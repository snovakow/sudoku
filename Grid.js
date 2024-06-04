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

		for (let r = 0; r < 8; r++) {
			const add = [true, true, true, true, true, true, true, true, true];

			const compressForSymbol = (symbol) => {
				let index = 0;
				for (let i = 0; i < 9; i++) {
					if (symbol === i) {
						add[symbol] = false;
						return index;
					}
					if (add[symbol]) index++;
				}
			};

			let index = 0;

			const symbol1 = this[r * 9 + index] - 1; // 9 0x1000
			const slot1_4bit = compressForSymbol(symbol1);
			let byte0 = slot1_4bit << 4; // 1-4

			index++;

			const symbol2 = this[r * 9 + index] - 1; // 8 0x111
			const slot2_3bit = compressForSymbol(symbol2);
			byte0 |= slot2_3bit << 1; // 5-7

			index++;

			const symbol3 = this[r * 9 + index] - 1; // 7 0x110
			const slot3_3bit = compressForSymbol(symbol3);
			byte0 |= slot3_3bit >> 2; // 8-8
			let byte1 = (slot3_3bit & 0x03) << 6; // 1-2

			index++;

			const symbol4 = this[r * 9 + index] - 1; // 6 0x101
			const slot4_3bit = compressForSymbol(symbol4);
			byte1 |= slot4_3bit << 0x03; // 3-5

			index++;

			const symbol5 = this[r * 9 + index] - 1; // 5 0x100
			const slot5_3bit = compressForSymbol(symbol5);
			byte1 |= slot5_3bit; // 6-8

			index++;

			const symbol6 = this[r * 9 + index] - 1; // 4 0x11
			const slot6_2bit = compressForSymbol(symbol6);
			let byte2 = slot6_2bit << 6; // 1-2

			index++;

			const symbol7 = this[r * 9 + index] - 1; // 3 0x10
			const slot7_2bit = compressForSymbol(symbol7);
			byte2 |= slot7_2bit << 4; // 3-4

			index++;

			const symbol8 = this[r * 9 + index] - 1; // 2 0x1
			const slot8_1bit = compressForSymbol(symbol8);
			byte2 |= slot8_1bit << 3; // 5

			index++;

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

		pointer = 0;
		for (let r = 0; r < 8; r++) {
			const add = [true, true, true, true, true, true, true, true, true];

			const symbolForCompress = (index) => {
				let skips = 0;
				for (let i = 0; i < 9; i++) {
					if (add[i]) {
						if (index + skips === i) {
							add[i] = false;
							return i;
						}
					} else {
						skips++;
					}
				}
				return skips;
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

			const slot1_4bit = byte0 >> 4;
			const symbol1 = symbolForCompress(slot1_4bit);
			// const symbol1 = this[r * 9 + index] - 1; // 9 0x1000
			// const slot1_4bit = compressForSymbol(symbol1);
			// let byte0 = slot1_4bit << 4; // 1-4

			const slot2_3bit = (byte0 >> 1) & 0x07;
			const symbol2 = symbolForCompress(slot2_3bit);
			// const symbol2 = this[r * 9 + index] - 1; // 8 0x111
			// const slot2_3bit = compressForSymbol(symbol2);
			// byte0 |= (slot2_3bit << 1); // 5-7

			const slot3_3bit = ((byte0 & 0x01) << 2) | (byte1 >> 6);
			const symbol3 = symbolForCompress(slot3_3bit);
			// const symbol3 = this[r * 9 + index] - 1; // 7 0x110
			// const slot3_3bit = compressForSymbol(symbol3);
			// byte0 |= (slot3_3bit >> 2); // 8-8
			// let byte1 = ((slot3_3bit & 0x3) << 6); // 1-2

			const slot4_3bit = (byte1 >> 3) & 0x07;
			const symbol4 = symbolForCompress(slot4_3bit);
			// const symbol4 = this[r * 9 + index] - 1; // 6 0x101
			// const slot4_3bit = compressForSymbol(symbol4);
			// byte1 |= ((slot4_3bit & 0x3) << 3); // 3-5

			const slot5_3bit = byte1 & 0x07;
			const symbol5 = symbolForCompress(slot5_3bit);
			// const symbol5 = this[r * 9 + index] - 1; // 5 0x100
			// const slot5_3bit = compressForSymbol(symbol5);
			// byte1 |= slot5_3bit; // 6-8

			const slot6_2bit = byte2 >> 6;
			const symbol6 = symbolForCompress(slot6_2bit);
			// const symbol6 = this[r * 9 + index] - 1; // 4 0x11
			// const slot6_2bit = compressForSymbol(symbol6);
			// let byte2 = (slot6_2bit << 6); // 1-2

			const slot7_2bit = (byte2 >> 4) & 0x03;
			const symbol7 = symbolForCompress(slot7_2bit);
			// const symbol7 = this[r * 9 + index] - 1; // 3 0x10
			// const slot7_2bit = compressForSymbol(symbol7);
			// byte2 |= (slot7_2bit << 4); // 3-4

			const slot8_1bit = (byte2 >> 3) & 0x01;
			const symbol8 = symbolForCompress(slot8_1bit);
			// const symbol8 = this[r * 9 + index] - 1; // 2 0x1
			// const slot8_1bit = compressForSymbol(symbol8);
			// byte2 |= (slot8_1bit << 3); // 5

			console.log(symbol1, symbol2, symbol3, symbol4, symbol5, symbol6, symbol7, symbol8);
		}
	}
}

const g = new Grid();
for (const i in g) {
	g[i] = (i % 9) + 1;
}
const compressed = g.compress();
g.decompress(compressed);

export { Grid };
