import { FONT, board, loadGrid, saveGrid, setMarkerFont } from "../sudokulib/board.js";
import { consoleOut, fillSolve } from "../sudokulib/generator.js";
import { picker, pickerDraw, pickerMarker, pixAlign } from "../sudokulib/picker.js";

let selectedRow = 0;
let selectedCol = 0;
let selected = false;

let markerFont = false;

const saveData = () => {
	saveGrid({
		selected,
		selectedRow,
		selectedCol,
		markerFont,
	});
};

const draw = () => {
	board.draw(selected, selectedRow, selectedCol);

	const font = "100 " + pixAlign(64 * window.devicePixelRatio) + "px " + FONT.marker;
	pickerDraw(font);
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

const clearButton = document.createElement('button');
clearButton.appendChild(document.createTextNode("X"));
clearButton.style.position = 'absolute';
clearButton.style.width = '32px';
clearButton.style.height = '32px';
clearButton.addEventListener('click', () => {
	selected = false;
	board.resetGrid();
	saveData();
	draw();
});

const candidateButton = document.createElement('button');
candidateButton.appendChild(document.createTextNode("x"));
candidateButton.style.position = 'absolute';
candidateButton.style.width = '32px';
candidateButton.style.height = '32px';

candidateButton.addEventListener('click', () => {
	for (const cell of board.cells) {
		cell.show = true;
	}

	const now = performance.now();

	const result = fillSolve(board.cells, window.location.search);
	console.log("----- " + (performance.now() - now) / 1000);
	for (const line of consoleOut(result)) console.log(line);

	saveData();
	draw();
});

clearButton.style.transform = 'translateX(-50%)';
candidateButton.style.transform = 'translateX(-50%)';

candidateButton.style.touchAction = "manipulation";

board.canvas.style.position = 'absolute';
board.canvas.style.left = '50%';
board.canvas.style.touchAction = "manipulation";
picker.style.touchAction = "manipulation";
pickerMarker.style.touchAction = "manipulation";

const resize = () => {
	let width = window.innerWidth;
	let height = window.innerHeight;
	if (width - 192 > height) {
		if (width - height < 384) {
			width = width - 384;
		}
		board.canvas.style.top = '0%';
		board.canvas.style.transform = 'translate(-50%, 0%)';

		candidateButton.style.bottom = '324px';
		candidateButton.style.left = '96px';

		clearButton.style.bottom = '200px';
		clearButton.style.left = '96px';
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

		candidateButton.style.bottom = '128px';
		candidateButton.style.left = '50%';

		clearButton.style.bottom = '8px';
		clearButton.style.left = '50%';
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

let loaded = false;
if (window.name) {
	const metadata = loadGrid();
	if (metadata) {
		if (metadata.selected !== undefined) selected = metadata.selected;
		if (metadata.selectedRow !== undefined) selectedRow = metadata.selectedRow;
		if (metadata.selectedCol !== undefined) selectedCol = metadata.selectedCol;
		if (metadata.markerFont !== undefined) {
			markerFont = metadata.markerFont;
			setMarkerFont(markerFont);
		}
		loaded = true;
		draw();
	}
}

const loadSudoku = () => {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = () => {
		if (xhttp.readyState == 4 && xhttp.status == 200) {
			if (xhttp.responseText.length !== 81) return;

			board.cells.fromString(xhttp.responseText);
			for (const cell of board.cells) {
				cell.show = false;
				const startCell = board.startCells[cell.index];
				startCell.symbol = cell.symbol;
			}

			saveData();
			draw();
		}
	};
	const search = window.location.search ? window.location.search : "?strategy=simple";
	xhttp.open("GET", "../sudokulib/sudoku.php" + search, true);
	xhttp.send();
};
if (!loaded) {
	loadSudoku();
}

const header = document.createElement('DIV');
const body = document.createElement('DIV');
const footer = document.createElement('DIV');

const title = document.createElement('SPAN');
title.style.fontSize = '48px';
title.style.textAlign = 'center';
title.style.position = 'absolute';
title.style.top = '0%';
title.style.left = '50%';
title.style.pointerEvents = 'none';
title.style.transform = 'translateX(-50%)';
title.appendChild(document.createTextNode("Sudoku"));

const newPuzzleButton = document.createElement('button');
newPuzzleButton.appendChild(document.createTextNode("New"));
newPuzzleButton.style.position = 'absolute';
newPuzzleButton.style.top = '4px';
newPuzzleButton.style.right = '56px';
newPuzzleButton.style.height = '32px';
newPuzzleButton.addEventListener('click', () => {
	selected = false;
	loadSudoku();
});

const clearPuzzleButton = document.createElement('button');
clearPuzzleButton.appendChild(document.createTextNode("Clear"));
clearPuzzleButton.style.position = 'absolute';
clearPuzzleButton.style.top = '4px';
clearPuzzleButton.style.right = '4px';
clearPuzzleButton.style.height = '32px';
clearPuzzleButton.addEventListener('click', () => {
	selected = false;
	board.resetGrid();
	saveData();
	draw();
});

const font = document.createElement('button');
font.appendChild(document.createTextNode("Font"));
font.style.position = 'absolute';
font.style.top = '4px';
font.style.left = '4px';
font.style.height = '32px';
font.addEventListener('click', () => {
	markerFont = !markerFont;
	setMarkerFont(markerFont);
	saveData();
	draw();
});

header.appendChild(title);
header.appendChild(font);
header.appendChild(newPuzzleButton);
header.appendChild(clearPuzzleButton);

header.style.position = 'static';
header.style.top = '0%';
header.style.width = '100%';
header.style.left = '0%';
header.style.height = '48px';
header.style.borderBottom = '1px solid black'

body.style.position = 'static';
body.style.top = '48px';
body.style.width = '100%';
body.style.left = '0%';
body.style.bottom = '192px';

footer.style.position = 'static';
footer.style.width = '100%';
footer.style.height = '192px';
footer.style.left = '0%';
footer.style.bottom = '0%';
footer.style.borderBottom = '1px solid black'

document.body.style.userSelect = 'none';
document.body.style.margin = '0px';

document.body.appendChild(picker);
// document.body.appendChild(pickerMarker);
document.body.appendChild(board.canvas);
// document.body.appendChild(clearButton);
// document.body.appendChild(candidateButton);

document.body.appendChild(header);
