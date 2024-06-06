/* floor Math.floor(x/3)

b1 1xxx | x1&1x
b2 (xx0x | xxx1) & x1^1x

1000 10
0111 10
0110 10

0101 01
0100 01
0011 01

0010 00
0001 00
0000 00
*/

const test = true;
const floor3 = test ? (x) => {
	const x2 = x >> 1;
	const x3 = x >> 2;
	const b1 = (x >> 3) | (x2 & x3);
	const b2 = (~x2 | x) & (x2 ^ x3);
	return (b1 << 1) | b2;
} : x => Math.floor(x / 3);

/* mod x%3

b1 1xxx | ((x2 ^ x1) & (x2 ^ x3))
b2 x111 | (~x2 & (x1 ^ x3))

1000 10
0101 10
0010 10

0111 01
0100 01
0001 01

0110 00
0011 00
0000 00
*/

const mod3 = test ? (x) => {
	const x1 = x & 0x1;
	const x2 = (x >> 1) & 0x1;
	const x3 = x >> 2;

	const b1 = (x >> 3) | ((x1 ^ x2) & (x2 ^ x3));
	const b2 = ~x2 & (x1 ^ x3);
	return (b1 << 1) | (b2 | (x1 & x2 & x3));
} : x => x % 3;
// for (let i = 0; i < 9; i++) console.log(mod3(i), floor3(i));

const rowForIndex = (x) => {
	return Math.floor(x / 9);
}
const colForIndex = (x) => {
	return x % 9;
}
const boxForIndex = (x) => {
	return Math.floor(x / 27) * 3 + floor3(x % 9);
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

const candidates = (grid, markers) => {
	for (let i = 0; i < 81; i++) {
		if (grid[i] === 0) {
			const marker = markers[i];
			if (marker) {
				for (let i = 0; i < 9; i++) {
					if (marker[i] !== false) marker[i] = true;
				}
			} else {
				markers[i] = [true, true, true, true, true, true, true, true, true];
			}
		}
	}
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			const symbol = grid.getSymbol(r, c);
			if (symbol > 0) continue;

			const index = r * 9 + c;
			const marker = markers[index];
			if (!marker) {
				continue;
			}

			for (let i = 0; i < 9; i++) {
				const rsymbol = grid.getSymbol(r, i);
				const csymbol = grid.getSymbol(i, c);

				const rbase = floor3(r) * 3;
				const cbase = floor3(c) * 3;
				const bsymbol = grid.getSymbol(rbase + floor3(i), cbase + mod3(i));

				if (rsymbol > 0) marker[rsymbol - 1] = false;
				if (csymbol > 0) marker[csymbol - 1] = false;
				if (bsymbol > 0) marker[bsymbol - 1] = false;
			}
		}
	}
}

const missingCells = (grid, markers) => {
	for (let i = 0; i < 81; i++) {
		if (grid[i] === 0) {
			let symbol = -1;
			const marker = markers[i];
			if (!marker) continue;

			for (let j = 0; j < 9; j++) {
				if (marker[j]) {
					if (symbol === -1) {
						symbol = j;
					} else {
						symbol = -1;
						break;
					}
				}
			}
			if (symbol >= 0) {
				delete markers[i];
				grid[i] = symbol + 1;
				return true;
			}
		}
	}
	return false;
}

class GridGroup {
	static rowForIndex = rowForIndex;
	static colForIndex = colForIndex;
	static boxForIndex = boxForIndex;

