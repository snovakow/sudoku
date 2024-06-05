import { FONT, board, markers } from "./board.js";
import { picker, pickerDraw, pickerMarker, pixAlign } from "./picker.js";
import { candidates, missingCells, nakedCells, hiddenCells, pairGroups, xWing, xyWing } from "./solver.js";

const sudokuSamples = [
	// [
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	[0, 0, 0, 0, 0, 0, 0, 0, 0],
	// 	"Name"
	// ],
	[
		[6, 0, 7, 9, 0, 1, 3, 0, 0],
		[9, 0, 3, 0, 7, 0, 0, 0, 0],
		[0, 5, 0, 0, 3, 0, 0, 0, 0],
		[0, 0, 0, 1, 2, 0, 6, 8, 0],
		[0, 0, 2, 5, 8, 9, 0, 0, 0],
		[5, 0, 0, 0, 0, 0, 0, 0, 0],
		[3, 0, 0, 0, 0, 7, 9, 0, 6],
		[0, 0, 0, 0, 6, 0, 4, 0, 0],
		[7, 0, 0, 3, 0, 0, 8, 0, 0],
		"Snake"
	],
	[
		[0, 0, 0, 0, 4, 0, 2, 0, 0],
		[2, 0, 0, 0, 0, 0, 6, 5, 0],
		[9, 0, 0, 6, 0, 0, 0, 0, 7],
		[0, 0, 0, 7, 6, 3, 0, 0, 0],
		[0, 0, 0, 0, 5, 0, 0, 0, 1],
		[0, 0, 0, 2, 1, 4, 0, 0, 0],
		[8, 0, 0, 1, 0, 7, 0, 0, 4],
		[0, 3, 6, 0, 0, 0, 0, 0, 8],
		[0, 0, 2, 0, 3, 0, 0, 0, 0],
		"XY-Wing"
	],
	[
		[0, 5, 0, 0, 2, 0, 0, 0, 0],
		[0, 0, 0, 6, 0, 0, 1, 0, 0],
		[0, 8, 3, 0, 0, 4, 0, 0, 6],
		[0, 3, 9, 0, 8, 0, 7, 0, 0],
		[5, 0, 0, 0, 0, 0, 0, 0, 3],
		[1, 0, 0, 0, 0, 9, 0, 0, 0],
		[0, 6, 4, 0, 0, 8, 0, 0, 1],
		[9, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 7, 0, 0, 2, 0],
		"XY-Wing"
	],
	[
		[0, 4, 0, 3, 6, 7, 0, 0, 0],
		[0, 1, 0, 0, 8, 0, 0, 6, 0],
		[6, 0, 0, 0, 4, 0, 0, 0, 2],
		[0, 0, 3, 8, 2, 0, 9, 0, 6],
		[0, 8, 4, 0, 0, 0, 2, 5, 3],
		[0, 0, 6, 0, 0, 0, 8, 0, 0],
		[4, 0, 0, 0, 9, 0, 0, 0, 5],
		[0, 5, 0, 0, 7, 0, 0, 9, 0],
		[0, 0, 0, 6, 5, 8, 0, 2, 0],
		"Isolate"
	],
	[ // 25.63%
		[9, 0, 0, 0, 0, 0, 0, 0, 5],
		[0, 6, 0, 0, 7, 0, 0, 0, 0],
		[0, 0, 2, 0, 0, 8, 4, 9, 0],
		[0, 0, 0, 0, 0, 0, 0, 1, 0],
		[0, 0, 9, 0, 0, 4, 3, 8, 0],
		[2, 0, 0, 9, 0, 0, 0, 0, 0],
		[0, 0, 3, 0, 0, 0, 0, 0, 1],
		[7, 0, 0, 0, 8, 0, 5, 3, 0],
		[0, 0, 0, 0, 0, 5, 0, 0, 2],
		"Iso 7 b5"
	],
	[ // 26%
		[1, 0, 0, 0, 6, 0, 0, 0, 0],
		[0, 0, 3, 9, 0, 1, 0, 4, 0],
		[2, 0, 0, 0, 0, 0, 0, 0, 7],
		[0, 0, 0, 0, 8, 0, 0, 5, 0],
		[0, 0, 6, 0, 4, 0, 0, 0, 0],
		[3, 0, 0, 5, 0, 6, 2, 0, 0],
		[0, 0, 1, 3, 0, 5, 0, 9, 0],
		[0, 0, 0, 8, 0, 0, 0, 0, 0],
		[0, 9, 0, 0, 0, 0, 4, 0, 0],
		"Iso 9 b1"
	],
	[ // 29%
		[7, 0, 0, 9, 0, 0, 6, 0, 0],
		[0, 5, 0, 8, 0, 0, 0, 3, 7],
		[0, 0, 0, 0, 3, 0, 4, 0, 0],
		[0, 0, 2, 5, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 3, 0, 0],
		[4, 0, 0, 0, 8, 0, 0, 1, 9],
		[0, 4, 0, 0, 0, 9, 0, 0, 0],
		[9, 0, 0, 0, 1, 0, 0, 7, 8],
		[0, 0, 0, 0, 0, 0, 0, 0, 6],
		"Iso 5 b2"
	],
	[ // 26.51%
		[0, 2, 0, 0, 0, 0, 0, 0, 3],
		[6, 0, 0, 0, 3, 1, 0, 0, 0],
		[5, 0, 0, 0, 0, 0, 0, 8, 4],
		[3, 7, 0, 0, 0, 0, 5, 0, 1],
		[0, 0, 0, 0, 6, 0, 0, 0, 9],
		[0, 0, 0, 4, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 7, 8, 0, 0],
		[2, 0, 0, 0, 9, 0, 0, 4, 0],
		[0, 5, 0, 2, 0, 0, 1, 0, 0],
		"Old 1"
	],
	[
		[2, 0, 0, 0, 0, 0, 0, 0, 8],
		[7, 0, 0, 0, 9, 0, 0, 0, 0],
		[6, 0, 5, 0, 3, 0, 0, 0, 0],
		[3, 0, 0, 0, 0, 0, 6, 0, 0],
		[0, 0, 8, 4, 0, 7, 9, 0, 0],
		[1, 0, 0, 6, 8, 0, 0, 0, 0],
		[0, 0, 3, 2, 0, 0, 0, 0, 1],
		[0, 5, 0, 0, 0, 0, 0, 0, 6],
		[0, 0, 0, 8, 0, 0, 0, 4, 0],
		"Old 2"
	],
	[
		[8, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 4, 0, 0, 0, 8, 9, 0],
		[9, 0, 0, 0, 3, 0, 0, 1, 0],
		[0, 7, 0, 0, 0, 4, 0, 0, 0],
		[0, 0, 0, 8, 1, 9, 0, 0, 0],
		[6, 4, 0, 0, 0, 3, 0, 0, 0],
		[0, 2, 5, 0, 0, 0, 0, 0, 6],
		[0, 0, 0, 0, 5, 0, 4, 0, 0],
		[0, 0, 0, 1, 0, 0, 0, 0, 3],
		"Old 3"
	],
	[
		[0, 0, 7, 0, 0, 8, 0, 0, 0],
		[0, 9, 5, 0, 0, 2, 6, 0, 0],
		[0, 0, 0, 1, 0, 0, 2, 5, 0],
		[0, 1, 0, 0, 0, 0, 0, 7, 9],
		[6, 0, 0, 0, 0, 9, 0, 0, 0],
		[0, 0, 8, 0, 0, 4, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 6, 4, 0, 0, 8, 0, 0],
		[0, 3, 0, 0, 5, 0, 0, 2, 0],
		"Old 4"
	],
	[
		[5, 0, 0, 0, 0, 4, 0, 7, 2],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 6, 1, 3, 0, 0, 0],
		[0, 0, 0, 3, 7, 8, 0, 0, 0],
		[0, 0, 0, 4, 0, 0, 0, 6, 3],
		[0, 0, 4, 0, 0, 0, 9, 0, 0],
		[0, 9, 6, 0, 0, 0, 1, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 4],
		[0, 1, 0, 0, 0, 5, 3, 9, 0],
		"Old 5"
	],
	[
		[0, 0, 1, 3, 0, 0, 0, 0, 0],
		[0, 9, 0, 0, 2, 0, 0, 0, 0],
		[0, 0, 8, 0, 0, 0, 0, 2, 6],
		[0, 0, 0, 0, 0, 9, 0, 0, 5],
		[0, 0, 0, 0, 0, 1, 8, 0, 9],
		[0, 0, 0, 7, 3, 4, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 7, 0, 0],
		[4, 7, 0, 0, 0, 0, 0, 9, 0],
		[3, 0, 0, 0, 1, 0, 4, 0, 0],
		"Old 6"
	],
	[
		[1, 0, 0, 2, 0, 0, 3, 0, 0],
		[2, 0, 0, 3, 0, 0, 4, 0, 0],
		[3, 0, 0, 4, 0, 0, 5, 0, 0],
		[4, 0, 0, 5, 0, 0, 6, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 3, 0, 0, 4, 0, 0, 5],
		[0, 0, 4, 0, 0, 5, 0, 0, 6],
		[0, 0, 5, 0, 0, 6, 0, 0, 7],
		[0, 0, 6, 0, 0, 7, 0, 0, 8],
		"Old 7"
	],
	[
		[0, 3, 0, 0, 4, 0, 0, 0, 0],
		[0, 0, 1, 0, 0, 7, 0, 0, 0],
		[0, 0, 6, 0, 0, 0, 9, 4, 0],
		[0, 0, 0, 5, 7, 8, 0, 0, 0],
		[0, 0, 0, 3, 0, 0, 2, 0, 0],
		[0, 0, 0, 1, 0, 0, 3, 0, 6],
		[5, 8, 0, 0, 0, 0, 0, 3, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 8],
		[7, 0, 0, 0, 1, 0, 0, 0, 5],
		"Old 8"
	],
	[
		[9, 0, 0, 4, 2, 0, 5, 6, 0],
		[0, 0, 7, 0, 0, 0, 0, 4, 0],
		[0, 5, 4, 0, 0, 0, 1, 9, 0],
		[0, 0, 0, 8, 7, 1, 9, 0, 0],
		[0, 2, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 6, 4, 0, 0],
		[0, 7, 0, 0, 3, 0, 0, 0, 5],
		[0, 0, 0, 0, 9, 0, 0, 0, 0],
		[0, 0, 8, 0, 0, 0, 0, 0, 0],
		"Old 10"
	],
];

