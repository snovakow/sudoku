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

let puzzleString = null;

const clueCounter = new Map();

let running = true;

let stepMode = 0; // 1=row 2=phist
const step = (search) => {
	let time = performance.now();

	let mode = stepMode;
	if (puzzleString) {
		cells.fromString(puzzleString);
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

	data.puzzleClues = data.puzzle;
	data.puzzleFilled = cells.string();
	data.clueCount = clueCount;

	data.simple = 0;
	data.naked2 = 0;
	data.naked3 = 0;
	data.naked4 = 0;
	data.hidden2 = 0;
	data.hidden3 = 0;
	data.hidden4 = 0;
	data.yWing = 0;
	data.xyzWing = 0;
	data.xWing = 0;
	data.swordfish = 0;
	data.jellyfish = 0;
	data.uniqueRectangle = 0;
	data.phistomefel = 0;
	data.superpositions = 0;
	data.bruteForce = 0;

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
		data.bruteForce = 1;
		bruteForceFill++;
	}

	const phistomefelResult = (result.phistomefelReduced > 0 || result.phistomefelFilled > 0);

	let simple = true;
	simple &&= result.nakedHiddenSetsReduced.length === 0;
	simple &&= result.bentWingsReduced.length === 0;
	simple &&= result.xWingReduced === 0;
	simple &&= result.swordfishReduced === 0;
	simple &&= result.jellyfishReduced === 0;
	simple &&= result.uniqueRectangleReduced === 0;
	simple &&= result.superpositionReduced.length === 0;
	simple &&= !phistomefelResult;
	simple &&= !result.bruteForceFill;

	data.simple = simple ? 1 : 0;

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

				if (set.nakedSize === 2) data.naked2++;
				else if (set.nakedSize === 3) data.naked3++;
				else if (set.nakedSize === 4) data.naked4++;
				else if (set.hiddenSize === 2) data.hidden2++;
				else if (set.hiddenSize === 3) data.hidden3++;
				else if (set.hiddenSize === 4) data.hidden4++;
			}
		}
		if (result.bentWingsReduced.length > 0) {
			for (const reduced of result.bentWingsReduced) {
				if (reduced.strategy === REDUCE.Y_Wing) yWingReduced++;
				if (reduced.strategy === REDUCE.XYZ_Wing) xyzWingReduced++;

				if (reduced.strategy === REDUCE.Y_Wing) data.yWing++;
				if (reduced.strategy === REDUCE.XYZ_Wing) data.xyzWing++;
			}
		}

		xWingReduced += result.xWingReduced;
		data.xWing += result.xWingReduced;

		swordfishReduced += result.swordfishReduced;
		data.swordfish += result.swordfishReduced;

		jellyfishReduced += result.jellyfishReduced;
		data.jellyfish += result.jellyfishReduced;

		uniqueRectangleReduced += result.uniqueRectangleReduced;
		data.uniqueRectangle += result.uniqueRectangleReduced;

		if (phistomefelResult) phistomefelCount++;
		if (phistomefelResult) data.phistomefel++;

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
			data.superpositions++;
		}

		if (!result.bruteForceFill) markers++;
	}

	setsTotal += setNaked2;
	setsTotal += setNaked3;
	setsTotal += setNaked4;
	setsTotal += setHidden2;
	setsTotal += setHidden3;
	setsTotal += setHidden4;

	const res = 10000;
	const percent = (val, total = totalPuzzles) => {
		return Math.ceil(100 * res * val / total) / res + "%";
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
};

onmessage = (e) => {
	const search = e.data.search;
	puzzleString = e.data.grid ?? null;
	stepMode = (search === "?dbphistomefel") ? 2 : 0;
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
// 19: 0% - 1
// 20: 0.0047% - 140
// 21: 0.2391% - 7172
// 22: 3.412% - 102359
// 23: 17.082% - 512459
// 24: 34.2541% - 1027623
// 25: 29.8964% - 896892
// 26: 12.2793% - 368378
// 27: 2.5355% - 76065
// 28: 0.2784% - 8353
// 29: 0.0179% - 538
// 30: 0.0007% - 20
// --- Superpositions
// Cell Markers 2: 99.198% - 992193
// Group Symbol 2: 0.6317% - 6318
// Cell Markers 3: 0.0785% - 785
// Cell Markers Pair 2: 0.067% - 670
// Group Symbol Pair 2: 0.0212% - 212
// Group Symbol 3: 0.003% - 30
// Group Symbol Pair 3: 0.0004% - 4
// Cell Markers Pair 3: 0.0002% - 2
// Group Symbol 4: 0.0001% - 1
// --- Naked Hiddens
// set4_2_2: 20.1387% - 334936
// set5_2_3: 19.0643% - 317067
// set5_3_2: 15.7856% - 262538
// set6_2_4: 12.1829% - 202619
// set6_3_3: 9.6694% - 160817
// set6_4_2: 8.0333% - 133606
// set7_2_5: 4.0269% - 66974
// set7_3_4: 3.3925% - 56423
// set7_4_3: 3.0952% - 51477
// set7_5_2: 1.8316% - 30463
// set8_2_6: 0.7206% - 11984
// set8_4_4: 0.6249% - 10393
// set8_3_5: 0.5454% - 9071
// set8_6_2: 0.4014% - 6676
// set8_5_3: 0.2734% - 4547
// set9_2_7: 0.0587% - 976
// set9_4_5: 0.0432% - 718
// set9_7_2: 0.0417% - 694
// set9_3_6: 0.0395% - 657
// set9_5_4: 0.0195% - 324
// set9_6_3: 0.0114% - 189
// Naked 2: 56.192% - 934556
// Naked 3: 29.4325% - 489506
// Naked 4: 11.7965% - 196194
// Hidden 2: 2.2748% - 37833
// Hidden 3: 0.2848% - 4736
// Hidden 4: 0.0195% - 324
// --- Markers
// NakedHiddenSet: 64.7675% - 1663149
// yWing: 17.9895% - 461947
// xyzWing: 8.3133% - 213475
// xWing: 3.7665% - 96720
// Swordfish: 0.837% - 21494
// Jellyfish: 0.0355% - 911
// UniqueRectangle: 4.2906% - 110178
// Phistomefel: 0% - 1
// --- Stats
// Time Avg: 0.005655921333374977 Max: 0.9772999992370606
// Operations Avg: 0
// --- Totals
// Simples: 53.8518% - 1615555
// Markers: 13.0679% - 392036
// Superpositions: 33.0802% - 992407
// BruteForceFill: 0.0001% - 2
// TotalPuzzles: 3000000
