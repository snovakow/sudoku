import { FONT, board, loadGrid, saveGrid, setMarkerFont } from "../sudokulib/board.js";
import { generateFromSeed, generateTransform, fillSolve, consoleOut, STRATEGY } from "../sudokulib/generator.js";
import { CellCandidate, Grid } from "../sudokulib/Grid.js";
import { picker, pickerDraw, pickerMarker, pixAlign } from "../sudokulib/picker.js";
import { candidates } from "../sudokulib/solver.js";

const searchParams = new URLSearchParams(window.location.search);
const strategy = searchParams.get("strategy");
if (strategy === null || (
	strategy !== 'simple' &&
	strategy !== 'bruteForce' &&
	strategy !== 'naked2' &&
	strategy !== 'naked3' &&
	strategy !== 'naked4' &&
	strategy !== 'hidden2' &&
	strategy !== 'hidden3' &&
	strategy !== 'hidden4' &&
	strategy !== 'omissions' &&
	strategy !== 'uniqueRectangle' &&
	strategy !== 'yWing' &&
	strategy !== 'xyzWing' &&
	strategy !== 'xWing' &&
	strategy !== 'swordfish' &&
	strategy !== 'jellyfish' &&
	strategy !== 'custom')
) window.location.href = "/";

const puzzleData = {
	id: 0,
	strategy: strategy,
	transform: null,
	grid: new Uint8Array(81),
	markers: new Uint16Array(81),
}
Object.seal(puzzleData);

let markerFont = false;
let pickerMarkerMode = false;

const headerHeight = 32;
const footerHeight = 22;

let selectedRow = 0;
let selectedCol = 0;
let selected = false;

const saveData = () => {
	saveGrid({
		id: puzzleData.id,
		strategy: strategy,
		transform: puzzleData.transform,
		grid: puzzleData.grid.join(""),
		markers: puzzleData.markers.join(""),
		markerFont,
		pickerMarkerMode,
		selected,
		selectedRow,
		selectedCol
	});
};

const draw = () => {
	board.draw(selected, selectedRow, selectedCol);

	if (FONT.initialized) {
		const font = pixAlign(64 * window.devicePixelRatio) + "px " + FONT.marker;
		const fontMarker = pixAlign(24 * window.devicePixelRatio) + "px " + FONT.marker;
		pickerDraw(font, fontMarker);
	} else {
		pickerDraw();
	}
}

{
	const urlComicSans = 'url(../snovakow/assets/fonts/comic-sans-ms/COMIC.TTF)';
	const urlOpenSansRegular = 'url(../snovakow/assets/fonts/Open_Sans/static/OpenSans-Regular.ttf)';

	const fontOpenSansRegular = new FontFace("REGULAR", urlOpenSansRegular);
	const fontComicSans = new FontFace("COMIC", urlComicSans);

	document.fonts.add(fontOpenSansRegular);
	document.fonts.add(fontComicSans);

	fontOpenSansRegular.load();
	fontComicSans.load();

	document.fonts.ready.then(() => {
		FONT.initialized = true;
		draw();
	});
}

let timer = 0;
let superpositionMode = 0;
let superimposeCandidates = null;

const click = (event) => {
	// event.preventDefault();

	const rect = event.target.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;

	const [row, col] = board.hitDetect(x, y, rect.width);

	if (row < 0 || col < 0) return;

	if (board.startCells[row * 9 + col].symbol !== 0) return;

	if (selected && selectedRow === row && selectedCol === col) {
		selected = false;
	} else {
		selectedRow = row;
		selectedCol = col;

		selected = true;
		if (timer && superpositionMode === 0 && superimposeCandidates) superimposeCandidates(true);
	}
	draw();
	saveData();
};
board.canvas.addEventListener('click', click);

const clickLocation = (event) => {
	const rect = event.target.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;

	const sizeTotal = rect.width;

	const r = Math.floor(y / sizeTotal * 3);
	const c = Math.floor(x / sizeTotal * 3);
	return [r, c];
};

