import { Grid } from "./Grid.js";
import { pixAlign } from "./picker.js";

export const markers = [];

const canvas = document.createElement('canvas');

const LINE_THICK = 8;
const LINE_THICK_HALF = LINE_THICK * 0.5;
const LINE_THIN = 2;

const FONT = "Hauss,sans-serif";

const BOX_SIDE = 3;
const GRID_SIDE = BOX_SIDE * BOX_SIDE;

class Board {
	constructor() {
		this.canvas = canvas;
		this.grid = new Grid();
		this.startGrid = new Grid();
	}
	setGrid(grid) {
		for (let r = 0; r < 9; r++) {
			const row = grid[r];
			for (let c = 0; c < 9; c++) {
				this.startGrid[r * 9 + c] = row[c];
			}
		}
		this.grid.set(this.startGrid);
	}
	resetGrid() {
		this.grid.set(this.startGrid);
	}
	hitDetect(x, y, sizeTotal) {
		const size = sizeTotal - LINE_THICK;

		const r = Math.floor((y - LINE_THICK_HALF) / size * GRID_SIDE);
		const c = Math.floor((x - LINE_THICK_HALF) / size * GRID_SIDE);
		if (r < 0 || c < 0 || r >= GRID_SIDE || c >= GRID_SIDE) return [-1, -1];
		return [r, c];
	}
	draw(pickerVisible, selectedRow, selectedCol) {
		const ctx = canvas.getContext("2d");

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		// ctx.clearRect(0, 0, canvas.width, canvas.height);

		ctx.strokeStyle = 'black';

		const sizeTotal = canvas.width;
		const size = sizeTotal - LINE_THICK * window.devicePixelRatio;
		const boxSize = size / BOX_SIDE;
		const unitSize = size / GRID_SIDE;

		if (pickerVisible) {
			ctx.fillStyle = 'cyan';
			ctx.fillRect(pixAlign(size * selectedCol / 9) + 1 * window.devicePixelRatio, pixAlign(size * selectedRow / 9) + 1 * window.devicePixelRatio, pixAlign(unitSize), pixAlign(unitSize));
		}

		ctx.beginPath();
		ctx.lineWidth = LINE_THICK * window.devicePixelRatio;
		let base;
		base = LINE_THICK_HALF * window.devicePixelRatio;
		for (let i = 0; i <= BOX_SIDE; i++, base += boxSize) {
			const pix = pixAlign(base);

			ctx.moveTo(pix, 0);
			ctx.lineTo(pix, sizeTotal);

			ctx.moveTo(0, pix);
			ctx.lineTo(sizeTotal, pix);
		}
		ctx.stroke();

		ctx.beginPath();
		ctx.lineWidth = LINE_THIN * window.devicePixelRatio;
		base = LINE_THICK_HALF * window.devicePixelRatio + unitSize;
		const nextBox = unitSize * 2;
		for (let i = 0; i < BOX_SIDE; i++, base += nextBox) {
			const off = 0.5;
			let pix = Math.round(base) + off;
			ctx.moveTo(pix, 0);
			ctx.lineTo(pix, sizeTotal);

			ctx.moveTo(0, pix);
			ctx.lineTo(sizeTotal, pix);

			base += unitSize;
			pix = Math.floor(base) + off;

			ctx.moveTo(pix, 0);
			ctx.lineTo(pix, sizeTotal);

			ctx.moveTo(0, pix);
			ctx.lineTo(sizeTotal, pix);
		}
		ctx.stroke();

		ctx.textAlign = 'center';
		ctx.textBaseline = 'bottom';
		ctx.fillStyle = 'black';

		let measure = null;
		let measureMarker = null;

		base = LINE_THICK_HALF * window.devicePixelRatio + unitSize * 0.5;
		let roff = base;
		for (let r = 0; r < GRID_SIDE; r++, roff += unitSize) {
			let coff = base;
			for (let c = 0; c < GRID_SIDE; c++, coff += unitSize) {
				const marker = markers[r * 9 + c];
				let count = 0;
				if (marker) {
					for (let i = 0; i < 9; i++) {
						if (marker[i]) count++;
					}
				}
				if (count > 0) {
					ctx.font = "100 " + pixAlign(unitSize * 0.7 * 1 / 3) + "px " + FONT;
					// ctx.font = "100 " + unitSize * 0.75 * 1 / 3 + "px " + FONTS[fontCurrent];
					// ctx.font = "100 " + unitSize * 0.8 * 1 / 3 + "px " + FONTS[fontCurrent];

					if (!measureMarker) measureMarker = ctx.measureText("0");

					for (let x = 0; x < 3; x++) {
						for (let y = 0; y < 3; y++) {
							if (marker[y * 3 + x]) {
								const xx = coff + unitSize * (x - 1) / 3 * 1;
								const yy = roff + (measureMarker.actualBoundingBoxAscent * 0.5 - measureMarker.actualBoundingBoxDescent * 0.5) + unitSize * (y - 1) / 3 * 1;
								const symbol = y * 3 + x + 1;
								ctx.fillText(symbol, xx, yy);
							}
						}
					}
				} else {
					ctx.font = "100 " + pixAlign(unitSize * 0.7) + "px " + FONT;
					// ctx.font = "100 " + unitSize * 0.75 + "px " + FONTS[fontCurrent];
					// ctx.font = "100 " + unitSize * 0.8 + "px " + FONTS[fontCurrent];

					if (!measure) measure = ctx.measureText("0");

					const symbol = this.grid.getSymbol(r, c);
					if (symbol === 0) continue;
					const x = coff;
					const y = roff + (measure.actualBoundingBoxAscent * 0.5 - measure.actualBoundingBoxDescent * 0.5);
					ctx.fillText(symbol, pixAlign(x), pixAlign(y));
				}
			}
		}
	}
}
const board = new Board();

export { board, FONT };
