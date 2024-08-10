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

let setNaked2 = 0;
let setNaked3 = 0;
let setNaked4 = 0;
let setHidden2 = 0;
let setHidden3 = 0;
let setHidden4 = 0;

let simples = 0;

let markers = 0;

let yWingReduced = 0;
let xyzWingReduced = 0;
let xWingReduced = 0;
let swordfishReduced = 0;
let jellyfishReduced = 0;
let uniqueRectangleReduced = 0;
let phistomefelCount = 0;

let superpositions = 0;
let superpositionReduced = new Map();

let bruteForceFill = 0;

let maxTime = 0;

let totalTime = 0;
let totalOps = 0;

let puzzleStrings = [];
let puzzleCount = 0;

const clueCounter = new Map();

let running = true;

const step = (search) => {
	const fromFile = puzzleStrings.length > 0;

	let time = performance.now();

	let mode = 0;
	if (search === "?row") mode = 1;
	if (search === "?phist") mode = 2;

	if (fromFile) {
		cells.fromString(puzzleStrings[puzzleCount]);
		mode = -1;
	}
	const { clueCount, operations } = sudokuGenerator(cells, mode);

	const clueValue = clueCounter.get(clueCount);
	if (clueValue) {
		clueCounter.set(clueCount, clueValue + 1)
	} else {
		clueCounter.set(clueCount, 1)
	}

	const data = {
		puzzle: cells.string(),
		totalPuzzles: totalPuzzles,
		cells: cells.toData(),
		message: null
	};

	const result = fillSolve(cells, search);

	const elapsed = performance.now() - time;
	if (maxTime === 0) {
		maxTime = elapsed;
	} else {
		if (elapsed > maxTime) {
			maxTime = elapsed;
		}
	}

	totalTime += elapsed;
	totalOps += operations;

	let setsTotal = 0;

	if (result.bruteForceFill) {
		bruteForceFill++;
	} else {
		const phistomefelResult = (result.phistomefelReduced > 0 || result.phistomefelFilled > 0);
		// if (phistomefelResult && result.bentWingsReduced.length === 0) {
		// 	console.log("Phistomefel -----");
		// 	console.log(test);
		// 	console.log("Phistomefel -----");
		// }

		let simple = true;
		simple &&= result.nakedHiddenSetsReduced.length === 0;
		simple &&= result.bentWingsReduced.length === 0;
		simple &&= result.xWingReduced === 0;
		simple &&= result.swordfishReduced === 0;
		simple &&= result.jellyfishReduced === 0;
		simple &&= result.uniqueRectangleReduced === 0;
		simple &&= result.superpositionReduced.length === 0;
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

					if (set.nakedSize === 2) setNaked2++;
					else if (set.nakedSize === 3) setNaked3++;
					else if (set.nakedSize === 4) setNaked4++;
					else if (set.hiddenSize === 2) setHidden2++;
					else if (set.hiddenSize === 3) setHidden3++;
					else if (set.hiddenSize === 4) setHidden4++;
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

			if (result.superpositionReduced.length > 0) {
				const once = new Set();
				for (const superpositionResult of result.superpositionReduced) {
					const key = superpositionResult.type + " " + superpositionResult.size;
					if (once.has(key)) continue;

					once.add(key);

					const count = superpositionReduced.get(key);
					if (count) {
						superpositionReduced.set(key, count + 1);
					} else {
						superpositionReduced.set(key, 1);
					}
				}
				superpositions++;
			} else {
				markers++;
			}
		}
	}

	setsTotal += setNaked2;
	setsTotal += setNaked3;
	setsTotal += setNaked4;
	setsTotal += setHidden2;
	setsTotal += setHidden3;
	setsTotal += setHidden4;

	const res = 10000;
	const percent = (val, total = totalPuzzles) => {
		return Math.round(100 * res * val / total) / res + "%";
	}

	let markerTotal = 0;
	markerTotal += setsTotal;
	markerTotal += yWingReduced;
	markerTotal += xyzWingReduced;
	markerTotal += xWingReduced;
	markerTotal += swordfishReduced;
	markerTotal += jellyfishReduced;
	markerTotal += uniqueRectangleReduced;
	markerTotal += phistomefelCount;

	let superTotal = 0;
	for (const value of superpositionReduced.values()) {
		superTotal += value;
	}

	const printLine = (title, val, total) => {
		lines.push(title + ": " + percent(val, total) + " - " + val);
	};

	const lines = [];

	const clues = [...clueCounter.entries()];
	clues.sort((a, b) => {
		return a[0] - b[0];
	});

	lines.push("--- Clues");
	for (const clue of clues) {
		printLine(clue[0], clue[1], totalPuzzles);
	}

	if (superTotal > 0) {
		lines.push("--- Superpositions");
		const ordered = [];
		const entries = superpositionReduced.entries();
		for (const [key, value] of entries) {
			ordered.push({ key, value });
		}
		ordered.sort((a, b) => {
			return b.value - a.value;
		});
		for (const result of ordered) {
			printLine(result.key, result.value, superTotal);
		}
	}
	if (setsTotal > 0) {
		lines.push("--- Naked Hiddens");
		const SetOrder = class {
			constructor(key, value) {
				this.key = key;
				this.value = value;
			}
		}
		const ordered = [
			new SetOrder("set5_2_3", set5_2_3),
			new SetOrder("set4_2_2", set4_2_2),
			new SetOrder("set6_2_4", set6_2_4),
			new SetOrder("set5_3_2", set5_3_2),
			new SetOrder("set6_3_3", set6_3_3),
			new SetOrder("set6_4_2", set6_4_2),
			new SetOrder("set7_2_5", set7_2_5),
			new SetOrder("set7_3_4", set7_3_4),
			new SetOrder("set7_4_3", set7_4_3),
			new SetOrder("set7_5_2", set7_5_2),
			new SetOrder("set8_2_6", set8_2_6),
			new SetOrder("set8_3_5", set8_3_5),
			new SetOrder("set8_4_4", set8_4_4),
			new SetOrder("set8_5_3", set8_5_3),
			new SetOrder("set8_6_2", set8_6_2),
			new SetOrder("set9_2_7", set9_2_7),
			new SetOrder("set9_3_6", set9_3_6),
			new SetOrder("set9_4_5", set9_4_5),
			new SetOrder("set9_6_3", set9_6_3),
			new SetOrder("set9_7_2", set9_7_2),
			new SetOrder("set9_5_4", set9_5_4),
		];
		ordered.sort((a, b) => {
			return b.value - a.value;
		});
		for (const order of ordered) {
			printLine(order.key, order.value, setsTotal);
		}
		printLine("Naked 2", setNaked2, setsTotal);
		printLine("Naked 3", setNaked3, setsTotal);
		printLine("Naked 4", setNaked4, setsTotal);
		printLine("Hidden 2", setHidden2, setsTotal);
		printLine("Hidden 3", setHidden3, setsTotal);
		printLine("Hidden 4", setHidden4, setsTotal);
	}
	if (markerTotal > 0) {
		lines.push("--- Markers");
		printLine("NakedHiddenSet", setsTotal, markerTotal);
		printLine("yWing", yWingReduced, markerTotal);
		printLine("xyzWing", xyzWingReduced, markerTotal);
		printLine("xWing", xWingReduced, markerTotal);
		printLine("Swordfish", swordfishReduced, markerTotal);
		printLine("Jellyfish", jellyfishReduced, markerTotal);
		printLine("UniqueRectangle", uniqueRectangleReduced, markerTotal);
		printLine("Phistomefel", phistomefelCount, markerTotal);
	}

	lines.push("--- Stats");
	lines.push("Time Avg: " + totalTime / 1000 / totalPuzzles + " Max: " + maxTime / 1000);
	lines.push("Operations Avg: " + Math.round(totalOps / totalPuzzles));

	lines.push("--- Totals");
	lines.push("Simples: " + percent(simples) + " - " + simples);
	lines.push("Markers: " + percent(markers) + " - " + markers);
	lines.push("Superpositions: " + percent(superpositions) + " - " + superpositions);
	lines.push("BruteForceFill: " + percent(bruteForceFill) + " - " + bruteForceFill);
	lines.push("TotalPuzzles: " + totalPuzzles);

	data.message = lines;

	postMessage(data);

	if (fromFile) {
		puzzleCount++;
		if (puzzleCount === puzzleStrings.length) running = false;
	}
};