const pickerClick = (event) => {
	// event.preventDefault();

	if (!selected) return;

	const running = timer ? true : false;
	if (timer && superimposeCandidates) superimposeCandidates(false);

	const [r, c] = clickLocation(event);

	const index = r * 3 + c + 1;
	const selectedIndex = selectedRow * 9 + selectedCol;
	const symbol = board.cells[selectedIndex].symbol;
	if (symbol === index) {
		const cell = board.cells[selectedIndex];
		cell.setSymbol(0);
	} else {
		board.cells[selectedIndex].setSymbol(index);
	}

	saveData();
	draw();

	if (running) {
		fillSolve(board.cells);
		saveData();
		if (superimposeCandidates) superimposeCandidates();
	}
};
picker.addEventListener('click', pickerClick);

const pickerMarkerClick = (event) => {
	// event.preventDefault();

	if (!selected) return;

	const running = timer ? true : false;
	if (timer) superimposeCandidates(false);

	const [r, c] = clickLocation(event);

	const symbol = r * 3 + c + 1;
	const selectedIndex = selectedRow * 9 + selectedCol;
	const cell = board.cells[selectedIndex];
	if (cell.symbol === 0) {
		const had = cell.delete(symbol);
		if (!had) cell.add(symbol);
	} else {
		cell.setSymbol(0);
		cell.add(symbol);
	}

	saveData();
	draw();

	if (running) {
		fillSolve(board.cells);
		saveData();
		if (superimposeCandidates) superimposeCandidates();
	}
};
pickerMarker.addEventListener('click', pickerMarkerClick);

const onFocus = () => {
	// console.log("onFocus");
	draw();
};
const offFocus = () => {

};
// window.addEventListener("focus", onFocus);
// window.addEventListener("blur", offFocus);

const orientationchange = (event) => {
	draw();
	console.log(event);
};
addEventListener("orientationchange", orientationchange);

picker.style.position = 'fixed';
picker.style.width = '192px';
picker.style.height = '192px';
picker.style.bottom = '0px';
picker.style.left = '0px';

pickerMarker.style.position = 'fixed';
pickerMarker.style.width = '192px';
pickerMarker.style.height = '192px';
pickerMarker.style.bottom = '0px';
pickerMarker.style.left = '0px';

board.canvas.style.position = 'absolute';
board.canvas.style.left = '50%';
board.canvas.style.touchAction = "manipulation";
picker.style.touchAction = "manipulation";
pickerMarker.style.touchAction = "manipulation";

const header = document.createElement('DIV');
const mainBody = document.createElement('DIV');
const footer = document.createElement('DIV');

const fontCheckbox = document.createElement('input');
fontCheckbox.type = "checkbox";
fontCheckbox.name = "name";
fontCheckbox.value = "value";
fontCheckbox.id = "id";
fontCheckbox.style.position = 'absolute';
fontCheckbox.style.bottom = footerHeight / 2 + 'px';
fontCheckbox.style.left = footerHeight / 2 + 'px';
fontCheckbox.style.transform = 'translate(-50%, 50%)';
fontCheckbox.style.margin = '0px';
fontCheckbox.style.padding = '8px';
fontCheckbox.addEventListener('change', () => {
	markerFont = fontCheckbox.checked;
	setMarkerFont(markerFont);
	saveData();
	draw();
});

const fontLabel = document.createElement('label')
fontLabel.appendChild(document.createTextNode('Marker Font'));
fontLabel.style.position = 'absolute';
fontLabel.style.bottom = footerHeight / 2 + 'px';
fontLabel.style.left = 8 + 'px';
fontLabel.style.paddingLeft = footerHeight + 4 + 'px';
fontLabel.style.transform = 'translateY(50%)';
fontLabel.style.lineHeight = footerHeight + 'px';
fontLabel.style.fontSize = footerHeight - 6 + 'px';
fontLabel.style.whiteSpace = 'nowrap';
fontLabel.for = "id";
fontLabel.appendChild(fontCheckbox);
footer.appendChild(fontLabel);

const markerButton = document.createElement('button');
markerButton.style.margin = '8px';
markerButton.style.width = '48px';