const sudokuStrings = `..53.....8......2..7..1.5..4....53...1..7...6..32...8..6.5....9..4....3......97..
12..4......5.69.1...9...5.........7.7...52.9..3......2.9.6...5.4..9..8.1..3...9.4
1....7.9..3..2...8..96..5....53..9...1..8...26....4...3......1..4......7..7...3..
1...34.8....8..5....4.6..21.18......3..1.2..6......81.52..7.9....6..9....9.64...2
...92......68.3...19..7...623..4.1....1...7....8.3..297...8..91...5.72......64...
.6.5.4.3.1...9...8.........9...5...6.4.6.2.7.7...4...5.........4...8...1.5.2.3.4.
7.....4...2..7..8...3..8.799..5..3...6..2..9...1.97..6...3..9...3..4..6...9..1.35
....7..2.8.......6.1.2.5...9.54....8.........3....85.1...3.2.8.4.......9.7..6....
4.....8.5.3..........7......2.....6.....8.4......1.......6.3.7.5..2.....1.4......
52...6.........7.13...........4..8..6......5...........418.........3..2...87.....
6.....8.3.4.7.................5.4.7.3..2.....1.6.......2.....5.....8.6......1....
48.3............71.2.......7.5....6....2..8.............1.76...3.....4......5....
....14....3....2...7..........9...3.6.1.............8.2.....1.4....5.6.....7.8...
......52..8.4......3...9...5.1...6..2..7........3.....6...1..........7.4.......3.
6.2.5.........3.4..........43...8....1....2........7..5..27...........81...6.....
.524.........7.1..............8.2...3.....6...9.5.....1.6.3...........897........
6.2.5.........4.3..........43...8....1....2........7..5..27...........81...6.....
.923.........8.1...........1.7.4...........658.........6.5.2...4.....7.....9.....
6..3.2....5.....1..........7.26............543.........8.15........4.2........7..
.6.5.1.9.1...9..539....7....4.8...7.......5.8.817.5.3.....5.2............76..8...
..5...987.4..5...1..7......2...48....9.1.....6..2.....3..6..2.......9.7.......5..
3.6.7...........518.........1.4.5...7.....6.....2......2.....4.....8.3.....5.....
1.....3.8.7.4..............2.3.1...........958.........5.6...7.....8.2...4.......
6..3.2....4.....1..........7.26............543.........8.15........4.2........7..
....3..9....2....1.5.9..............1.2.8.4.6.8.5...2..75......4.1..6..3.....4.6.
45.....3....8.1....9...........5..9.2..7.....8.........1..4..........7.2...6..8..
.237....68...6.59.9.....7......4.97.3.7.96..2.........5..47.........2....8.......
..84...3....3.....9....157479...8........7..514.....2...9.6...2.5....4......9..56
.98.1....2......6.............3.2.5..84.........6.........4.8.93..5...........1..
..247..58..............1.4.....2...9528.9.4....9...1.........3.3....75..685..2...
4.....8.5.3..........7......2.....6.....5.4......1.......6.3.7.5..2.....1.9......
.2.3......63.....58.......15....9.3....7........1....8.879..26......6.7...6..7..4
1.....7.9.4...72..8.........7..1..6.3.......5.6..4..2.........8..53...7.7.2....46
4.....3.....8.2......7........1...8734.......6........5...6........1.4...82......
.......71.2.8........4.3...7...6..5....2..3..9........6...7.....8....4......5....
6..3.2....4.....8..........7.26............543.........8.15........8.2........7..
.47.8...1............6..7..6....357......5....1..6....28..4.....9.1...4.....2.69.
......8.17..2........5.6......7...5..1....3...8.......5......2..4..8....6...3....
38.6.......9.......2..3.51......5....3..1..6....4......17.5..8.......9.......7.32
...5...........5.697.....2...48.2...25.1...3..8..3.........4.7..13.5..9..2...31..
.2.......3.5.62..9.68...3...5..........64.8.2..47..9....3.....1.....6...17.43....
.8..4....3......1........2...5...4.69..1..8..2...........3.9....6....5.....2.....
..8.9.1...6.5...2......6....3.1.7.5.........9..4...3...5....2...7...3.8.2..7....4
4.....5.8.3..........7......2.....6.....5.8......1.......6.3.7.5..2.....1.8......
1.....3.8.6.4..............2.3.1...........958.........5.6...7.....8.2...4.......
1....6.8..64..........4...7....9.6...7.4..5..5...7.1...5....32.3....8...4........
249.6...3.3....2..8.......5.....6......2......1..4.82..9.5..7....4.....1.7...3...
...8....9.873...4.6..7.......85..97...........43..75.......3....3...145.4....2..1
...5.1....9....8...6.......4.1..........7..9........3.8.....1.5...2..4.....36....
......8.16..2........7.5......6...2..1....3...8.......2......7..3..8....5...4....
.476...5.8.3.....2.....9......8.5..6...1.....6.24......78...51...6....4..9...4..7
.....7.95.....1...86..2.....2..73..85......6...3..49..3.5...41724................
.4.5.....8...9..3..76.2.....146..........9..7.....36....1..4.5..6......3..71..2..
.834.........7..5...........4.1.8..........27...3.....2.6.5....5.....8........1..
..9.....3.....9...7.....5.6..65..4.....3......28......3..75.6..6...........12.3.8
.26.39......6....19.....7.......4..9.5....2....85.....3..2..9..4....762.........4
2.3.8....8..7...........1...6.5.7...4......3....1............82.5....6...1.......
6..3.2....1.....5..........7.26............843.........8.15........8.2........7..
1.....9...64..1.7..7..4.......3.....3.89..5....7....2.....6.7.9.....4.1....129.3.
.........9......84.623...5....6...453...1...6...9...7....1.....4.5..2....3.8....9
.2....5938..5..46.94..6...8..2.3.....6..8.73.7..2.........4.38..7....6..........5
9.4..5...25.6..1..31......8.7...9...4..26......147....7.......2...3..8.6.4.....9.
...52.....9...3..4......7...1.....4..8..453..6...1...87.2........8....32.4..8..1.
53..2.9...24.3..5...9..........1.827...7.........981.............64....91.2.5.43.
1....786...7..8.1.8..2....9........24...1......9..5...6.8..........5.9.......93.4
....5...11......7..6.....8......4.....9.1.3.....596.2..8..62..7..7......3.5.7.2..
.47.2....8....1....3....9.2.....5...6..81..5.....4.....7....3.4...9...1.4..27.8..
......94.....9...53....5.7..8.4..1..463...........7.8.8..7.....7......28.5.26....
.2......6....41.....78....1......7....37.....6..412....1..74..5..8.5..7......39..
1.....3.8.6.4..............2.3.1...........758.........7.5...6.....8.2...4.......
2....1.9..1..3.7..9..8...2.......85..6.4.........7...3.2.3...6....5.....1.9...2.5
..7..8.....6.2.3...3......9.1..5..6.....1.....7.9....2........4.83..4...26....51.
...36....85.......9.4..8........68.........17..9..45...1.5...6.4....9..2.....3...
34.6.......7.......2..8.57......5....7..1..2....4......36.2..1.......9.......7.82
......4.18..2........6.7......8...6..4....3...1.......6......2..5..1....7...3....
.4..5..67...1...4....2.....1..8..3........2...6...........4..5.3.....8..2........
.......4...2..4..1.7..5..9...3..7....4..6....6..1..8...2....1..85.9...6.....8...3
8..7....4.5....6............3.97...8....43..5....2.9....6......2...6...7.71..83.2
.8...4.5....7..3............1..85...6.....2......4....3.26............417........
....7..8...6...5...2...3.61.1...7..2..8..534.2..9.......2......58...6.3.4...1....
......8.16..2........7.5......6...2..1....3...8.......2......7..4..8....5...3....
.2..........6....3.74.8.........3..2.8..4..1.6..5.........1.78.5....9..........4.
.52..68.......7.2.......6....48..9..2..41......1.....8..61..38.....9...63..6..1.9
....1.78.5....9..........4..2..........6....3.74.8.........3..2.8..4..1.6..5.....
1.......3.6.3..7...7...5..121.7...9...7........8.1..2....8.64....9.2..6....4.....
4...7.1....19.46.5.....1......7....2..2.3....847..6....14...8.6.2....3..6...9....
......8.17..2........5.6......7...5..1....3...8.......5......2..3..8....6...4....
963......1....8......2.5....4.8......1....7......3..257......3...9.2.4.7......9..
15.3......7..4.2....4.72.....8.........9..1.8.1..8.79......38...........6....7423
..........5724...98....947...9..3...5..9..12...3.1.9...6....25....56.....7......6
....75....1..2.....4...3...5.....3.2...8...1.......6.....1..48.2........7........
6.....7.3.4.8.................5.4.8.7..2.....1.3.......2.....5.....7.9......1....
....6...4..6.3....1..4..5.77.....8.5...8.....6.8....9...2.9....4....32....97..1..
.32.....58..3.....9.428...1...4...39...6...5.....1.....2...67.8.....4....95....6.
...5.3.......6.7..5.8....1636..2.......4.1.......3...567....2.8..4.7.......2..5..
.5.3.7.4.1.........3.......5.8.3.61....8..5.9.6..1........4...6...6927....2...9..
..5..8..18......9.......78....4.....64....9......53..2.6.........138..5....9.714.
..........72.6.1....51...82.8...13..4.........37.9..1.....238..5.4..9.........79.
...658.....4......12............96.7...3..5....2.8...3..19..8..3.6.....4....473..
.2.3.......6..8.9.83.5........2...8.7.9..5........6..4.......1...1...4.22..7..8.9
.5..9....1.....6.....3.8.....8.4...9514.......3....2..........4.8...6..77..15..6.
.....2.......7...17..3...9.8..7......2.89.6...13..6....9..5.824.....891..........
3...8.......7....51..............36...2..4....7...........6.13..452...........8..`.split('\n');

