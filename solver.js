import { Grid } from "./Grid.js";

const floor3 = x => Math.floor(x / 3);
const mod3 = x => x % 3;

const rowForIndex = (i) => {
	return Math.floor(i / 9);
}
const colForIndex = (i) => {
	return i % 9;
}
const boxForIndex = (i) => {
	return Math.floor(i / 27) * 3 + floor3(i % 9);
}

const indexForRow = (x, i) => {
	return x * 9 + i;
}
const indexForCol = (x, i) => {
	return i * 9 + x;
}
const indexForBox = (x, i) => {
	const row = floor3(x) * 3 + floor3(i);
	const col = mod3(x) * 3 + mod3(i);
	return row * 9 + col;
}

const candidates = (cells) => {
	for (const cell of cells) {
		const symbol = cell.symbol;
		if (symbol === null) continue;

		for (const i of cell.group) {
			const linked = cells[i];
			if (linked.symbol === null) linked.delete(symbol);
		}
	}
}

const openSingles = (cells) => {
	for (const group of Grid.groupTypes) {
		let symbolCell = null;
		for (const index of group) {
			const cell = cells[index];
			if (cell.symbol !== null) continue;
			if (symbolCell === null) symbolCell = cell;
			else { symbolCell = null; break; }
		}
		if (symbolCell !== null) {
			symbolCell.setSymbol(symbolCell.remainder);
			return true;
		}
	}
	return false;
}

const loneSingles = (cells) => {
	for (const cell of cells) {
		if (cell.symbol !== null || cell.size !== 1) continue;
		cell.setSymbol(cell.remainder);
		return true;
	}
	return false;
}

const hiddenSingles = (cells) => {
	for (let x = 0; x < 9; x++) {
		for (const group of Grid.groupTypes) {
			let symbolCell = null;
			for (const index of group) {
				const cell = cells[index];
				if (cell.symbol !== null) continue;
				if (!cell.has(x)) continue;
				if (symbolCell === null) symbolCell = cell;
				else { symbolCell = null; break; }
			}
			if (symbolCell !== null) {
				symbolCell.setSymbol(x);
				return true;
			}
		}
	}
	return false;
}

class SetUnit {
	constructor(index, set) {
		this.index = index;
		this.set = set;
	}
}

const nakedHiddenSets = (cells) => { // Naked and Hidden Pairs Triplets Quads any
	const union = new Set();

	for (const groupType of Grid.groupTypes) {
		const sets = [];
		for (const index of groupType) {
			const cell = cells[index];

			const set = new Set();
			for (let i = 0; i < 9; i++) {
				if (cell.has(i)) set.add(i);
			}
			if (set.size > 0) sets.push(new SetUnit(index, set));
		}

		const len = sets.length;
		for (let i = 0; i < len - 1; i++) {
			const remainder = len - i - 1;
			const setUnit = sets[i];

			const endLen = 0x1 << remainder;
			for (let inc = 1; inc < endLen; inc++) {
				union.clear();
				for (const x of setUnit.set) union.add(x);
				let unionCount = 1;
				let setHitMask = 0x1 << i;

				let mask = 0x1;
				for (let j = i + 1; j < len; j++) {
					const state = inc & mask;
					if (state > 0) {
						const compare = sets[j];
						for (const x of compare.set) union.add(x);
						unionCount++;
						setHitMask |= 0x1 << j;
					}
					mask <<= 1;
				}

				let reduced = false;
				if (unionCount === union.size && unionCount < sets.length) {
					for (let shift = 0; shift < len; shift++) {
						if ((setHitMask & (0x1 << shift)) > 0) continue;

						const set = sets[shift];
						const cell = cells[set.index];

						for (const symbol of union) {
							const had = cell.delete(symbol);
							if (had) reduced = true;
						}
					}
				}
				if (reduced) return true;
			}
		}
	}

	return false;
}

const omissions = (cells) => {
	const groupInGroup = (x, srcGroups, srcGroupType, dstGroups, dstGroupType) => {
		let groupIndex = 0;
		for (const group of srcGroups) {
			let groupForGroup = -1;
			for (const index of group) {
				const cell = cells[index];
				if (cell.symbol !== null) continue;
				if (!cell.has(x)) continue;

				const typeIndex = cell[srcGroupType];
				if (groupForGroup === -1) {
					groupForGroup = typeIndex;
				} else if (groupForGroup !== typeIndex) {
					groupForGroup = -1;
					break;
				}
			}

			let reduced = false;

			if (groupForGroup !== -1) {
				for (const index of dstGroups[groupForGroup]) {
					const cell = cells[index];
					if (cell.symbol !== null) continue;
					if (cell[dstGroupType] === groupIndex) continue;
					const had = cell.delete(x);
					if (had) reduced = true;
				}
			}

			if (reduced) return true;

			groupIndex++;
		}
		return false;
	}
	const groupInBox = (x, groups, groupProperty) => {
		return groupInGroup(x, groups, 'box', Grid.groupBoxs, groupProperty);
	}
	const boxInGroup = (x, groups, groupProperty) => {
		return groupInGroup(x, Grid.groupBoxs, groupProperty, groups, 'box');
	}

	for (let x = 0; x < 9; x++) {
		if (groupInBox(x, Grid.groupRows, 'row')) return true;
		if (groupInBox(x, Grid.groupCols, 'col')) return true;

		if (boxInGroup(x, Grid.groupRows, 'row')) return true;
		if (boxInGroup(x, Grid.groupCols, 'col')) return true;
	}

	return false;
}

