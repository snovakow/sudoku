import { CellMarker, Grid } from "./Grid.js";
import { sudokuGenerator, sudokuGeneratorPhistomefel, fillSolve, totalPuzzles, consoleOut } from "./generator.js";
import { REDUCE } from "./solver.js";

const cells = new Grid();

for (const index of Grid.indices) cells[index] = new CellMarker(index);

const step = (search) => {
	if (search === "?phist") {
		const { clueCount, grid } = sudokuGeneratorPhistomefel(cells);
		const data = {
			cells: cells.toData(),
			message: null
		};

		const result = fillSolve(cells, search, REDUCE.Phistomefel);
		let basic = result.swordfishReduced === 0 && result.xyWingReduced === 0 && result.xWingReduced === 0 && result.uniqueRectangleReduced === 0;
		if (result.nakedHiddenSetsReduced.length > 0) {
			basic = false;
		}

		if (!result.bruteForceFill && basic && (result.phistomefelReduced > 0 || result.phistomefelFilled > 0)) {
			const lines = [];
			lines.push("Tries: " + totalPuzzles);
			lines.push(...consoleOut(result));
			lines.push(grid.toString());
			data.message = lines;
		}
		postMessage(data);
	} else {
		const { clueCount, grid } = sudokuGenerator(cells);
		const data = {
			cells: cells.toData(),
			message: null
		};

		const result = fillSolve(cells, search);

		// REDUCE.Hidden_4
		// REDUCE.UniqueRectangle
		// REDUCE.X_Wing
		// REDUCE.XY_Wing
		// REDUCE.Swordfish
		// REDUCE.Phistomefel
		// REDUCE.Brute_Force

		if (!result.bruteForceFill && result.nakedHiddenSetsReduced.length > 0) {
			for (const nakedHiddenSet of result.nakedHiddenSetsReduced) {
				if (nakedHiddenSet.size === 5) {
					const lines = [];
					lines.push("Hidden 4 Tries: " + totalPuzzles);
					lines.push(...consoleOut(result));
					lines.push(grid.toString());
					data.message = lines;
					break;
				}
			}
		}
		postMessage(data);
	}

	setTimeout(() => { step(search) }, 0);
};

onmessage = (e) => {
	const search = e.data.search;
	cells.fromData(e.data.cells);

	step(search);
};