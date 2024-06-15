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

				if (y2 === -1) continue;
				const index1 = GridGroup[groupIndex](x, y1);
				const index2 = GridGroup[groupIndex](x, y2);

				let reduced = false;
				const reduce = (x, i, index1, index2, fromType, toType, getGroup) => {
					let compareForIndex = 'boxForIndex';
					if (fromType === TypeBox) {
						compareForIndex = 'boxForIndex';
					}
					if (fromType === TypeRow) {
						compareForIndex = 'rowForIndex';
					}
					if (fromType === TypeCol) {
						compareForIndex = 'colForIndex';
					}

					let hit = false;
					const typeIndex1 = GridGroup[compareForIndex](index1);
					const typeIndex2 = GridGroup[compareForIndex](index2);
					if (typeIndex1 === typeIndex2) {
						for (let j = 0; j < 9; j++) {
							if (fromType === TypeBox) {
								if (toType === TypeRow && mod3(typeIndex1) === floor3(j)) continue;
								if (toType === TypeCol && floor3(typeIndex1) === floor3(j)) continue;
							} else {
								if (toType === TypeRow && mod3(x) === floor3(j)) continue;
								if (toType === TypeCol && floor3(x) === floor3(j)) continue;
							}
							const outer = markerGroup[getGroup](x, j);
							if (!outer) continue;
							const symbol = outer[i];
							if (symbol) {
								outer[i] = false;
								hit = true;
								console.log(fromType, toType);
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
					// reduced = reduce(x, i, index1, index2, TypeRow, TypeRow, getGroup);
					// reduced = reduce(x, i, index1, index2, TypeCol, TypeCol, getGroup);
				} else {
					reduced = reduce(x, i, index1, index2, TypeBox, groupType.type, getGroup);
				}

				// if (groupType.type === TypeBox) {
				// 	const colIndex1 = colForIndex(index1);
				// 	const colIndex2 = colForIndex(index2);
				// 	if (colIndex1 === colIndex2) {
				// 		let reduced = false;

				// 		for (let j = 0; j < 9; j++) {
				// 			if (floor3(x) === floor3(j)) continue;
				// 			const outer = markerGroup.getCol(colIndex1, j);
				// 			if (!outer) continue;
				// 			const symbol = outer[i];
				// 			if (symbol) {
				// 				outer[i] = false;
				// 				reduced = true;
				// 			}
				// 		}
				// 		if (reduced) return true;
				// 	}

				// 	const rowIndex1 = rowForIndex(index1);
				// 	const rowIndex2 = rowForIndex(index2);
				// 	if (rowIndex1 === rowIndex2) {
				// 		let reduced = false;

				// 		for (let j = 0; j < 9; j++) {
				// 			if (mod3(x) === floor3(j)) continue;
				// 			const outer = markerGroup.getRow(rowIndex1, j);
				// 			if (!outer) continue;
				// 			const symbol = outer[i];
				// 			if (symbol) {
				// 				outer[i] = false;
				// 				reduced = true;
				// 			}
				// 		}
				// 		if (reduced) return true;
				// 	}
				// } else {
				// 	const boxIndex1 = boxForIndex(index1);
				// 	const boxIndex2 = boxForIndex(index2);
				// 	if (boxIndex1 === boxIndex2) {
				// 		let reduced = false;

				// 		for (let j = 0; j < 9; j++) {
				// 			if (groupType.type === TypeRow && mod3(boxIndex1) === floor3(j)) continue;
				// 			if (groupType.type === TypeCol && floor3(boxIndex1) === floor3(j)) continue;
				// 			const outer = markerGroup[getGroup](x, j);
				// 			if (!outer) continue;
				// 			const symbol = outer[i];
				// 			if (symbol) {
				// 				outer[i] = false;
				// 				reduced = true;
				// 				console.log(getGroup);
				// 			}
				// 		}
				// 		if (reduced) return true;
				// 	}
				// }

				if (reduced) return true;
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

const indices = new Uint8Array(81);
for (let i = 0; i < 81; i++) indices[i] = i;

const generate = (markers) => {
	if (!markers) {
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
		const marker = markers[index];
		if (!marker) continue;
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
			if (marker[x]) {
				if (found >= 0) {
					for (let y = 0; y < 9; y++) marker[y] = false;
					marker[found] = true;
					return true;
				}
				found = x;
			}
		}
	}
	return false;
}

export { candidates, generate, missingCells, nakedCells, hiddenCells, pairGroups, xWing, xyWing };
