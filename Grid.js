const GRID_SIDE = 9;
const GRID_SIZE = 81;

class Grid extends Uint8Array {
	constructor() {
		super(GRID_SIZE);
	}
	getSymbol(r, c) {
		return this[r * GRID_SIDE + c];
	}
	setSymbol(r, c, symbol) {
		this[r * GRID_SIDE + c] = symbol;
	}

	toData() {
		let data = "";
		for (let i = 0; i < GRID_SIZE; i++) data += this[i];
		return data;
	}
	fromData(data) {
		for (let i = 0; i < GRID_SIZE; i++) this[i] = parseInt(data[i]);
	}
}

export { Grid };
