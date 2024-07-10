import { FONT, board } from "./board.js";
import { sudokuGenerator, sudokuGeneratorPhistomefel, totalPuzzles } from "./generator.js";
import { picker, pickerDraw, pickerMarker, pixAlign } from "./picker.js";
import { candidates, loneSingles, hiddenSingles, nakedSets, hiddenSets, omissions, xWing, swordfish, xyWing, generate, bruteForce, phistomefel, uniqueRectangle } from "./solver.js";

const sudokuSamples = [
	// [
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	"Name"
	// ],
	[
		[0, 0, 0, 8, 4, 0, 3, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 8, 0],
		[2, 0, 9, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0, 4, 0],
		[0, 0, 0, 3, 0, 0, 0, 0, 8],
		[0, 0, 0, 9, 0, 6, 0, 0, 1],
		[0, 4, 3, 0, 0, 0, 5, 6, 0],
		[9, 5, 0, 0, 0, 0, 7, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		"20"
	],
	[
		[0, 0, 0, 0, 4, 0, 2, 0, 0],
		[2, 0, 0, 0, 0, 0, 6, 5, 0],
		[9, 0, 0, 6, 0, 0, 0, 0, 7],
		[0, 0, 0, 7, 6, 3, 0, 0, 0],
		[0, 0, 0, 0, 5, 0, 0, 0, 1],
		[0, 0, 0, 2, 1, 4, 0, 0, 0],
		[8, 0, 0, 1, 0, 7, 0, 0, 4],
		[0, 3, 6, 0, 0, 0, 0, 0, 8],
		[0, 0, 2, 0, 3, 0, 0, 0, 0],
		"XY-Wing"
	],
	[
		[0, 5, 0, 0, 2, 0, 0, 0, 0],
		[0, 0, 0, 6, 0, 0, 1, 0, 0],
		[0, 8, 3, 0, 0, 4, 0, 0, 6],
		[0, 3, 9, 0, 8, 0, 7, 0, 0],
		[5, 0, 0, 0, 0, 0, 0, 0, 3],
		[1, 0, 0, 0, 0, 9, 0, 0, 0],
		[0, 6, 4, 0, 0, 8, 0, 0, 1],
		[9, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 7, 0, 0, 2, 0],
		"XY-Wing"
	],
	[
		[0, 4, 0, 3, 6, 7, 0, 0, 0],
		[0, 1, 0, 0, 8, 0, 0, 6, 0],
		[6, 0, 0, 0, 4, 0, 0, 0, 2],
		[0, 0, 3, 8, 2, 0, 9, 0, 6],
		[0, 8, 4, 0, 0, 0, 2, 5, 3],
		[0, 0, 6, 0, 0, 0, 8, 0, 0],
		[4, 0, 0, 0, 9, 0, 0, 0, 5],
		[0, 5, 0, 0, 7, 0, 0, 9, 0],
		[0, 0, 0, 6, 5, 8, 0, 2, 0],
		"X-Wing"
	],
	[
		[0, 9, 0, 0, 0, 4, 0, 8, 5],
		[0, 1, 0, 0, 8, 0, 9, 0, 0],
		[0, 0, 2, 3, 9, 0, 0, 4, 0],
		[0, 0, 0, 0, 0, 9, 0, 0, 8],
		[5, 0, 0, 0, 3, 0, 0, 9, 6],
		[9, 0, 0, 8, 0, 0, 0, 0, 0],
		[0, 4, 0, 0, 0, 8, 2, 0, 0],
		[0, 0, 3, 0, 4, 0, 0, 1, 0],
		[6, 0, 0, 7, 0, 3, 0, 5, 0],
		"v=bnPmmAeb-SI"
	],
	[
		[0, 0, 5, 0, 2, 0, 6, 0, 0],
		[0, 9, 0, 0, 0, 4, 0, 1, 0],
		[2, 0, 0, 5, 0, 0, 0, 0, 3],
		[0, 0, 6, 0, 3, 0, 0, 0, 0],
		[0, 0, 0, 8, 0, 1, 0, 0, 0],
		[0, 0, 0, 0, 9, 0, 4, 0, 0],
		[3, 0, 0, 0, 0, 2, 0, 0, 7],
		[0, 1, 0, 9, 0, 0, 0, 5, 0],
		[0, 0, 4, 0, 6, 0, 8, 0, 0],
		"v=ynkkMxQPUpk"
	],
	[
		[0, 0, 0, 1, 0, 2, 0, 0, 0],
		[0, 6, 0, 0, 0, 0, 0, 7, 0],
		[0, 0, 8, 0, 0, 0, 9, 0, 0],
		[4, 0, 0, 0, 0, 0, 0, 0, 3],
		[0, 5, 0, 0, 0, 7, 0, 0, 0],
		[2, 0, 0, 0, 8, 0, 0, 0, 1],
		[0, 0, 9, 0, 0, 0, 8, 0, 5],
		[0, 7, 0, 0, 0, 0, 0, 6, 0],
		[0, 0, 0, 3, 0, 4, 0, 0, 0],
		"v=Ui1hrp7rovw"
	],
	[
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 2, 0, 9, 0, 0, 3, 8, 0],
		[0, 3, 0, 1, 0, 0, 7, 5, 0],
		[0, 4, 8, 0, 2, 0, 0, 0, 0],
		[0, 5, 0, 0, 0, 6, 0, 0, 0],
		[7, 6, 0, 5, 0, 0, 4, 1, 0],
		[4, 0, 0, 0, 0, 3, 0, 0, 0],
		[2, 0, 0, 8, 4, 5, 6, 7, 0],
		[0, 7, 5, 2, 0, 0, 0, 0, 0],
		"v=fjWOgJqRWZI"
	],
	[
		[0, 0, 5, 0, 0, 0, 2, 0, 0],
		[0, 9, 0, 0, 6, 0, 0, 8, 0],
		[8, 0, 3, 0, 0, 0, 1, 0, 9],
		[0, 0, 0, 3, 0, 9, 0, 0, 0],
		[0, 4, 0, 0, 0, 0, 0, 3, 0],
		[0, 0, 0, 7, 0, 4, 0, 0, 0],
		[2, 0, 7, 0, 0, 0, 6, 0, 5],
		[0, 5, 0, 0, 1, 0, 0, 2, 0],
		[0, 0, 9, 0, 0, 0, 8, 0, 0],
		"v=BjOtNij7C84"
	],
];

