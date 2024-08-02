import { CellMarker, Grid } from "./Grid.js";
import { sudokuGenerator, fillSolve, totalPuzzles } from "./generator.js";
import { REDUCE } from "./solver.js";

const cells = new Grid();

for (const index of Grid.indices) cells[index] = new CellMarker(index);

let nakedSets2 = 0;
let nakedSets3 = 0;
let nakedSets4 = 0;
let hiddenSets2 = 0;
let hiddenSets3 = 0;
let hiddenSets4 = 0;
let nakedSets5 = 0;
let yWingReduced = 0;
let xyzWingReduced = 0;
let xWingReduced = 0;
let swordfishReduced = 0;
let jellyfishReduced = 0;
let uniqueRectangleReduced = 0;
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
	const logPeriod = 100;

	let time = performance.now();

	let mode = 0;
	if (search === "?row") mode = 1;
	if (search === "?phist") mode = 2;

	const { clueCount, grid, operations } = sudokuGenerator(cells, mode);
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
		if (phistomefelResult && result.bentWingsReduced.length === 0) {
			console.log("Phistomefel -----");
			console.log(test);
			console.log("Phistomefel -----");
		}

		let simple = true;
		simple &&= result.nakedHiddenSetsReduced.length === 0;
		simple &&= result.bentWingsReduced.length === 0;
		simple &&= result.xWingReduced === 0;
		simple &&= result.swordfishReduced === 0;
		simple &&= result.jellyfishReduced === 0;
		simple &&= result.uniqueRectangleReduced === 0;
		simple &&= !phistomefelResult;

		if (simple) simples++;
		else {
			if (result.nakedHiddenSetsReduced.length > 0) {
				for (const set of result.nakedHiddenSetsReduced) {
					if (set.nakedSize === 2) nakedSets2++;
					else if (set.nakedSize === 3) nakedSets3++;
					else if (set.nakedSize === 4) nakedSets4++;
					else if (set.hiddenSize === 2) hiddenSets2++;
					else if (set.hiddenSize === 3) hiddenSets3++;
					else if (set.hiddenSize === 4) hiddenSets4++;

					if (set.nakedSize === 5) nakedSets5++;
				}
			}
			if (result.bentWingsReduced.length > 0) {
				for (const reduced of result.bentWingsReduced) {
					if (reduced.strategy === REDUCE.Y_Wing) yWingReduced++;
					if (reduced.strategy === REDUCE.XYZ_Wing) xyzWingReduced++;
				}
			}
			if (result.xWingReduced > 0) xWingReduced++;
			if (result.swordfishReduced > 0) swordfishReduced++;
			if (result.jellyfishReduced > 0) jellyfishReduced++;
			if (result.uniqueRectangleReduced > 0) uniqueRectangleReduced++;
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
		markerTotal += nakedSets2;
		markerTotal += nakedSets3;
		markerTotal += nakedSets4;
		markerTotal += hiddenSets2;
		markerTotal += hiddenSets3;
		markerTotal += hiddenSets4;
		markerTotal += yWingReduced;
		markerTotal += xyzWingReduced;
		markerTotal += xWingReduced;
		markerTotal += swordfishReduced;
		markerTotal += jellyfishReduced;
		markerTotal += uniqueRectangleReduced;
		markerTotal += phistomefelCount;

		let setsTotal = 0;
		setsTotal += nakedSets2;
		setsTotal += nakedSets3;
		setsTotal += nakedSets4;
		setsTotal += hiddenSets2;
		setsTotal += hiddenSets3;
		setsTotal += hiddenSets4;

		const lines = [];
		lines.push("-----");
		if (markerTotal > 0) {
			lines.push("NakedSet2: " + percent(nakedSets2, markerTotal) + " " + percent((nakedSets2 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("NakedSet3: " + percent(nakedSets3, markerTotal) + " " + percent((nakedSets3 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("NakedSet4: " + percent(nakedSets4, markerTotal) + " " + percent((nakedSets4 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("HiddenSet2: " + percent(hiddenSets2, markerTotal) + " " + percent((hiddenSets2 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("HiddenSet3: " + percent(hiddenSets3, markerTotal) + " " + percent((hiddenSets3 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("HiddenSet4: " + percent(hiddenSets4, markerTotal) + " " + percent((hiddenSets4 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("NakedSet5: " + percent(nakedSets5, markerTotal) + " " + percent((nakedSets5 / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("NakedHiddenSet: " + percent(setsTotal, markerTotal) + " " + percent((setsTotal / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("yWing: " + percent(yWingReduced, markerTotal) + " " + percent((yWingReduced / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("xyzWing: " + percent(xyzWingReduced, markerTotal) + " " + percent((xyzWingReduced / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("xWing: " + percent(xWingReduced, markerTotal) + " " + percent((xWingReduced / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("Swordfish: " + percent(swordfishReduced, markerTotal) + " " + percent((swordfishReduced / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("Jellyfish: " + percent(jellyfishReduced, markerTotal) + " " + percent((jellyfishReduced / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("UniqueRectangle: " + percent(uniqueRectangleReduced, markerTotal) + " " + percent((uniqueRectangleReduced / markerTotal) * (markers / totalPuzzles), 1));
			lines.push("Phistomefel: " + percent(phistomefelCount, markerTotal) + " " + percent((phistomefelCount / markerTotal) * (markers / totalPuzzles), 1));
		}
		lines.push("Simples: " + percent(simples));
		lines.push("Markers: " + percent(markers));
		lines.push("BruteForceFill: " + percent(bruteForceFill));
		const opTime = percentTime > 0 ? (1000 * percentOps) / percentTime : 0;
		lines.push("Time Avg < " + cap + ": " + opTime + "fps Avg: " + totalTime / 1000 / totalPuzzles + " Max: " + maxTime / 1000);
		lines.push("Operations: " + percent(percentOps) + " < " + cap + " avg: " + Math.round(totalOps / totalPuzzles));
		lines.push("TotalPuzzles: " + totalPuzzles);

		data.message = lines;
	}
	postMessage(data);

	setTimeout(() => { step(search) }, 0);
};

onmessage = (e) => {
	const search = e.data.search;
	cells.fromData(e.data.cells);

	step(search);
};

// NakedSet2: 37.108% 4.849%
// NakedSet3: 15.026% 1.963%
// NakedSet4: 4.535% 0.593%
// NakedSet5: 0.603% 0.079%
// HiddenSet2: 0.186% 0.024%
// HiddenSet3: 0.005% 0.001%
// NakedHiddenSet: 57.464% 7.508%
// yWing: 29.072% 3.799%
// xyzWing: 6.867% 0.897%
// xWing: 1.907% 0.249%
// Swordfish: 0.466% 0.061%
// Jellyfish: 0.016% 0.002%
// UniqueRectangle: 4.207% 0.55%
// Phistomefel: 0% 0%
// Simples: 53.98%
// Markers: 13.066%
// BruteForceFill: 32.954%
// Time Avg < 100000: 65.75330862555371fps Avg: 0.22744786999756433 Max: 71.31880000019073
// Operations: 14.406% < 100000 avg: 982177
// TotalPuzzles: 250000