const xWingSwordfish = (cells) => {
	class GroupPair {
		constructor(x, i1, i2) {
			this.x = x;
			this.i1 = i1;
			this.i2 = i2;
		}
	}

	let reduced = false;

	for (let i = 0; i < 9; i++) {
		const pairs = [];
		for (let x = 0; x < 9; x++) {
			let y1 = -1;
			let y2 = -1;
			for (let y = 0; y < 9; y++) {
				const cell = cells[x * 9 + y];
				if (cell.symbol !== null) continue;
				if (cell.has(i)) {
					if (y1 === -1) y1 = y;
					else if (y2 === -1) y2 = y;
					else { y2 = -1; break; }
				}
			}
			if (y2 >= 0) pairs.push(new GroupPair(x, y1, y2));
		}

		const len = pairs.length;
		for (let p1 = 0, last = len - 1; p1 < last; p1++) {
			const pair1 = pairs[p1];
			for (let p2 = p1 + 1; p2 < len; p2++) {
				const pair2 = pairs[p2];
				if (pair1.i1 === pair2.i1 && pair1.i2 === pair2.i2) {
					for (let x = 0; x < 9; x++) {
						if (x === pair1.x || x === pair2.x) continue;

						const cell1 = cells[x * 9 + pair1.i1];
						if (cell1.symbol === null) {
							const had = cell1.delete(i);
							if (had) {
								reduced = true;
								// console.log("X-Wing");
							}
						}

						const cell2 = cells[x * 9 + pair1.i2];
						if (cell2.symbol === null) {
							const had = cell2.delete(i);
							if (had) {
								reduced = true;
								// console.log("X-Wing");
							}
						}
					}
				}
			}
		}
	}

	for (let i = 0; i < 9; i++) {
		const pairs = [];
		for (let x = 0; x < 9; x++) {
			let y1 = -1;
			let y2 = -1;
			for (let y = 0; y < 9; y++) {
				const cell = cells[y * 9 + x];
				if (cell.symbol !== null) continue;
				if (cell.has(i)) {
					if (y1 === -1) y1 = y;
					else if (y2 === -1) y2 = y;
					else { y2 = -1; break; }
				}
			}
			if (y2 >= 0) pairs.push(new GroupPair(x, y1, y2));
		}

		const len = pairs.length;
		for (let p1 = 0, last = len - 1; p1 < last; p1++) {
			const pair1 = pairs[p1];
			for (let p2 = p1 + 1; p2 < len; p2++) {
				const pair2 = pairs[p2];
				if (pair1.i1 === pair2.i1 && pair1.i2 === pair2.i2) {
					for (let x = 0; x < 9; x++) {
						if (x === pair1.x || x === pair2.x) continue;

						const cell1 = cells[pair1.i1 * 9 + x];
						if (cell1.symbol === null) {
							const had = cell1.delete(i);
							if (had) {
								reduced = true;
								// console.log("X-Wing");
							}
						}

						const cell2 = cells[pair1.i2 * 9 + x];
						if (cell2.symbol === null) {
							const had = cell2.delete(i);
							if (had) {
								reduced = true;
								// console.log("X-Wing");
							}
						}
					}
				}
			}
		}
	}

	return reduced;
}

const xWingSwordfish2 = (cells) => {
	for (let x = 0; x < 9; x++) {
		let rowIndex = 0;
		let rowMap = new Map();
		for (const rowGroup of Grid.groupRows) {
			const symbols = new Set();
			for (const index of rowGroup) {
				const cell = cells[index];
				if (cell.has(x)) symbols.add(index);
				if (symbols.size > 3) break;
			}
			if (symbols.size === 2 || symbols.size === 3) {
				rowMap.set(rowIndex, symbols);
			}
			rowIndex++;
		}

		// const rowArray = rowMap.entries();
		// for (let i = 0; i < rowArray.length) {

		// }
		// for(const [rkey, rvalue] of rowMap) {
		// 	for(const [ckey, cvalue] of colMap) {
		// 		if()
		// 	}

		// 	console.log(key, value);
		// }
	}
	return false;
}

