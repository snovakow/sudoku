const fillMarkers = (grid, markers) => {
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

				const rbase = Math.floor(r / 3) * 3;
				const cbase = Math.floor(c / 3) * 3;
				const bsymbol = grid.getSymbol(rbase + Math.floor(i / 3), cbase + i % 3);

				if (rsymbol > 0) marker[rsymbol - 1] = false;
				if (csymbol > 0) marker[csymbol - 1] = false;
				if (bsymbol > 0) marker[bsymbol - 1] = false;
			}
		}
	}
}

const fillSingles = (grid, markers) => {
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
	static rowLoc(x, i) {
		return x * 9 + i;
	}
	static colLoc(x, i) {
		return i * 9 + x;
	}
	static boxLoc(x, i) {
		const row = Math.floor(x / 3) * 3 + Math.floor(i / 3);
		const col = (x % 3) * 3 + (i % 3);
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
		const row = Math.floor(x / 3) * 3 + Math.floor(i / 3);
		const col = (x % 3) * 3 + (i % 3);
		return this.group[row * 9 + col];
	}
}

const fillMissingSingles = (grid, markers) => {
	const markerGroup = new GridGroup(markers);

	class Type {
		constructor(group, loc) {
			this.group = group;
			this.loc = loc;
		}
	}
	const groupTypes = [new Type('getRow', 'rowLoc'), new Type('getCol', 'colLoc'), new Type('getBox', 'boxLoc')];

	for (const groupType of groupTypes) {
		const getGroup = groupType.group;
		const getLoc = groupType.loc;

		for (let i = 0; i < 9; i++) {
			for (let x = 0; x < 9; x++) {
				let index = -1;
				for (let y = 0; y < 9; y++) {
					const marker = markerGroup[getGroup](x, y);
					if (marker && marker[i]) {
						if (index === -1) index = y;
						else {
							index = -1;
							break;
						}
					}
				}
				if (index !== -1) {
					const loc = GridGroup[getLoc](x, index);
					grid[loc] = i + 1;
					delete markers[loc];
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

const fillGroups = (markers) => {
	const markerGroup = new GridGroup(markers);
	const union = new Set();

	const groupTypes = ['getRow', 'getCol', 'getBox'];
	for (const getGroup of groupTypes) {
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
	const union = new Set();

	const groupTypes = ['getRow', 'getCol', 'getBox'];
	for (const getGroup of groupTypes) {
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

export { fillMarkers, fillSingles, fillMissingSingles, fillGroups, pairGroups };