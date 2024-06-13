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

const indices = Uint8Array.of(
	0, 1, 2, 3, 4, 5, 6, 7, 8,
	9, 10, 11, 12, 13, 14, 15, 16, 17,
	18, 19, 20, 21, 22, 23, 24, 25, 26,
	27, 28, 29, 30, 31, 32, 33, 34, 35,
	36, 37, 38, 39, 40, 41, 42, 43, 44,
	45, 46, 47, 48, 49, 50, 51, 52, 53,
	54, 55, 56, 57, 58, 59, 60, 61, 62,
	63, 64, 65, 66, 67, 68, 69, 70, 71,
	72, 73, 74, 75, 76, 77, 78, 79, 80
);

const row1 = Uint8Array.of(0, 1, 2, 3, 4, 5, 6, 7, 8);
const row2 = Uint8Array.of(9, 10, 11, 12, 13, 14, 15, 16, 17);
const row3 = Uint8Array.of(18, 19, 20, 21, 22, 23, 24, 25, 26);
const row4 = Uint8Array.of(27, 28, 29, 30, 31, 32, 33, 34, 35);
const row5 = Uint8Array.of(36, 37, 38, 39, 40, 41, 42, 43, 44);
const row6 = Uint8Array.of(45, 46, 47, 48, 49, 50, 51, 52, 53);
const row7 = Uint8Array.of(54, 55, 56, 57, 58, 59, 60, 61, 62);
const row8 = Uint8Array.of(63, 64, 65, 66, 67, 68, 69, 70, 71);
const row9 = Uint8Array.of(72, 73, 74, 75, 76, 77, 78, 79, 80);

const col1 = Uint8Array.of(0, 9, 18, 27, 36, 45, 54, 63, 72);
const col2 = Uint8Array.of(1, 10, 19, 28, 37, 46, 55, 64, 73);
const col3 = Uint8Array.of(2, 11, 20, 29, 38, 47, 56, 65, 74);
const col4 = Uint8Array.of(3, 12, 21, 30, 39, 48, 57, 66, 75);
const col5 = Uint8Array.of(4, 13, 22, 31, 40, 49, 58, 67, 76);
const col6 = Uint8Array.of(5, 14, 23, 32, 41, 50, 59, 68, 77);
const col7 = Uint8Array.of(6, 15, 24, 33, 42, 51, 60, 69, 78);
const col8 = Uint8Array.of(7, 16, 25, 34, 43, 52, 61, 70, 79);
const col9 = Uint8Array.of(8, 17, 26, 35, 44, 53, 62, 71, 80);

const box1 = Uint8Array.of(0, 1, 2, 9, 10, 11, 18, 19, 20);
const box2 = Uint8Array.of(3, 4, 5, 12, 13, 14, 21, 22, 23);
const box3 = Uint8Array.of(6, 7, 8, 15, 16, 17, 24, 25, 26);
const box4 = Uint8Array.of(27, 28, 29, 36, 37, 38, 45, 45, 47);
const box5 = Uint8Array.of(30, 31, 32, 39, 40, 41, 48, 49, 50);
const box6 = Uint8Array.of(33, 34, 35, 42, 43, 44, 51, 52, 53);
const box7 = Uint8Array.of(54, 55, 56, 63, 64, 65, 72, 73, 74);
const box8 = Uint8Array.of(57, 58, 59, 66, 67, 68, 75, 76, 77);
const box9 = Uint8Array.of(60, 61, 62, 69, 70, 71, 78, 79, 80);

const rows = [row1, row2, row3, row4, row5, row6, row7, row8, row9];
const cols = [col1, col2, col3, col4, col5, col6, col7, col8, col9];
const boxs = [box1, box2, box3, box4, box5, box6, box7, box8, box9];

class Cell {
	constructor(index, row, col, box) {
		this.symbol = 0xff; // Int8: -1 or 0-9
		this.markers = 0x01ff; // Uint16: 9 bit penic mark mask

		this.index = index;

		this.row = Math.floor(index / 9);
		this.col = index % 9;
		this.box = Math.floor(this.row / 3) * 3 + Math.floor(this.col / 3);

		const set = new Set();
		for (const i of rows[this.row]) set.add(i);
		for (const i of cols[this.col]) set.add(i);
		for (const i of boxs[this.box]) set.add(i);
		set.delete(index);

		this.groupSet = set;
		this.groups = [];

		Object.freeze(this.index);
		Object.freeze(this.row);
		Object.freeze(this.col);
		Object.freeze(this.box);
		Object.freeze(this.groupSet);
	}
}

