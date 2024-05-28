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
			let indexBox = -1;
			for (let b = 0; b < 9; b++) {
				const r = brow + Math.floor(b / 3);
				const c = bcol + b % 3;
				const markerBox = markers[r * 9 + c];
				if (markerBox && markerBox[i]) {
					if (indexBox === -1) indexBox = r;
					else {
						indexBox = -1;
						break;
					}
				}
			}
			if (indexBox !== -1) {
				const r = brow + Math.floor(indexBox / 3);
				const c = bcol + indexBox % 3;

				grid[r * 9 + c] = i + 1;
				delete markers[r * 9 + c];
				return true;
			}
		}

		return false;
	}
	for (let y = 0; y < 9; y++) {
		for (let i = 0; i < 9; i++) {
			// let indexCol = -1;
			// for (let x = 0; x < 9; x++) {
			// 	const markerRow = markers[y * 9 + x];
			// 	if (markerRow && markerRow[i]) {
			// 		if (indexCol === -1) indexCol = x;
			// 		else {
			// 			indexCol = -1;
			// 			break;
			// 		}
			// 	}
			// }
			// if (indexCol !== -1) {
			// 	grid.setSymbol(y, indexCol, i + 1);
			// 	delete markers[y * 9 + indexCol];
			// }

			// let indexRow = -1;
			// for (let x = 0; x < 9; x++) {
			// 	const markerCol = markers[x * 9 + y];
			// 	if (markerCol && markerCol[i]) {
			// 		if (indexRow === -1) indexRow = y;
			// 		else {
			// 			indexRow = -1;
			// 			break;
			// 		}
			// 	}
			// }
			// if (indexRow !== -1) {
			// 	grid.setSymbol(indexRow, y, i + 1);
			// 	delete markers[indexRow * 9 + y];
			// }

			// let indexBox = -1;
			// for (let x = 0; x < 9; x++) {
			// 	const xbase = Math.floor(x / 3) * 3 + (y % 3) * 3;
			// 	const ybase = Math.floor(y % 3) * 3 + Math.floor(x / 3);
			// 	const markerRow = markers[ybase * 9 + xbase];
			// 	if (markerRow && markerRow[i]) {
			// 		if (indexBox === -1) indexBox = ybase * 9 + xbase;
			// 		else {
			// 			indexBox = -1;
			// 			break;
			// 		}
			// 	}
			// }
			// if (indexBox !== -1) {
			// 	const xbase = Math.floor(y / 3) * 3 + indexBox % 3;
			// 	const ybase = Math.floor(y % 3) * 3 + Math.floor(indexBox / 3);

			// 	// grid[indexBox] = i + 1;
			// 	// delete markers[indexBox];
			// }
		}
	}
}

export { fillMarkers, fillSingles, fillMissingSingles };