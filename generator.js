import { aCells, bCells } from "./solver.js";

const makeArray = (size) => {
	const array = new Uint8Array(size);
	for (let i = 0; i < size; i++) array[i] = i;
	return array;
}
const randomize = (array) => {
	const size = array.length;
	for (let i = 0; i < size; i++) {
		const position = Math.floor(Math.random() * size);
		if (position !== i) {
			const tmp = array[position];
			array[position] = array[i];
			array[i] = tmp;
		}
	}
}

let totalPuzzles = 0;

const grid = new Uint8Array(81);

function isValidCell(board, row, col, x) {
	for (let i = 0; i < 9; i++) {
		const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
		const n = 3 * Math.floor(col / 3) + i % 3;
		if (board[row * 9 + i] == x || board[i * 9 + col] == x || board[m * 9 + n] == x) {
			return false;
		}
	}
	return true;
}

const isValidGrid = (grid) => {
	let symbols = 0;
	for (let i = 0; i < 81; i++) {
		if (grid[i] !== 0) symbols++;
	}
	if (symbols < 17) return false;

	for (let row = 0; row < 9; row++) {
		for (let x = 1; x <= 9; x++) {
			let rowCount = 0;
			let colCount = 0;
			let boxCount = 0;

			for (let i = 0; i < 9; i++) {
				if (grid[row * 9 + i] === x) {
					rowCount++;
					if (rowCount === 2) return false;
				}
				if (grid[i * 9 + row] === x) {
					colCount++;
					if (colCount === 2) return false;
				}

				const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
				const n = 3 * Math.floor(row / 3) + i % 3;

				if (grid[m * 9 + n] === x) {
					boxCount++;
					if (boxCount === 2) return false;
				}
			}

		}
	}
	return true;
}

const sodokoSolver = (grid) => {
	const rndx = makeArray(9);
	for (let i = 0; i < 81; i++) {
		const index = i;
		if (grid[index] === 0) {
			randomize(rndx);
			for (let x = 0; x < 9; x++) {
				const symbol = rndx[x] + 1;
				if (isValidCell(grid, Math.floor(index / 9), index % 9, symbol)) {
					grid[index] = symbol;
					if (sodokoSolver(grid)) {
						return true;
					} else {
						grid[index] = 0;
					}
				}
			}
			return false;
		}
	}
	return true;
}

const solutionCount = (grid, solutions = 0) => {
	for (let i = 0; i < 81; i++) {
		if (grid[i] !== 0) continue;
		const index = i;
		for (let x = 0; x < 9; x++) {
			const symbol = x + 1;
			if (isValidCell(grid, Math.floor(index / 9), index % 9, symbol)) {
				grid[index] = symbol;
				solutions = solutionCount(grid, solutions);
				if (solutions < 2) {
					grid[index] = 0;
				} else {
					return solutions;
				}
			}
		}
		return solutions;
	}
	return solutions + 1;
}

const savedGrid = new Uint8Array(81);
const rndi = makeArray(81);

let once = 0;
const samePuzzle = false;
const sudokuGenerator = (cells) => {

	if(samePuzzle) {
		if (once === 0) {
			for (let i = 0; i < 81; i++) grid[i] = cells[i].symbol;	
			sodokoSolver(grid);
		}
	} else {
		for (let i = 0; i < 81; i++) grid[i] = 0;
		for (let i = 0; i < 9; i++) grid[i] = i + 1;
		sodokoSolver(grid);	
	}

	if (!isValidGrid(grid)) {
		console.log("INVALID!");
		return;
	}

	randomize(rndi);

	for (let i = 0; i < 81; i++) {
		const index = rndi[i];

		// if (groupCells.has(index)) continue;

		// const index = i;
		const symbol = grid[index];
		if (symbol === 0) continue;
		grid[index] = 0;

		savedGrid.set(grid);

		const result = solutionCount(grid);
		// console.log(result)
		grid.set(savedGrid);
		if (result !== 1) {
			grid[index] = symbol;
		}
	}

	let hits = 0;
	for (let i = 0; i < 81; i++) {
		if (grid[i] !== 0) {
			hits++;
		}
	}
	totalPuzzles++;

	for (let i = 0; i < 81; i++) {
		const cell = cells[i];
		cell.setSymbol(grid[i]);
	}

	if (hits < 20) {
		console.log(hits, totalPuzzles);
		cells.log();
	}

	return { clueCount: hits, grid };
}

const sudokuGeneratorPhistomefel = (cells) => {

	if (once % 1 === 0) {
		for (let i = 0; i < 81; i++) grid[i] = 0;
		for (let i = 0; i < 9; i++) grid[i] = i + 1;
	}
	once++;
	sodokoSolver(grid);

	if (!isValidGrid(grid)) {
		console.log("INVALID!");
		return;
	}

	randomize(rndi);

	const rnd = [];
	const rndChanceA = Math.random() * 1.5 - 0.25;
	for (const cell of aCells) {
		if (Math.random() < rndChanceA) rnd.push(cell);
	}
	const rndChanceB = Math.random() * 1.5 - 0.25;
	for (const cell of bCells) {
		if (Math.random() < rndChanceB) rnd.push(cell);
	}

	const rndSet = new Set(rnd);
	randomize(rnd);

	for (let i = 0; i < 81; i++) {
		const index = rndi[i];

		if (rndSet.has(index)) continue;

		// const index = i;
		const symbol = grid[index];
		if (symbol === 0) continue;
		grid[index] = 0;

		savedGrid.set(grid);

		const result = solutionCount(grid);
		// console.log(result)
		grid.set(savedGrid);
		if (result !== 1) {
			grid[index] = symbol;
		}
	}

	for (const i of rnd) {
		const index = rnd[i];
		// const index = i;
		const symbol = grid[index];
		if (symbol === 0) continue;
		grid[index] = 0;

		savedGrid.set(grid);

		const result = solutionCount(grid);
		// console.log(result)
		grid.set(savedGrid);
		if (result !== 1) {
			grid[index] = symbol;
		}
	}

	for (let i = 0; i < 81; i++) {
		const cell = cells[i];
		cell.setSymbol(grid[i]);
	}

	let hits = 0;
	for (let i = 0; i < 81; i++) {
		if (grid[i] !== 0) {
			hits++;
		}
	}
	// console.log(hits);
	totalPuzzles++;

	return { clueCount: hits, grid };
}

export { totalPuzzles };
export { sudokuGenerator, sudokuGeneratorPhistomefel };