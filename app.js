import { FONT, board } from "./board.js";
import { sudokuGenerator, sudokuGeneratorPhistomefel, totalPuzzles } from "./generator.js";
import { picker, pickerDraw, pickerMarker, pixAlign } from "./picker.js";
import { candidates, loneSingles, hiddenSingles, nakedHiddenSets, omissions, xWing, swordfish, xyWing, generate, bruteForce, phistomefel, uniqueRectangle, REDUCE } from "./solver.js";

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
		[0, 0, 0, 8, 4, 0, 3, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 8, 0],
		[2, 0, 9, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0, 4, 0],
		[0, 0, 0, 3, 0, 0, 0, 0, 8],
		[0, 0, 0, 9, 0, 6, 0, 0, 1],
		[0, 4, 3, 0, 0, 0, 5, 6, 0],
		[9, 5, 0, 0, 0, 0, 7, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0, 0],
		"20"
	],
];

const rawNames = [
	"Hidden4 1",
	"Hidden4 2",
	"Hidden4 Hard",
	"Phistomefel 1",
	"Phistomefel 2",
	"Phistomefel 3",
	"Phistomefel 4",
	"Phistomefel 5",
	"Phistomefel 6",
	"Phistomefel Easy",
	"Phistomefel 8",
	"Phistomefel - 2 XY Wings",
	"Phistomefel Swordfish",
	"Phist",
	"Phist",
	"Phist Easy",
	"Phist",
	"Phist",
	"Phist",
	"Phist",
	"Phist",
	"Phist",
	"Phist Easy",
	"Phist",
	"Phist",
	"Phist",
	"Phist",
	"20",
	"20",
	"20",
	"20",
	"20",
	"20",
	"20",
	"20",
	"20",
	"20",
	"20",
	"20",
];
rawNames.reverse();
const raws = [
	[0, 2, 0, 4, 0, 6, 7, 0, 0, 0, 9, 0, 2, 0, 8, 0, 0, 6, 0, 0, 7, 0, 0, 0, 5, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 8, 0, 0, 2, 9, 8, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 4, 0, 0, 0, 0, 3, 0, 0, 0, 7, 0, 5, 0, 0, 9, 0, 0, 2],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 4, 0, 8, 0, 0, 0, 0, 0, 8, 0, 0, 0, 7, 0, 1, 4, 0, 0, 0, 8, 0, 1, 9, 5, 0, 0, 0, 0, 0, 2, 0, 4, 0, 0, 0, 0, 9, 0, 6, 0, 0, 0, 0, 4, 0, 0, 0, 1, 2, 0, 0, 7, 6, 0, 0, 0, 9, 3, 0, 0, 8, 0, 0, 0, 6, 0, 0, 1, 3, 0],
	[0, 2, 0, 0, 5, 0, 0, 8, 9, 0, 0, 0, 9, 0, 0, 4, 0, 0, 0, 0, 0, 7, 1, 0, 0, 0, 0, 0, 0, 0, 5, 9, 0, 0, 0, 7, 6, 7, 0, 1, 0, 0, 0, 0, 0, 8, 0, 0, 6, 0, 0, 5, 1, 4, 0, 0, 7, 0, 0, 0, 0, 2, 0, 0, 5, 1, 0, 0, 0, 0, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0],
	[1, 2, 0, 0, 0, 6, 0, 8, 9, 6, 9, 0, 0, 0, 0, 0, 5, 2, 0, 0, 7, 0, 0, 0, 6, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 7, 0, 0, 0, 9, 0, 0, 0, 4, 0, 0, 0, 0, 7, 3, 0, 0, 0, 0, 0, 0, 2, 0, 0, 8, 0, 0, 0, 8, 1, 0, 5, 0, 0, 0, 7, 3, 7, 5, 0, 0, 0, 0, 0, 9, 8],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 9, 7, 2, 1, 4, 0, 6, 6, 0, 5, 0, 4, 0, 2, 0, 7, 0, 9, 4, 0, 0, 0, 8, 0, 0, 8, 0, 7, 0, 0, 5, 1, 0, 0, 0, 0, 2, 1, 6, 4, 9, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0],
	[1, 2, 0, 0, 0, 0, 0, 8, 9, 5, 7, 0, 0, 9, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 1, 8, 0, 0, 4, 0, 0, 0, 0, 8, 0, 0, 7, 0, 0, 0, 0, 0, 0, 5, 0, 9, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 4, 7, 4, 3, 0, 0, 6, 0, 0, 9, 5],
	[0, 0, 0, 0, 5, 0, 0, 0, 9, 0, 0, 0, 2, 0, 3, 1, 0, 0, 0, 0, 5, 0, 8, 1, 3, 0, 6, 0, 7, 0, 0, 0, 0, 6, 5, 0, 0, 0, 4, 1, 0, 5, 2, 0, 0, 0, 0, 1, 0, 0, 0, 9, 0, 0, 0, 6, 2, 8, 9, 4, 5, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 8, 0, 6, 7, 2, 0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 8, 0, 7, 0, 7, 9, 2, 0, 0, 3, 0, 0, 0, 0, 8, 0, 6, 0, 0, 0, 0, 0, 0, 1, 5, 3, 8, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 5, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 4, 0, 0, 0, 0, 9, 8, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 6, 0, 0, 8, 5, 0, 0, 7, 0, 9, 0, 0, 0, 8, 0, 3, 0, 1, 5, 0, 0, 0, 9, 0, 0, 0, 0, 8, 0, 0, 0, 6, 0, 0, 0, 0, 2, 9, 3, 5, 1, 0, 0, 0, 9, 1, 0, 6, 0, 0, 0, 5, 0, 0, 0, 1, 0, 0, 0, 0, 0],
	[0, 0, 0, 4, 0, 0, 0, 8, 9, 7, 0, 0, 0, 8, 0, 0, 6, 0, 0, 0, 6, 7, 1, 9, 3, 0, 0, 0, 0, 7, 0, 0, 0, 4, 0, 0, 0, 0, 9, 5, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 7, 1, 2, 0, 0, 0, 7, 0, 0, 0, 2, 0, 0, 8, 0, 6, 0, 0, 0, 0, 0, 4, 0],
	[0, 2, 0, 0, 0, 0, 0, 0, 9, 0, 0, 8, 0, 0, 0, 5, 0, 0, 0, 0, 9, 1, 8, 3, 4, 2, 0, 3, 0, 6, 0, 4, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 9, 0, 0, 5, 0, 1, 7, 0, 0, 3, 0, 0, 0, 0, 4, 5, 3, 8, 6, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 8, 0, 0, 0, 4, 0, 0, 0],
	[1, 2, 0, 0, 0, 0, 0, 8, 0, 7, 5, 0, 0, 0, 0, 0, 1, 6, 0, 0, 6, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 9, 0, 0, 0, 0, 0, 7, 0, 5, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 6, 9, 1, 0, 1, 9, 0, 0, 0, 0, 4, 5],
	[1, 2, 0, 0, 5, 0, 0, 8, 9, 6, 5, 0, 0, 3, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 5, 6, 0, 3, 0, 0, 0, 0, 0, 7, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 8, 3, 0, 0, 1, 0, 0, 5, 2, 2, 1, 0, 0, 0, 0, 0, 0, 7],
	[1, 2, 0, 0, 0, 0, 0, 8, 0, 9, 0, 0, 0, 8, 7, 0, 1, 3, 0, 0, 0, 1, 0, 9, 4, 0, 0, 0, 0, 2, 7, 6, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 3, 9, 7, 0, 0, 0, 1, 0, 0, 8, 5, 0, 0, 2, 7, 0, 0, 0, 0, 0, 9, 1, 8, 0, 0, 0, 0, 0, 0, 4, 7],
	[1, 2, 0, 4, 0, 0, 0, 8, 9, 4, 5, 6, 0, 0, 8, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 7, 0, 0, 0, 0, 6, 0, 1, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0, 9, 0, 1, 4, 2, 4, 1, 0, 0, 0, 0, 3, 8],
	[0, 0, 3, 0, 5, 0, 7, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 7, 8, 3, 9, 1, 0, 4, 0, 0, 1, 0, 4, 0, 3, 0, 2, 0, 7, 4, 0, 0, 0, 5, 1, 0, 0, 0, 8, 0, 0, 7, 4, 0, 0, 0, 0, 5, 2, 9, 4, 8, 0, 0, 4, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 2, 0, 0, 0, 6, 0, 8, 9, 5, 8, 0, 3, 0, 0, 0, 0, 6, 0, 0, 6, 2, 0, 1, 0, 0, 0, 0, 4, 1, 0, 2, 0, 6, 0, 0, 0, 0, 9, 0, 3, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 5, 0, 4, 0, 0, 2, 5, 0, 3, 9, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 4, 1],
	[0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 4, 0, 9, 8, 3, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 2, 9, 0, 0, 0, 0, 1, 6, 0, 0, 2, 0, 0, 0, 0, 2, 1, 0, 8, 5, 0, 6, 0, 0, 0, 0, 0, 7, 0, 9, 2, 0, 4, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 7, 8, 9, 1, 2, 0, 0, 0, 1, 8, 0, 0, 9, 6, 7, 0, 7, 0, 4, 0, 0, 2, 5, 0, 8, 0, 0, 2, 0, 0, 0, 9, 0, 0, 0, 0, 5, 7, 1, 4, 8, 9, 0, 0, 8, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 1, 5, 0],
	[1, 2, 0, 0, 0, 0, 0, 8, 9, 4, 6, 0, 0, 0, 0, 3, 2, 1, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 4, 1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 5, 9, 0, 0, 0, 7, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 6, 7, 4, 2, 7, 0, 6, 0, 0, 0, 9, 3],
	[0, 0, 0, 0, 0, 6, 0, 8, 0, 0, 4, 0, 0, 7, 0, 0, 0, 2, 0, 0, 7, 3, 9, 2, 1, 0, 0, 5, 0, 2, 8, 0, 0, 4, 0, 7, 0, 0, 9, 0, 4, 0, 3, 0, 0, 0, 0, 4, 0, 0, 3, 6, 0, 0, 4, 0, 1, 6, 8, 9, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 7, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 7, 0, 9, 0, 0, 0, 0, 0, 8, 0, 3, 0, 0, 0, 8, 3, 1, 7, 5, 0, 0, 0, 0, 4, 1, 0, 5, 9, 0, 0, 6, 0, 9, 0, 0, 0, 3, 5, 0, 0, 0, 7, 0, 0, 0, 2, 0, 0, 0, 0, 5, 7, 8, 9, 1, 0, 0, 0, 9, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 5, 0, 0, 0, 0, 0],
	[1, 2, 0, 0, 5, 0, 0, 8, 9, 6, 8, 0, 9, 0, 0, 0, 3, 5, 0, 0, 9, 0, 8, 0, 2, 4, 0, 0, 6, 0, 0, 0, 5, 0, 0, 0, 0, 0, 8, 0, 0, 9, 0, 0, 0, 0, 0, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 9, 0, 0, 8, 1, 0, 0, 0, 0, 0, 5, 3, 9, 3, 0, 0, 0, 0, 0, 1, 2],
	[0, 2, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 4, 7, 8, 2, 1, 0, 0, 0, 0, 8, 2, 0, 0, 9, 0, 0, 0, 0, 6, 0, 0, 0, 2, 3, 0, 0, 0, 2, 0, 9, 4, 0, 0, 0, 0, 0, 9, 8, 4, 5, 6, 0, 0, 6, 5, 0, 0, 0, 3, 0, 9, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0],
	[1, 2, 0, 0, 0, 0, 0, 8, 9, 4, 5, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 3, 0, 0, 0, 1, 0, 8, 0, 6, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 8, 0, 0, 3, 8, 4, 6, 0, 0, 3, 0, 9, 1, 3, 1, 0, 0, 0, 0, 0, 6, 5],
	[0, 0, 0, 4, 0, 0, 0, 8, 0, 0, 5, 0, 0, 0, 0, 0, 3, 0, 0, 0, 6, 3, 7, 9, 5, 0, 0, 0, 0, 2, 0, 0, 0, 1, 6, 5, 0, 0, 1, 0, 0, 0, 9, 2, 0, 0, 0, 5, 1, 0, 0, 8, 0, 0, 0, 0, 9, 7, 6, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 8, 0, 2, 0, 1],
	[0, 2, 0, 0, 0, 0, 0, 0, 9, 0, 5, 9, 0, 0, 7, 0, 0, 0, 0, 0, 0, 1, 0, 3, 4, 0, 0, 7, 0, 1, 0, 0, 5, 8, 0, 0, 0, 0, 2, 0, 0, 0, 5, 7, 0, 0, 0, 5, 0, 0, 0, 6, 0, 0, 0, 0, 4, 5, 7, 9, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 6, 0],
	'003006700070000500040018000650100000000000200000000008000000003500002000280900004'.split(''),
	'023006000080000010000170040060000002910000008000000630000800000000000970000501000'.split(''),
	'000400700050000010000800300000000000805207000430000600000005000002001007900000402'.split(''),
	'100006000000000013908000600006000200030070000070003800000140900000930000050000000'.split(''),
	'000000000000020104600000002002080000004000096000063000000048001090000005750000030'.split(''),
	'100450000000000060090000002006000090002130007000040000000802001089000500000000006'.split(''),
	'020050009600008000000000000004010000070300920000007008000040000090000370061080000'.split(''),
	'003000000000700001000100006050000007010590000460003008070000000502000300000010900'.split(''),
	'020000080007390010060000000002000500589000072000004000000005900801000000000200000'.split(''),
	'000000780400200000065100000800000000000500000000002904040090603001800005000000400'.split(''),
	'020050080007000640000308000000000000000002008030040010902001070000030000006000900'.split(''),
	'100000000089001000000000003000042000050000697000000500060000300000090102005704000'.split(''),
];
raws.reverse();
let rawIndex = 0;
for (const raw of raws) {
	const puzzle = [];
	for (let i = 0, index = 0; i < 9; i++) {
		const row = [];
		for (let j = 0; j < 9; j++, index++) {
			row[j] = raw[index];
		}
		puzzle[i] = row;
	}
	puzzle[9] = rawNames[rawIndex];
	rawIndex++;

	sudokuSamples.unshift(puzzle);
}

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