export class Sudoku {
	constructor() {
		this.cells = [];
		for (const index of indices) {
			this.cells[index] = new Cell(index);
		}
		for (const cell of this.cells) {
			for (const index of cell.groupSet) {
				cell.groups.push(this.cells[index]);
			}
			Object.freeze(cell.groups);
		}
	}
	fromOld(grid, markers) {
		for (const cell of this.cells) {
			const symbol = grid[cell.index];
			let marker = markers[cell.index];
			if (symbol === 0) {
				// cell.symbol = 0xff;
				// if (!marker) {
				// 	cell.markers = 0x01ff;
				// 	marker = [true, true, true, true, true, true, true, true, true];
				// 	markers[cell.index] = marker;
				// }	
			} else {
				cell.symbol = symbol - 1;
				cell.markers = 0x0000;
			}
		}
	}
	toOld(grid, markers) {
		for (const cell of this.cells) {
			grid[cell.index] = (cell.symbol === 0xff) ? 0 : cell.symbol + 1;

			if (cell.symbol === 0xff) {
				// 	if (markers[cell.index]) {
				markers[cell.index] = [
					cell.markers & 0x0001 ? true : false,
					(cell.markers >> 1) & 0x0001 ? true : false,
					(cell.markers >> 2) & 0x0001 ? true : false,
					(cell.markers >> 3) & 0x0001 ? true : false,
					(cell.markers >> 4) & 0x0001 ? true : false,
					(cell.markers >> 5) & 0x0001 ? true : false,
					(cell.markers >> 6) & 0x0001 ? true : false,
					(cell.markers >> 7) & 0x0001 ? true : false,
					cell.markers >> 8 ? true : false
				];
				// }
			}
		}
	}
	setPencilMarks() {
		for (const cell of this.cells) {
			const symbol = cell.symbol;
			if (symbol !== 0xff) continue;
			for (const compare of cell.groups) {
				if (compare.symbol !== 0xff) cell.markers &= ~(0x0001 << compare.symbol);
			}
		}
	}
	solveOpenSingles() {

	}
}
const sudoku = new Sudoku();