let selectedRow = 0;
let selectedCol = 0;
let selected = false;

document.body.appendChild(picker);
document.body.appendChild(pickerMarker);

document.body.style.userSelect = 'none';

const draw = () => {
	board.draw(selected, selectedRow, selectedCol);

	const font = "100 " + pixAlign(64 * window.devicePixelRatio) + "px " + FONT;
	pickerDraw(font);
}

const createSelect = (options, onChange) => {
	const select = document.createElement('select');

	for (const title of options) {
		const option = document.createElement('option');
		option.text = title;
		select.appendChild(option);
	}

	select.addEventListener('change', () => {
		onChange(select);
	});
	document.body.appendChild(select);

	document.body.appendChild(document.createElement('br'));

	return select;
};

const names = [];
const sudokus = [...sudokuSamples];
for (const sudoku of sudokuSamples) names.push(sudoku[9]);
let nameIndex = 0;
for (const sudoku of sudokuStrings) {
	names.push(++nameIndex);
	const convert = [];
	for (let r = 0; r < 9; r++) {
		const row = [];
		convert.push(row);
		for (let c = 0; c < 9; c++) {
			const symbol = sudoku[r * 9 + c];
			if (symbol === ".") row.push(0);
			else row.push(parseInt(symbol));
		}
	}
	sudokus.push(convert);
}

