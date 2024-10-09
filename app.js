import { FONT, board, loadGrid, saveGrid, setMarkerFont } from "../sudokulib/board.js";
import { generateFromSeed, generateTransform, fillSolve, consoleOut } from "../sudokulib/generator.js";
import { CellCandidate, Grid } from "../sudokulib/Grid.js";
import { picker, pickerDraw, pickerMarker, pixAlign } from "../sudokulib/picker.js";
import { candidates, hiddenSingles, nakedSingles } from "../sudokulib/solver.js";

const searchParams = new URLSearchParams(window.location.search);
const strategy = searchParams.get("strategy") || 'simple';
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

const titleHeight = 32;

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
		selected,
		selectedRow,
		selectedCol
	});
	const data = JSON.stringify({ markerFont });
	localStorage.setItem("data", data);
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

board.canvas.style.position = 'absolute';
board.canvas.style.left = '50%';
board.canvas.style.touchAction = "manipulation";
picker.style.touchAction = "manipulation";
pickerMarker.style.touchAction = "manipulation";

const fontCheckbox = document.createElement('input');
fontCheckbox.type = "checkbox";
fontCheckbox.name = "name";
fontCheckbox.value = "value";
fontCheckbox.id = "id";
fontCheckbox.style.position = 'absolute';
fontCheckbox.style.top = titleHeight / 2 + 'px';
fontCheckbox.style.left = titleHeight / 2 + 'px';
fontCheckbox.style.transform = 'translate(-50%, -50%)';
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
fontLabel.style.top = '0%';
fontLabel.style.left = '0%';
fontLabel.style.paddingLeft = titleHeight + 'px';
fontLabel.style.lineHeight = titleHeight + 'px';
fontLabel.style.whiteSpace = 'nowrap';
fontLabel.for = "id";
fontLabel.appendChild(fontCheckbox);

const loadStorage = () => {
	const dataJSON = localStorage.getItem("data");
	if (dataJSON === null) return false;
	try {
		const data = JSON.parse(dataJSON);
		if (data.markerFont === undefined) return false;
		markerFont = data.markerFont;
		setMarkerFont(markerFont);
		fontCheckbox.checked = markerFont;
	} catch (error) {
		console.error(error);
	}
};

let loaded = false;
if (window.name) {
	const metadata = loadGrid();
	if (metadata) {
		if (metadata.strategy === strategy) {
			if (metadata.selected !== undefined) selected = metadata.selected;
			if (metadata.selectedRow !== undefined) selectedRow = metadata.selectedRow;
			if (metadata.selectedCol !== undefined) selectedCol = metadata.selectedCol;

			if (metadata.id !== undefined) puzzleData.id = metadata.id;
			if (metadata.transform !== undefined) puzzleData.transform = metadata.transform;
			if (metadata.grid !== undefined) puzzleData.grid.set(metadata.grid);
			// console.log(puzzleData.grid, metadata.grid);
			// if (metadata.markers !== undefined) puzzleData.markers.set(metadata.markers);	

			loaded = true;
		}
		if (metadata.strategy !== strategy) {
			metadata.strategy = strategy;
			saveData();
		}
	}
	loadStorage();
	draw();
}

addEventListener("storage", (event) => {
	if (event.key !== "data") return;
	loadStorage();
	draw();
});

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

title.style.fontSize = (titleHeight - 4) + 'px';
title.style.fontWeight = 'bold';
title.style.lineHeight = titleHeight + 'px';
title.style.textAlign = 'center';
title.style.position = 'absolute';
title.style.top = titleHeight / 2 + 'px';
title.style.left = '50%';
// title.style.pointerEvents = 'none';
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
clearPuzzleButton.style.top = '4px';
clearPuzzleButton.style.right = '4px';
clearPuzzleButton.style.height = titleHeight - 8 + 'px';
clearPuzzleButton.addEventListener('click', () => {
	selected = false;
	board.resetGrid();
	saveData();
	draw();
});

const candidateButton = document.createElement('button');
candidateButton.appendChild(document.createTextNode("X"));
candidateButton.style.position = 'absolute';
candidateButton.style.width = '32px';
candidateButton.style.height = '32px';
candidateButton.style.top = '48px';
candidateButton.style.left = '8px';
candidateButton.style.zIndex = 1;
candidateButton.addEventListener('click', () => {
	for (const cell of board.cells) {
		if (cell.symbol === 0 && cell.mask === 0x0000) cell.fill();
	}
	candidates(board.cells);

	draw();
	saveData();
});
document.body.appendChild(candidateButton);

