export const picker = document.createElement('canvas');

picker.style.position = 'absolute';
picker.style.width = '192px';
picker.style.height = '256px';
picker.style.top = '0px';
picker.style.right = '0px';
// picker.style.transform = 'translate(-50%, -50%)';

const LINE_THIN = 2;

let markerMode = false;

export const setMarkerMode = (mode) => {
	markerMode = mode;
};

export const pixAlign = (val) => {
	return Math.round(val) + 0.5;
};

export const pickerDraw = (font) => {
	picker.width = 64 * 3 * window.devicePixelRatio;
	picker.height = 64 * 4 * window.devicePixelRatio;

	const symbols = [
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
		['x', '', markerMode ? '+' : '-'],
	];

	const sizeTotal = picker.width;
	const unitSize = sizeTotal / 3;
	const inc = unitSize;

	const off = unitSize * 0.5;
	// for (let r = 0; r < GRID_SIDE; r++, roff += inc) {
	// 	for (let c = 0; c < GRID_SIDE; c++, coff += inc) {
	// 		const symbol = grid.getSymbol(r, c);
	// 		if (symbol === 0) continue;
	// 		ctx.fillText(symbol, coff, roff + (measure.actualBoundingBoxAscent * 0.5 - measure.actualBoundingBoxDescent * 0.5));
	// 	}
	// }

	const ctx = picker.getContext("2d");
	// ctx.clearRect(0, 0, canvas.width, canvas.height);

	ctx.clearRect(0, 0, picker.width, picker.height);

	ctx.lineWidth = LINE_THIN * window.devicePixelRatio;

	ctx.beginPath();
	for (let base = 0; base <= sizeTotal; base += inc) {
		const pix = pixAlign(base);
		ctx.moveTo(pix, 0);
		ctx.lineTo(pix, sizeTotal);
		// ctx.stroke();

		ctx.moveTo(0, pix);
		ctx.lineTo(sizeTotal, pix);

	}
	ctx.stroke();

	ctx.strokeStyle = 'black';
	ctx.font = font;

	ctx.textAlign = 'center';
	ctx.textBaseline = 'bottom';
	ctx.fillStyle = 'black';

	const measure = ctx.measureText("0");

	let roff = off;
	for (let x = 0; x < 4; x++, roff += inc) {
		let coff = off;
		for (let y = 0; y < 3; y++, coff += inc) {
			ctx.fillText(symbols[x][y], pixAlign(coff), pixAlign(roff + (measure.actualBoundingBoxAscent * 0.5 - measure.actualBoundingBoxDescent * 0.5)));
		}
	}
};

/*
{
	let res;
	let blur;
	let rad = 2;

	if (rad <= 1) {
		res = 1;
		blur = rad;
		that.shadowCanvas.width = that.pixWidth;
		that.shadowCanvas.height = Math.floor(that.pixHeight * 0.5);
	} else {
		blur = Math.pow(rad, 0.5);
		res = (blur === 0 ? 1 : blur / rad);

		let width = that.pixWidth * res;
		let height = that.pixHeight * res;
		if (width < 1) {
			if (height < 1) {
				res = Math.max(width / that.pixWidth, height / that.pixHeight);
				width = that.pixWidth * res;
				height = that.pixHeight * res;
			} else {
				width = 1;
				res = width / that.pixWidth;
			}
		} else {
			if (height < 1) {
				height = 1;
				res = height / that.pixHeight;
			}
		}
		const diameter = blur * 2;
		const maxw = Math.max(width, diameter);
		const maxh = Math.max(height, diameter);
		that.shadowCanvas.width = maxw;
		that.shadowCanvas.height = maxh * 0.5;
	}

	const inset = blur;
	const insize = blur * 2;
	that.shadowCanvas.width += insize;
	that.shadowCanvas.height += insize;

	const ctx = that.shadowCanvas.getContext('2d');
	ctx.clearRect(0, 0, that.shadowCanvas.width, that.shadowCanvas.height);
	ctx.filter = "blur(" + blur + "px)";
	if (that.alphaMode === 1 || that.alphaMode === 3) {
		const shh = that.viv.videoHeight * 0.5;
		ctx.drawImage(that.viv, 0, shh, that.viv.videoWidth, shh, inset, inset, that.shadowCanvas.width - insize, that.shadowCanvas.height - insize);
	} else {
		ctx.drawImage(that.viv, 0, 0, that.viv.videoWidth, that.viv.videoHeight, inset, inset, that.shadowCanvas.width - insize, that.shadowCanvas.height - insize);
	}
}
if(false){
	let res;
	let blur;
	let rad = 2;

	if (rad <= 1) {
		res = 1;
		blur = rad;
		that.shadowCanvas.width = that.pixWidth;
		that.shadowCanvas.height = Math.floor(that.pixHeight * 0.5);
	} else {
		blur = Math.pow(rad, 0.5);
		res = (blur === 0 ? 1 : blur / rad);

		let width = that.pixWidth * res;
		let height = that.pixHeight * res;
		if (width < 1) {
			if (height < 1) {
				res = Math.max(width / that.pixWidth, height / that.pixHeight);
				width = that.pixWidth * res;
				height = that.pixHeight * res;
			} else {
				width = 1;
				res = width / that.pixWidth;
			}
		} else {
			if (height < 1) {
				height = 1;
				res = height / that.pixHeight;
			}
		}
		const diameter = blur * 2;
		const maxw = Math.max(width, diameter);
		const maxh = Math.max(height, diameter);
		that.shadowCanvas.width = maxw;
		that.shadowCanvas.height = maxh * 0.5;
	}

	const inset = blur;
	const insize = blur * 2;
	that.shadowCanvas.width += insize;
	that.shadowCanvas.height += insize;

	const ctx = that.shadowCanvas.getContext('2d');
	ctx.clearRect(0, 0, that.shadowCanvas.width, that.shadowCanvas.height);
	ctx.filter = "blur(" + blur + "px)";

	ctx.drawImage(that.viv, 0, 0, that.viv.videoWidth, that.viv.videoHeight, inset, inset, that.shadowCanvas.width - insize, that.shadowCanvas.height - insize);
}
*/