const selector = createSelect(["-", ...names], (select) => {
	if (select.selectedIndex === 0) {
		for (let i = 0; i < 81; i++) {
			const cell = board.cells[i];
			cell.show = false;
			cell.setSymbol(0);
			board.startCells[i].symbol = 0;
		}
		localStorage.removeItem("gridName");
		saveGrid();
		draw();
		return;
	}

	selected = false;

	const index = select.selectedIndex - 1;
	board.setGrid(index < sudokus.length ? sudokus[index] : sudokuSamples[index - sudokus.length]);
	saveGrid(select.selectedIndex);
	draw();
});
selector.style.position = 'absolute';
selector.style.width = '40px';

const DataVersion = "0.2";

const saveGrid = (selectedIndex = null) => {
	if (selectedIndex !== null) localStorage.setItem("gridName", selectedIndex);
	localStorage.setItem("DataVersion", DataVersion);
	localStorage.setItem("startGrid", board.startCells.toStorage());
	localStorage.setItem("grid", board.cells.toStorage());
};
const loadGrid = () => {
	if (localStorage.getItem("DataVersion") !== DataVersion) return false;

	const selectedIndex = localStorage.getItem("gridName");
	if (selectedIndex !== null) {
		const selectedInt = parseInt(selectedIndex);
		if (selectedInt > 0 && selectedInt < selector.options.length) selector.selectedIndex = selectedInt;
	}

	const startGrid = localStorage.getItem("startGrid");
	if (!startGrid) return false;

	board.startCells.fromStorage(startGrid);

	const grid = localStorage.getItem("grid");
	if (grid) {
		board.cells.fromStorage(grid);
	}
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

	if (board.startCells[row * 9 + col].symbol !== 0) return;

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
	const selectedIndex = selectedRow * 9 + selectedCol;
	const symbol = board.cells[selectedIndex].symbol;
	if (symbol === index) {
		const cell = board.cells[selectedIndex];
		cell.show = false;
		cell.setSymbol(0);
	} else {
		board.cells[selectedIndex].setSymbol(index);
	}

	draw();

	saveGrid(selector.selectedIndex);
};
picker.addEventListener('click', pickerClick);