const fillButton = document.createElement('button');
fillButton.appendChild(document.createTextNode("0"));
fillButton.style.position = 'absolute';
fillButton.style.width = '32px';
fillButton.style.height = '32px';
fillButton.style.top = '96px';
fillButton.style.left = '8px';
fillButton.style.zIndex = 1;
fillButton.addEventListener('click', () => {
	const now = performance.now();
	const result = fillSolve(board.cells);
	console.log("----- " + (performance.now() - now) / 1000);
	for (const line of consoleOut(result)) console.log(line);

	draw();
	saveData();
});
document.body.appendChild(fillButton);

const header = document.createElement('DIV');
const mainBody = document.createElement('DIV');

header.appendChild(title);
header.appendChild(fontLabel);

if (strategy !== 'custom') {
	const newPuzzleButton = document.createElement('button');
	newPuzzleButton.appendChild(document.createTextNode("New"));
	newPuzzleButton.style.position = 'absolute';
	newPuzzleButton.style.top = '4px';
	newPuzzleButton.style.right = '64px';
	newPuzzleButton.style.height = titleHeight - 8 + 'px';
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
header.style.left = '0%';
header.style.height = titleHeight + 'px';
header.style.borderBottom = '1px solid black'
header.style.background = 'White'

mainBody.style.position = 'absolute';
mainBody.style.top = titleHeight + 'px';
mainBody.style.width = '100%';
mainBody.style.left = '0%';
mainBody.style.bottom = '0%';

document.body.style.userSelect = 'none';
document.body.style.margin = '0px';

mainBody.appendChild(picker);
mainBody.appendChild(pickerMarker);
mainBody.appendChild(board.canvas);

document.body.appendChild(header);
document.body.appendChild(mainBody);

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

		const solve = (cells) => {
			let progress = false;
			do {
				candidates(cells);

				progress = nakedSingles(cells);
				if (progress) continue;

				progress = hiddenSingles(cells);
			} while (progress);
		};

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
					solve(board.cells);
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
		} else if (superpositionMode === 1) {
			const intersection = new Grid();
			for (let i = 0; i < 81; i++) intersection[i] = new CellCandidate(i);
			for (let index = 0; index < 81; index++) {
				const startCell = startBoard[index];
				const intersectionCell = intersection[index];
				intersectionCell.setSymbol(startCell.symbol);
				if (startCell.symbol === 0) intersectionCell.fill();
			}

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
					solve(board.cells);
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
			}

			flips = [startBoard, intersection.toData()];
		} else if (superpositionMode === 2) {
			const intersection = new Grid();
			for (let i = 0; i < 81; i++) intersection[i] = new CellCandidate(i);
			for (let index = 0; index < 81; index++) {
				const startCell = startBoard[index];
				const intersectionCell = intersection[index];
				intersectionCell.setSymbol(startCell.symbol);
				if (startCell.symbol === 0) intersectionCell.fill();
			}

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
						solve(board.cells);
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
		}, 1000 * 1 / 20);
	}

	let startBoard = null;
	const superpositionCandidateButton = document.createElement('button');
	superpositionCandidateButton.appendChild(document.createTextNode("M"));
	superpositionCandidateButton.style.position = 'absolute';
	superpositionCandidateButton.style.top = titleHeight / 2 + 'px';
	superpositionCandidateButton.style.transform = 'translateY(-50%)';
	superpositionCandidateButton.style.right = '120px';
	superpositionCandidateButton.addEventListener('click', () => {
		superpositionMode = 0;
		superimposeCandidates();
	});
	header.appendChild(superpositionCandidateButton);

	const superpositionCandidateAllButton = document.createElement('button');
	superpositionCandidateAllButton.appendChild(document.createTextNode("A"));
	superpositionCandidateAllButton.style.position = 'absolute';
	superpositionCandidateAllButton.style.top = titleHeight / 2 + 'px';
	superpositionCandidateAllButton.style.right = '92px';
	superpositionCandidateAllButton.style.transform = 'translateY(-50%)';
	superpositionCandidateAllButton.addEventListener('click', () => {
		superpositionMode = 1;
		superimposeCandidates();
	});
	header.appendChild(superpositionCandidateAllButton);

	const superpositionSymbolButton = document.createElement('button');
	superpositionSymbolButton.appendChild(document.createTextNode("S"));
	superpositionSymbolButton.style.position = 'absolute';
	superpositionSymbolButton.style.top = titleHeight / 2 + 'px';
	superpositionSymbolButton.style.right = '64px';
	superpositionSymbolButton.style.transform = 'translateY(-50%)';
	superpositionSymbolButton.addEventListener('click', () => {
		superpositionMode = 2;
		superimposeCandidates();
	});
	header.appendChild(superpositionSymbolButton);
}