const rawNames = [
	"Phistomefel 1",
	"Phistomefel 2",
	"Phistomefel 3",
	"Phistomefel - XY Wing",
	"Phistomefel 4",
	"Phistomefel 5",
	"Phistomefel - XY Wing",
	"Phistomefel 6",
	"Phistomefel - 2 XY Wings",
	"Phistomefel Swordfish",
	"Phistomefel - XY Wing",
	"Phistomefel - XY Wing",
	"Phistomefel - 2 XY Wings",
	"Phistomefel - XY Wing",
	"Phistomefel - XY Wing",
	"Phistomefel 7",
	"20",
];
rawNames.reverse();
const raws = [
	[1, 2, 0, 0, 0, 6, 0, 8, 9, 6, 9, 0, 0, 0, 0, 0, 5, 2, 0, 0, 7, 0, 0, 0, 6, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 7, 0, 0, 0, 9, 0, 0, 0, 4, 0, 0, 0, 0, 7, 3, 0, 0, 0, 0, 0, 0, 2, 0, 0, 8, 0, 0, 0, 8, 1, 0, 5, 0, 0, 0, 7, 3, 7, 5, 0, 0, 0, 0, 0, 9, 8],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 9, 7, 2, 1, 4, 0, 6, 6, 0, 5, 0, 4, 0, 2, 0, 7, 0, 9, 4, 0, 0, 0, 8, 0, 0, 8, 0, 7, 0, 0, 5, 1, 0, 0, 0, 0, 2, 1, 6, 4, 9, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0],
	[1, 2, 0, 0, 0, 0, 0, 8, 9, 5, 7, 0, 0, 9, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 1, 8, 0, 0, 4, 0, 0, 0, 0, 8, 0, 0, 7, 0, 0, 0, 0, 0, 0, 5, 0, 9, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 4, 7, 4, 3, 0, 0, 6, 0, 0, 9, 5],
	[1, 0, 0, 4, 5, 0, 0, 8, 9, 0, 6, 0, 0, 0, 0, 0, 5, 0, 0, 0, 5, 0, 2, 0, 4, 0, 0, 0, 4, 0, 0, 0, 3, 9, 0, 0, 0, 0, 0, 0, 8, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1, 0, 0, 0, 0, 0, 6, 4, 5, 9, 0, 0, 4, 0, 0, 1, 7],
	[0, 0, 0, 0, 5, 0, 0, 0, 9, 0, 0, 0, 2, 0, 3, 1, 0, 0, 0, 0, 5, 0, 8, 1, 3, 0, 6, 0, 7, 0, 0, 0, 0, 6, 5, 0, 0, 0, 4, 1, 0, 5, 2, 0, 0, 0, 0, 1, 0, 0, 0, 9, 0, 0, 0, 6, 2, 8, 9, 4, 5, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 8, 0, 6, 7, 2, 0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 8, 0, 7, 0, 7, 9, 2, 0, 0, 3, 0, 0, 0, 0, 8, 0, 6, 0, 0, 0, 0, 0, 0, 1, 5, 3, 8, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 5, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0],
	[1, 2, 0, 0, 5, 6, 0, 8, 9, 9, 4, 0, 0, 0, 0, 0, 1, 0, 6, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 6, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 6, 0, 8, 0, 0, 0, 9, 4, 4, 3, 0, 0, 0, 0, 0, 5, 6],
	[0, 0, 0, 4, 0, 0, 0, 0, 9, 8, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 6, 0, 0, 8, 5, 0, 0, 7, 0, 9, 0, 0, 0, 8, 0, 3, 0, 1, 5, 0, 0, 0, 9, 0, 0, 0, 0, 8, 0, 0, 0, 6, 0, 0, 0, 0, 2, 9, 3, 5, 1, 0, 0, 0, 9, 1, 0, 6, 0, 0, 0, 5, 0, 0, 0, 1, 0, 0, 0, 0, 0],
	[1, 2, 0, 0, 0, 0, 0, 8, 0, 7, 5, 0, 0, 0, 0, 0, 1, 6, 0, 0, 6, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 9, 0, 0, 0, 0, 0, 7, 0, 5, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 6, 9, 1, 0, 1, 9, 0, 0, 0, 0, 4, 5],
	[1, 2, 0, 0, 5, 0, 0, 8, 9, 6, 5, 0, 0, 3, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 5, 6, 0, 3, 0, 0, 0, 0, 0, 7, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 8, 3, 0, 0, 1, 0, 0, 5, 2, 2, 1, 0, 0, 0, 0, 0, 0, 7],
	[0, 2, 0, 0, 0, 0, 0, 8, 9, 6, 4, 0, 0, 8, 0, 0, 0, 2, 7, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 9, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 3, 0, 0, 7, 0, 0, 9, 4, 9, 7, 0, 0, 2, 5, 0, 6, 8],
	[0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 1, 0, 0, 0, 4, 0, 0, 8, 3, 9, 7, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 6, 2, 0, 1, 0, 3, 0, 1, 0, 0, 0, 5, 0, 0, 0, 0, 2, 5, 0, 9, 1, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 9, 0, 7],
	[0, 2, 0, 4, 0, 0, 7, 8, 0, 0, 8, 0, 1, 0, 0, 0, 5, 3, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 1, 9, 0, 0, 4, 0, 0, 8, 0, 5, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 4, 9, 0, 0, 3, 7, 0, 0, 0, 0, 0, 2, 8, 0, 1, 0, 0, 0, 0, 0, 0, 7],
	[0, 0, 0, 0, 5, 0, 7, 0, 9, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 8, 1, 3, 7, 6, 0, 0, 0, 0, 5, 0, 0, 0, 3, 4, 0, 0, 0, 2, 0, 0, 0, 0, 6, 0, 9, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 6, 0, 8, 0, 0, 3, 0, 0, 8, 0, 0, 0, 5, 0, 0, 1, 0, 7, 0, 0, 0, 0, 0],
	[1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1, 9, 7, 5, 0, 0, 0, 9, 1, 0, 0, 0, 8, 2, 0, 7, 8, 2, 0, 0, 0, 9, 0, 4, 0, 0, 4, 0, 2, 0, 6, 0, 0, 0, 0, 8, 2, 7, 1, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 1, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0],
	[0, 0, 0, 4, 0, 0, 0, 8, 9, 7, 0, 0, 0, 8, 0, 0, 6, 0, 0, 0, 6, 7, 1, 9, 3, 0, 0, 0, 0, 7, 0, 0, 0, 4, 0, 0, 0, 0, 9, 5, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 7, 1, 2, 0, 0, 0, 7, 0, 0, 0, 2, 0, 0, 8, 0, 6, 0, 0, 0, 0, 0, 4, 0],
	'100006000000000013908000600006000200030070000070003800000140900000930000050000000'.split(''),
];
raws.reverse();
let rawIndex = 0;
for (const raw of raws) {
	const puzzle = [];
	for (let i = 0, index = 0; i < 9; i++) {
		const row = [];
		for (let j = 0; j < 9; j++, index++) {
			row[j] = raw[index];
		}
		puzzle[i] = row;
	}
	puzzle[9] = rawNames[rawIndex];
	rawIndex++;

	sudokuSamples.unshift(puzzle);
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
const sudokus = [...sudokuSamples];
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
	board.setGrid(index < sudokus.length ? sudokus[index] : sudokuSamples[index - sudokus.length]);
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

	draw();

	saveGrid(selector.selectedIndex);
};
picker.addEventListener('click', pickerClick);

