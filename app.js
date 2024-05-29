import { FONT, board, markers } from "./board.js";
import { picker, pickerDraw, pickerMarker, pixAlign } from "./picker.js";
import { fillMarkers, fillSingles, fillMissingSingles } from "./solver.js";

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
	[ // 26%
		[6, 0, 7, 9, 0, 1, 3, 0, 0],
		[9, 0, 3, 0, 7, 0, 0, 0, 0],
		[0, 5, 0, 0, 3, 0, 0, 0, 0],
		[0, 0, 0, 1, 2, 0, 6, 8, 0],
		[0, 0, 2, 5, 8, 9, 0, 0, 0],
		[5, 0, 0, 0, 0, 0, 0, 0, 0],
		[3, 0, 0, 0, 0, 7, 9, 0, 6],
		[0, 0, 0, 0, 6, 0, 4, 0, 0],
		[7, 0, 0, 3, 0, 0, 8, 0, 0],
	],
	[
		[2, 0, 0, 0, 0, 0, 0, 0, 8],
		[7, 0, 0, 0, 9, 0, 0, 0, 0],
		[6, 0, 5, 0, 3, 0, 0, 0, 0],
		[3, 0, 0, 0, 0, 0, 6, 0, 0],
		[0, 0, 8, 4, 0, 7, 9, 0, 0],
		[1, 0, 0, 6, 8, 0, 0, 0, 0],
		[0, 0, 3, 2, 0, 0, 0, 0, 1],
		[0, 5, 0, 0, 0, 0, 0, 0, 6],
		[0, 0, 0, 8, 0, 0, 0, 4, 0],
	],
	[
		[8, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 4, 0, 0, 0, 8, 9, 0],
		[9, 0, 0, 0, 3, 0, 0, 1, 0],
		[0, 7, 0, 0, 0, 4, 0, 0, 0],
		[0, 0, 0, 8, 1, 9, 0, 0, 0],
		[6, 4, 0, 0, 0, 3, 0, 0, 0],
		[0, 2, 5, 0, 0, 0, 0, 0, 6],
		[0, 0, 0, 0, 5, 0, 4, 0, 0],
		[0, 0, 0, 1, 0, 0, 0, 0, 3],
	],
	[
		[0, 0, 7, 0, 0, 8, 0, 0, 0],
		[0, 9, 5, 0, 0, 2, 6, 0, 0],
		[0, 0, 0, 1, 0, 0, 2, 5, 0],
		[0, 1, 0, 0, 0, 0, 0, 7, 9],
		[6, 0, 0, 0, 0, 9, 0, 0, 0],
		[0, 0, 8, 0, 0, 4, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 6, 4, 0, 0, 8, 0, 0],
		[0, 3, 0, 0, 5, 0, 0, 2, 0],
	],
	[
		[5, 0, 0, 0, 0, 4, 0, 7, 2],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 6, 1, 3, 0, 0, 0],
		[0, 0, 0, 3, 7, 8, 0, 0, 0],
		[0, 0, 0, 4, 0, 0, 0, 6, 3],
		[0, 0, 4, 0, 0, 0, 9, 0, 0],
		[0, 9, 6, 0, 0, 0, 1, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 4],
		[0, 1, 0, 0, 0, 5, 3, 9, 0],
	],
	[
		[0, 0, 1, 3, 0, 0, 0, 0, 0],
		[0, 9, 0, 0, 2, 0, 0, 0, 0],
		[0, 0, 8, 0, 0, 0, 0, 2, 6],
		[0, 0, 0, 0, 0, 9, 0, 0, 5],
		[0, 0, 0, 0, 0, 1, 8, 0, 9],
		[0, 0, 0, 7, 3, 4, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 7, 0, 0],
		[4, 7, 0, 0, 0, 0, 0, 9, 0],
		[3, 0, 0, 0, 1, 0, 4, 0, 0],
	],
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

document.body.appendChild(board.canvas);

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