const selector = createSelect(["-", ...names], (select) => {
	if (select.selectedIndex === 0) {
		localStorage.removeItem("gridName");
		return;
	}

	markers.length = 0;
	selected = false;

	const index = select.selectedIndex - 1;
	board.setGrid(index < sudokus.length ? sudokus[index] : sudokuSamples[index - sudokus.length]);
	saveGrid(select.selectedIndex);
	draw();
});
selector.style.position = 'absolute';
selector.style.width = '40px';

const saveGrid = (selectedIndex = null) => {
	if (selectedIndex !== null) localStorage.setItem("gridName", selectedIndex);
	localStorage.setItem("startGrid", board.startGrid.toData());
	localStorage.setItem("grid", board.grid.toData());

	localStorage.setItem("markers", JSON.stringify(markers));
};
const loadGrid = () => {
	const selectedIndex = localStorage.getItem("gridName");
	if (selectedIndex !== null) {
		const selectedInt = parseInt(selectedIndex);
		if (selectedInt > 0 && selectedInt < selector.options.length) selector.selectedIndex = selectedInt;
	}

	const startGrid = localStorage.getItem("startGrid");

	if (startGrid) {
		board.startGrid.fromData(startGrid);

		const grid = localStorage.getItem("grid");
		if (grid) {
			board.grid.fromData(grid);
		}

		const markersJSON = localStorage.getItem("markers");
		if (markersJSON) {
			const markersData = JSON.parse(markersJSON);
			markers.length = 0;
			for (const index in markersData) {
				markers[index] = markersData[index];
			}
		}

		return true;
	}
	return false;
};