const pickerMarkerClick = (event) => {
	// event.preventDefault();

	if (!selected) return;

	const [r, c] = clickLocation(event);

	const symbol = r * 3 + c + 1;
	const selectedIndex = selectedRow * 9 + selectedCol;
	const cell = board.cells[selectedIndex];
	if (cell.show) {
		const had = cell.delete(symbol);
		if (!had) cell.add(symbol);
	} else {
		cell.clear();
		cell.add(symbol);
		cell.show = true;
	}

	draw();

	saveGrid(selector.selectedIndex);
};
pickerMarker.addEventListener('click', pickerMarkerClick);

const onFocus = () => {
	// console.log("onFocus");
	draw();
};
const offFocus = () => {

};
// window.addEventListener("focus", onFocus);
// window.addEventListener("blur", offFocus);

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
	selected = false;
	board.resetGrid();
	saveGrid();
	draw();
});
document.body.appendChild(clearButton);

const markerButton = document.createElement('button');
markerButton.appendChild(document.createTextNode("x"));
markerButton.style.position = 'absolute';
markerButton.style.width = '32px';
markerButton.style.height = '32px';

const fillSolve = (reduce = null) => {
	let uniqueRectangleReduced = 0;

	let nakedHiddenSetsReduced = [];
	let omissionsReduced = 0;
	let xWingReduced = 0;
	let swordfishReduced = 0;
	let xyWingReduced = 0;

	let phistomefelReduced = 0;
	let phistomefelFilled = 0;

	let bruteForceFill = false;

	let progress = false;
	let result = null;
	do {
		candidates(board.cells);

		progress = loneSingles(board.cells);
		if (progress) continue;

		progress = hiddenSingles(board.cells);
		if (progress) continue;

		progress = omissions(board.cells);
		if (progress) { omissionsReduced++; continue; }

		if (window.location.search === "?markers") continue;

		for (const type in REDUCE) {
			const strategy = REDUCE[type];
			if (reduce === strategy) continue;

			switch (strategy) {
				case REDUCE.Hidden_4:
					result = nakedHiddenSets(board.cells);
					if (result) {
						progress = true;
						nakedHiddenSetsReduced.push(result);
						// continue;
					}

					break;
				case REDUCE.UniqueRectangle:
					progress = uniqueRectangle(board.cells);
					if (progress) uniqueRectangleReduced++;

					break;
				case REDUCE.X_Wing:
					progress = xWing(board.cells);
					if (progress) xWingReduced++;

					break;
				case REDUCE.XY_Wing:
					progress = xyWing(board.cells);
					if (progress) xyWingReduced++;

					break;
				case REDUCE.Swordfish:
					progress = swordfish(board.cells);
					if (progress) swordfishReduced++;

					break;
				case REDUCE.Phistomefel:
					if (window.location.search === "?phist") {
						const { reduced, filled } = phistomefel(board.cells, true);
						progress = reduced > 0 || filled > 0;
						if (progress) {
							if (reduced > 0) phistomefelReduced++;
							if (filled > 0) phistomefelFilled++;
							// continue;
						}
					}

					break;

				default:
					break;
			}
			if (progress) break;
		}

		if (progress) continue;

		switch (reduce) {
			case REDUCE.Hidden_4:
				result = nakedHiddenSets(board.cells);
				if (result) {
					progress = true;
					nakedHiddenSetsReduced.push(result);
					continue;
				}

				break;
			case REDUCE.UniqueRectangle:
				progress = uniqueRectangle(board.cells);
				if (progress) { uniqueRectangleReduced++; continue; }

				break;
			case REDUCE.X_Wing:
				progress = xWing(board.cells);
				if (progress) { xWingReduced++; continue; }

				break;
			case REDUCE.XY_Wing:
				progress = xyWing(board.cells);
				if (progress) { xyWingReduced++; continue; }

				break;
			case REDUCE.Swordfish:
				progress = swordfish(board.cells);
				if (progress) { swordfishReduced++; continue; }

				break;
			case REDUCE.Phistomefel:
				if (window.location.search === "?phist") {
					const { reduced, filled } = phistomefel(board.cells, true);
					progress = reduced > 0 || filled > 0;
					if (progress) {
						if (reduced > 0) phistomefelReduced++;
						if (filled > 0) phistomefelFilled++;
						continue;
					}
				}

				break;

			default:
				break;
		}

		bruteForceFill = !isFinished();
		// bruteForce(board.cells);
	} while (progress);

	return {
		omissionsReduced,
		nakedHiddenSetsReduced,
		uniqueRectangleReduced,
		xWingReduced,
		xyWingReduced,
		swordfishReduced,
		phistomefelReduced,
		phistomefelFilled,
		bruteForceFill
	};
}

