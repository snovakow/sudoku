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

class GridGroup {
	static rowForIndex = rowForIndex;
	static colForIndex = colForIndex;
	static boxForIndex = boxForIndex;

	static rowIndex = indexForRow;
	static colIndex = indexForCol;
	static boxIndex = indexForBox;

	constructor(group) {
		this.group = group;
	}
	getRow(x, i) {
		return this.group[x * 9 + i];
	}
	setRow(x, i, symbol) {
		this.group[x * 9 + i] = symbol;
	}
	getCol(x, i) {
		return this.group[i * 9 + x];
	}
	setCol(x, i, symbol) {
		this.group[i * 9 + x] = symbol;
	}
	getBox(x, i) {
		const row = floor3(x) * 3 + floor3(i);
		const col = mod3(x) * 3 + mod3(i);
		return this.group[row * 9 + col];
	}
}
const xWing = (markers) => {
	const markerGroup = new GridGroup(markers);

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
				const marker = markerGroup.getRow(x, y);
				if (!marker) continue;
				if (marker[i]) {
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

						const marker1 = markerGroup.getCol(pair1.i1, x);
						if (marker1) {
							const symbol = marker1[i];
							if (symbol) {
								marker1[i] = false;
								reduced = true;
								console.log("X-Wing");
							}
						}

						const marker2 = markerGroup.getCol(pair1.i2, x);
						if (marker2) {
							const symbol = marker2[i];
							if (symbol) {
								marker2[i] = false;
								reduced = true;
								console.log("X-Wing");
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
				const marker = markerGroup.getCol(x, y);
				if (!marker) continue;
				if (marker[i]) {
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

						const marker1 = markerGroup.getRow(pair1.i1, x);
						if (marker1) {
							const symbol = marker1[i];
							if (symbol) {
								marker1[i] = false;
								reduced = true;
								console.log("X-Wing");
							}
						}

						const marker2 = markerGroup.getRow(pair1.i2, x);
						if (marker2) {
							const symbol = marker2[i];
							if (symbol) {
								marker2[i] = false;
								reduced = true;
								console.log("X-Wing");
							}
						}
					}
				}
			}
		}
	}

	return reduced;
}

const xyWing = (markers) => {
	const markerGroup = new GridGroup(markers);

	class Pair {
		constructor(index, s1, s2) {
			this.index = index;
			this.s1 = s1;
			this.s2 = s2;
		}
	}

	// map pairs
	const pairs = [];
	for (let i = 0; i < 81; i++) {
		const marker = markers[i];
		if (!marker) continue;
		let s1 = -1;
		let s2 = -1;
		for (let s = 0; s < 9; s++) {
			if (!marker[s]) continue;
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
			pairs.push(new Pair(i, s1, s2));
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
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											reduced = true;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row2, x);
									const b = boxForIndex(index);
									if (box3 === b) {
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
											reduced = true;
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForCol(col3, x);
									const b = boxForIndex(index);
									if (box2 === b) {
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											reduced = true;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row3, x);
									const b = boxForIndex(index);
									if (box2 === b) {
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
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
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											reduced = true;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row1, x);
									const b = boxForIndex(index);
									if (box3 === b) {
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
											reduced = true;
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForCol(col3, x);
									const b = boxForIndex(index);
									if (box1 === b) {
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											reduced = true;

											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row3, x);
									const b = boxForIndex(index);
									if (box1 === b) {
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
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
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											reduced = true;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row1, x);
									const b = boxForIndex(index);
									if (box2 === b) {
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
											reduced = true;
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForCol(col2, x);
									const b = boxForIndex(index);
									if (box1 === b) {
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											reduced = true;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
										}
									}
								}
								for (let x = 0; x < 9; x++) {
									const index = indexForRow(row2, x);
									const b = boxForIndex(index);
									if (box1 === b) {
										const m = markerGroup.group[index];
										if (m?.[hit]) {
											m[hit] = false;
											console.log(rowForIndex(pair1.index) + 1, colForIndex(pair1.index) + 1);
											console.log(rowForIndex(pair2.index) + 1, colForIndex(pair2.index) + 1);
											console.log(rowForIndex(pair3.index) + 1, colForIndex(pair3.index) + 1);
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

const indices = new Uint8Array(81);
for (let i = 0; i < 81; i++) indices[i] = i;

const generate = (cells) => {
	if (!cells) {
		for (let i = 0; i < 81; i++) {
			const position = Math.floor(Math.random() * 81);
			if (position !== i) {
				const tmp = indices[position];
				indices[position] = i;
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
				random[position] = i;
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

export { candidates, generate, loneSingles, hiddenSingles, nakedHiddenSets, omissions, xWing, xyWing };
