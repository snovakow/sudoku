import { FONT, board, loadGrid, saveGrid, setMarkerFont } from "../sudokulib/board.js";
import { consoleOut, fillSolve, generateFromSeed, generateTransform } from "../sudokulib/generator.js";
import { picker, pickerDraw, pickerMarker, pixAlign } from "../sudokulib/picker.js";

let selectedRow = 0;
let selectedCol = 0;
let selected = false;

const puzzleData = {
	id: 0,
	transform: {},
	grid: new Uint8Array(81),
}

let markerFont = false;

const titleHeight = 28;

const saveData = () => {
	saveGrid({
		id: puzzleData.id,
		transform: puzzleData.transform,
		grid: puzzleData.grid.join(""),
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
		pickerDraw(font);
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

	const data = localStorage.getItem("data");
	if (data !== null) FONT.initialized = true;
	document.fonts.ready.then(() => {
		FONT.initialized = true;
		draw();
	});
}

const click = (event) => {
	// event.preventDefault();

	// Get the bounding rectangle of target
	const rect = event.target.getBoundingClientRect();
	// Mouse position
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

	const [r, c] = clickLocation(event);

	const index = r * 3 + c + 1;
	const selectedIndex = selectedRow * 9 + selectedCol;
	const symbol = board.cells[selectedIndex].symbol;
	if (symbol === index) {
		const cell = board.cells[selectedIndex];
		cell.show = false;
		cell.setSymbol(0);
	} else {
		board.cells[selectedIndex].setSymbol(index);
	}

	saveData();
	draw();
};
picker.addEventListener('click', pickerClick);

const pickerMarkerClick = (event) => {
	// event.preventDefault();

	if (!selected) return;

	const [r, c] = clickLocation(event);

	const symbol = r * 3 + c + 1;
	const selectedIndex = selectedRow * 9 + selectedCol;
	const cell = board.cells[selectedIndex];
	if (cell.show) {
		const had = cell.delete(symbol);
		if (!had) cell.add(symbol);
	} else {
		cell.clear();
		cell.add(symbol);
		cell.show = true;
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
		if (metadata.selected !== undefined) selected = metadata.selected;
		if (metadata.selectedRow !== undefined) selectedRow = metadata.selectedRow;
		if (metadata.selectedCol !== undefined) selectedCol = metadata.selectedCol;

		if (metadata.id !== undefined) puzzleData.id = metadata.id;
		if (metadata.transform !== undefined) puzzleData.transform = metadata.transform;
		if (metadata.grid !== undefined) puzzleData.grid.set(metadata.grid);

		loaded = true;
	}
	loadStorage();
	draw();
}

addEventListener("storage", (event) => {
	loadStorage();
	draw();
});

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
				cell.show = false;
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
	const uid = performance.now().toString() + Math.random().toString();
	const search = window.location.search ? window.location.search : "?strategy=simple&uid=" + uid;
	xhttp.open("GET", "../sudokulib/sudoku.php" + search, true);
	xhttp.send();
};
if (!loaded) {
	loadSudoku();
}

const title = document.createElement('SPAN');
title.style.fontSize = titleHeight + 'px';
title.style.lineHeight = titleHeight + 'px';
title.style.textAlign = 'center';
title.style.position = 'absolute';
title.style.top = '0%';
title.style.left = '50%';
// title.style.pointerEvents = 'none';
title.style.transform = 'translateX(-50%)';
title.appendChild(document.createTextNode("Sudoku"));

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

const header = document.createElement('DIV');
const mainBody = document.createElement('DIV');

header.appendChild(title);
header.appendChild(fontLabel);

header.appendChild(newPuzzleButton);
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
// document.body.appendChild(pickerMarker);
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
