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
	const data = {
		puzzle: cells.string(),
		totalPuzzles: totalPuzzles,
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
			lines.push(title + ": " + percent(val, markerTotal) + " " + percent((val / markerTotal) * (markers / totalPuzzles), 1) + " - " + val);
		};
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

		for (const order of ordered) printLine(order.key, order.value);

		printLine("NakedHiddenSet", setsTotal);
		printLine("yWing", yWingReduced);
		printLine("xyzWing", xyzWingReduced);
		printLine("xWing", xWingReduced);
		printLine("Swordfish", swordfishReduced);
		printLine("Jellyfish", jellyfishReduced);
		printLine("UniqueRectangle", uniqueRectangleReduced);
		// printLine("Phistomefel", phistomefelCount);
	}
	lines.push("Simples: " + percent(simples) + " - " + simples);
	lines.push("Markers: " + percent(markers) + " - " + markers);
	lines.push("BruteForceFill: " + percent(bruteForceFill) + " - " + bruteForceFill);
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

// set5_2_3: 13.5067% 1.7535%
// set4_2_2: 11.3721% 1.4764%
// set6_2_4: 9.1872% 1.1927%
// set5_3_2: 6.9146% 0.8977%
// set6_3_3: 5.4437% 0.7067%
// set7_2_5: 2.9866% 0.3877%
// set6_4_2: 2.4459% 0.3175%
// set7_3_4: 2.116% 0.2747%
// set7_5_2: 1.5772% 0.2048%
// set8_2_6: 0.5779% 0.075%
// set7_4_3: 0.5649% 0.0733%
// set8_6_2: 0.4176% 0.0542%
// set8_3_5: 0.3691% 0.0479%
// set8_5_3: 0.1603% 0.0208%
// set8_4_4: 0.0802% 0.0104%
// set9_2_7: 0.0447% 0.0058%
// set9_7_2: 0.0391% 0.0051%
// set9_3_6: 0.0261% 0.0034%
// set9_6_3: 0.0112% 0.0015%
// set9_4_5: 0.0093% 0.0012%
// set9_5_4: 0.0019% 0.0002%
// NakedHiddenSet: 57.8523% 7.5105%
// yWing: 28.5328% 3.7042%
// xyzWing: 6.7319% 0.874%
// xWing: 1.9911% 0.2585%
// Swordfish: 0.5127% 0.0666%
// Jellyfish: 0.028% 0.0036%
// UniqueRectangle: 4.3512% 0.5649%
// Phistomefel: 0% 0%
// Simples: 53.9316%
// Markers: 12.9822%
// BruteForceFill: 33.0862%
// Time Avg < 100000: 65.31760657980833fps Avg: 0.22953987749064084 Max: 149.3282999997139
// Operations: 14.2648% < 100000 avg: 986643
// TotalPuzzles: 179407

// set5_2_3: 13.334% 1.7548%
// set4_2_2: 10.996% 1.4471%
// set6_2_4: 8.8413% 1.1635%
// set5_3_2: 6.6639% 0.877%
// set6_3_3: 5.6751% 0.7469%
// set6_4_2: 2.7397% 0.3606%
// set7_2_5: 2.9581% 0.3893%
// set7_3_4: 2.1856% 0.2876%
// set7_4_3: 1.339% 0.1762%
// set7_5_2: 0.5418% 0.0713%
// set8_2_6: 0.5582% 0.0735%
// set8_3_5: 0.3584% 0.0472%
// set8_4_4: 0.3193% 0.042%
// set8_5_3: 0.0886% 0.0117%
// set8_6_2: 0.1215% 0.016%
// set9_2_7: 0.0494% 0.0065%
// set9_3_6: 0.0288% 0.0038%
// set9_4_5: 0.0268% 0.0035%
// set9_6_3: 0.0021% 0.0003%
// set9_7_2: 0.0041% 0.0005%
// set9_5_4: 0.0041% 0.0005%
// NakedHiddenSet: 56.8359% 7.4798%
// yWing: 29.2718% 3.8523%
// xyzWing: 6.9894% 0.9198%
// xWing: 2.0579% 0.2708%
// Swordfish: 0.4202% 0.0553%
// Jellyfish: 0.0268% 0.0035%
// UniqueRectangle: 4.398% 0.5788%
// Phistomefel: 0% 0%
// Simples: 53.7245%
// Markers: 13.1603%
// BruteForceFill: 33.1152%
// Time Avg < 100000: 66.12393454344502fps Avg: 0.22498061798707428 Max: 38.295900000095365
// Operations: 14.4% < 100000 avg: 972856
// TotalPuzzles: 159875