onmessage = (e) => {
	const search = e.data.search;
	if (e.data.puzzles) {
		puzzleStrings = e.data.puzzles.split('\n');
		puzzleCount = 0;
	} else {
		puzzleStrings = [];
		puzzleCount = 0;
	}
	while (running) step(search);
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

// --- Clues
// 20: 0.0046% - 46
// 21: 0.236% - 2360
// 22: 3.4532% - 34532
// 23: 17.0409% - 170409
// 24: 34.2287% - 342287
// 25: 29.8985% - 298985
// 26: 12.2749% - 122749
// 27: 2.5614% - 25614
// 28: 0.2841% - 2841
// 29: 0.0172% - 172
// 30: 0.0005% - 5
// --- Superpositions
// Cell Markers 2: 99.1938% - 330869
// Group Symbol 2: 0.6338% - 2114
// Cell Markers 3: 0.0791% - 264
// Cell Markers Pair 2: 0.069% - 230
// Group Symbol Pair 2: 0.0207% - 69
// Group Symbol 3: 0.0033% - 11
// Cell Markers Pair 3: 0.0003% - 1
// --- Naked Hiddens
// set4_2_2: 20.1376% - 111834
// set5_2_3: 19.0393% - 105735
// set5_3_2: 15.7976% - 87732
// set6_2_4: 12.145% - 67447
// set6_3_3: 9.6804% - 53760
// set6_4_2: 8.0456% - 44681
// set7_2_5: 4.0301% - 22381
// set7_3_4: 3.3921% - 18838
// set7_4_3: 3.1162% - 17306
// set7_5_2: 1.8257% - 10139
// set8_2_6: 0.7291% - 4049
// set8_4_4: 0.6104% - 3390
// set8_3_5: 0.5553% - 3084
// set8_6_2: 0.4039% - 2243
// set8_5_3: 0.2737% - 1520
// set9_2_7: 0.0573% - 318
// set9_7_2: 0.0443% - 246
// set9_4_5: 0.0434% - 241
// set9_3_6: 0.0429% - 238
// set9_5_4: 0.0189% - 105
// set9_6_3: 0.0113% - 63
// Naked 2: 56.1383% - 311764
// Naked 3: 29.4683% - 163652
// Naked 4: 11.8156% - 65618
// Hidden 2: 2.2739% - 12628
// Hidden 3: 0.285% - 1583
// Hidden 4: 0.0189% - 105
// --- Markers
// NakedHiddenSet: 64.8261% - 555350
// yWing: 17.9103% - 153433
// xyzWing: 8.3211% - 71285
// xWing: 3.7512% - 32136
// Swordfish: 0.8366% - 7167
// Jellyfish: 0.0334% - 286
// UniqueRectangle: 4.3212% - 37019
// Phistomefel: 0.0001% - 1
// --- Stats
// Time Avg: 0.005588108400100708 Max: 1.0180999994277955
// Operations Avg: 0
// --- Totals
// Simples: 53.8587% - 538587
// Markers: 13.0482% - 130482
// Superpositions: 33.0931% - 330931
// BruteForceFill: 0% - 0
// TotalPuzzles: 1000000

// H2 N4
// --- Clues
// 20: 0.002% - 2
// 21: 0.238% - 238
// 22: 3.446% - 3446
// 23: 16.82% - 16820
// 24: 34.182% - 34182
// 25: 30.021% - 30021
// 26: 12.378% - 12378
// 27: 2.601% - 2601
// 28: 0.295% - 295
// 29: 0.017% - 17
// --- Superpositions
// Cell Markers 2: 99.2059% - 33105
// Group Symbol 2: 0.6443% - 215
// Cell Markers 3: 0.0659% - 22
// Cell Markers Pair 2: 0.0629% - 21
// Group Symbol Pair 2: 0.021% - 7
// --- Naked Hiddens
// set4_2_2: 19.9102% - 11040
// set5_2_3: 19.0644% - 10571
// set5_3_2: 15.9462% - 8842
// set6_2_4: 11.9587% - 6631
// set6_3_3: 9.6323% - 5341
// set6_4_2: 7.194% - 3989
// set7_2_5: 4.1065% - 2277
// set7_5_2: 3.6664% - 2033
// set7_3_4: 3.5023% - 1942
// set7_4_3: 1.8071% - 1002
// set8_6_2: 1.0063% - 558
// set8_2_6: 0.7015% - 389
// set8_3_5: 0.5483% - 304
// set8_4_4: 0.4418% - 245
// set8_5_3: 0.2615% - 145
// set9_7_2: 0.1046% - 58
// set9_3_6: 0.0451% - 25
// set9_2_7: 0.0433% - 24
// set9_4_5: 0.0343% - 19
// set9_6_3: 0.0162% - 9
// set9_5_4: 0.009% - 5
// Naked 2: 55.7846% - 30932
// Naked 3: 29.6741% - 16454
// Naked 4: 9.4772% - 5255
// Hidden 2: 4.7774% - 2649
// Hidden 3: 0.2777% - 154
// Hidden 4: 0.009% - 5
// --- Markers
// NakedHiddenSet: 64.8579% - 55449
// yWing: 17.7114% - 15142
// xyzWing: 8.5492% - 7309
// xWing: 3.8073% - 3255
// Swordfish: 0.7814% - 668
// Jellyfish: 0.0328% - 28
// UniqueRectangle: 4.26% - 3642
// Phistomefel: 0% - 0
// --- Stats
// Time Avg: 0.004942411001243592 Max: 0.408
// Operations Avg: 0
// --- Totals
// Simples: 53.917% - 53917
// Markers: 12.971% - 12971
// Superpositions: 33.112% - 33112
// BruteForceFill: 0% - 0
// TotalPuzzles: 100000

// N4 H2
// --- Clues
// 20: 0.002% - 2
// 21: 0.238% - 238
// 22: 3.446% - 3446
// 23: 16.82% - 16820
// 24: 34.182% - 34182
// 25: 30.021% - 30021
// 26: 12.378% - 12378
// 27: 2.601% - 2601
// 28: 0.295% - 295
// 29: 0.017% - 17
// --- Superpositions
// Cell Markers 2: 99.2059% - 33105
// Group Symbol 2: 0.6443% - 215
// Cell Markers 3: 0.0659% - 22
// Cell Markers Pair 2: 0.0629% - 21
// Group Symbol Pair 2: 0.021% - 7
// --- Naked Hiddens
// set4_2_2: 19.899% - 11037
// set5_2_3: 19.0553% - 10569
// set5_3_2: 15.9398% - 8841
// set6_2_4: 11.9589% - 6633
// set6_3_3: 9.6223% - 5337
// set6_4_2: 8.1781% - 4536
// set7_2_5: 4.1089% - 2279
// set7_3_4: 3.5085% - 1946
// set7_4_3: 3.0776% - 1707
// set7_5_2: 1.821% - 1010
// set8_2_6: 0.7284% - 404
// set8_4_4: 0.6653% - 369
// set8_3_5: 0.5499% - 305
// set8_6_2: 0.4075% - 226
// set8_5_3: 0.2614% - 145
// set9_7_2: 0.0541% - 30
// set9_2_7: 0.0487% - 27
// set9_3_6: 0.0451% - 25
// set9_4_5: 0.0451% - 25
// set9_6_3: 0.0162% - 9
// set9_5_4: 0.009% - 5
// Naked 2: 55.7992% - 30949
// Naked 3: 29.6656% - 16454
// Naked 4: 11.9661% - 6637
// Hidden 2: 2.2825% - 1266
// Hidden 3: 0.2777% - 154
// Hidden 4: 0.009% - 5
// --- Markers
// NakedHiddenSet: 64.8645% - 55465
// yWing: 17.7081% - 15142
// xyzWing: 8.5476% - 7309
// xWing: 3.8066% - 3255
// Swordfish: 0.7812% - 668
// Jellyfish: 0.0327% - 28
// UniqueRectangle: 4.2592% - 3642
// Phistomefel: 0% - 0
// --- Stats
// Time Avg: 0.005229268998594284 Max: 0.4548999996185303
// Operations Avg: 0
// --- Totals
// Simples: 53.917% - 53917
// Markers: 12.971% - 12971
// Superpositions: 33.112% - 33112
// BruteForceFill: 0% - 0
// TotalPuzzles: 100000