const consoleOut = (result) => {
	const phistomefelReduced = result.phistomefelReduced;
	const phistomefelFilled = result.phistomefelFilled;
	console.log("Omissions: " + result.omissionsReduced);
	console.log("Naked Hidden Sets: " + result.nakedHiddenSetsReduced.length);
	for (const nakedHiddenSet of result.nakedHiddenSetsReduced) {
		console.log("    Hidden: " + nakedHiddenSet.hidden + " Size: " + nakedHiddenSet.size);
	}
	console.log("Deadly Pattern Unique Rectangle: " + result.uniqueRectangleReduced);
	console.log("X Wing: " + result.xWingReduced);
	console.log("XY Wing: " + result.xyWingReduced);
	console.log("Swordfish: " + result.swordfishReduced);
	console.log("Phistomefel: " + phistomefelReduced + (phistomefelFilled > 0 ? " + " + phistomefelFilled + " filled" : ""));
	console.log("Brute Force: " + result.bruteForceFill);
}

markerButton.addEventListener('click', () => {
	for (const cell of board.cells) {
		cell.show = true;
	}

	const t = performance.now();

	const result = fillSolve();
	console.log("--- " + Math.round(performance.now() - t) / 1000);
	consoleOut(result);

	draw();
	saveGrid();
});
document.body.appendChild(markerButton);

