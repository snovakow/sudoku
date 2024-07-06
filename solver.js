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

const xWing = (cells) => {
	class GroupPair {
		constructor(x, i1, i2) {
			this.x = x;
			this.i1 = i1;
			this.i2 = i2;
		}
	}

	let reduced = false;

	const xWingOrientation = (flip) => {
		for (let i = 0; i < 9; i++) {
			const pairs = [];
			for (let x = 0; x < 9; x++) {
				let y1 = -1;
				let y2 = -1;
				for (let y = 0; y < 9; y++) {
					const index = flip ? x * 9 + y : y * 9 + x;
					const cell = cells[index];
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

							const index1 = flip ? x * 9 + pair1.i1 : pair1.i1 * 9 + x;
							const cell1 = cells[index1];
							if (cell1.symbol === null) {
								const had = cell1.delete(i);
								if (had) {
									reduced = true;
									// console.log("X-Wing");
								}
							}

							const index2 = flip ? x * 9 + pair1.i2 : pair1.i2 * 9 + x;
							const cell2 = cells[index2];
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
	}
	xWingOrientation(true);
	xWingOrientation(false);

	return reduced;
}

const swordfish = (cells) => {
	class GroupPair {
		constructor(x, i1, i2, i3) {
			this.x = x;
			this.i1 = i1;
			this.i2 = i2;
			this.i3 = i3;
		}
	}

	let reduced = false;
	const set = new Set();

	const swordfishOrientation = (flip) => {
		for (let i = 0; i < 9; i++) {
			const pairs = [];
			for (let x = 0; x < 9; x++) {
				let y1 = -1;
				let y2 = -1;
				let y3 = -1;
				for (let y = 0; y < 9; y++) {
					const index = flip ? x * 9 + y : y * 9 + x;
					const cell = cells[index];
					if (cell.symbol !== null) continue;
					if (cell.has(i)) {
						if (y1 === -1) y1 = y;
						else if (y2 === -1) y2 = y;
						else if (y3 === -1) y3 = y;
						else { y2 = -1; break; }
					}
				}
				if (y2 >= 0) pairs.push(new GroupPair(x, y1, y2, y3));
			}

			const len = pairs.length;
			for (let p1 = 0, last1 = len - 2; p1 < last1; p1++) {
				const pair1 = pairs[p1];
				for (let p2 = p1 + 1, last2 = len - 1; p2 < last2; p2++) {
					const pair2 = pairs[p2];
					for (let p3 = p2 + 1; p3 < len; p3++) {
						const pair3 = pairs[p3];

						set.clear();

						set.add(pair1.i1);
						set.add(pair1.i2);
						if (pair1.i3 !== -1) set.add(pair1.i3);

						set.add(pair2.i1);
						set.add(pair2.i2);
						if (pair2.i3 !== -1) set.add(pair2.i3);

						set.add(pair3.i1);
						set.add(pair3.i2);
						if (pair3.i3 !== -1) set.add(pair3.i3);

						if (set.size === 3) {
							for (let x = 0; x < 9; x++) {
								if (x === pair1.x || x === pair2.x || x === pair3.x) continue;

								for (const pairi of [...set]) {
									const index = flip ? x * 9 + pairi : pairi * 9 + x;
									const cell = cells[index];
									if (cell.symbol === null) {
										const had = cell.delete(i);
										if (had) {
											reduced = true;
											// console.log("Swordfish");
										}
									}
								}
							}
						}
					}
				}
			}
		}
	}
	swordfishOrientation(true);
	swordfishOrientation(false);

	return reduced;
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

const deadlyPattern = () => {
	// Type 2 Unique Rectangles
	// https://www.sudokuwiki.org/Unique_Rectangles
}

// Deadly Pattern: Type 1 Unique Rectangles
const uniqueRectangle = (cells) => {
	const pairs = [];
	for (let i = 0; i < 81; i++) {
		const cell = cells[i];
		if (cell.symbol !== null) continue;
		if (cell.size !== 2) continue;
		pairs.push(cell);
	}
	for (let i = 0, leni = pairs.length - 2; i < leni; i++) {
		for (let j = i + 1, lenj = pairs.length - 1; j < lenj; j++) {
			for (let k = j + 1, lenk = pairs.length; k < lenk; k++) {
				const cell1 = pairs[i];
				const cell2 = pairs[j];
				const cell3 = pairs[k];

				if (cell1.mask !== cell2.mask || cell2.mask !== cell3.mask) continue;

				let rowCount = 1;
				if (cell2.row !== cell1.row) rowCount++;
				if (cell3.row !== cell1.row && cell3.row !== cell2.row) rowCount++;
				if (rowCount !== 2) continue;

				let colCount = 1;
				if (cell2.col !== cell1.col) colCount++;
				if (cell3.col !== cell1.col && cell3.col !== cell2.col) colCount++;
				if (colCount !== 2) continue;

				let boxCount = 1;
				if (cell2.box !== cell1.box) boxCount++;
				if (cell3.box !== cell1.box && cell3.box !== cell2.box) boxCount++;
				if (boxCount !== 2) continue;

				let row = -1;
				if (cell1.row === cell2.row) row = cell3.row;
				// if (cell1.row === cell3.row) row = cell2.row; // cells are in order so the 1st and 3rd can't be on the same row
				if (cell2.row === cell3.row) row = cell1.row;

				if (row === -1) continue;

				let col = -1;
				if (cell1.col === cell2.col) col = cell3.col;
				if (cell1.col === cell3.col) col = cell2.col;
				if (cell2.col === cell3.col) col = cell1.col;

				if (col === -1) continue;

				const cell = cells[row * 9 + col];
				for (let x = 0; x < 9; x++) {
					if (cell1.has(x)) {
						if (cell.delete(x)) {
							return true;
						}
					}
				}
			}
		}
	}
}

export const aCells = new Set();
export const bCells = new Set();
const phistomefel = (cells) => {
	// 00 01 02|03 04 05|06 07 08
	// 09 10 11|12 13 14|15 16 17
	// 18 19 20|21 22 23|24 25 26
	// --------|--------|--------
	// 27 28 29|30 31 32|33 34 35
	// 36 37 38|39 40 41|42 43 44
	// 45 46 47|48 49 50|51 52 53
	// --------|--------|--------
	// 54 55 56|57 58 59|60 61 62
	// 63 64 65|66 67 68|69 70 71
	// 72 73 74|75 76 77|78 79 80

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
	const addGroupIndex = (set, index) => {
		set.add(index);
	};
	addGroupIndex(aCells, 0);
	addGroupIndex(aCells, 1);
	addGroupIndex(aCells, 9);
	addGroupIndex(aCells, 10);

	addGroupIndex(aCells, 7);
	addGroupIndex(aCells, 8);
	addGroupIndex(aCells, 16);
	addGroupIndex(aCells, 17);

	addGroupIndex(aCells, 63);
	addGroupIndex(aCells, 64);
	addGroupIndex(aCells, 72);
	addGroupIndex(aCells, 73);

	addGroupIndex(aCells, 70);
	addGroupIndex(aCells, 71);
	addGroupIndex(aCells, 79);
	addGroupIndex(aCells, 80);

	addGroupIndex(bCells, 20);
	addGroupIndex(bCells, 21);
	addGroupIndex(bCells, 22);
	addGroupIndex(bCells, 23);
	addGroupIndex(bCells, 24);

	addGroupIndex(bCells, 29);
	addGroupIndex(bCells, 33);

	addGroupIndex(bCells, 38);
	addGroupIndex(bCells, 42);

	addGroupIndex(bCells, 47);
	addGroupIndex(bCells, 51);

	addGroupIndex(bCells, 56);
	addGroupIndex(bCells, 57);
	addGroupIndex(bCells, 58);
	addGroupIndex(bCells, 59);
	addGroupIndex(bCells, 60);

	let reduced = false;
	let filled = false;

	for (let x = 0; x < 9; x++) {
		let aCount = 0;
		let aMarkers = 0;
		let aFull = true;
		for (const aIndex of aCells) {
			const aCell = cells[aIndex];
			if (aCell.symbol === null) {
				if (aCell.has(x)) {
					aFull = false;
					aMarkers++;
				}
			} else {
				aCount++;
			}
		}

		let bCount = 0;
		let bMarkers = 0;
		let bFull = true;
		for (const bIndex of bCells) {
			const bCell = cells[bIndex];
			if (bCell.symbol === null) {
				if (bCell.has(x)) {
					bFull = false;
					bMarkers++;
				}
			} else {
				bCount++;
			}
		}

		if (aFull) {
			if (aCount === bCount && bMarkers > 0) {
				for (const bIndex of bCells) {
					const bCell = cells[bIndex];
					if (bCell.symbol === null) {
						if (bCell.delete(x)) {
							reduced = true;
						}
					}
				}
			}
			if (aCount === bCount + bMarkers) {
				for (const bIndex of bCells) {
					const bCell = cells[bIndex];
					if (bCell.symbol === null) {
						if (bCell.has(x)) {
							bCell.setSymbol(x);
							filled = true;
						}
					}
				}
			}
		}
		if (bFull) {
			if (bCount === aCount && aMarkers > 0) {
				for (const aIndex of aCells) {
					const aCell = cells[aIndex];
					if (aCell.symbol === null) {
						if (aCell.delete(x)) {
							reduced = true;
						}
					}
				}
			}
			if (bCount === aCount + aMarkers) {
				for (const aIndex of aCells) {
					const aCell = cells[aIndex];
					if (aCell.symbol === null) {
						if (aCell.has(x)) {
							aCell.setSymbol(x);
							filled = true;
						}
					}
				}
			}
		}
	}
	return { reduced, filled };

	// 	let bCount = 0;
	// 	let bValid = true;
	// 	for (const bIndex of bCells) {
	// 		const bCell = cells[bIndex];
	// 		if (bCell.symbol === null) {
	// 			if (bCell.has(x)) {
	// 				bValid = false;
	// 				// break;
	// 			}
	// 		} else {
	// 			if (bCell.has(x)) bCount++;
	// 		}
	// 	}

	// 	if (aValid && aCount === 0) {
	// 		for (const bIndex of bCells) {
	// 			const bCell = cells[bIndex];
	// 			if (bCell.symbol === null) {
	// 				if (bCell.delete(x)) {
	// 					reduced = true;
	// 				}
	// 			}
	// 		}
	// 	}
	// 	if (bValid && bCount === 0) {
	// 		for (const aIndex of aCells) {
	// 			const aCell = cells[aIndex];
	// 			if (aCell.symbol === null) {
	// 				if (aCell.delete(x)) {
	// 					reduced = true;
	// 				}
	// 			}
	// 		}
	// 	}
	// 	if (aValid && aCount === bCount) {
	// 		for (const bIndex of bCells) {
	// 			const bCell = cells[bIndex];
	// 			if (bCell.symbol === null) {
	// 				if (bCell.delete(x)) {
	// 					reduced = true;
	// 				}
	// 			}
	// 		}
	// 	}
	// 	if (bValid && aCount === bCount) {
	// 		for (const aIndex of aCells) {
	// 			const aCell = cells[aIndex];
	// 			if (aCell.symbol === null) {
	// 				if (aCell.delete(x)) {
	// 					reduced = true;
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	let aCount = 0;
	let aCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	for (const aIndex of aCells) {
		const aCell = cells[aIndex];
		if (aCell.symbol === null) continue;
		aCounts[aCell.symbol]++;
		aCount++;
	}
	let bCount = 0;
	let bCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
	for (const bIndex of bCells) {
		const bCell = cells[bIndex];
		if (bCell.symbol === null) continue;
		bCounts[bCell.symbol]++;
		bCount++;
	}
	if (aCount !== bCount) {
		if (aCount === 16) {
			for (let x = 0; x < 9; x++) {
				aCounts[x] -= bCounts[x];
			}
			for (const bIndex of bCells) {
				const bCell = cells[bIndex];
				if (bCell.symbol !== null) continue;
				for (let x = 0; x < 9; x++) {
					if (aCounts[x] === 0) {
						if (bCell.delete(x)) {
							reduced = true;
						}
					}
				}
			}
		}
		if (bCount === 16) {
			for (let x = 0; x < 9; x++) {
				bCounts[x] -= aCounts[x];
			}
			for (const aIndex of aCells) {
				const aCell = cells[aIndex];
				if (aCell.symbol !== null) continue;
				for (let x = 0; x < 9; x++) {
					if (bCounts[x] === 0) {
						if (aCell.delete(x)) {
							reduced = true;
						}
					}
				}
			}
		}
	}

	for (const aIndex of aCells) {
		const aCell = cells[aIndex];
		if (aCell.symbol !== null) continue;
		for (let x = 0; x < 9; x++) {
			if (!aCell.has(x)) continue;

			let possible = false;
			for (const bIndex of bCells) {
				const bCell = cells[bIndex];
				if (bCell.symbol === null) {
					if (bCell.has(x)) {
						possible = true;
						break;
					}
				} else {
					if (bCell.symbol === x) {
						possible = true;
						break;
					}
				}
			}

			if (!possible) {
				// console.log("A !!!");
				reduced = true;
				aCell.delete(x);
				// return true;
			}
		}
	}
	for (const bIndex of bCells) {
		const bCell = cells[bIndex];
		if (bCell.symbol !== null) continue;
		for (let x = 0; x < 9; x++) {
			if (!bCell.has(x)) continue;

			let possible = false;
			for (const aIndex of aCells) {
				const aCell = cells[aIndex];
				if (aCell.symbol === null) {
					if (aCell.has(x)) {
						possible = true;
						break;
					}
				} else {
					if (aCell.symbol === x) {
						possible = true;
						break;
					}
				}
			}

			if (!possible) {
				// console.log("B !!!");
				reduced = true;
				bCell.delete(x);
				// return true;
			}
		}
	}

	return reduced;
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

export {
	candidates, generate, loneSingles, hiddenSingles, nakedHiddenSets, omissions, xWing, swordfish, xyWing,
	uniqueRectangle, phistomefel, bruteForce
};