const xyWing = (cells) => {
	class Pair {
		constructor(index, s1, s2) {
			this.index = index;
			this.s1 = s1;
			this.s2 = s2;
		}
	}

	// map pairs
	const pairs = [];
	for (const cell of cells) {
		if (cell.symbol !== null) continue;
		let s1 = -1;
		let s2 = -1;
		for (let s = 0; s < 9; s++) {
			if (!cell.has(s)) continue;
			if (s1 === -1) {
				s1 = s;
			} else if (s2 === -1) {
				s2 = s;
			} else {
				s2 = -1;
				break;
			}
		}
		if (s2 !== -1) {
			pairs.push(new Pair(cell.index, s1, s2));
		}
	}

	const pairLen = pairs.length;
	const union = new Set();
	for (let i1 = 0; i1 < pairLen - 2; i1++) {
		const pair1 = pairs[i1];
		union.clear();
		union.add(pair1.s1);
		union.add(pair1.s2);

		for (let i2 = i1 + 1; i2 < pairLen - 1; i2++) {
			const pair2 = pairs[i2];

			if (pair1.s1 === pair2.s1 && pair1.s2 === pair2.s2) continue;

			if (union.size === 0) {
				union.add(pair1.s1);
				union.add(pair1.s2);
			}
			union.add(pair2.s1);
			union.add(pair2.s2);

			// if (union.size !== 3) continue

			for (let i3 = i2 + 1; i3 < pairLen; i3++) {
				const pair3 = pairs[i3];

				if (pair1.s1 === pair3.s1 && pair1.s2 === pair3.s2) continue;
				if (pair2.s1 === pair3.s1 && pair2.s2 === pair3.s2) continue;

				union.clear();
				if (union.size === 0) {
					union.add(pair1.s1);
					union.add(pair1.s2);
					union.add(pair2.s1);
					union.add(pair2.s2);
					if (union.size !== 3) continue
				}

				union.add(pair3.s1);
				if (union.size !== 3) continue
				union.add(pair3.s2);
				if (union.size !== 3) continue;

				const row1 = rowForIndex(pair1.index);
				const row2 = rowForIndex(pair2.index);
				const row3 = rowForIndex(pair3.index);
				const col1 = colForIndex(pair1.index);
				const col2 = colForIndex(pair2.index);
				const col3 = colForIndex(pair3.index);
				const box1 = boxForIndex(pair1.index);
				const box2 = boxForIndex(pair2.index);
				const box3 = boxForIndex(pair3.index);

				if (row1 === row2 && row2 === row3) continue;
				if (col1 === col2 && col2 === col3) continue;
				if (box1 === box2 && box2 === box3) continue;

				let reduced = false;

				if (row1 === row2 || col1 === col2 || box1 === box2) {
					if (row1 === row3 || col1 === col3 || box1 === box3) {
						const hits = new Set();
						hits.add(pair2.s1);
						hits.add(pair2.s2);
						hits.add(pair3.s1);
						hits.add(pair3.s2);

						hits.delete(pair1.s1);
						hits.delete(pair1.s2);

						for (const hit of hits) {

							if (box2 !== box3) {
								for (let x = 0; x < 9; x++) {
									const index = indexForCol(col2, x);
									const b = boxForIndex(index);
									if (box3 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											reduced = true;
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row2, x);
									const b = boxForIndex(index);
									if (box3 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
											reduced = true;
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForCol(col3, x);
									const b = boxForIndex(index);
									if (box2 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											reduced = true;
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row3, x);
									const b = boxForIndex(index);
									if (box2 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
											reduced = true;
										}
									}
								}
							}

						}

					}
				}
				if (row1 === row2 || col1 === col2 || box1 === box2) {
					if (row2 === row3 || col2 === col3 || box2 === box3) {
						const hits = new Set();
						hits.add(pair1.s1);
						hits.add(pair1.s2);
						hits.add(pair3.s1);
						hits.add(pair3.s2);

						hits.delete(pair2.s1);
						hits.delete(pair2.s2);

						for (const hit of hits) {

							if (box1 !== box3) {
								for (let x = 0; x < 9; x++) {
									const index = indexForCol(col1, x);
									const b = boxForIndex(index);
									if (box3 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											reduced = true;
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row1, x);
									const b = boxForIndex(index);
									if (box3 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
											reduced = true;
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForCol(col3, x);
									const b = boxForIndex(index);
									if (box1 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											reduced = true;

											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row3, x);
									const b = boxForIndex(index);
									if (box1 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
											reduced = true;
										}
									}
								}
							}

						}

					}
				}
				if (row1 === row3 || col1 === col3 || box1 === box3) {
					if (row2 === row3 || col2 === col3 || box2 === box3) {
						const hits = new Set();
						hits.add(pair1.s1);
						hits.add(pair1.s2);
						hits.add(pair2.s1);
						hits.add(pair2.s2);

						hits.delete(pair3.s1);
						hits.delete(pair3.s2);

						for (const hit of hits) {

							if (box1 !== box2) {
								for (let x = 0; x < 9; x++) {
									const index = indexForCol(col1, x);
									const b = boxForIndex(index);
									if (box2 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											reduced = true;
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row1, x);
									const b = boxForIndex(index);
									if (box2 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
											reduced = true;
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForCol(col2, x);
									const b = boxForIndex(index);
									if (box1 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											reduced = true;
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row2, x);
									const b = boxForIndex(index);
									if (box1 === b) {
										const cell = cells[index];
										const had = cell.delete(hit);
										if (had) {
											// console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											// console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											// console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
											reduced = true;
										}
									}
								}
							}

						}

					}
				}
				// console.log(reduced);
				if (reduced) return reduced;

				union.clear();
			}
		}
	}
	return false;
}

const phistomefel = () => {
	// A symbols = B symbols
	// AA.|...|.AA
	// AA.|...|.AA
	// ..B|BBB|B..
	// ---|---|---
	// ..B|...|B..
	// ..B|...|B..
	// ..B|...|B..
	// ---|---|---
	// ..B|BBB|B..
	// AA.|...|.AA
	// AA.|...|.AA
}
const deadlyPattern = () => {
	// same pairs on 2 cols, 2 rows, and 2 boxs
	// Unique Rectangle
	// Type 1 Unique Rectangles

	// Type 2 Unique Rectangles
	// https://www.sudokuwiki.org/Unique_Rectangles
}

const bruteForce = (cells) => {
	function isValid(cell, x) {
		const row = Math.floor(cell.index / 9);
		const col = cell.index % 9;
		for (let i = 0; i < 9; i++) {
			const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
			const n = 3 * Math.floor(col / 3) + i % 3;
			const rowCell = cells[row * 9 + i];
			const colCell = cells[i * 9 + col];
			const boxCell = cells[m * 9 + n];
			if (rowCell.symbol === x || colCell.symbol === x || boxCell.symbol === x) {
				return false;
			}
		}
		return true;
	}

	const makeRand = (size) => {
		const rnd = new Uint8Array(size);
		for (let i = 0; i < size; i++) rnd[i] = i;

		for (let i = 0; i < size; i++) {
			const position = Math.floor(Math.random() * size);
			if (position !== i) {
				const tmp = rnd[position];
				rnd[position] = rnd[i];
				rnd[i] = tmp;
			}
		}
		return rnd;
	}
	const rnd = makeRand(81);
	function sodokoSolver() {
		for (let index = 0; index < 81; index++) {
			const cell = cells[rnd[index]];
			if (cell.symbol === null) {

				const rndx = makeRand(9);
				for (let x = 0; x < 9; x++) {
					const symbol = rndx[x];
					if (!cell.has(symbol)) continue;

					const state = cell.toData();

					if (isValid(cell, symbol)) {
						cell.setSymbol(symbol);
						if (sodokoSolver()) {
							return true;
						} else {
							cell.fromData(state);
							// cell.setSymbol(null);
						}
					}
				}
				return false;
			}
		}
		return true;
	}

	const result = sodokoSolver();
	return result;
}

const indices = new Uint8Array(81);
for (let i = 0; i < 81; i++) indices[i] = i;

const generate = (cells) => {
	if (!cells) {
		for (let i = 0; i < 81; i++) {
			const position = Math.floor(Math.random() * 81);
			if (position !== i) {
				const tmp = indices[position];
				indices[position] = indices[i];
				indices[i] = tmp;
			}
		}
		return;
	}

	for (let i = 0; i < 81; i++) {
		const index = indices[i];
		const cell = cells[index];
		if (cell.symbol !== null) continue;
		let found = -1;

		const random = [0, 1, 2, 3, 4, 5, 6, 7, 8];
		for (let i = 0; i < 9; i++) {
			const position = Math.floor(Math.random() * 9);
			if (position !== i) {
				const tmp = random[position];
				random[position] = random[i];
				random[i] = tmp;
			}
		}

		for (const x of random) {
			if (cell.has(x)) {
				if (found >= 0) {
					cell.setSymbol(x);
					return true;
				}
				found = x;
			}
		}
	}
	return false;
}

export { candidates, generate, loneSingles, hiddenSingles, nakedHiddenSets, omissions, xWingSwordfish, xyWing, bruteForce };
