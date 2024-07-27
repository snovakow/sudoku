import { CellMarker, Grid } from "./Grid.js";
import { sudokuGenerator, sudokuGeneratorPhistomefel, fillSolve, totalPuzzles, consoleOut } from "./generator.js";
import { REDUCE } from "./solver.js";

const cells = new Grid();

for (const index of Grid.indices) cells[index] = new CellMarker(index);

let hiddenSets2 = 0;
let hiddenSets3 = 0;
let nakedSets2 = 0;
let nakedSets3 = 0;
let nakedSets4 = 0;
let nakedSets5 = 0;
let uniqueRectangleReduced = 0;
let xWingReduced = 0;
let yWingReduced = 0;
let swordfishReduced = 0;
let jellyfishReduced = 0;
let simples = 0;
let markers = 0;
let bruteForceFill = 0;

let maxTime = 0;

let percentTime = 0;
let totalTime = 0;

let percentOps = 0;
let totalOps = 0;
const step = (search) => {
	if (search === "?phist") {
		const { clueCount, grid } = sudokuGeneratorPhistomefel(cells);
		const data = {
			cells: cells.toData(),
			message: null
		};

		const result = fillSolve(cells, search, REDUCE.Phistomefel);
		let basic = result.swordfishReduced === 0 && result.jellyfishReduced === 0 && result.yWingReduced === 0 && result.xWingReduced === 0 && result.uniqueRectangleReduced === 0;
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
		let time = performance.now();
		const { clueCount, grid, operations } = sudokuGenerator(cells);
		const test = cells.string();
		const data = {
			cells: cells.toData(),
			message: null
		};

		const elapsed = performance.now() - time;
		if (maxTime === 0) {
			maxTime = elapsed;
		} else {
			if (elapsed > maxTime) {
				maxTime = elapsed;
			}
		}

		const cap = 100000;
		if (operations < cap) percentOps++;
		if (operations < cap) percentTime += elapsed;

		totalTime += elapsed;
		totalOps += operations;

		const result = fillSolve(cells, search);

		if (result.bruteForceFill) {
			bruteForceFill++;
		} else {
			if (result.jellyfishReduced > 0) {
				console.log("Jellyfish -----");
				console.log(test);
				console.log("Jellyfish -----");
			}

			let simple = true;
			simple &&= result.nakedHiddenSetsReduced.length === 0;
			simple &&= result.uniqueRectangleReduced === 0;
			simple &&= result.xWingReduced === 0;
			simple &&= result.yWingReduced === 0;
			simple &&= result.swordfishReduced === 0;
			simple &&= result.jellyfishReduced === 0;

			if (simple) simples++;
			else {
				if (result.nakedHiddenSetsReduced.length > 0) {
					for (const set of result.nakedHiddenSetsReduced) {
						if (!set.hidden && set.size === 2) nakedSets2++;
						if (!set.hidden && set.size === 3) nakedSets3++;
						if (!set.hidden && set.size === 4) nakedSets4++;
						if (!set.hidden && set.size === 5) nakedSets5++;
						if (set.hidden && set.size === 2) hiddenSets2++;
						if (set.hidden && set.size === 3) hiddenSets3++;
					}
				}
				if (result.uniqueRectangleReduced > 0) uniqueRectangleReduced++;
				if (result.xWingReduced > 0) xWingReduced++;
				if (result.yWingReduced > 0) yWingReduced++;
				if (result.swordfishReduced > 0) swordfishReduced++;
				if (result.jellyfishReduced > 0) jellyfishReduced++;

				markers++;
			}
		}

		const res = 1000;
		const percent = (val, total = totalPuzzles) => {
			return Math.round(100 * res * val / total) / res + "%";
		}

		if (totalPuzzles % 10 === 0) {
			let markerTotal = 0;
			markerTotal += swordfishReduced;
			markerTotal += jellyfishReduced;
			markerTotal += xWingReduced;
			markerTotal += yWingReduced;
			markerTotal += uniqueRectangleReduced;
			markerTotal += hiddenSets3;
			markerTotal += hiddenSets2;
			markerTotal += nakedSets5;
			markerTotal += nakedSets4;
			markerTotal += nakedSets3;
			markerTotal += nakedSets2;

			let setsTotal = 0;
			setsTotal += nakedSets2;
			setsTotal += nakedSets3;
			setsTotal += nakedSets4;
			setsTotal += nakedSets5;
			setsTotal += hiddenSets2;
			setsTotal += hiddenSets3;

			const lines = [];
			lines.push("-----");
			if (markerTotal > 0) {
				lines.push("nakedSets2: " + percent(nakedSets2, markerTotal) + " " + percent((nakedSets2 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("nakedSets3: " + percent(nakedSets3, markerTotal) + " " + percent((nakedSets3 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("nakedSets4: " + percent(nakedSets4, markerTotal) + " " + percent((nakedSets4 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("nakedSets5: " + percent(nakedSets5, markerTotal) + " " + percent((nakedSets5 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("hiddenSets2: " + percent(hiddenSets2, markerTotal) + " " + percent((hiddenSets2 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("hiddenSets3: " + percent(hiddenSets3, markerTotal) + " " + percent((hiddenSets3 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("nakedHiddenSets: " + percent(setsTotal, markerTotal) + " " + percent((setsTotal / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("uniqueRectangleReduced: " + percent(uniqueRectangleReduced, markerTotal) + " " + percent((uniqueRectangleReduced / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("xWingReduced: " + percent(xWingReduced, markerTotal) + " " + percent((xWingReduced / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("yWingReduced: " + percent(yWingReduced, markerTotal) + " " + percent((yWingReduced / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("swordfishReduced: " + percent(swordfishReduced, markerTotal) + " " + percent((swordfishReduced / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("jellyfishReduced: " + percent(jellyfishReduced, markerTotal) + " " + percent((jellyfishReduced / markerTotal) * (markers / totalPuzzles), 1));
			}
			lines.push("simples: " + percent(simples));
			lines.push("markers: " + percent(markers));
			lines.push("bruteForceFill: " + percent(bruteForceFill));
			lines.push("time avg < " + cap + ": " + (1000 * percentOps) / percentTime + "fps Avg: " + totalTime / 1000 / totalPuzzles + " Max: " + maxTime / 1000);
			lines.push("operations: " + percent(percentOps) + " < " + cap + " avg: " + Math.round(totalOps / totalPuzzles));
			lines.push("totalPuzzles: " + totalPuzzles);
			// lines.push(...consoleOut(result));
			// lines.push(grid.toString());
			data.message = lines;

			// Simples: 54%
			// Fails: 35%
			// Remainder: 89%
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