const isFinished = () => {
	const cells = board.cells;
	for (let i = 0; i < 81; i++) {
		const cell = cells[i];
		if (cell.symbol === 0) return false;
	}
	return true;
}

const generateButton = document.createElement('button');
generateButton.appendChild(document.createTextNode("+"));
generateButton.style.position = 'absolute';
generateButton.style.width = '32px';
generateButton.style.height = '32px';

let running = false;
generateButton.addEventListener('click', () => {
	running = !running;
	const step = () => {
		// const { clueCount, grid } = sudokuGeneratorPhistomefel(board.cells);
		// draw();
		// const result = fillSolve();
		// if (!result.bruteForceFill && (result.phistomefelReduced > 0 || result.phistomefelFilled > 0)) {
		// 	console.log("Tries: " + totalPuzzles);
		// 	consoleOut(result);
		// 	console.log(grid.toString());
		// }

		const { clueCount, grid } = sudokuGenerator(board.cells);
		draw();
		const result = fillSolve(REDUCE.Swordfish);

		// REDUCE.Hidden_4
		// REDUCE.UniqueRectangle
		// REDUCE.X_Wing
		// REDUCE.XY_Wing
		// REDUCE.Swordfish		
		// REDUCE.Phistomefel
		// REDUCE.Brute_Force

		// if (!result.bruteForceFill && result.nakedHiddenSetsReduced && result.uniqueRectangleReduced === 0 && result.swordfishReduced === 0 && result.xyWingReduced === 0 && result.xWingReduced === 0) {
		// 	for (const nakedHiddenSet of result.nakedHiddenSetsReduced) {
		// 		if (nakedHiddenSet.hidden && nakedHiddenSet.size === 4) {
		// 			console.log("nakedHiddenSet hidden 4 Tries: " + totalPuzzles);
		// 			consoleOut(result);
		// 			console.log(grid.toString());
		// 		}
		// 	}
		// }
		if (!result.bruteForceFill && result.swordfishReduced > 0) {
			// const simple = result.xyWingReduced === 0 && result.xWingReduced === 0 && result.uniqueRectangleReduced === 0 && result.nakedHiddenSetsReduced.length === 0 && result.omissions === 0;
			const brutal = result.swordfishReduced > 1;
			// if (simple) console.log("Swordfish Isolated! Tries: " + totalPuzzles);

			// else console.log("Swordfish Tries: " + totalPuzzles);
			if (brutal) {
				console.log("Swordfish Brutal! Tries: " + totalPuzzles);
				consoleOut(result);
				console.log(grid.toString());
			}
		}

		if (running) window.setTimeout(step, 0);
	};
	if (running) step();

	// saveGrid();
});
document.body.appendChild(generateButton);

selector.style.transform = 'translateX(-50%)';
clearButton.style.transform = 'translateX(-50%)';
generateButton.style.transform = 'translateX(-50%)';
markerButton.style.transform = 'translateX(-50%)';

markerButton.style.touchAction = "manipulation";

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

		markerButton.style.bottom = '324px';
		markerButton.style.left = '96px';

		selector.style.bottom = '288px';
		selector.style.left = '96px';

		generateButton.style.bottom = '240px';
		generateButton.style.left = '96px';

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

		markerButton.style.bottom = '128px';
		markerButton.style.left = '50%';

		selector.style.bottom = '96px';
		selector.style.left = '50%';

		generateButton.style.bottom = '48px';
		generateButton.style.left = '50%';

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
