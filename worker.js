import { CellMarker, Grid } from "./Grid.js";
import { sudokuGenerator, fillSolve, totalPuzzles } from "./generator.js";
import { REDUCE } from "./solver.js";

const cells = new Grid();
for (const index of Grid.indices) cells[index] = new CellMarker(index);

let set4_2_2 = 0;

let set5_2_3 = 0;
let set5_3_2 = 0;

let set6_2_4 = 0;
let set6_3_3 = 0;
let set6_4_2 = 0;

let set7_2_5 = 0;
let set7_3_4 = 0;
let set7_4_3 = 0;
let set7_5_2 = 0;

let set8_2_6 = 0;
let set8_3_5 = 0;
let set8_4_4 = 0;
let set8_5_3 = 0;
let set8_6_2 = 0;

let set9_2_7 = 0;
let set9_3_6 = 0;
let set9_4_5 = 0;
let set9_5_4 = 0;
let set9_6_3 = 0;
let set9_7_2 = 0;

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
					if (set.max === 4 && set.nakedSize === 2) set4_2_2++;

					else if (set.max === 5 && set.nakedSize === 2) set5_2_3++;
					else if (set.max === 5 && set.nakedSize === 3) set5_3_2++;

					else if (set.max === 6 && set.nakedSize === 2) set6_2_4++;
					else if (set.max === 6 && set.nakedSize === 3) set6_3_3++;
					else if (set.max === 6 && set.nakedSize === 4) set6_4_2++;

					else if (set.max === 7 && set.nakedSize === 2) set7_2_5++;
					else if (set.max === 7 && set.nakedSize === 3) set7_3_4++;
					else if (set.max === 7 && set.nakedSize === 4) set7_4_3++;
					else if (set.max === 7 && set.nakedSize === 5) set7_5_2++;

					else if (set.max === 8 && set.nakedSize === 2) set8_2_6++;
					else if (set.max === 8 && set.nakedSize === 3) set8_3_5++;
					else if (set.max === 8 && set.nakedSize === 4) set8_4_4++;
					else if (set.max === 8 && set.nakedSize === 5) set8_5_3++;
					else if (set.max === 8 && set.nakedSize === 6) set8_6_2++;

					else if (set.max === 9 && set.nakedSize === 2) set9_2_7++;
					else if (set.max === 9 && set.nakedSize === 3) set9_3_6++;
					else if (set.max === 9 && set.nakedSize === 4) set9_4_5++;
					else if (set.max === 9 && set.nakedSize === 5) set9_5_4++;
					else if (set.max === 9 && set.nakedSize === 6) set9_6_3++;
					else if (set.max === 9 && set.nakedSize === 7) set9_7_2++;
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

	const res = 10000;
	const percent = (val, total = totalPuzzles) => {
		return Math.round(100 * res * val / total) / res + "%";
	}

	let markerTotal = 0;
	markerTotal += set4_2_2;
	markerTotal += set5_2_3;
	markerTotal += set5_3_2;
	markerTotal += set6_2_4;
	markerTotal += set6_3_3;
	markerTotal += set6_4_2;
	markerTotal += set7_2_5;
	markerTotal += set7_3_4;
	markerTotal += set7_4_3;
	markerTotal += set7_5_2;
	markerTotal += set8_2_6;
	markerTotal += set8_3_5;
	markerTotal += set8_4_4;
	markerTotal += set8_5_3;
	markerTotal += set8_6_2;
	markerTotal += set9_2_7;
	markerTotal += set9_3_6;
	markerTotal += set9_4_5;
	markerTotal += set9_5_4;
	markerTotal += set9_6_3;
	markerTotal += set9_7_2;

	markerTotal += yWingReduced;
	markerTotal += xyzWingReduced;
	markerTotal += xWingReduced;
	markerTotal += swordfishReduced;
	markerTotal += jellyfishReduced;
	markerTotal += uniqueRectangleReduced;
	markerTotal += phistomefelCount;

	let setsTotal = 0;
	setsTotal += set4_2_2;
	setsTotal += set5_2_3;
	setsTotal += set5_3_2;
	setsTotal += set6_2_4;
	setsTotal += set6_3_3;
	setsTotal += set6_4_2;
	setsTotal += set7_2_5;
	setsTotal += set7_3_4;
	setsTotal += set7_4_3;
	setsTotal += set7_5_2;
	setsTotal += set8_2_6;
	setsTotal += set8_3_5;
	setsTotal += set8_4_4;
	setsTotal += set8_5_3;
	setsTotal += set8_6_2;
	setsTotal += set9_2_7;
	setsTotal += set9_3_6;
	setsTotal += set9_4_5;
	setsTotal += set9_5_4;
	setsTotal += set9_6_3;
	setsTotal += set9_7_2;

	const lines = [];
	if (markerTotal > 0) {
		const printLine = (title, val) => {
			lines.push(title + ": " + percent(val, markerTotal) + " " + percent((val / markerTotal) * (markers / totalPuzzles), 1));
		};
		printLine("set5_2_3", set5_2_3);
		printLine("set4_2_2", set4_2_2);
		printLine("set6_2_4", set6_2_4);
		printLine("set5_3_2", set5_3_2);
		printLine("set6_3_3", set6_3_3);
		printLine("set7_2_5", set7_2_5);
		printLine("set6_4_2", set6_4_2);
		printLine("set7_3_4", set7_3_4);
		printLine("set7_4_3", set7_4_3);
		printLine("set7_5_2", set7_5_2);
		printLine("set8_2_6", set8_2_6);
		printLine("set8_3_5", set8_3_5);
		printLine("set8_4_4", set8_4_4);
		printLine("set8_5_3", set8_5_3);
		printLine("set8_6_2", set8_6_2);
		printLine("set9_2_7", set9_2_7);
		printLine("set9_3_6", set9_3_6);
		printLine("set9_4_5", set9_4_5);
		printLine("set9_5_4", set9_5_4);
		printLine("set9_6_3", set9_6_3);
		printLine("set9_7_2", set9_7_2);

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

	postMessage(data);

	setTimeout(() => { step(search) }, 0);
};