const click = (event) => {
	// event.preventDefault();

	// Get the bounding rectangle of target
	const rect = event.target.getBoundingClientRect();
	// Mouse position
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;

	const [row, col] = board.hitDetect(x, y, rect.width);

	if (row < 0 || col < 0) return;

	if (board.startGrid.getSymbol(row, col) !== 0) return;

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
	const symbol = board.grid.getSymbol(selectedRow, selectedCol);
	if (symbol == index) {
		board.grid.setSymbol(selectedRow, selectedCol, 0);
	} else {
		delete markers[selectedRow * 9 + selectedCol];
		board.grid.setSymbol(selectedRow, selectedCol, index);
		saveGrid();
	}

	draw();
};
picker.addEventListener('click', pickerClick);

const pickerMarkerClick = (event) => {
	// event.preventDefault();

	if (!selected) return;

	const [r, c] = clickLocation(event);

	const index = r * 3 + c;
	let marker = markers[selectedRow * 9 + selectedCol];
	if (!marker) {
		marker = [];
		markers[selectedRow * 9 + selectedCol] = marker;
	}
	// if (marker[index]) delete marker[index];
	// else marker[index] = true;
	marker[index] = !marker[index];

	draw();
};
pickerMarker.addEventListener('click', pickerMarkerClick);

const onFocus = () => {
	console.log("onFocus");
	draw();
};
const offFocus = () => {

};
window.addEventListener("focus", onFocus);
window.addEventListener("blur", offFocus);

const orientationchange = (event) => {
	draw();
	console.log(event);
};
addEventListener("orientationchange", orientationchange);

const selector = createSelect(["-", ...sudokus.keys()], (select) => {
	if (select.selectedIndex === 0) return;

	markers.length = 0;
	board.setGrid(sudokus[select.selectedIndex - 1]);
	saveGrid();
	draw();
});
selector.style.position = 'absolute';

const clearButton = document.createElement('button');
clearButton.appendChild(document.createTextNode("X"));
clearButton.style.position = 'absolute';
clearButton.style.width = '32px';
clearButton.style.height = '32px';
clearButton.addEventListener('click', () => {
	markers.length = 0;
	board.resetGrid();
	saveGrid();
	draw();
});
document.body.appendChild(clearButton);

const singleButton = document.createElement('button');
singleButton.appendChild(document.createTextNode("+"));
singleButton.style.position = 'absolute';
singleButton.style.width = '32px';
singleButton.style.height = '32px';
singleButton.addEventListener('click', () => {
	let progress = false;
	let count = 0;
	do {
		fillMarkers(board.grid, markers);
		progress = fillSingles(board.grid, markers);
		if (progress) {
			count++;
		} else {
			progress = fillMissingSingles(board.grid, markers);
			if (progress) count++;
		}
	} while (progress);

	console.log("Removals: " + count);

	draw();
});
document.body.appendChild(singleButton);

const fillButton = document.createElement('button');
fillButton.appendChild(document.createTextNode("x"));
fillButton.style.position = 'absolute';
fillButton.style.width = '32px';
fillButton.style.height = '32px';
fillButton.addEventListener('click', () => {
	// markers.length = 0;
	fillMarkers(board.grid, markers);
	draw();
});
document.body.appendChild(fillButton);

selector.style.transform = 'translateX(-50%)';
clearButton.style.transform = 'translateX(-50%)';
fillButton.style.transform = 'translateX(-50%)';
singleButton.style.transform = 'translateX(-50%)';

singleButton.style.touchAction = "manipulation";

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

		singleButton.style.bottom = '320px';
		singleButton.style.left = '96px';

		fillButton.style.bottom = '280px';
		fillButton.style.left = '96px';

		selector.style.bottom = '240px';
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

		fillButton.style.bottom = '128px';
		fillButton.style.left = '50%';

		singleButton.style.bottom = '88px';
		singleButton.style.left = '50%';

		selector.style.bottom = '48px';
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
