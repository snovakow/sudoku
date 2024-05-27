class Hit {
	constructor(row, col, symbol) {
		this.row = row;
		this.col = col;
		this.symbol = col;
	}
}

const fillBruteForce = (grid) => {
	const hits = [];

	const foundSymbolsRow = [false, false, false, false, false, false, false, false, false];
	const foundSymbolsCol = [false, false, false, false, false, false, false, false, false];
	const foundSymbolsBox = [false, false, false, false, false, false, false, false, false];
	for (let i = 0; i < 9; i++) {
		foundSymbolsRow.fill(false);
		foundSymbolsCol.fill(false);
		foundSymbolsBox.fill(false);

		for (let j = 0; j < 9; j++) {
			const symbolRow = grid.getSymbol(i, j);
			const symbolCol = grid.getSymbol(j, i);
			const symbolBox = grid.getSymbol(Math.floor(i / 3), j % 3);
			if (symbolRow !== 0) foundSymbolsRow[symbol - 1] = true;
			if (symbolCol !== 0) foundSymbolsCol[symbol - 1] = true;
			if (symbolBox !== 0) foundSymbolsBox[symbol - 1] = true;
		}

		let foundIndexRow = -1;
		let foundIndexCol = -1;
		let foundIndexBox = -1;
		for (let j = 0; j < 9; j++) {
			const foundRow = foundSymbolsRow[j];
			const foundCol = foundSymbolsCol[j];
			const foundBox = foundSymbolsBox[j];

			if (!foundRow) {
				if (foundIndexRow === -1) {
					foundIndexRow = j;
				} else {
					foundIndexRow = -2;
				}
			}
			if (!foundCol) {
				if (foundIndexCol === -1) {
					foundIndexCol = j;
				} else {
					foundIndexCol = -2;
				}
			}
			if (!foundBox) {
				if (foundIndexBox === -1) {
					foundIndexBox = j;
				} else {
					foundIndexBox = -2;
				}
			}
		}

		if (foundIndexRow >= 0) hits.push(new Hit(i, foundIndexRow, j + 1));
		if (foundIndexCol >= 0) hits.push(new Hit(foundIndexCol, i, j + 1));
		if (foundIndexBox >= 0) hits.push(new Hit(Math.floor(i / 3), foundIndexBox % 3, j + 1));
	}

	return hits;
}

const fillMarkers = (grid, markers, max = 4) => {
	markers.length = 0;

	for (let i = 0; i < 81; i++) {
		if (grid[i] === 0) {
			markers[i] = [true, true, true, true, true, true, true, true, true];
		}
	}
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			const symbol = grid.getSymbol(r, c);
			if (symbol > 0) continue;

			const index = r * 9 + c;
			let marker = markers[index];
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
			let count = 0;
			for (let i = 0; i < 9; i++) {
				if (marker[i]) count++;
			}
			if (count > max) {
				delete markers[index];
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
			}
		}
	}
}

export { fillMarkers, fillSingles };