let loaded = false;
if (window.name) {
	const metadata = loadGrid();
	if (metadata) {
		if (metadata.strategy === strategy) {
			if (metadata.selected !== undefined) selected = metadata.selected;
			if (metadata.selectedRow !== undefined) selectedRow = metadata.selectedRow;
			if (metadata.selectedCol !== undefined) selectedCol = metadata.selectedCol;

			if (metadata.markerFont !== undefined) markerFont = metadata.markerFont;
			setMarkerFont(markerFont);
			fontCheckbox.checked = markerFont;

			if (metadata.pickerMarkerMode !== undefined) pickerMarkerMode = metadata.pickerMarkerMode;

			if (metadata.id !== undefined) puzzleData.id = metadata.id;
			if (metadata.transform !== undefined) puzzleData.transform = metadata.transform;
			if (metadata.grid !== undefined) puzzleData.grid.set(metadata.grid);

			loaded = true;
		}
		if (metadata.strategy !== strategy) {
			metadata.strategy = strategy;
			saveData();
		}
	}
	draw();
}

const setMarkerMode = ()=>{
	while (markerButton.firstChild) markerButton.removeChild(markerButton.firstChild);

	if (pickerMarkerMode) {
		markerButton.appendChild(document.createTextNode("Place"));
		picker.style.visibility = "hidden";
		pickerMarker.style.visibility = "visible";
	} else {
		markerButton.appendChild(document.createTextNode("Mark"));
		picker.style.visibility = "visible";
		pickerMarker.style.visibility = "hidden";
	}
}
setMarkerMode();

const title = document.createElement('SPAN');

let customSelector = null;
if (strategy === 'custom') {
	const createSelect = (options, onChange) => {
		const select = document.createElement('select');

		for (const title of options) {
			const option = document.createElement('option');
			option.text = title;
			select.appendChild(option);
		}

		select.addEventListener('change', () => {
			onChange(select);
		});
		return select;
	};

	const search = "?strategy=" + strategy;
	fetch("../sudokulib/sudoku.php" + search).then(response => {
		response.text().then((string) => {
			const results = string.split(":");
			const entries = [];
			const names = [];
			for (const result of results) {
				const fields = result.split(",");
				if (fields.length !== 3) continue;

				const id = parseInt(fields[0]);
				const title = fields[1];
				const puzzle = fields[2];

				if (puzzle.length !== 81) return;
				entries.push({ id, title, puzzle });
				names.push(title);
			}

			customSelector = createSelect(["-", ...names], (select) => {
				selected = false;

				if (select.selectedIndex === 0) {
					for (const cell of board.cells) {
						cell.symbol = 0;
						cell.mask = 0x0000;
					}
					for (const cell of board.startCells) cell.symbol = 0;

					puzzleData.id = 0;
					puzzleData.grid.fill(0);
					puzzleData.markers.fill(0);
				} else {
					const index = select.selectedIndex - 1;
					const entry = entries[index];
					board.setGrid(entry.puzzle);

					const grid = new Uint8Array(81);
					const markers = new Uint16Array(81);
					for (let i = 0; i < 81; i++) {
						grid[i] = board.cells[i].symbol;
						markers[i] = board.cells[i].mask;
					}

					puzzleData.id = select.selectedIndex;
					puzzleData.grid = grid;
					puzzleData.markers = markers;
				}
				puzzleData.transform = null;

				saveData();
				draw();
			});

			customSelector.style.transform = 'translate(-50%, -50%)';
			customSelector.style.position = 'absolute';
			customSelector.style.top = 0 + 'px';
			title.appendChild(customSelector);

			if (!puzzleData.transform && puzzleData.id > 0) {
				let selectedIndex = 1;
				for (let i = 0; i < entries.length; i++) {
					const entry = entries[i];
					if (entry.id === puzzleData.id) {
						customSelector.selectedIndex = i + 1;
						break;
					}
				}
				for (const entry of entries) {
					selectedIndex++;
				}
			}
		});
	});
}