loadGrid();

document.body.appendChild(board.canvas);

const click = (event) => {
	// event.preventDefault();

	// Get the bounding rectangle of target
	const rect = event.target.getBoundingClientRect();
	// Mouse position
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;

	const [row, col] = board.hitDetect(x, y, rect.width);

	if (row < 0 || col < 0) return;

	if (board.startGrid.getSymbol(row, col) !== 0) return;

	if (selected && selectedRow === row && selectedCol === col) {
		selected = false;
	} else {
		selectedRow = row;
		selectedCol = col;

		selected = true;
	}
	draw();
};
board.canvas.addEventListener('click', click);

const clickLocation = (event) => {
	const rect = event.target.getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;

	const sizeTotal = rect.width;

	const r = Math.floor(y / sizeTotal * 3);
	const c = Math.floor(x / sizeTotal * 3);
	return [r, c];
};

const pickerClick = (event) => {
	// event.preventDefault();

	if (!selected) return;

	const [r, c] = clickLocation(event);

	const index = r * 3 + c + 1;
	const symbol = board.grid.getSymbol(selectedRow, selectedCol);
	if (symbol == index) {
		board.grid.setSymbol(selectedRow, selectedCol, 0);
	} else {
		delete markers[selectedRow * 9 + selectedCol];
		board.grid.setSymbol(selectedRow, selectedCol, index);
		saveGrid(selector.selectedIndex);
	}

	draw();
};
picker.addEventListener('click', pickerClick);

