import { CellMarker, Grid } from "./Grid.js";
import { sudokuGenerator, sudokuGeneratorPhistomefel, fillSolve, totalPuzzles, consoleOut, samePuzzle } from "./generator.js";
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
let phistomefelCount = 0;
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
		const logPeriod = 10000;

		let time = performance.now();

		let fresh = totalPuzzles % logPeriod === 0;
		if (fresh) {
			if (samePuzzle) {
				hiddenSets2 = 0;
				hiddenSets3 = 0;
				nakedSets2 = 0;
				nakedSets3 = 0;
				nakedSets4 = 0;
				nakedSets5 = 0;
				uniqueRectangleReduced = 0;
				xWingReduced = 0;
				yWingReduced = 0;
				swordfishReduced = 0;
				jellyfishReduced = 0;
				phistomefelCount = 0;
				simples = 0;
				markers = 0;
				bruteForceFill = 0;

				maxTime = 0;

				percentTime = 0;
				totalTime = 0;

				percentOps = 0;
				totalOps = 0;
			}
		}
		const { clueCount, grid, operations } = sudokuGenerator(cells, fresh);
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
			const phistomefelResult = (result.phistomefelReduced > 0 || result.phistomefelFilled > 0);
			if (phistomefelResult) {
				console.log("Phistomefel -----");
				console.log(test);
				console.log("Phistomefel -----");
			}


			let simple = true;
			simple &&= result.nakedHiddenSetsReduced.length === 0;
			simple &&= result.uniqueRectangleReduced === 0;
			simple &&= result.xWingReduced === 0;
			simple &&= result.yWingReduced === 0;
			simple &&= result.swordfishReduced === 0;
			simple &&= result.jellyfishReduced === 0;
			simple &&= !phistomefelResult;

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
				if (phistomefelResult) phistomefelCount++;

				markers++;
			}
		}

		const res = 1000;
		const percent = (val, total = totalPuzzles) => {
			return Math.round(100 * res * val / total) / res + "%";
		}

		if (totalPuzzles % logPeriod === 0) {
			let markerTotal = 0;
			markerTotal += phistomefelCount;
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
				lines.push("NakedSet2: " + percent(nakedSets2, markerTotal) + " " + percent((nakedSets2 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("NakedSet3: " + percent(nakedSets3, markerTotal) + " " + percent((nakedSets3 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("NakedSet4: " + percent(nakedSets4, markerTotal) + " " + percent((nakedSets4 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("HiddenSet2: " + percent(hiddenSets2, markerTotal) + " " + percent((hiddenSets2 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("HiddenSet3: " + percent(hiddenSets3, markerTotal) + " " + percent((hiddenSets3 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("NakedSet5: " + percent(nakedSets5, markerTotal) + " " + percent((nakedSets5 / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("NakedHiddenSet: " + percent(setsTotal, markerTotal) + " " + percent((setsTotal / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("UniqueRectangle: " + percent(uniqueRectangleReduced, markerTotal) + " " + percent((uniqueRectangleReduced / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("xWing: " + percent(xWingReduced, markerTotal) + " " + percent((xWingReduced / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("yWing: " + percent(yWingReduced, markerTotal) + " " + percent((yWingReduced / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("Swordfish: " + percent(swordfishReduced, markerTotal) + " " + percent((swordfishReduced / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("Jellyfish: " + percent(jellyfishReduced, markerTotal) + " " + percent((jellyfishReduced / markerTotal) * (markers / totalPuzzles), 1));
				lines.push("Phistomefel: " + percent(jellyfishReduced, markerTotal) + " " + percent((jellyfishReduced / markerTotal) * (markers / totalPuzzles), 1));
			}
			lines.push("Simples: " + percent(simples));
			lines.push("Markers: " + percent(markers));
			lines.push("BruteForceFill: " + percent(bruteForceFill));
			const opTime = percentTime > 0 ? (1000 * percentOps) / percentTime : 0;
			lines.push("Time Avg < " + cap + ": " + opTime + "fps Avg: " + totalTime / 1000 / totalPuzzles + " Max: " + maxTime / 1000);
			lines.push("Operations: " + percent(percentOps) + " < " + cap + " avg: " + Math.round(totalOps / totalPuzzles));
			lines.push("TotalPuzzles: " + totalPuzzles + " " + cells.string());
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

// NakedSet2: 46.598% 5.48%
// NakedSet3: 18.155% 2.135%
// NakedSet4: 5.502% 0.647%
// HiddenSet2: 0.824% 0.097%
// HiddenSet3: 0.11% 0.013%
// NakedSet5: 0.024% 0.003%
// NakedHiddenSet: 71.212% 8.374%
// UniqueRectangle: 8.593% 1.011%
// xWing: 3.834% 0.451%
// yWing: 15.848% 1.864%
// Swordfish: 0.488% 0.057%
// Jellyfish: 0.026% 0.003%
// Simples: 53.814%
// Markers: 11.76%
// BruteForceFill: 34.427%
// Time Avg < 100000: 64.7452013494576fps Avg: 0.2298961929991611 Max: 111.84930000019074
// Operations: 14.377% < 100000 avg: 981148
// TotalPuzzles: 300000

// NakedSet2: 46.635% 5.242%
// NakedSet3: 18.165% 2.042%
// NakedSet4: 4.753% 0.534%
// HiddenSet2: 1.129% 0.127%
// HiddenSet3: 0.094% 0.011%
// NakedSet5: 0.094% 0.011%
// NakedHiddenSet: 70.871% 7.966%
// UniqueRectangle: 7.953% 0.894%
// xWing: 4.565% 0.513%
// yWing: 16.282% 1.83%
// Swordfish: 0.329% 0.037%
// Jellyfish: 0% 0%
// Phistomefel: 0% 0%
// Simples: 55.23%
// Markers: 11.24%
// BruteForceFill: 33.53%
// Time Avg < 100000: 61.54744455106676fps Avg: 0.13167260000405312 Max: 11.587900000095367
// Operations: 20.66% < 100000 avg: 543769
// TotalPuzzles: 10000 000406080090803400004907061000680040048091000200074010005760124710040030400130597