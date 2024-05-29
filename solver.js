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
			let symbol = 0;
			const marker = markers[i];
			if (!marker) continue;

			for (let j = 0; j < 9; j++) {
				if (marker[j]) {
					if (symbol === 0) {
						symbol = j + 1;
					} else {
						symbol = -1;
						break;
					}
				}
			}
			if (symbol > 0) {
				delete markers[i];
				grid[i] = symbol;
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

const fillGroups = (grid, markers) => {
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

export { fillMarkers, fillSingles, fillMissingSingles };