const pickerMarkerClick = (event) => {
	// event.preventDefault();

	if (!selected) return;

	const [r, c] = clickLocation(event);

	const index = r * 3 + c;
	let marker = markers[selectedRow * 9 + selectedCol];
	if (!marker) {
		marker = [];
		markers[selectedRow * 9 + selectedCol] = marker;
	}
	// if (marker[index]) delete marker[index];
	// else marker[index] = true;
	marker[index] = !marker[index];

	draw();
};
pickerMarker.addEventListener('click', pickerMarkerClick);

const onFocus = () => {
	console.log("onFocus");
	draw();
};
const offFocus = () => {

};
window.addEventListener("focus", onFocus);
window.addEventListener("blur", offFocus);

const orientationchange = (event) => {
	draw();
	console.log(event);
};
addEventListener("orientationchange", orientationchange);

const clearButton = document.createElement('button');
clearButton.appendChild(document.createTextNode("X"));
clearButton.style.position = 'absolute';
clearButton.style.width = '32px';
clearButton.style.height = '32px';
clearButton.addEventListener('click', () => {
	markers.length = 0;
	selected = false;
	board.resetGrid();
	saveGrid();
	draw();
});
document.body.appendChild(clearButton);

const singleButton = document.createElement('button');
singleButton.appendChild(document.createTextNode("+"));
singleButton.style.position = 'absolute';
singleButton.style.width = '32px';
singleButton.style.height = '32px';
singleButton.addEventListener('click', () => {
	const time = performance.now();

	let fills = 0;
	let missingSingles = 0;
	let groupSets = 0;

	let progress = false;
	do {
		candidates(board.grid, markers);
		progress = missingCells(board.grid, markers);
		if (progress) {
			fills++;
		} else {
			progress = nakedCells(board.grid, markers);
			if (progress) {
				missingSingles++;
				fills++;
			} else {
				progress = hiddenCells(markers);
				if (progress) {
					groupSets++;
				} else {
					progress = pairGroups(markers);
					if (progress) {
						fills++;
					} else {
						progress = xWing(markers);
						if (progress) {
							fills++;
						} else {
							progress = xyWing(markers);
							if (progress) fills++;
						}
					}
				}
			}
		}
	} while (progress);

	const now = performance.now();

	console.log("---");
	console.log("Removals: " + fills);
	console.log("Missing Singles: " + missingSingles);
	console.log("Marker Reductions: " + groupSets);
	console.log("Time: " + (now - time) / 1000);

	draw();
});
document.body.appendChild(singleButton);