const loadSudoku = () => {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = () => {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			const fields = xhttp.responseText.split(":");
			if (fields.length !== 3) return;

			const puzzleId = parseInt(fields[0]);
			const puzzle = fields[1];
			if (puzzle.length !== 81) return;
			const grid = fields[2];
			if (grid.length !== 81) return;

			const transform = generateTransform();
			const puzzleTransformed = generateFromSeed(puzzle, transform);
			const gridTransformed = generateFromSeed(grid, transform);

			const puzzleString = puzzleTransformed.join("");
			board.cells.fromString(puzzleString);
			for (const cell of board.cells) {
				const startCell = board.startCells[cell.index];
				startCell.symbol = cell.symbol;
			}

			puzzleData.id = puzzleId;
			puzzleData.transform = transform;
			puzzleData.grid = gridTransformed;

			saveData();
			draw();
		}
	};
	const search = window.location.search ? window.location.search : "?strategy=simple";
	xhttp.open("GET", "../sudokulib/sudoku.php" + search, true);
	xhttp.send();
};

if (!loaded && strategy !== 'custom') {
	loadSudoku();
}

title.style.fontSize = (headerHeight - 4) + 'px';
title.style.fontWeight = 'bold';
title.style.lineHeight = headerHeight + 'px';
title.style.textAlign = 'center';
title.style.position = 'absolute';
title.style.top = headerHeight / 2 + 'px';
title.style.left = '50%';
title.style.transform = 'translate(-50%, -50%)';
let titleString = null;
if (strategy === 'simple') titleString = "Sudoku";
if (strategy === 'naked2') titleString = "Naked Pairs";
if (strategy === 'naked3') titleString = "Naked Triples";
if (strategy === 'naked4') titleString = "Naked Quads";
if (strategy === 'hidden2') titleString = "Hidden Pairs";
if (strategy === 'hidden3') titleString = "Hidden Triples";
if (strategy === 'hidden4') titleString = "Hidden Quads";
if (strategy === 'omissions') titleString = "Intersection Removals";
if (strategy === 'uniqueRectangle') titleString = "Deadly Patterns";
if (strategy === 'yWing') titleString = "Y Wings";
if (strategy === 'xyzWing') titleString = "XYZ Wings";
if (strategy === 'xWing') titleString = "X Wings";
if (strategy === 'swordfish') titleString = "Swordfish";
if (strategy === 'jellyfish') titleString = "Jellyfish";
if (titleString) title.appendChild(document.createTextNode(titleString));

const clearPuzzleButton = document.createElement('button');
clearPuzzleButton.appendChild(document.createTextNode("Reset"));
clearPuzzleButton.style.position = 'absolute';
clearPuzzleButton.style.top = headerHeight / 2 + 'px';
clearPuzzleButton.style.right = '8px';
clearPuzzleButton.style.transform = 'translateY(-50%)';
clearPuzzleButton.addEventListener('click', () => {
	selected = false;
	board.resetGrid();
	saveData();
	draw();
});

const buttonContainer = document.createElement('span');
buttonContainer.style.position = 'absolute';
buttonContainer.style.bottom = 192 + 8 + 'px';
buttonContainer.style.left = 192 / 2 + 'px';
buttonContainer.style.transform = 'translateX(-50%)';
buttonContainer.style.zIndex = 1;
mainBody.appendChild(buttonContainer);

markerButton.addEventListener('click', () => {
	pickerMarkerMode = !pickerMarkerMode;
	setMarkerMode();
	saveData();
});
const fillButton = document.createElement('button');
fillButton.appendChild(document.createTextNode("Fill"));
fillButton.style.margin = '8px';
fillButton.style.width = '48px';
fillButton.style.display = 'block';
fillButton.addEventListener('click', () => {
	for (const cell of board.cells) if (cell.symbol === 0 && cell.mask === 0x0000) cell.fill();
	candidates(board.cells);

	draw();
	saveData();
});
const solveButton = document.createElement('button');
solveButton.appendChild(document.createTextNode("Solve"));
solveButton.style.margin = '8px';
solveButton.style.width = '48px';
solveButton.addEventListener('click', () => {
	for (const cell of board.cells) if (cell.symbol === 0 && cell.mask === 0x0000) cell.fill();
	fillSolve(board.cells);
	// const now = performance.now();
	// const result = fillSolve(board.cells);
	// console.log("----- " + (performance.now() - now) / 1000);
	// for (const line of consoleOut(result)) console.log(line);

	draw();
	saveData();
});
buttonContainer.appendChild(markerButton);
buttonContainer.appendChild(fillButton);
buttonContainer.appendChild(solveButton);