export const candidates = (grid, markers) => {
	sudoku.fromOld(grid, markers);
	sudoku.setPencilMarks();
	sudoku.toOld(grid, markers);
}

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
	compress() {
		let pointer = 0;
		const bits = new Uint8Array(168);

		const add = [false, false, false, false, false, false, false, false, false];

		const compressForSymbol = (symbol) => {
			symbol--;
			let reduced = symbol;
			for (let i = 0; i < symbol; i++) {
				if (add[i]) reduced--;
			}
			add[symbol] = true;
			return reduced;
		};

		for (let r = 0; r < 8; r++) {
			for (const x in add) add[x] = false;

			let index = r * 9;

			const slot1_4bit = compressForSymbol(this[index++]);
			let byte0 = slot1_4bit << 4; // 1-4

			const slot2_3bit = compressForSymbol(this[index++]);
			byte0 |= slot2_3bit << 1; // 5-7

			const slot3_3bit = compressForSymbol(this[index++]);
			byte0 |= slot3_3bit >> 2; // 8-8
			let byte1 = (slot3_3bit & 0x03) << 6; // 1-2

			const slot4_3bit = compressForSymbol(this[index++]);
			byte1 |= slot4_3bit << 0x03; // 3-5

			const slot5_3bit = compressForSymbol(this[index++]);
			byte1 |= slot5_3bit; // 6-8

			const slot6_2bit = compressForSymbol(this[index++]);
			let byte2 = slot6_2bit << 6; // 1-2

			const slot7_2bit = compressForSymbol(this[index++]);
			byte2 |= slot7_2bit << 4; // 3-4

			const slot8_1bit = compressForSymbol(this[index]); // don't need last increment
			byte2 |= slot8_1bit << 3; // 5

			bits[pointer] = (byte0 & 0x80) >> 7;
			bits[pointer + 1] = (byte0 & 0x40) >> 6;
			bits[pointer + 2] = (byte0 & 0x20) >> 5;
			bits[pointer + 3] = (byte0 & 0x10) >> 4;
			bits[pointer + 4] = (byte0 & 0x08) >> 3;
			bits[pointer + 5] = (byte0 & 0x04) >> 2;
			bits[pointer + 6] = (byte0 & 0x02) >> 1;
			bits[pointer + 7] = byte0 & 0x01;

			pointer += 8;

			bits[pointer] = (byte1 & 0x80) >> 7;
			bits[pointer + 1] = (byte1 & 0x40) >> 6;
			bits[pointer + 2] = (byte1 & 0x20) >> 5;
			bits[pointer + 3] = (byte1 & 0x10) >> 4;
			bits[pointer + 4] = (byte1 & 0x08) >> 3;
			bits[pointer + 5] = (byte1 & 0x04) >> 2;
			bits[pointer + 6] = (byte1 & 0x02) >> 1;
			bits[pointer + 7] = byte1 & 0x01;

			pointer += 8;

			bits[pointer] = (byte2 & 0x80) >> 7;
			bits[pointer + 1] = (byte2 & 0x40) >> 6;
			bits[pointer + 2] = (byte2 & 0x20) >> 5;
			bits[pointer + 3] = (byte2 & 0x10) >> 4;
			bits[pointer + 4] = (byte2 & 0x08) >> 3;

			pointer += 5;
		}

		pointer = 0;
		const compressed = new Uint8Array(21);
		for (let i = 0; i < 21; i++) {
			let byte = bits[pointer] << 7;
			byte |= bits[pointer + 1] << 6;
			byte |= bits[pointer + 2] << 5;
			byte |= bits[pointer + 3] << 4;
			byte |= bits[pointer + 4] << 3;
			byte |= bits[pointer + 5] << 2;
			byte |= bits[pointer + 6] << 1;
			byte |= bits[pointer + 7];

			compressed[i] = byte;

			pointer += 8;
		}

		return compressed;
	}
	decompress(compressed) {
		const bytes = compressed;

		const bits = new Uint8Array(168);

		let pointer = 0;
		for (let i = 0; i < 21; i++) {
			const byte = bytes[i];

			bits[pointer] = (byte & 0x80) >> 7;
			bits[pointer + 1] = (byte & 0x40) >> 6;
			bits[pointer + 2] = (byte & 0x20) >> 5;
			bits[pointer + 3] = (byte & 0x10) >> 4;
			bits[pointer + 4] = (byte & 0x08) >> 3;
			bits[pointer + 5] = (byte & 0x04) >> 2;
			bits[pointer + 6] = (byte & 0x02) >> 1;
			bits[pointer + 7] = byte & 0x01;

			pointer += 8;
		}

		const rows = [];

		pointer = 0;
		for (let r = 0; r < 8; r++) {
			const add = [false, false, false, false, false, false, false, false, false];

			const symbolForCompress = (index) => {
				for (let i = 0; i <= index; i++) {
					if (add[i]) index++;
				}
				add[index] = true;
				return index;
			};

			let byte0 = bits[pointer] << 7;
			byte0 |= bits[pointer + 1] << 6;
			byte0 |= bits[pointer + 2] << 5;
			byte0 |= bits[pointer + 3] << 4;
			byte0 |= bits[pointer + 4] << 3;
			byte0 |= bits[pointer + 5] << 2;
			byte0 |= bits[pointer + 6] << 1;
			byte0 |= bits[pointer + 7];

			pointer += 8;

			let byte1 = bits[pointer] << 7;
			byte1 |= bits[pointer + 1] << 6;
			byte1 |= bits[pointer + 2] << 5;
			byte1 |= bits[pointer + 3] << 4;
			byte1 |= bits[pointer + 4] << 3;
			byte1 |= bits[pointer + 5] << 2;
			byte1 |= bits[pointer + 6] << 1;
			byte1 |= bits[pointer + 7];

			pointer += 8;

			let byte2 = bits[pointer] << 7;
			byte2 |= bits[pointer + 1] << 6;
			byte2 |= bits[pointer + 2] << 5;
			byte2 |= bits[pointer + 3] << 4;
			byte2 |= bits[pointer + 4] << 3;

			pointer += 5;

			const symbols = [];

			symbols[0] = symbolForCompress(byte0 >> 4);
			symbols[1] = symbolForCompress((byte0 >> 1) & 0x07);
			symbols[2] = symbolForCompress(((byte0 & 0x01) << 2) | (byte1 >> 6));
			symbols[3] = symbolForCompress((byte1 >> 3) & 0x07);
			symbols[4] = symbolForCompress(byte1 & 0x07);
			symbols[5] = symbolForCompress(byte2 >> 6);
			symbols[6] = symbolForCompress((byte2 >> 4) & 0x03);
			symbols[7] = symbolForCompress((byte2 >> 3) & 0x01);

			const missing = [true, true, true, true, true, true, true, true, true];
			for (const symbol of symbols) {
				missing[symbol] = false;
			}
			for (let i = 0; i < 9; i++) {
				if (missing[i]) {
					symbols[8] = i;
					break;
				}
			}
			rows.push(symbols);
		}
		const row = [];
		for (let c = 0; c < 9; c++) {
			const missing = [true, true, true, true, true, true, true, true, true];
			for (let r = 0; r < 8; r++) {
				const symbol = rows[r][c];
				missing[symbol] = false;
			}
			for (let i = 0; i < 9; i++) {
				if (missing[i]) {
					row[c] = i;
					break;
				}
			}
		}
		rows[8] = row;
		console.log(rows);
	}
}

const g = new Grid();
// for (const i in g) {
// 	g[i] = 1 + (8 - (i % 9));
// }
// const compressed = g.compress();
// g.decompress(compressed);

// for (const i in g) {
// 	g[i] = (i % 9) + 1;
// }
// let start = 0;
// for (let x = 0; x < 9; x++) {
// 	for (let y = 0; y < 9; y++) {
// 		g[x * 9 + y] = 1 + ((start + y) % 9);
// 	}
// 	start++;
// }
// const compressed = g.compress();
// g.decompress(compressed);

export { Grid };
