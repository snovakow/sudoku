import { aCells, bCells } from "./solver.js";
import { generate, candidates, loneSingles, hiddenSingles, omissions, NakedHiddenGroups, uniqueRectangle, yWing, xWing, swordfish, jellyfish, bruteForce, phistomefel, REDUCE } from "./solver.js";

const consoleOut = (result) => {
	const lines = [];
	const phistomefelReduced = result.phistomefelReduced;
	const phistomefelFilled = result.phistomefelFilled;
	lines.push("Naked Hidden Sets: " + result.nakedHiddenSetsReduced.length);
	for (const nakedHiddenSet of result.nakedHiddenSetsReduced) {
		if (nakedHiddenSet.hidden) lines.push("    Hidden " + nakedHiddenSet.size);
		else lines.push("    Naked " + nakedHiddenSet.size);
	}
	lines.push("Deadly Pattern Unique Rectangle: " + result.uniqueRectangleReduced);
	lines.push("X Wing: " + result.xWingReduced);
	lines.push("Y Wing: " + result.yWingReduced);
	lines.push("Swordfish: " + result.swordfishReduced);
	lines.push("Jellyfish: " + result.jellyfishReduced);
	lines.push("Phistomefel: " + phistomefelReduced + (phistomefelFilled > 0 ? " + " + phistomefelFilled + " filled" : ""));
	lines.push("Brute Force: " + result.bruteForceFill);
	return lines;
}

const isFinished = (cells) => {
	for (let i = 0; i < 81; i++) {
		const cell = cells[i];
		if (cell.symbol === 0) return false;
	}
	return true;
}

const fillSolve = (cells, search, reduce = null) => {
	let uniqueRectangleReduced = 0;

	let nakedHiddenSetsReduced = [];
	let xWingReduced = 0;
	let swordfishReduced = 0;
	let jellyfishReduced = 0;
	let yWingReduced = 0;

	let phistomefelReduced = 0;
	let phistomefelFilled = 0;

	let bruteForceFill = false;

	let progress = false;
	do {
		candidates(cells);

		progress = loneSingles(cells);
		if (progress) continue;

		progress = hiddenSingles(cells);
		if (progress) continue;

		progress = omissions(cells);
		if (progress) continue;

		if (search === "?markers") continue;

		for (const type in REDUCE) {
			const strategy = REDUCE[type];
			if (reduce === strategy) continue;

			switch (strategy) {
				case REDUCE.Hidden_4:
					const result = new NakedHiddenGroups(cells).nakedHiddenSets();
					if (result) {
						progress = true;
						nakedHiddenSetsReduced.push(result);
					}
					break;
				case REDUCE.UniqueRectangle:
					progress = uniqueRectangle(cells);
					if (progress) uniqueRectangleReduced++;
					break;
				case REDUCE.X_Wing:
					progress = xWing(cells);
					if (progress) xWingReduced++;
					break;
				case REDUCE.Y_Wing:
					progress = yWing(cells);
					if (progress) yWingReduced++;
					break;
				case REDUCE.Swordfish:
					progress = swordfish(cells);
					if (progress) swordfishReduced++;
					break;
				case REDUCE.Jellyfish:
					progress = jellyfish(cells);
					if (progress) jellyfishReduced++;
					break;
				case REDUCE.Phistomefel:
					const { reduced, filled } = phistomefel(cells);
					progress = reduced > 0 || filled > 0;
					if (progress) {
						if (reduced > 0) phistomefelReduced++;
						if (filled > 0) phistomefelFilled++;
					}
					break;
				default:
					break;
			}
			if (progress) break;
		}

		if (progress) continue;

		switch (reduce) {
			case REDUCE.Hidden_4:
				const result = new NakedHiddenGroups(cells).nakedHiddenSets();
				if (result) {
					progress = true;
					nakedHiddenSetsReduced.push(result);
				}
				break;
			case REDUCE.UniqueRectangle:
				progress = uniqueRectangle(cells);
				if (progress) { uniqueRectangleReduced++; continue; }
				break;
			case REDUCE.X_Wing:
				progress = xWing(cells);
				if (progress) { xWingReduced++; continue; }
				break;
			case REDUCE.Y_Wing:
				progress = yWing(cells);
				if (progress) { yWingReduced++; continue; }
				break;
			case REDUCE.Swordfish:
				progress = swordfish(cells);
				if (progress) { swordfishReduced++; continue; }
				break;
			case REDUCE.Jellyfish:
				progress = jellyfish(cells);
				if (progress) jellyfishReduced++;
				break;
			case REDUCE.Phistomefel:
				const { reduced, filled } = phistomefel(cells);
				progress = reduced > 0 || filled > 0;
				if (progress) {
					if (reduced > 0) phistomefelReduced++;
					if (filled > 0) phistomefelFilled++;
					continue;
				}
				break;
			default:
				break;
		}

		bruteForceFill = !isFinished(cells);
		// bruteForce(board.cells);
	} while (progress);

	return {
		nakedHiddenSetsReduced,
		uniqueRectangleReduced,
		xWingReduced,
		yWingReduced,
		swordfishReduced,
		jellyfishReduced,
		phistomefelReduced,
		phistomefelFilled,
		bruteForceFill
	};
}

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

let operations = 0;
const solutionCount = (grid, solutions = 0) => {
	operations++;
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
const sudokuGenerator = (cells, target = 0) => {
	for (let i = 0; i < 81; i++) grid[i] = 0;
	for (let i = 0; i < 9; i++) grid[i] = i + 1;
	sodokoSolver(grid);

	if (!isValidGrid(grid)) {
		console.log("INVALID!");
		return;
	}

	randomize(rndi);

	const edge = new Set();
	if (target === 1) {
		let number = Math.floor(Math.random() * 27);
		const type = Math.floor(number / 9);
		const x = number % 9;

		if (type === 0) {
			for (const cell of cells) if (cell.row === x) edge.add(cell.index);
		}
		if (type === 1) {
			for (const cell of cells) if (cell.col === x) edge.add(cell.index);
		}
		if (type === 2) {
			for (const cell of cells) if (cell.box === x) edge.add(cell.index);
		}
	}

	operations = 0;

	for (const index of edge) {
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
		const index = rndi[i];

		if (edge.has(index)) continue;

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

	return { clueCount: hits, grid, operations };
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
	const rndChanceA = 0;//Math.random() * 2 - 1;
	for (const cell of aCells) {
		if (Math.random() < rndChanceA) rnd.push(cell);
	}
	const rndChanceB = 0;//Math.random() * 2 - 1;
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
export { sudokuGenerator, sudokuGeneratorPhistomefel, fillSolve, consoleOut };