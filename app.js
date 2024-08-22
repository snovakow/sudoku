import { FONT, board } from "./board.js";
import { consoleOut, fillSolve } from "./generator.js";
import { CellMarker, Grid } from "./Grid.js";
import { picker, pickerDraw, pickerMarker, pixAlign } from "./picker.js";
import { bentWings, candidates, hiddenSingles, jellyfish, loneSingles, NakedHiddenGroups, omissions, swordfish, uniqueRectangle, xWing } from "./solver.js";

const raws = [
	"19 clue 1 simple",
	'003400000700000000000010600060000000000070040050002930000003000000065800914000000'.split(''),
	"19 clue 2 brute",
	'000050700000100000590003600300000007000060400800070000006090000000000008009000031'.split(''),
	"19 clue 3 simple",
	'000000080060200010050007040070065000800001090000000002009004000400000000002000005'.split(''),
	"19 clue 4 simple",
	'020056000008000000090070300480010000000000020000000050300009000700002800000000407'.split(''),
	"30 clue 1",
	'000400080008029030090003004370060048900000600680002375000200007007005890000017000'.split(''),
	"30 clue 2",
	'023400000500300000600000400302000608000010004805030921001200006006100300438960000'.split(''),
	"30 clue 3",
	'000050080000000204748000601090000170800700940600900008500200093280004000007090810'.split(''),
	"30 clue 4",
	'000000780067280140000900300046700000210500000030060004000000407001009050654007901'.split(''),
	"30 clue 5",
	'000400700068903010004080006046109002000000000800000050680210500010035208200004600'.split(''),
	"30 clue 6",
	'023400709000900314090010000201000500000000000060040032600090871009070050002130040'.split(''),
	"30 clue 7",
	'120450080004009035089030060400300507302547900000000003001000000000800090000904050'.split(''),
	"30 clue 8",
	'023006080540080001807001000000020000301070200002010097734000102000000005605000038'.split(''),
	"30 clue 9",
	'000000000589107000070002005000003800800571002030208010950000071000000290010720043'.split(''),
];
const sudokuSamples = [];
for (let rawIndex = 0; rawIndex < raws.length; rawIndex += 2) {
	const name = raws[rawIndex];
	const raw = raws[rawIndex + 1];
	const puzzle = [];
	for (let i = 0, index = 0; i < 9; i++) {
		const row = [];
		for (let j = 0; j < 9; j++, index++) {
			row[j] = raw[index];
		}
		puzzle[i] = row;
	}
	puzzle[9] = name;
	sudokuSamples.push(puzzle);
}

let selectedRow = 0;
let selectedCol = 0;
let selected = false;

document.body.appendChild(picker);
document.body.appendChild(pickerMarker);

document.body.style.userSelect = 'none';

const draw = () => {
	board.draw(selected, selectedRow, selectedCol);

	const font = "100 " + pixAlign(64 * window.devicePixelRatio) + "px " + FONT;
	pickerDraw(font);
}

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
	document.body.appendChild(select);

	document.body.appendChild(document.createElement('br'));

	return select;
};

const names = [];
for (const sudoku of sudokuSamples) names.push(sudoku[9]);

const selector = createSelect(["-", ...names], (select) => {
	if (select.selectedIndex === 0) {
		for (let i = 0; i < 81; i++) {
			const cell = board.cells[i];
			cell.show = false;
			cell.setSymbol(0);
			board.startCells[i].symbol = 0;
		}
		localStorage.removeItem("gridName");
		saveGrid();
		draw();
		return;
	}

	selected = false;

	const index = select.selectedIndex - 1;
	board.setGrid(index < sudokuSamples.length ? sudokuSamples[index] : sudokuSamples[index - sudokuSamples.length]);
	saveGrid(select.selectedIndex);
	draw();
});
selector.style.position = 'absolute';
selector.style.width = '40px';

const DataVersion = "0.2";

const saveGrid = (selectedIndex = null) => {
	if (selectedIndex !== null) localStorage.setItem("gridName", selectedIndex);
	localStorage.setItem("DataVersion", DataVersion);
	localStorage.setItem("startGrid", board.startCells.toStorage());
	localStorage.setItem("grid", board.cells.toStorage());
};
const loadGrid = () => {
	if (localStorage.getItem("DataVersion") !== DataVersion) return false;

	const selectedIndex = localStorage.getItem("gridName");
	if (selectedIndex !== null) {
		const selectedInt = parseInt(selectedIndex);
		if (selectedInt > 0 && selectedInt < selector.options.length) selector.selectedIndex = selectedInt;
	}

	const startGrid = localStorage.getItem("startGrid");
	if (!startGrid) return false;

	board.startCells.fromStorage(startGrid);

	const grid = localStorage.getItem("grid");
	if (grid) {
		board.cells.fromStorage(grid);
	}
};

loadGrid();

document.body.appendChild(board.canvas);

let superpositionMode = 0;
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
		if (timer && superpositionMode === 0) superimposeMarkers(true);
	}
	draw();
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
	if (timer) superimposeMarkers(false);

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

	draw();

	saveGrid(selector.selectedIndex);

	if (running) {
		fillSolve(board.cells, window.location.search);
		saveGrid();
		superimposeMarkers();
	}
};
picker.addEventListener('click', pickerClick);

const pickerMarkerClick = (event) => {
	// event.preventDefault();

	if (!selected) return;

	const running = timer ? true : false;
	if (timer) superimposeMarkers(false);

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

	draw();

	saveGrid(selector.selectedIndex);

	if (running) {
		fillSolve(board.cells, window.location.search);
		saveGrid();
		superimposeMarkers();
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

const clearButton = document.createElement('button');
clearButton.appendChild(document.createTextNode("X"));
clearButton.style.position = 'absolute';
clearButton.style.width = '32px';
clearButton.style.height = '32px';
clearButton.addEventListener('click', () => {
	selected = false;
	board.resetGrid();
	saveGrid();
	draw();
});
document.body.appendChild(clearButton);

const markerButton = document.createElement('button');
markerButton.appendChild(document.createTextNode("x"));
markerButton.style.position = 'absolute';
markerButton.style.width = '32px';
markerButton.style.height = '32px';

markerButton.addEventListener('click', () => {
	for (const cell of board.cells) {
		cell.show = true;
	}

	const now = performance.now();

	const result = fillSolve(board.cells, window.location.search);
	console.log("----- " + (performance.now() - now) / 1000);
	for (const line of consoleOut(result)) console.log(line);

	draw();
	saveGrid();
});
document.body.appendChild(markerButton);

selector.style.transform = 'translateX(-50%)';
clearButton.style.transform = 'translateX(-50%)';
markerButton.style.transform = 'translateX(-50%)';

markerButton.style.touchAction = "manipulation";

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

		markerButton.style.bottom = '324px';
		markerButton.style.left = '96px';

		selector.style.bottom = '288px';
		selector.style.left = '96px';

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

		markerButton.style.bottom = '128px';
		markerButton.style.left = '50%';

		selector.style.bottom = '96px';
		selector.style.left = '50%';

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
