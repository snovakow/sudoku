const BLOCK = [];
const BLOCK_NDX = [];
const N_BIT = [];
const ZERO = [];
const BIT = [];

console.time('Processing time');

init();

let filename = process.argv[2],
	puzzle = fs.readFileSync(filename).toString().split('\n'),
	len = puzzle.shift(),
	output = len + '\n';

console.log("File '" + filename + "': " + len + " puzzles");

// solve all puzzles
puzzle.forEach((p, i) => {
	let sol, res;

	[p, sol] = p.split(',');

	if (p.length == 81) {
		if (!(++i % 2000)) {
			console.log((i * 100 / len).toFixed(1) + '%');
		}
		if (!(res = solve(p))) {
			throw "Failed on puzzle " + i;
		}
		if (sol && res != sol) {
			throw "Invalid solution for puzzle " + i;
		}
		output += p + ',' + res + '\n';
	}
});

// results
console.timeEnd('Processing time');
fs.writeFileSync('sudoku.log', output);
console.log("MD5 = " + require('crypto').createHash('md5').update(output).digest("hex"));

// initialization of lookup tables
function init() {
	let ptr, x, y;

	for (x = 0; x < 0x200; x++) {
		N_BIT[x] = [0, 1, 2, 3, 4, 5, 6, 7, 8].reduce((s, n) => s + (x >> n & 1), 0);
		ZERO[x] = ~x & -~x;
	}

	for (x = 0; x < 9; x++) {
		BIT[1 << x] = x;
	}

	for (ptr = y = 0; y < 9; y++) {
		for (x = 0; x < 9; x++, ptr++) {
			BLOCK[ptr] = (y / 3 | 0) * 3 + (x / 3 | 0);
			BLOCK_NDX[ptr] = (y % 3) * 3 + x % 3;
		}
	}
}

// solver
function solve(p) {
	let ptr, x, y, v,
		count = 81,
		m = Array(81).fill(-1),
		row = Array(9).fill(0),
		col = Array(9).fill(0),
		blk = Array(9).fill(0);

	// helper function to check and play a move
	function play(stack, x, y, n) {
		let p = y * 9 + x;

		if (~m[p]) {
			if (m[p] == n) {
				return true;
			}
			undo(stack);
			return false;
		}

		let msk, b;

		msk = 1 << n;
		b = BLOCK[p];

		if ((col[x] | row[y] | blk[b]) & msk) {
			undo(stack);
			return false;
		}
		count--;
		col[x] ^= msk;
		row[y] ^= msk;
		blk[b] ^= msk;
		m[p] = n;
		stack.push(x << 8 | y << 4 | n);

		return true;
	}

	// helper function to undo all moves on the stack
	function undo(stack) {
		stack.forEach(v => {
			let x = v >> 8,
				y = v >> 4 & 15,
				p = y * 9 + x,
				b = BLOCK[p];

			v = 1 << (v & 15);

			count++;
			col[x] ^= v;
			row[y] ^= v;
			blk[b] ^= v;
			m[p] = -1;
		});
	}

	// convert the puzzle into our own format
	for (ptr = y = 0; y < 9; y++) {
		for (x = 0; x < 9; x++, ptr++) {
			if (~(v = p[ptr] - 1)) {
				col[x] |= 1 << v;
				row[y] |= 1 << v;
				blk[BLOCK[ptr]] |= 1 << v;
				count--;
				m[ptr] = v;
			}
		}
	}

	// main recursive search function
	let res = (function search() {
		// success?
		if (!count) {
			return true;
		}

		let ptr, x, y, v, n, max, best,
			k, i, stack = [],
			dCol = Array(81).fill(0),
			dRow = Array(81).fill(0),
			dBlk = Array(81).fill(0),
			b, v0;

		// scan the grid:
		// - keeping track of where each digit can go on a given column, row or block
		// - looking for a cell with the fewest number of legal moves
		for (max = ptr = y = 0; y < 9; y++) {
			for (x = 0; x < 9; x++, ptr++) {
				if (m[ptr] == -1) {
					v = col[x] | row[y] | blk[BLOCK[ptr]];
					n = N_BIT[v];

					// abort if there's no legal move on this cell
					if (n == 9) {
						return false;
					}

					// update dCol[], dRow[] and dBlk[]
					for (v0 = v ^ 0x1FF; v0;) {
						b = v0 & -v0;
						dCol[x * 9 + BIT[b]] |= 1 << y;
						dRow[y * 9 + BIT[b]] |= 1 << x;
						dBlk[BLOCK[ptr] * 9 + BIT[b]] |= 1 << BLOCK_NDX[ptr];
						v0 ^= b;
					}

					// update the cell with the fewest number of moves
					if (n > max) {
						best = {
							x: x,
							y: y,
							ptr: ptr,
							msk: v
						};
						max = n;
					}
				}
			}
		}

		// play all forced moves (unique candidates on a given column, row or block)
		// and make sure that it doesn't lead to any inconsistency
		for (k = 0; k < 9; k++) {
			for (n = 0; n < 9; n++) {
				if (N_BIT[dCol[k * 9 + n]] == 1) {
					i = BIT[dCol[k * 9 + n]];

					if (!play(stack, k, i, n)) {
						return false;
					}
				}

				if (N_BIT[dRow[k * 9 + n]] == 1) {
					i = BIT[dRow[k * 9 + n]];

					if (!play(stack, i, k, n)) {
						return false;
					}
				}

				if (N_BIT[dBlk[k * 9 + n]] == 1) {
					i = BIT[dBlk[k * 9 + n]];

					if (!play(stack, (k % 3) * 3 + i % 3, (k / 3 | 0) * 3 + (i / 3 | 0), n)) {
						return false;
					}
				}
			}
		}

		// if we've played at least one forced move, do a recursive call right away
		if (stack.length) {
			if (search()) {
				return true;
			}
			undo(stack);
			return false;
		}

		// otherwise, try all moves on the cell with the fewest number of moves
		while ((v = ZERO[best.msk]) < 0x200) {
			col[best.x] ^= v;
			row[best.y] ^= v;
			blk[BLOCK[best.ptr]] ^= v;
			m[best.ptr] = BIT[v];
			count--;

			if (search()) {
				return true;
			}

			count++;
			m[best.ptr] = -1;
			col[best.x] ^= v;
			row[best.y] ^= v;
			blk[BLOCK[best.ptr]] ^= v;

			best.msk ^= v;
		}

		return false;
	})();

	return res ? m.map(n => n + 1).join('') : false;
}

// debugging
function dump(m) {
	let x, y, c = 81, s = '';

	for (y = 0; y < 9; y++) {
		for (x = 0; x < 9; x++) {
			s += (~m[y * 9 + x] ? (c--, m[y * 9 + x] + 1) : '-') + (x % 3 < 2 || x == 8 ? ' ' : ' | ');
		}
		s += y % 3 < 2 || y == 8 ? '\n' : '\n------+-------+------\n';
	}
	console.log(c);
	console.log(s);
}