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

			const slot1_4bit = compressForSymbol(this[index]);
			let byte0 = slot1_4bit << 4; // 1-4

			index++;

			const slot2_3bit = compressForSymbol(this[index]);
			byte0 |= slot2_3bit << 1; // 5-7

			index++;

			const slot3_3bit = compressForSymbol(this[index]);
			byte0 |= slot3_3bit >> 2; // 8-8
			let byte1 = (slot3_3bit & 0x03) << 6; // 1-2

			index++;

			const slot4_3bit = compressForSymbol(this[index]);
			byte1 |= slot4_3bit << 0x03; // 3-5

			index++;

			const slot5_3bit = compressForSymbol(this[index]);
			byte1 |= slot5_3bit; // 6-8

			index++;

			const slot6_2bit = compressForSymbol(this[index]);
			let byte2 = slot6_2bit << 6; // 1-2

			index++;

			const slot7_2bit = compressForSymbol(this[index]);
			byte2 |= slot7_2bit << 4; // 3-4

			index++;

			const slot8_1bit = compressForSymbol(this[index]);
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
			const slot1_4bit = byte0 >> 4;
			symbols[0] = symbolForCompress(slot1_4bit);
			// const symbol1 = this[r * 9 + index] - 1; // 9 0x1000
			// const slot1_4bit = compressForSymbol(symbol1);
			// let byte0 = slot1_4bit << 4; // 1-4

			const slot2_3bit = (byte0 >> 1) & 0x07;
			symbols[1] = symbolForCompress(slot2_3bit);
			// const symbol2 = this[r * 9 + index] - 1; // 8 0x111
			// const slot2_3bit = compressForSymbol(symbol2);
			// byte0 |= (slot2_3bit << 1); // 5-7

			const slot3_3bit = ((byte0 & 0x01) << 2) | (byte1 >> 6);
			symbols[2] = symbolForCompress(slot3_3bit);
			// const symbol3 = this[r * 9 + index] - 1; // 7 0x110
			// const slot3_3bit = compressForSymbol(symbol3);
			// byte0 |= (slot3_3bit >> 2); // 8-8
			// let byte1 = ((slot3_3bit & 0x3) << 6); // 1-2

			const slot4_3bit = (byte1 >> 3) & 0x07;
			symbols[3] = symbolForCompress(slot4_3bit);
			// const symbol4 = this[r * 9 + index] - 1; // 6 0x101
			// const slot4_3bit = compressForSymbol(symbol4);
			// byte1 |= ((slot4_3bit & 0x3) << 3); // 3-5

			const slot5_3bit = byte1 & 0x07;
			symbols[4] = symbolForCompress(slot5_3bit);
			// const symbol5 = this[r * 9 + index] - 1; // 5 0x100
			// const slot5_3bit = compressForSymbol(symbol5);
			// byte1 |= slot5_3bit; // 6-8

			const slot6_2bit = byte2 >> 6;
			symbols[5] = symbolForCompress(slot6_2bit);
			// const symbol6 = this[r * 9 + index] - 1; // 4 0x11
			// const slot6_2bit = compressForSymbol(symbol6);
			// let byte2 = (slot6_2bit << 6); // 1-2

			const slot7_2bit = (byte2 >> 4) & 0x03;
			symbols[6] = symbolForCompress(slot7_2bit);
			// const symbol7 = this[r * 9 + index] - 1; // 3 0x10
			// const slot7_2bit = compressForSymbol(symbol7);
			// byte2 |= (slot7_2bit << 4); // 3-4

			const slot8_1bit = (byte2 >> 3) & 0x01;
			symbols[7] = symbolForCompress(slot8_1bit);
			// const symbol8 = this[r * 9 + index] - 1; // 2 0x1
			// const slot8_1bit = compressForSymbol(symbol8);
			// byte2 |= (slot8_1bit << 3); // 5

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
let start = 0;
for (let x = 0; x < 9; x++) {
	for (let y = 0; y < 9; y++) {
		g[x * 9 + y] = 1 + ((start + y) % 9);
	}
	start++;
}
const compressed = g.compress();
g.decompress(compressed);

export { Grid };