const fillButton = document.createElement('button');
fillButton.appendChild(document.createTextNode("x"));
fillButton.style.position = 'absolute';
fillButton.style.width = '32px';
fillButton.style.height = '32px';
fillButton.addEventListener('click', () => {
	// markers.length = 0;
	candidates(board.grid, markers);
	draw();
});
document.body.appendChild(fillButton);

selector.style.transform = 'translateX(-50%)';
clearButton.style.transform = 'translateX(-50%)';
fillButton.style.transform = 'translateX(-50%)';
singleButton.style.transform = 'translateX(-50%)';

singleButton.style.touchAction = "manipulation";

board.canvas.style.position = 'absolute';
board.canvas.style.left = '50%';
board.canvas.style.touchAction = "manipulation";
picker.style.touchAction = "manipulation";
pickerMarker.style.touchAction = "manipulation";

const resize = () => {
	let width = window.innerWidth;
	let height = window.innerHeight;
	if (width - 192 > height) {
		if (width - height < 384) {
			width = width - 384;
		}
		board.canvas.style.top = '0%';
		board.canvas.style.transform = 'translate(-50%, 0%)';

		singleButton.style.bottom = '320px';
		singleButton.style.left = '96px';

		fillButton.style.bottom = '280px';
		fillButton.style.left = '96px';

		selector.style.bottom = '240px';
		selector.style.left = '96px';

		clearButton.style.bottom = '200px';
		clearButton.style.left = '96px';
	} else {
		if (height - width < 192) {
			board.canvas.style.top = '0%';
		} else {
			board.canvas.style.top = ((height - 192) - width) * 0.5 + 'px';
		}

		if (height - width < 384) {
			height = height - 192;
		}

		board.canvas.style.transform = 'translate(-50%, 0%)';

		fillButton.style.bottom = '128px';
		fillButton.style.left = '50%';

		singleButton.style.bottom = '88px';
		singleButton.style.left = '50%';

		selector.style.bottom = '48px';
		selector.style.left = '50%';

		clearButton.style.bottom = '8px';
		clearButton.style.left = '50%';
	}



	const size = Math.min(width, height);
	board.canvas.style.width = size + 'px';
	board.canvas.style.height = size + 'px';
	board.canvas.width = Math.floor(size * window.devicePixelRatio / 1) * 2;
	board.canvas.height = Math.floor(size * window.devicePixelRatio / 1) * 2;

	draw();
};
resize();

window.addEventListener('resize', resize);