onmessage = (e) => {
	const search = e.data.search;
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

// set5_2_3: 12.783% 1.688%
// set4_2_2: 11.244% 1.485%
// set6_2_4: 8.846% 1.168%
// set5_3_2: 6.838% 0.903%
// set6_3_3: 5.801% 0.766%
// set7_2_5: 3.201% 0.423%
// set6_4_2: 2.712% 0.358%
// set7_3_4: 2.145% 0.283%
// set7_4_3: 1.317% 0.174%
// set7_5_2: 0.587% 0.077%
// set8_2_6: 0.535% 0.071%
// set8_3_5: 0.3% 0.04%
// set8_4_4: 0.313% 0.041%
// set8_5_3: 0.111% 0.015%
// set8_6_2: 0.117% 0.015%
// set9_2_7: 0.059% 0.008%
// set9_3_6: 0.013% 0.002%
// set9_4_5: 0.033% 0.004%
// set9_5_4: 0% 0%
// set9_6_3: 0.007% 0.001%
// set9_7_2: 0.013% 0.002%
// NakedHiddenSet: 56.972% 7.523%
// yWing: 29.783% 3.933%
// xyzWing: 6.805% 0.899%
// xWing: 1.916% 0.253%
// Swordfish: 0.476% 0.063%
// Jellyfish: 0.02% 0.003%
// UniqueRectangle: 4.028% 0.532%
// Phistomefel: 0% 0%
// Simples: 54.126%
// Markers: 13.204%
// BruteForceFill: 32.67%
// Time Avg < 100000: 64.17024489208116fps Avg: 0.23347794000398636 Max: 128.85990000009537
// Operations: 14.538% < 100000 avg: 985723
// TotalPuzzles: 50000