header.appendChild(title);

if (strategy !== 'custom') {
	const newPuzzleButton = document.createElement('button');
	newPuzzleButton.appendChild(document.createTextNode("New"));
	newPuzzleButton.style.position = 'absolute';
	newPuzzleButton.style.top = headerHeight / 2 + 'px';
	newPuzzleButton.style.right = '68px';
	newPuzzleButton.style.transform = 'translateY(-50%)';
	newPuzzleButton.addEventListener('click', () => {
		selected = false;
		loadSudoku();
	});
	header.appendChild(newPuzzleButton);
}
header.appendChild(clearPuzzleButton);

header.style.position = 'absolute';
header.style.top = '0%';
header.style.width = '100%';
header.style.left = '50%';
header.style.transform = 'translateX(-50%)';
header.style.height = headerHeight + 'px';
header.style.borderBottom = '1px solid black'
header.style.background = 'White'

mainBody.style.position = 'absolute';
mainBody.style.top = headerHeight + 'px';
mainBody.style.bottom = footerHeight + 'px';
mainBody.style.width = '100%';
mainBody.style.left = '50%';
mainBody.style.transform = 'translateX(-50%)';

const copyright = document.createElement('SPAN');
copyright.style.fontSize = (footerHeight - 6) + 'px';
copyright.style.lineHeight = footerHeight + 'px';
copyright.style.textAlign = 'right';
copyright.style.position = 'absolute';
copyright.style.bottom = footerHeight / 2 + 'px';
copyright.style.right = '8px';
copyright.style.transform = 'translateY(50%)';
copyright.appendChild(document.createTextNode("© Scott Novakowski"));
footer.appendChild(copyright);

const homelink = document.createElement('a');
homelink.style.fontSize = (headerHeight / 2) + 'px';
homelink.style.lineHeight = headerHeight + 'px';
homelink.style.textAlign = 'left';
homelink.style.position = 'absolute';
homelink.style.top = headerHeight / 2 + 'px';
homelink.style.left = '8px';
homelink.style.transform = 'translateY(-50%)';
homelink.appendChild(document.createTextNode("Home"));
homelink.href = "/";
header.appendChild(homelink);

footer.style.position = 'absolute';
footer.style.overflow = 'visible';
footer.style.bottom = '0%';
footer.style.width = '100%';
footer.style.left = '50%';
footer.style.transform = 'translateX(-50%)';
footer.style.height = footerHeight + 'px';
footer.style.borderTop = '1px solid darkgray'
footer.style.background = 'White'

document.body.style.userSelect = 'none';
document.body.style.margin = '0px';

mainBody.appendChild(picker);
mainBody.appendChild(pickerMarker);
mainBody.appendChild(board.canvas);

document.body.appendChild(header);
document.body.appendChild(mainBody);
document.body.appendChild(footer);

const resize = () => {
	const boundingClientRect = mainBody.getBoundingClientRect();
	let width = boundingClientRect.width;
	let height = boundingClientRect.height;
	if (width - 192 > height) {
		if (width - height < 384) {
			width = width - 384;
		}
		board.canvas.style.top = '0%';
		board.canvas.style.transform = 'translate(-50%, 0%)';
	} else {
		if (height - width < 192) {
			board.canvas.style.top = '0%';
		} else {
			board.canvas.style.top = ((height - 192) - width) * 0.5 + 'px';
		}

		if (height - width < 384) {
			height = height - 192;
		}

		board.canvas.style.transform = 'translate(-50%, 0%)';
	}

	if (boundingClientRect.width - 192 > boundingClientRect.height) {
		buttonContainer.style.bottom = 192 + 8 + 'px';
		buttonContainer.style.left = 192 / 2 + 'px';
		buttonContainer.style.transform = 'translateX(-50%)';
		fillButton.style.display = 'inline';
	} else {
		buttonContainer.style.bottom = 192 / 2 + 'px';
		buttonContainer.style.left = 192 + 8 + 'px';
		buttonContainer.style.transform = 'translateY(50%)';
		fillButton.style.display = 'block';
	}

	const size = Math.min(width, height);
	board.canvas.style.width = size + 'px';
	board.canvas.style.height = size + 'px';
	board.canvas.width = Math.floor(size * window.devicePixelRatio / 1) * 2;
	board.canvas.height = Math.floor(size * window.devicePixelRatio / 1) * 2;

	draw();
};

