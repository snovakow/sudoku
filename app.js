import { FONT, board, markers } from "./board.js";
import { picker, pickerDraw, pixAlign, setMarkerMode } from "./picker.js";

let selectedRow = 0;
let selectedCol = 0;

let pickerVisible = false;

const draw = () => {
	board.draw(pickerVisible, selectedRow, selectedCol);
	if (pickerVisible) {
		if (!picker.parentElement) document.body.appendChild(picker);

		const font = "100 " + pixAlign(64 * window.devicePixelRatio) + "px " + FONT;
		pickerDraw(font);
	} else {
		if (picker.parentElement) document.body.removeChild(picker);
	}
}

const saveGrid = () => {
	localStorage.setItem("startGrid", board.startGrid.toData());
	localStorage.setItem("grid", board.grid.toData());

	localStorage.setItem("markers", JSON.stringify(markers));
};
const loadGrid = () => {
	const startGrid = localStorage.getItem("startGrid");

	if (startGrid) {
		board.startGrid.fromData(startGrid);

		const grid = localStorage.getItem("grid");
		if (grid) {
			board.grid.fromData(grid);
		}

		const markersJSON = localStorage.getItem("markers");
		if (markersJSON) {
			const markersData = JSON.parse(markersJSON);
			markers.length = 0;
			for (const index in markersData) {
				markers[index] = markersData[index];
			}
		}

		return true;
	}
	return false;
};

const sudokus = [
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
	// ],
	[
		[1, 0, 0, 2, 0, 0, 3, 0, 0],
		[2, 0, 0, 3, 0, 0, 4, 0, 0],
		[3, 0, 0, 4, 0, 0, 5, 0, 0],
		[4, 0, 0, 5, 0, 0, 6, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 3, 0, 0, 4, 0, 0, 5],
		[0, 0, 4, 0, 0, 5, 0, 0, 6],
		[0, 0, 5, 0, 0, 6, 0, 0, 7],
		[0, 0, 6, 0, 0, 7, 0, 0, 8],
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
	],
	[
		[0, 3, 0, 0, 4, 0, 0, 0, 0],
		[0, 0, 1, 0, 0, 7, 0, 0, 0],
		[0, 0, 6, 0, 0, 0, 9, 4, 0],
		[0, 0, 0, 5, 7, 8, 0, 0, 0],
		[0, 0, 0, 3, 0, 0, 2, 0, 0],
		[0, 0, 0, 1, 0, 0, 3, 0, 6],
		[5, 8, 0, 0, 0, 0, 0, 3, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 8],
		[7, 0, 0, 0, 1, 0, 0, 0, 5],
	],
	[
		[9, 0, 0, 4, 2, 0, 5, 6, 0],
		[0, 0, 7, 0, 0, 0, 0, 4, 0],
		[0, 5, 4, 0, 0, 0, 1, 9, 0],
		[0, 0, 0, 8, 7, 1, 9, 0, 0],
		[0, 2, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 6, 4, 0, 0],
		[0, 7, 0, 0, 3, 0, 0, 0, 5],
		[0, 0, 0, 0, 9, 0, 0, 0, 0],
		[0, 0, 8, 0, 0, 0, 0, 0, 0],
	],
];

if (!loadGrid()) board.setGrid(sudokus[0]);

let markerMode = false;

document.body.appendChild(board.canvas);

const resize = () => {
	const size = Math.min(window.innerWidth, window.innerHeight);
	board.canvas.style.width = size + 'px';
	board.canvas.style.height = size + 'px';
	board.canvas.width = Math.floor(size * window.devicePixelRatio / 1) * 2;
	board.canvas.height = Math.floor(size * window.devicePixelRatio / 1) * 2;

	draw();
};
resize();

window.addEventListener('resize', resize);

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

};

const click = (e) => {
	if (pickerVisible) {
		pickerVisible = false;
		draw();
		return;
	}

	// Get the bounding rectangle of target
	const rect = e.target.getBoundingClientRect();
	// Mouse position
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;

	const [row, col] = board.hitDetect(x, y, rect.width);

	if (row < 0 || col < 0) return;
	if (board.startGrid.getSymbol(row, col) !== 0) return;

	selectedRow = row;
	selectedCol = col;

	pickerVisible = true;
	draw();
};
board.canvas.addEventListener('click', click);

const pickerClick = (e) => {
	// Get the bounding rectangle of target
	const rect = e.target.getBoundingClientRect();
	// Mouse position
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;

	const sizeTotal = rect.width;

	const r = Math.floor(y / sizeTotal * 3);
	const c = Math.floor(x / sizeTotal * 3);

	if (r === 3) {
		if (c === 2) {
			markerMode = !markerMode;
			setMarkerMode(markerMode);
			const font = "100 " + pixAlign(64 * 0.7 / 0.8) + "px " + FONT;
			pickerDraw(font);
		} else if (c === 0) {
			delete markers[selectedRow * 9 + selectedCol];
			board.grid.setSymbol(selectedRow, selectedCol, 0);
			saveGrid();
			pickerVisible = false;
		}
	} else {
		const index = r * 3 + c;
		if (markerMode) {
			let marker = markers[selectedRow * 9 + selectedCol];
			if (!marker) {
				marker = [];
				markers[selectedRow * 9 + selectedCol] = marker;
			}
			marker[index] = !marker[index];
		} else {
			delete markers[selectedRow * 9 + selectedCol];
			board.grid.setSymbol(selectedRow, selectedCol, index + 1);
			saveGrid();
			pickerVisible = false;
		}
	}

	draw();
};
picker.addEventListener('click', pickerClick);

export const appInitialize = (version) => {
	console.log("Version: " + version);
}

const onFocus = () => {
	console.log("onFocus");
	draw();
};
const offFocus = () => {

};
window.addEventListener("focus", onFocus);
window.addEventListener("blur", offFocus);

createSelect([0, 1, 2, 3], (select) => {
	board.setGrid(sudokus[select.selectedIndex]);
	saveGrid();
	draw();
});

const clearButton = document.createElement('button');
clearButton.appendChild(document.createTextNode("Clear"));
clearButton.style.position = 'absolute';
clearButton.style.width = '64px';
clearButton.style.height = '64px';
clearButton.style.top = '64px';
clearButton.style.left = '64px';
clearButton.addEventListener('click', () => {
	markers.length = 0;
	board.resetGrid();
	saveGrid();
	draw();
});
document.body.appendChild(clearButton);