	static rowIndex(x, i) {
		return x * 9 + i;
	}
	static colIndex(x, i) {
		return i * 9 + x;
	}
	static boxIndex(x, i) {
		const row = floor3(x) * 3 + floor3(i);
		const col = mod3(x) * 3 + mod3(i);
		return row * 9 + col;
	}

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

const TypeRow = "ROW";
const TypeCol = "COL";
const TypeBox = "BOX";
class Type {
	constructor(type) {
		switch (type) {
			case TypeRow:
				this.group = 'getRow';
				this.index = 'rowIndex';
				break;
			case TypeCol:
				this.group = 'getCol';
				this.index = 'colIndex';
				break;
			case TypeBox:
				this.group = 'getBox';
				this.index = 'boxIndex';
				break;
		}
		this.type = type;
	}
}
const groupTypes = [new Type(TypeRow), new Type(TypeCol), new Type(TypeBox)];

const nakedCells = (grid, markers) => {
	const markerGroup = new GridGroup(markers);

	for (const groupType of groupTypes) {
		const getGroup = groupType.group;
		const groupIndex = groupType.index;

		for (let i = 0; i < 9; i++) {
			for (let x = 0; x < 9; x++) {
				let symbol = -1;
				for (let y = 0; y < 9; y++) {
					const marker = markerGroup[getGroup](x, y);
					if (marker && marker[i]) {
						if (symbol === -1) symbol = y;
						else {
							symbol = -1;
							break;
						}
					}
				}
				if (symbol !== -1) {
					const index = GridGroup[groupIndex](x, symbol);
					grid[index] = i + 1;
					delete markers[index];
					return true;
				}
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

const hiddenCells = (markers) => { // single double any
	const markerGroup = new GridGroup(markers);
	const union = new Set();

	for (const groupType of groupTypes) {
		const getGroup = groupType.group;
		for (let x = 0; x < 9; x++) {
			const sets = [];
			for (let y = 0; y < 9; y++) {
				const marker = markerGroup[getGroup](x, y);
				if (!marker) continue;

				const set = new Set();
				for (let i = 0; i < 9; i++) {
					const symbol = marker[i];
					if (symbol) set.add(i);
				}
				if (set.size > 0) sets.push(new SetUnit(y, set));
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
							const marker = markerGroup[getGroup](x, set.index);
							if (!marker) continue;

							for (const symbol of union) {
								if (marker[symbol]) {
									marker[symbol] = false;
									reduced = true;
								}
							}
						}
						// console.log("Found Group " + getGroup);
					}
					if (reduced) return true;
				}
			}
		}
	}

	return false;
}

const pairGroups = (markers) => {
	const markerGroup = new GridGroup(markers);

	for (let i = 0; i < 9; i++) {
		for (const groupType of groupTypes) {
			const getGroup = groupType.group;
			const groupIndex = groupType.index;

			for (let x = 0; x < 9; x++) {
				let y1 = -1;
				let y2 = -1;

				for (let y = 0; y < 9; y++) {
					const marker = markerGroup[getGroup](x, y);
					if (!marker) continue;

					const symbol = marker[i];
					if (!symbol) continue;

					if (y1 === -1) y1 = y;
					else if (y2 === -1) y2 = y;
					else { y2 = -1; break; }
				}

				if (y2 >= 0) {
					const index1 = GridGroup[groupIndex](x, y1);
					const index2 = GridGroup[groupIndex](x, y2);

					let reduced = false;
					const reduce = (fromType, toType) => {
						const fromForIndex = (fromType === TypeRow) ? 'rowForIndex' : ((fromType === TypeCol) ? 'colForIndex' : 'boxForIndex');

						let hit = false;
						const typeIndex1 = GridGroup[fromForIndex](index1);
						const typeIndex2 = GridGroup[fromForIndex](index2);
						if (typeIndex1 === typeIndex2) {
							for (let j = 0; j < 9; j++) {
								if (groupType.type === TypeRow && mod3(typeIndex1) === floor3(j)) continue;
								if (groupType.type === TypeCol && floor3(typeIndex1) === floor3(j)) continue;
								const outer = markerGroup[getGroup](x, j);
								if (!outer) continue;
								const symbol = outer[i];
								if (symbol) {
									outer[i] = false;
									hit = true;
									console.log(getGroup);
								}
							}
						}
						return hit;
					}

					if (groupType.type === TypeBox) {
						const colIndex1 = colForIndex(index1);
						const colIndex2 = colForIndex(index2);
						if (colIndex1 === colIndex2) {
							for (let j = 0; j < 9; j++) {
								if (floor3(x) === floor3(j)) continue;
								const outer = markerGroup.getCol(colIndex1, j);
								if (!outer) continue;
								const symbol = outer[i];
								if (symbol) {
									outer[i] = false;
									reduced = true;
								}
							}
						}

						const rowIndex1 = rowForIndex(index1);
						const rowIndex2 = rowForIndex(index2);
						if (rowIndex1 === rowIndex2) {
							for (let j = 0; j < 9; j++) {
								if (mod3(x) === floor3(j)) continue;
								const outer = markerGroup.getRow(rowIndex1, j);
								if (!outer) continue;
								const symbol = outer[i];
								if (symbol) {
									outer[i] = false;
									reduced = true;
								}
							}
							if (reduced) return true;
						}
					} else {
						reduced = reduce(TypeBox);
					}

					if (reduced) return true;
				}

			}
		}
	}

	return false;
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

	const groupTypes = [groupTypeRow, groupTypeCol];
	const groupType = groupTypeRow;
	const getGroup = groupType.group;
	const compareGroup = (groupType.type === TypeRow) ? groupTypeCol.group : groupTypeRow.group;
	for (let i = 0; i < 9; i++) {
		const pairs = [];
		for (let x = 0; x < 9; x++) {
			let y1 = -1;
			let y2 = -1;
			for (let y = 0; y < 9; y++) {
				const marker = markerGroup[getGroup](x, y);
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

						const marker1 = markerGroup[compareGroup](pair1.i1, x);
						if (marker1) {
							const symbol = marker1[i];
							if (symbol) {
								marker1[i] = false;
								reduced = true;
								console.log("X-Wing");
							}
						}

						const marker2 = markerGroup[compareGroup](pair1.i2, x);
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

						let hit = -1;
						for (const s of hits) {
							hit = s;
						}

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
				if (row1 === row2 || col1 === col2 || box1 === box2) {
					if (row2 === row3 || col2 === col3 || box2 === box3) {
						const hits = new Set();
						hits.add(pair1.s1);
						hits.add(pair1.s2);
						hits.add(pair3.s1);
						hits.add(pair3.s2);

						hits.delete(pair2.s1);
						hits.delete(pair2.s2);

						let hit = -1;
						for (const s of hits) {
							hit = s;
						}

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
				if (row1 === row3 || col1 === col3 || box1 === box3) {
					if (row2 === row3 || col2 === col3 || box2 === box3) {
						const hits = new Set();
						hits.add(pair1.s1);
						hits.add(pair1.s2);
						hits.add(pair2.s1);
						hits.add(pair2.s2);

						hits.delete(pair3.s1);
						hits.delete(pair3.s2);

						let hit = -1;
						for (const s of hits) {
							hit = s;
						}

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
				// console.log(reduced);
				if (reduced) return reduced;

				union.clear();
			}
		}
	}
	return false;
}

export { candidates, missingCells, nakedCells, hiddenCells, pairGroups, xWing, xyWing };