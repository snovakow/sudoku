import { CellMarker, Grid, Marker } from "./Grid.js";
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
let xyWingReduced = 0;
let swordfishReduced = 0;
let simples = 0;
let markers = 0;
let bruteForceFill = 0;

let maxTime = 0;
let maxTimeSolved = 0;
const maxTimePuzzle = new Grid();
for (let i = 0; i < 81; i++) 	maxTimePuzzle[i] = new CellMarker(i);

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
		let time = performance.now();
		const { clueCount, grid, operations } = sudokuGenerator(cells);
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

		// REDUCE.Hidden_4
		// REDUCE.UniqueRectangle
		// REDUCE.X_Wing
		// REDUCE.XY_Wing
		// REDUCE.Swordfish
		// REDUCE.Phistomefel
		// REDUCE.Brute_Force

		if (!result.bruteForceFill) {
			if (maxTimeSolved === 0) {
				maxTimeSolved = elapsed;
				maxTimePuzzle.fromData(cells.toData());
			} else {
				if (elapsed > maxTimeSolved) {
					maxTimeSolved = elapsed;
					maxTimePuzzle.fromData(cells.toData());
				}
			}
		}

		if (result.bruteForceFill) {
			bruteForceFill++;
		} else {
			let simple = true;
			simple &&= result.nakedHiddenSetsReduced.length === 0;
			simple &&= result.uniqueRectangleReduced === 0;
			simple &&= result.xWingReduced === 0;
			simple &&= result.xyWingReduced === 0;
			simple &&= result.swordfishReduced === 0;

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
				if (result.xyWingReduced > 0) xyWingReduced++;
				if (result.swordfishReduced > 0) swordfishReduced++;

				markers++;
			}
		}

		const res = 100;
		const percent = (val, total = totalPuzzles) => {
			return Math.round(100 * res * val / total) / res + "%";
		}

		if (totalPuzzles % 10000 === 0) {
			let markerTotal = 0;
			markerTotal += swordfishReduced;
			markerTotal += xyWingReduced;
			markerTotal += xWingReduced;
			markerTotal += uniqueRectangleReduced;
			markerTotal += hiddenSets3;
			markerTotal += hiddenSets2;
			markerTotal += nakedSets5;
			markerTotal += nakedSets4;
			markerTotal += nakedSets3;
			markerTotal += nakedSets2;

			const lines = [];
			lines.push("-----");
			lines.push("nakedSets2: " + percent(nakedSets2, markerTotal) + " " + percent((nakedSets2 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("nakedSets3: " + percent(nakedSets3, markerTotal) + " " + percent((nakedSets3 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("nakedSets4: " + percent(nakedSets4, markerTotal) + " " + percent((nakedSets4 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("nakedSets5: " + percent(nakedSets5, markerTotal) + " " + percent((nakedSets5 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("hiddenSets2: " + percent(hiddenSets2, markerTotal) + " " + percent((hiddenSets2 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("hiddenSets3: " + percent(hiddenSets3, markerTotal) + " " + percent((hiddenSets3 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("uniqueRectangleReduced: " + percent(uniqueRectangleReduced, markerTotal) + " " + percent((uniqueRectangleReduced / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("xWingReduced: " + percent(xWingReduced, markerTotal) + " " + percent((xWingReduced / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("xyWingReduced: " + percent(xyWingReduced, markerTotal) + " " + percent((xyWingReduced / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("swordfishReduced: " + percent(swordfishReduced, markerTotal) + " " + percent((swordfishReduced / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("simples: " + percent(simples));
			lines.push("markers: " + percent(markers));
			lines.push("bruteForceFill: " + percent(bruteForceFill));
			lines.push("time avg < " + cap + ": " + (1000 * percentOps) / percentTime + "fps Avg: " + totalTime / 1000 / totalPuzzles + " Max: " + maxTime / 1000);
			lines.push("Max time: " + maxTimeSolved / 1000 + " " + maxTimePuzzle.string());
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

/*
nakedSets2: 10.6%
nakedSets3: 3.957%
nakedSets4: 1.143%
nakedSets5: 0%
hiddenSets2: 0.257%
hiddenSets3: 0.029%
uniqueRectangleReduced: 1.4%
xWingReduced: 0.857%
xyWingReduced: 3.657%
swordfishReduced: 0.157%
simples: 55.214%
markers: 10.757%
bruteForceFill: 34.029%
time avg < 100,000: 0.01536222445319793 Avg: 0.2287471571507454 Max: 11.68660000038147
operations: 14.257% < 100,000 avg: 977918
totalPuzzles: 7000

nakedSets2: 10.157%
nakedSets3: 4.014%
nakedSets4: 1.114%
nakedSets5: 0%
hiddenSets2: 0.143%
hiddenSets3: 0.043%
uniqueRectangleReduced: 1.657%
xWingReduced: 0.843%
xyWingReduced: 3.386%
swordfishReduced: 0.114%
simples: 56%
markers: 10.371%
bruteForceFill: 33.629%
time avg < 100,000: 0.015255862074415084 Avg: 0.22473355714525498 Max: 15.417400000095368
operations: 14.5% < 100,000 avg: 961979
totalPuzzles: 7000

100,000
60fps
14% 14%

200,000
40fps
30%

300,000
30fps
45%

500,000
18fps
60%

1,000,000
12.5fps
75%

nakedSets2: 10.12%
nakedSets3: 3.86%
nakedSets4: 1.12%
nakedSets5: 0.01%
hiddenSets2: 0.16%
hiddenSets3: 0.02%
uniqueRectangleReduced: 1.64%
xWingReduced: 0.84%
xyWingReduced: 3.61%
swordfishReduced: 0.11%
simples: 55.04%
markers: 10.33%
bruteForceFill: 34.63%
time avg < 100000: 0.015296445409269586 Avg: 0.2259400967631914 Max: 50.444
operations: 14.34% < 100000 avg: 975938
totalPuzzles: 216000
*/