const pickerMarkerClick = (event) => {
	// event.preventDefault();

	if (!selected) return;

	const [r, c] = clickLocation(event);

	const index = r * 3 + c;
	const selectedIndex = selectedRow * 9 + selectedCol;
	const cell = board.cells[selectedIndex];
	if (cell.show) {
		cell.toggle(index);
	} else {
		cell.clear();
		cell.add(index);
		cell.show = true;
	}

	draw();

	saveGrid(selector.selectedIndex);
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

const fillSolve = () => {
	let uniqueRectangleReduced = 0;

	let nakedSetsReduced = 0;
	let hiddenSetsReduced = 0;
	let omissionsReduced = 0;
	let xWingReduced = 0;
	let swordfishReduced = 0;
	let xyWingReduced = 0;

	let phistomefelReduced = 0;
	let phistomefelFilled = 0;

	let bruteForceFill = false;

	let progress = false;
	do {
		candidates(board.cells);

		if (window.location.search === "?markers") continue;

		progress = loneSingles(board.cells);
		if (progress) continue;

		progress = hiddenSingles(board.cells);
		if (progress) continue;

		progress = uniqueRectangle(board.cells);
		if (progress) { uniqueRectangleReduced++; continue; }

		progress = nakedSets(board.cells);
		if (progress) { nakedSetsReduced++; continue; }

		progress = hiddenSets(board.cells);
		if (progress) { hiddenSetsReduced++; continue; }

		progress = omissions(board.cells);
		if (progress) { omissionsReduced++; continue; }

		progress = xWing(board.cells);
		if (progress) { xWingReduced++; continue; }

		progress = swordfish(board.cells);
		if (progress) { swordfishReduced++; continue; }

		progress = xyWing(board.cells);
		if (progress) { xyWingReduced++; continue; }

		bruteForceFill = !isFinished();
	} while (progress);

	return {
		uniqueRectangleReduced,
		nakedSetsReduced,
		hiddenSetsReduced,
		omissionsReduced,
		xWingReduced,
		swordfishReduced,
		xyWingReduced,
		phistomefelReduced,
		phistomefelFilled,
		bruteForceFill
	};
}

const fillSolvePhistomefel = () => {
	let phistomefelReduced = 0;
	let phistomefelFilled = 0;

	let uniqueRectangleReduced = 0;
	let nakedSetsReduced = 0;
	let hiddenSetsReduced = 0;
	let omissionsReduced = 0;
	let xWingReduced = 0;
	let swordfishReduced = 0;
	let xyWingReduced = 0;

	let bruteForceFill = false;

	let progress = false;
	do {
		candidates(board.cells);

		if (window.location.search === "?markers") continue;

		const { reduced, filled } = phistomefel(board.cells);
		progress = reduced || filled;
		if (reduced) phistomefelReduced++;
		if (filled) phistomefelFilled++;
		if (progress) continue;

		progress = loneSingles(board.cells);
		if (progress) continue;

		progress = hiddenSingles(board.cells);
		if (progress) continue;

		progress = uniqueRectangle(board.cells);
		if (progress) { uniqueRectangleReduced++; continue; }

		progress = nakedSets(board.cells);
		if (progress) { nakedSetsReduced++; continue; }

		progress = hiddenSets(board.cells);
		if (progress) { hiddenSetsReduced++; continue; }

		progress = omissions(board.cells);
		if (progress) { omissionsReduced++; continue; }

		progress = xWing(board.cells);
		if (progress) { xWingReduced++; continue; }

		progress = swordfish(board.cells);
		if (progress) { swordfishReduced++; continue; }

		progress = xyWing(board.cells);
		if (progress) { xyWingReduced++; continue; }

		bruteForceFill = !isFinished();
		// if (bruteForceFill) bruteForce(board.cells);

	} while (progress);

	return {
		reduced: phistomefelReduced,
		filled: phistomefelFilled,
		bruteForced: bruteForceFill
	};
}

markerButton.addEventListener('click', () => {
	for (const cell of board.cells) {
		if (cell.symbol !== 0) continue;
		cell.show = true;
	}

	const t = performance.now();

	const {
		uniqueRectangleReduced,
		nakedSetsReduced,
		hiddenSetsReduced,
		omissionsReduced,
		xWingReduced,
		swordfishReduced,
		xyWingReduced,
		phistomefelReduced,
		phistomefelFilled,
		bruteForceFill
	} = fillSolve();

	console.log("--- " + Math.round(performance.now() - t) / 1000);
	console.log("Deadly Pattern Unique Rectangle: " + uniqueRectangleReduced);
	console.log("Naked Sets: " + nakedSetsReduced);
	console.log("Hidden Sets: " + hiddenSetsReduced);
	console.log("Omissions: " + omissionsReduced);
	console.log("X Wing: " + xWingReduced);
	console.log("Swordfish: " + swordfishReduced);
	console.log("XY Wing: " + xyWingReduced);
	console.log("Phistomefel: " + phistomefelReduced + (phistomefelFilled > 0 ? " + " + phistomefelFilled + " filled" : ""));
	console.log("Brute Force: " + bruteForceFill);

	draw();
	saveGrid();
});
document.body.appendChild(markerButton);

const isFinished = () => {
	const cells = board.cells;
	for (let i = 0; i < 81; i++) {
		const cell = cells[i];
		if (cell.symbol === 0) return false;
	}
	return true;
}

const generateButton = document.createElement('button');
generateButton.appendChild(document.createTextNode("+"));
generateButton.style.position = 'absolute';
generateButton.style.width = '32px';
generateButton.style.height = '32px';

let running = false;
generateButton.addEventListener('click', () => {
	running = !running;
	const step = () => {
		const { clueCount, grid } = sudokuGeneratorPhistomefel(board.cells);

		const save = board.cells.toData();
		// const { clueCount, grid } = sudokuGenerator(board.cells);
		draw();

		// const now = performance.now();
		// console.log(`Time: ${Math.round(now - time) / 1000}`);

		const {
			reduced,
			filled,
			bruteForced
		} = fillSolvePhistomefel();

		if ((reduced > 0 || filled > 0) && !bruteForced) {
			board.cells.fromData(save);

			const {
				uniqueRectangleReduced,
				nakedSetsReduced,
				hiddenSetsReduced,
				omissionsReduced,
				xWingReduced,
				swordfishReduced,
				xyWingReduced,
				phistomefelReduced,
				phistomefelFilled,
				bruteForceFill
			} = fillSolve();

			if (bruteForceFill) {
				console.log("Phistomefel: " + phistomefelReducedBase + (phistomefelFilledBase > 0 ? " + " + phistomefelFilledBase + " filled" : "") + " " + totalPuzzles);
				console.log(grid.toString());
				// console.log("Phistomefel: " + phistomefelReduced + (phistomefelFilled > 0 ? " + " + phistomefelFilled + " filled" : "") + " " + totalPuzzles);
				// console.log("nakedSetsReduced: " + nakedSetsReduced);
				// console.log("hiddenSetsReduced: " + hiddenSetsReduced);
				// console.log("omissionsReduced: " + omissionsReduced);
				// console.log(grid.toString());

				// console.log("Deadly Pattern Unique Rectangle: " + uniqueRectangleReduced);
				// console.log("Naked Sets: " + nakedSetsReduced);
				// console.log("Hidden Sets: " + hiddenSetsReduced);
				// console.log("Omissions: " + omissionsReduced);
				// console.log("X Wing: " + xWingReduced);
				// console.log("Swordfish: " + swordfishReduced);
				// console.log("XY Wing: " + xyWingReduced);
				// console.log("Phistomefel: " + phistomefelReduced + (phistomefelFilled > 0 ? " + " + phistomefelFilled + " filled" : ""));
				// console.log("Brute Force: " + bruteForceFill);
				// console.log("Phistomefel: " + grid.toString());
			}
		}


		if (running) window.setTimeout(step, 0);
	};
	if (running) step();

	// saveGrid();
});
document.body.appendChild(generateButton);

selector.style.transform = 'translateX(-50%)';
clearButton.style.transform = 'translateX(-50%)';
generateButton.style.transform = 'translateX(-50%)';
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

		generateButton.style.bottom = '240px';
		generateButton.style.left = '96px';

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

		generateButton.style.bottom = '48px';
		generateButton.style.left = '50%';

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
