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

const fillMissingSingles = (grid, markers) => {
	for (let i = 0; i < 9; i++) {
		for (let r = 0; r < 9; r++) {
			let indexCol = -1;
			for (let c = 0; c < 9; c++) {
				const markerCol = markers[r * 9 + c];
				if (markerCol && markerCol[i]) {
					if (indexCol === -1) indexCol = c;
					else {
						indexCol = -1;
						break;
					}
				}
			}
			if (indexCol !== -1) {
				grid[r * 9 + indexCol] = i + 1;
				delete markers[r * 9 + indexCol];
				return true;
			}
		}

		for (let c = 0; c < 9; c++) {
			let indexRow = -1;
			for (let r = 0; r < 9; r++) {
				const markerRow = markers[r * 9 + c];
				if (markerRow && markerRow[i]) {
					if (indexRow === -1) indexRow = r;
					else {
						indexRow = -1;
						break;
					}
				}
			}
			if (indexRow !== -1) {
				grid[indexRow * 9 + c] = i + 1;
				delete markers[indexRow * 9 + c];
				return true;
			}
		}

		for (let j = 0; j < 9; j++) {
			const brow = Math.floor(j / 3) * 3;
			const bcol = (j % 3) * 3;
			let indexRow = -1;
			let indexCol = -1;
			for (let b = 0; b < 9; b++) {
				const r = brow + Math.floor(b / 3);
				const c = bcol + b % 3;
				const markerBox = markers[r * 9 + c];
				if (markerBox && markerBox[i]) {
					if (indexRow === -1) {
						indexRow = r;
						indexCol = c;
					} else {
						indexRow = -1;
						break;
					}
				}
			}
			if (indexRow !== -1) {
				const index = indexRow * 9 + indexCol;

				grid[index] = i + 1;
				delete markers[index];
				return true;
			}
		}

	}
	return false;
}

class GridGroup {
	constructor(group) {
		this.group = group;
	}
	getRow(x, i) {
		return this.group[x * 9 + i];
	}
	getCol(x, i) {
		return this.group[i * 9 + x];
	}
	getBox(x, i) {
		const row = Math.floor(x / 3) * 3 + Math.floor(i / 3);
		const col = (x % 3) * 3 + (i % 3);
		return this.group[row * 9 + col];
	}
}
class SetUnit {
	constructor(index, set) {
		this.index = index;
		this.set = set;
	}
}

const fillGroups = (grid, markers) => {
	const markerGroup = new GridGroup(markers);
	const union = new Set();

	for (let r = 0; r < 9; r++) {
		const sets = [];
		for (let c = 0; c < 9; c++) {
			const marker = markerGroup.getRow(r, c);
			if (!marker) continue;

			const set = new Set();
			for (let i = 0; i < 9; i++) {
				const symbol = marker[i];
				if (symbol) set.add(i);
			}
			if (set.size > 0) sets.push(new SetUnit(c, set));
		}
		const len = sets.length;
		for (let i = 0; i < len - 1; i++) {
			const remainder = len - i - 1;
			const setUnit = sets[i];

			const endLen = (0x1 << remainder) - 1;
			for (let inc = 1; inc <= endLen; inc++) {
				union.clear();
				for (const x of setUnit.set) union.add(x);	
				let unionCount = 1;
	
				let mask = 0x1;
				for (let j = 0; j < remainder; j++) {
					const state = inc & mask;
					if (state > 0) {
						const compare = sets[i + 1 + j];
						for (const x of compare.set) union.add(x);
						unionCount++;
					}
					mask <<= 1;
				}

				if (unionCount === union.size && unionCount < sets.length) {
					console.log("Found Row ", r, union);
				}	
			}
		}
	}

	// for (let r = 0; r < 9; r++) {
	// 	const sets = [];
	// 	for (let c = 0; c < 9; c++) {
	// 		const marker = markerGroup.getCol(r, c);
	// 		if (!marker) continue;

	// 		const set = new Set();
	// 		for (let i = 0; i < 9; i++) {
	// 			const symbol = marker[i];
	// 			if (symbol) set.add(i);
	// 		}
	// 		if (set.size > 0) sets.push(new SetUnit(r, set));
	// 	}
	// 	const len = sets.length;
	// 	for (let i = 0; i < len - 1; i++) {
	// 		const remainder = len - i - 1;
	// 		const setUnit = sets[i];

	// 		const endLen = (0x1 << remainder) - 1;
	// 		for (let inc = 1; inc <= endLen; inc++) {
	// 			let mask = 0x1;

	// 			union.clear();
	// 			for (const x of setUnit.set) union.add(x);	
	// 			let unionCount = 1;

	// 			for (let j = 0; j < remainder; j++) {
	// 				const state = inc & mask;
	// 				if (state > 0) {
	// 					const compare = sets[i + 1 + j];
	// 					for (const x of compare.set) union.add(x);
	// 					unionCount++;
	// 				}
	// 			}

	// 			if (unionCount === union.size && unionCount < sets.length) {
	// 				console.log("Found Column ", r, union);
	// 			}	
	// 		}
	// 	}
	// }

	// for (let c = 0; c < 9; c++) {
	// 	const sets = [];
	// 	for (let r = 0; r < 9; r++) {
	// 		const marker = markers[r * 9 + c];
	// 		if (!marker) continue;

	// 		const set = new Set();
	// 		for (let i = 0; i < 9; i++) {
	// 			const symbol = marker[i];
	// 			if (symbol) set.add(i);
	// 		}
	// 		if (set.size > 0) sets.push(set);
	// 	}
	// 	const len = sets.length;
	// 	for (let i = 0; i < len; i++) {
	// 		let count = 0;
	// 		const set = sets[i];
	// 		for (let j = i + 1; j < len; j++) {
	// 			const compare = sets[j];
	// 			if (compare.isSubsetOf(set)) {
	// 				count++;
	// 			}
	// 		}
	// 		if (count > 0 && count + 1 === set.size && count + 1 < sets.length) {
	// 			console.log("Found Col", set);
	// 		}
	// 	}
	// }

	for (let b = 0; b < 9; b++) {
		const sets = [];
		for (let i = 0; i < 9; i++) {
			// const marker = markers[r * 9 + c];
			// if (!marker) continue;

			// const set = new Set();
			// for (let i = 0; i < 9; i++) {
			// 	const symbol = marker[i];
			// 	if (symbol) set.add(i);
			// }
			// if (set.size > 0) sets.push(set);
		}
		// const len = sets.length;
		// for (let i = 0; i < len; i++) {
		// 	let count = 0;
		// 	const set = sets[i];
		// 	for (let j = i + 1; j < len; j++) {
		// 		const compare = sets[j];
		// 		if (compare.isSubsetOf(set)) {
		// 			count++;
		// 		}
		// 	}
		// 	if (count > 0 && count + 1 === set.size && count + 1 < sets.length) {
		// 		console.log("Found Row ", set);

		// 		for (let j = 0; j < len; j++) {
		// 			if(j===i) continue;

		// 			const compare = sets[j];
		// 			if (!compare.isSubsetOf(set)) {

		// 			}
		// 		}	
		// 	}
		// }
	}

	return false;
}

export { fillMarkers, fillSingles, fillMissingSingles, fillGroups };