resize();
window.addEventListener('resize', resize);

if (strategy === 'custom') {
	superimposeCandidates = (reset = false) => {
		if (timer) {
			window.clearInterval(timer);
			board.cells.fromData(startBoard);
			draw();
			timer = 0;
			if (!reset) return;
		}
		if (!selected && superpositionMode === 0) return;

		startBoard = board.cells.toData();

		let flips;
		if (superpositionMode === 0) {
			const union = new Grid();
			for (let i = 0; i < 81; i++) union[i] = new CellCandidate(i);
			for (let index = 0; index < 81; index++) {
				const startCell = startBoard[index];
				const unionCell = union[index];
				if (startCell.symbol !== 0) unionCell.setSymbol(startCell.symbol);
			}

			const superCell = board.cells[selectedRow * 9 + selectedCol];
			if (superCell.symbol !== 0) return;

			const supers = [];

			for (let x = 1; x <= 9; x++) {
				if (superCell.has(x)) {
					// cell.delete(x);
					superCell.setSymbol(x);
					fillSolve(board.cells, STRATEGY.NONE);
					supers.push(board.cells.toData());
					board.cells.fromData(startBoard);
				}
			}

			if (supers.length < 2) return;

			for (let index = 0; index < 81; index++) {
				const unionCell = union[index];
				if (unionCell.symbol !== 0) continue;

				for (const solution of supers) {
					const solutionCell = solution[index];
					if (solutionCell.symbol === 0) {
						for (let x = 1; x <= 9; x++) {
							if (((solutionCell.mask >> x) & 0x0001) === 0x0001) {
								unionCell.add(x)
							}
						}
					} else {
						unionCell.add(solutionCell.symbol)
					}
				}
			}

			flips = [startBoard, union.toData()];
		} else {
			const intersectionFromUnion = (intersection, union) => {
				for (let index = 0; index < 81; index++) {
					const unionCell = union[index];
					const intersectionCell = intersection[index];
					if (unionCell.symbol === 0) {
						for (let x = 1; x <= 9; x++) {
							if (!unionCell.has(x)) {
								intersectionCell.delete(x);
							}
						}
					} else {
						// intersectionCell.setSymbol(unionCell.symbol);
					}
				}
			};

			const intersection = new Grid();
			for (let i = 0; i < 81; i++) intersection[i] = new CellCandidate(i);
			for (let index = 0; index < 81; index++) {
				const startCell = startBoard[index];
				const intersectionCell = intersection[index];
				intersectionCell.setSymbol(startCell.symbol);
				if (startCell.symbol === 0) intersectionCell.fill();
			}

			const solve = () => {
				if (superpositionMode === 1) fillSolve(board.cells, STRATEGY.NONE);
				else fillSolve(board.cells, STRATEGY.ALL);
			}

			// Candidates
			for (let index = 0; index < 81; index++) {
				const cell = board.cells[index];
				if (cell.symbol !== 0) continue;

				const union = new Grid();
				for (let i = 0; i < 81; i++) union[i] = new CellCandidate(i);
				for (let index = 0; index < 81; index++) {
					const startCell = startBoard[index];
					const unionCell = union[index];
					unionCell.setSymbol(startCell.symbol);
				}

				const supers = [];
				for (let x = 1; x <= 9; x++) {
					if (!cell.has(x)) continue;

					cell.setSymbol(x);
					solve();
					supers.push(board.cells.toData());
					board.cells.fromData(startBoard);
				}
				if (supers.length < 2) continue;

				for (let index = 0; index < 81; index++) {
					const unionCell = union[index];
					if (unionCell.symbol !== 0) continue;

					for (const solution of supers) {
						const solutionCell = solution[index];
						if (solutionCell.symbol === 0) {
							for (let x = 1; x <= 9; x++) {
								if (((solutionCell.mask >> x) & 0x0001) === 0x0001) {
									unionCell.add(x)
								}
							}
						} else {
							unionCell.add(solutionCell.symbol)
						}
					}
				}
				intersectionFromUnion(intersection, union);
			}

			// Symbols
			for (const group of Grid.groupTypes) {
				for (let x = 1; x <= 9; x++) {
					const union = new Grid();
					for (let i = 0; i < 81; i++) union[i] = new CellCandidate(i);
					for (let index = 0; index < 81; index++) {
						const startCell = startBoard[index];
						const unionCell = union[index];
						unionCell.setSymbol(startCell.symbol);
					}

					const supers = [];
					for (const index of group) {
						const cell = board.cells[index];
						if (cell.symbol !== 0) continue;
						if (!cell.has(x)) continue;

						cell.setSymbol(x);
						solve();
						supers.push(board.cells.toData());
						board.cells.fromData(startBoard);
					}

					if (supers.length < 2) continue;

					for (let index = 0; index < 81; index++) {
						const unionCell = union[index];
						if (unionCell.symbol !== 0) continue;

						for (const solution of supers) {
							const solutionCell = solution[index];
							if (solutionCell.symbol === 0) {
								for (let x = 1; x <= 9; x++) {
									if (((solutionCell.mask >> x) & 0x0001) === 0x0001) {
										unionCell.add(x)
									}
								}
							} else {
								unionCell.add(solutionCell.symbol)
							}
						}
					}
					intersectionFromUnion(intersection, union);
				}
			}
			flips = [startBoard, intersection.toData()];
		}

		let iteration = 0;
		timer = window.setInterval(() => {
			board.cells.fromData(flips[iteration % flips.length]);
			draw();
			board.cells.fromData(startBoard);
			iteration++;
		}, 1000 * 0.1);
	}

	let startBoard = null;
	const superpositionCellButton = document.createElement('button');
	superpositionCellButton.appendChild(document.createTextNode("C"));
	superpositionCellButton.style.position = 'absolute';
	superpositionCellButton.style.top = headerHeight / 2 + 'px';
	superpositionCellButton.style.transform = 'translateY(-50%)';
	superpositionCellButton.style.right = '120px';
	superpositionCellButton.addEventListener('click', () => {
		superpositionMode = 0;
		for (const cell of board.cells) if (cell.symbol === 0 && cell.mask === 0x0000) cell.fill();
		candidates(board.cells);
		superimposeCandidates();
	});
	header.appendChild(superpositionCellButton);

	const superpositionAllCellSymbolButton = document.createElement('button');
	superpositionAllCellSymbolButton.appendChild(document.createTextNode("S"));
	superpositionAllCellSymbolButton.style.position = 'absolute';
	superpositionAllCellSymbolButton.style.top = headerHeight / 2 + 'px';
	superpositionAllCellSymbolButton.style.transform = 'translateY(-50%)';
	superpositionAllCellSymbolButton.style.right = '92px';
	superpositionAllCellSymbolButton.addEventListener('click', () => {
		superpositionMode = 1;
		for (const cell of board.cells) if (cell.symbol === 0 && cell.mask === 0x0000) cell.fill();
		candidates(board.cells);
		superimposeCandidates();
	});
	header.appendChild(superpositionAllCellSymbolButton);

	const superpositionAllFullSolveButton = document.createElement('button');
	superpositionAllFullSolveButton.appendChild(document.createTextNode("A")); // ALL Candidate and Symbol full solve
	superpositionAllFullSolveButton.style.position = 'absolute';
	superpositionAllFullSolveButton.style.top = headerHeight / 2 + 'px';
	superpositionAllFullSolveButton.style.right = '64px';
	superpositionAllFullSolveButton.style.transform = 'translateY(-50%)';
	superpositionAllFullSolveButton.addEventListener('click', () => {
		superpositionMode = 2;
		for (const cell of board.cells) if (cell.symbol === 0 && cell.mask === 0x0000) cell.fill();
		candidates(board.cells);
		superimposeCandidates();
	});
	header.appendChild(superpositionAllFullSolveButton);
}
