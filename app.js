import { FONT, board } from "./board.js";
import { consoleOut, fillSolve } from "./generator.js";
import { picker, pickerDraw, pickerMarker, pixAlign } from "./picker.js";

const raws = [
	"20 XYZ Wing",
	[0, 0, 0, 8, 4, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 2, 0, 9, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 3, 0, 0, 0, 0, 8, 0, 0, 0, 9, 0, 6, 0, 0, 1, 0, 4, 3, 0, 0, 0, 5, 6, 0, 9, 5, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	"Snake",
	[6, 0, 7, 9, 0, 1, 3, 0, 0, 9, 0, 3, 0, 7, 0, 0, 0, 0, 0, 5, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 6, 8, 0, 0, 0, 2, 5, 8, 9, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 7, 9, 0, 6, 0, 0, 0, 0, 6, 0, 4, 0, 0, 7, 0, 0, 3, 0, 0, 8, 0, 0],
	// "N5 H2 Deadly",
	// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 6, 0, 0, 0, 7, 0, 9, 0, 4, 0, 3, 0, 9, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 6, 3, 1, 0, 0, 0, 0, 8, 6, 0, 0, 4, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 7, 4, 0, 0, 9, 6, 0, 0, 0, 8, 0, 0, 0, 4, 0],
	// "N5",
	// [0, 0, 0, 4, 0, 6, 0, 0, 0, 0, 5, 4, 0, 9, 0, 2, 1, 0, 9, 0, 7, 0, 8, 2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 6, 0, 0, 0, 5, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 5, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 4, 0, 7, 0, 0, 1, 2, 7, 0, 0, 0, 9, 4],
	// "N53222 YWing Deadly",
	// [0, 0, 3, 0, 0, 0, 7, 0, 0, 6, 0, 0, 2, 0, 0, 5, 0, 0, 0, 9, 8, 0, 0, 1, 0, 0, 6, 9, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 5, 0, 0, 0, 3, 0, 0, 8, 7, 0, 6, 0, 0, 0, 0, 0, 4, 0, 0, 0, 7, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 9, 0, 4],
	// "N522 Deadly",
	// [0, 0, 0, 0, 5, 0, 7, 8, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 4, 0, 9, 0, 0, 0, 0, 1, 0, 5, 0, 7, 0, 0, 8, 0, 0, 0, 0, 0, 0, 6, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 1, 6, 9, 0, 0, 0, 2, 0, 0, 9, 3, 0, 8, 1, 0, 0, 4, 0, 2, 0, 0, 1, 0, 6, 0],
	// "N542",
	// [0, 0, 3, 0, 0, 0, 7, 8, 0, 0, 8, 6, 0, 0, 0, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 8, 1, 7, 0, 0, 9, 0, 0, 3, 5, 0, 0, 0, 0, 0, 5, 0, 4, 2, 0, 0, 0, 4, 6, 0, 7, 0, 0, 0, 9, 0, 0, 0, 0, 5, 0, 0, 8, 0, 0],
	// "N532",
	// [0, 0, 3, 0, 5, 0, 0, 0, 9, 8, 0, 9, 0, 7, 0, 5, 0, 4, 7, 0, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 4, 0, 7, 0, 0, 0, 8, 0, 0, 0, 2, 6, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 6, 2, 0, 0, 0, 5, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0],
	// "N5",
	// [0, 0, 3, 4, 5, 0, 0, 8, 9, 0, 0, 0, 0, 2, 0, 0, 5, 0, 0, 0, 0, 0, 3, 8, 0, 0, 0, 5, 0, 0, 0, 7, 1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 9, 0, 6, 0, 0, 3, 0, 0, 0, 0, 8, 0, 0, 4, 0, 0, 7, 0, 2, 5, 0, 8, 0, 0, 6, 0, 9, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	// "N5 YWing",
	// [1, 2, 0, 4, 0, 0, 7, 0, 0, 0, 4, 7, 0, 9, 8, 0, 0, 0, 0, 0, 0, 3, 0, 0, 4, 0, 0, 0, 0, 0, 0, 3, 0, 6, 7, 0, 0, 0, 0, 1, 7, 0, 5, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 1, 0, 0, 5, 0, 0, 6, 9, 0, 0, 0],
	// "N543",
	// [0, 2, 0, 4, 0, 0, 0, 8, 9, 0, 0, 0, 2, 0, 0, 0, 0, 3, 7, 5, 0, 0, 0, 0, 0, 0, 0, 9, 0, 2, 0, 3, 0, 0, 7, 0, 6, 0, 5, 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 8, 0, 3, 0, 0, 0, 1, 4, 0, 1, 0, 0, 4, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 0, 7],
	// "N52",
	// [1, 0, 3, 0, 5, 0, 0, 0, 0, 0, 0, 6, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 2, 0, 0, 0, 0, 7, 8, 0, 0, 0, 0, 0, 1, 0, 0, 5, 7, 0, 0, 0, 0, 0, 0, 0, 0, 6, 3, 0, 6, 7, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 6, 4, 0, 3, 7, 0, 8, 0, 0, 0, 0, 0, 1, 0],
	// "N532",
	// [0, 2, 0, 0, 0, 6, 7, 0, 0, 0, 8, 7, 2, 1, 0, 0, 0, 0, 6, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 4, 1, 0, 0, 0, 0, 3, 9, 0, 0, 0, 8, 0, 4, 8, 0, 3, 0, 6, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 5, 0, 2],
	// "P YWing",
	// [1, 2, 0, 0, 0, 0, 0, 8, 9, 0, 9, 0, 0, 0, 0, 0, 3, 5, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 9, 7, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 0, 0, 5, 0, 0, 4, 0, 0, 7, 1, 0, 8, 0, 0, 0, 5, 3, 8, 0, 0, 0, 0, 4, 0, 2, 1],
	// "P N43",
	// [0, 2, 0, 0, 5, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 9, 8, 7, 3, 0, 0, 0, 0, 2, 0, 0, 0, 9, 0, 3, 0, 0, 9, 1, 0, 0, 4, 7, 0, 3, 0, 4, 0, 0, 0, 5, 2, 0, 0, 0, 7, 8, 1, 4, 2, 0, 0, 0, 0, 0, 7, 0, 0, 0, 9, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
	// "Hidden 4",
	// [0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 9, 0, 3, 0, 0, 0, 0, 0, 0, 3, 7, 0, 0, 4, 8, 0, 0, 0, 7, 0, 0, 0, 0, 6, 0, 9, 0, 0, 0, 2, 0, 0, 0, 1, 5, 0, 0, 0, 0, 0, 8, 0, 8, 0, 0, 0, 0, 9, 0, 2, 3, 0, 0, 0, 4, 0, 0, 0, 0, 2, 7, 0, 0, 0, 9, 0, 3, 6],
	// "P YWing",
	// [0, 0, 0, 0, 5, 0, 0, 8, 0, 8, 9, 0, 7, 0, 0, 0, 4, 0, 0, 0, 0, 9, 3, 8, 5, 0, 0, 0, 0, 4, 6, 0, 9, 2, 0, 0, 3, 0, 9, 0, 0, 0, 4, 0, 0, 6, 1, 2, 0, 0, 0, 8, 0, 0, 0, 0, 1, 0, 9, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 6, 2],
	// "Pa",
	// [1, 2, 0, 0, 5, 0, 0, 8, 9, 6, 8, 0, 0, 0, 0, 0, 3, 5, 0, 0, 0, 0, 0, 8, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 2, 5, 0, 0, 3, 0, 0, 0, 6, 0, 1, 0, 0, 0, 0, 0, 6, 0, 9, 0, 0, 0, 8, 1, 0, 0, 0, 0, 0, 2, 6, 4, 6, 0, 0, 0, 0, 9, 5, 3],
	// "Pb",
	// [1, 2, 0, 0, 0, 0, 0, 8, 9, 7, 5, 0, 0, 0, 0, 0, 4, 1, 9, 0, 0, 0, 0, 1, 5, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 0, 6, 0, 0, 2, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 9, 0, 0, 8, 0, 0, 6, 4, 6, 8, 0, 0, 4, 0, 0, 7, 5],
	// "Pc",
	// [1, 0, 3, 0, 5, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 2, 7, 3, 4, 0, 0, 0, 0, 9, 0, 0, 4, 8, 0, 0, 7, 0, 4, 0, 0, 8, 9, 3, 0, 0, 0, 2, 0, 1, 0, 5, 6, 0, 0, 0, 0, 8, 4, 1, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 7, 0],
	// "Pd",
	// [0, 0, 0, 0, 0, 6, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 2, 1, 3, 6, 0, 0, 0, 3, 2, 0, 0, 7, 4, 0, 1, 7, 0, 6, 0, 0, 1, 9, 0, 0, 0, 0, 8, 0, 0, 0, 2, 0, 0, 0, 0, 4, 7, 8, 9, 3, 0, 6, 0, 0, 0, 3, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 8, 4, 0],
	// "Pe",
	// [0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 5, 0, 2, 0, 0, 9, 3, 8, 2, 1, 0, 0, 0, 9, 8, 0, 0, 5, 2, 4, 3, 0, 0, 1, 0, 0, 0, 6, 0, 0, 0, 0, 2, 0, 0, 0, 8, 0, 0, 0, 1, 4, 5, 3, 8, 9, 0, 0, 0, 0, 0, 0, 6, 1, 0, 0, 8, 0, 0, 0, 0, 0, 4, 0, 1, 0],
	// "Pf",
	// [0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 3, 0, 8, 0, 9, 1, 3, 0, 6, 0, 0, 0, 9, 4, 0, 8, 0, 3, 6, 0, 6, 0, 8, 0, 4, 0, 5, 0, 1, 0, 0, 5, 0, 0, 0, 8, 2, 0, 0, 0, 1, 8, 2, 4, 9, 0, 0, 0, 8, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0],
	// "Phist",
	// [0, 0, 0, 0, 0, 6, 0, 0, 0, 7, 5, 0, 0, 0, 9, 0, 0, 0, 0, 0, 8, 2, 1, 7, 6, 0, 0, 2, 0, 5, 0, 0, 0, 9, 0, 0, 0, 0, 1, 0, 0, 0, 8, 0, 4, 0, 3, 9, 0, 0, 0, 5, 0, 0, 0, 8, 7, 5, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 6, 0, 0, 0, 7, 0],
	// "Phist",
	// [0, 2, 0, 0, 0, 6, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 2, 8, 1, 6, 0, 0, 0, 0, 9, 0, 0, 7, 8, 0, 0, 0, 0, 6, 0, 0, 0, 2, 4, 0, 0, 3, 5, 0, 0, 0, 9, 7, 0, 0, 0, 1, 6, 0, 8, 5, 0, 0, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 1, 0],
	// "Phist N42",
	// [1, 2, 0, 0, 0, 6, 0, 0, 9, 4, 0, 0, 0, 0, 0, 0, 5, 3, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 8, 0, 7, 0, 0, 5, 0, 0, 8, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 8, 1, 0, 0, 0, 0, 0, 7, 2, 2, 3, 9, 0, 1, 0, 0, 4, 8],
	// "Phist Easy",
	// [0, 2, 0, 0, 0, 0, 0, 8, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 2, 9, 1, 0, 0, 0, 0, 6, 2, 0, 0, 0, 9, 1, 0, 0, 4, 5, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 8, 4, 0, 0, 0, 0, 8, 9, 7, 4, 6, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 1, 0, 0, 0, 0, 0, 5, 0],
	// "Phist 3N2",
	// [0, 2, 0, 0, 0, 6, 0, 0, 9, 0, 8, 0, 0, 0, 0, 0, 4, 0, 0, 0, 9, 7, 8, 3, 1, 0, 2, 3, 0, 2, 0, 0, 0, 9, 0, 0, 0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 1, 7, 0, 8, 0, 0, 0, 0, 1, 5, 3, 7, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 8, 3, 5, 9, 0, 0, 0, 0, 0],
	// "Phist N2",
	// [1, 2, 0, 0, 0, 0, 0, 8, 0, 8, 5, 0, 7, 0, 0, 0, 6, 1, 4, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 1, 6, 5, 0, 0, 0, 0, 8, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 0, 7, 0, 1, 8, 6, 7, 0, 0, 8, 5, 0, 2, 4],
	// "Naked Quint",
	// [0, 0, 0, 4, 0, 6, 0, 0, 0, 0, 0, 6, 2, 0, 0, 0, 3, 0, 0, 9, 7, 0, 0, 0, 0, 5, 0, 7, 0, 0, 0, 9, 4, 0, 0, 0, 2, 3, 0, 0, 6, 0, 0, 9, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 8, 0, 2, 5, 0, 0, 0, 0, 0, 0, 0, 6, 3, 3, 5, 0, 0, 0, 0, 0, 0, 7],
	// "Phistomefel Easy",
	// [0, 2, 0, 0, 0, 0, 0, 8, 0, 6, 0, 0, 0, 0, 8, 0, 2, 3, 0, 0, 0, 2, 9, 3, 6, 0, 0, 0, 0, 1, 7, 0, 0, 0, 0, 0, 4, 0, 8, 0, 0, 0, 3, 0, 0, 0, 0, 9, 0, 0, 0, 2, 4, 0, 0, 0, 2, 6, 1, 0, 8, 0, 0, 5, 0, 0, 0, 0, 0, 0, 3, 0, 8, 1, 0, 0, 0, 0, 0, 5, 6],
	// "Swordfish x2",
	// [0, 0, 0, 4, 0, 0, 0, 8, 0, 0, 0, 4, 9, 2, 0, 0, 0, 0, 6, 9, 0, 0, 0, 0, 5, 0, 0, 9, 0, 0, 0, 0, 0, 6, 0, 8, 0, 0, 7, 1, 4, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 3, 0, 0, 0, 9, 0, 0, 0, 0, 5, 0, 0, 0, 4, 3, 0, 0, 1, 0, 0, 0, 0, 7, 0],
	// "Phistomefel 1",
	// [1, 2, 0, 0, 0, 6, 0, 8, 9, 6, 9, 0, 0, 0, 0, 0, 5, 2, 0, 0, 7, 0, 0, 0, 6, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 7, 0, 0, 0, 9, 0, 0, 0, 4, 0, 0, 0, 0, 7, 3, 0, 0, 0, 0, 0, 0, 2, 0, 0, 8, 0, 0, 0, 8, 1, 0, 5, 0, 0, 0, 7, 3, 7, 5, 0, 0, 0, 0, 0, 9, 8],
	// "Phistomefel 2",
	// [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 9, 7, 2, 1, 4, 0, 6, 6, 0, 5, 0, 4, 0, 2, 0, 7, 0, 9, 4, 0, 0, 0, 8, 0, 0, 8, 0, 7, 0, 0, 5, 1, 0, 0, 0, 0, 2, 1, 6, 4, 9, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0],
	// "Phistomefel 3",
	// [1, 2, 0, 0, 0, 0, 0, 8, 9, 5, 7, 0, 0, 9, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 1, 8, 0, 0, 4, 0, 0, 0, 0, 8, 0, 0, 7, 0, 0, 0, 0, 0, 0, 5, 0, 9, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, 4, 7, 4, 3, 0, 0, 6, 0, 0, 9, 5],
	// "Phistomefel 4",
	// [0, 0, 0, 0, 5, 0, 0, 0, 9, 0, 0, 0, 2, 0, 3, 1, 0, 0, 0, 0, 5, 0, 8, 1, 3, 0, 6, 0, 7, 0, 0, 0, 0, 6, 5, 0, 0, 0, 4, 1, 0, 5, 2, 0, 0, 0, 0, 1, 0, 0, 0, 9, 0, 0, 0, 6, 2, 8, 9, 4, 5, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	// "Phistomefel 5",
	// [0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 8, 0, 6, 7, 2, 0, 1, 0, 0, 0, 0, 5, 0, 0, 0, 8, 0, 7, 0, 7, 9, 2, 0, 0, 3, 0, 0, 0, 0, 8, 0, 6, 0, 0, 0, 0, 0, 0, 1, 5, 3, 8, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 5, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0],
	// "Phistomefel 6",
	// [0, 0, 0, 4, 0, 0, 0, 0, 9, 8, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 6, 0, 0, 8, 5, 0, 0, 7, 0, 9, 0, 0, 0, 8, 0, 3, 0, 1, 5, 0, 0, 0, 9, 0, 0, 0, 0, 8, 0, 0, 0, 6, 0, 0, 0, 0, 2, 9, 3, 5, 1, 0, 0, 0, 9, 1, 0, 6, 0, 0, 0, 5, 0, 0, 0, 1, 0, 0, 0, 0, 0],
	// "Phistomefel Easy",
	// [0, 0, 0, 4, 0, 0, 0, 8, 9, 7, 0, 0, 0, 8, 0, 0, 6, 0, 0, 0, 6, 7, 1, 9, 3, 0, 0, 0, 0, 7, 0, 0, 0, 4, 0, 0, 0, 0, 9, 5, 0, 0, 0, 0, 0, 3, 0, 2, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 7, 1, 2, 0, 0, 0, 7, 0, 0, 0, 2, 0, 0, 8, 0, 6, 0, 0, 0, 0, 0, 4, 0],
	// "Phistomefel 8",
	// [0, 2, 0, 0, 0, 0, 0, 0, 9, 0, 0, 8, 0, 0, 0, 5, 0, 0, 0, 0, 9, 1, 8, 3, 4, 2, 0, 3, 0, 6, 0, 4, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 9, 0, 0, 5, 0, 1, 7, 0, 0, 3, 0, 0, 0, 0, 4, 5, 3, 8, 6, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 8, 0, 0, 0, 4, 0, 0, 0],
	// "Phistomefel - 2 Y Wings",
	// [1, 2, 0, 0, 0, 0, 0, 8, 0, 7, 5, 0, 0, 0, 0, 0, 1, 6, 0, 0, 6, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 9, 0, 0, 0, 0, 0, 7, 0, 5, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 6, 9, 1, 0, 1, 9, 0, 0, 0, 0, 4, 5],
	// "Phistomefel Swordfish",
	// [1, 2, 0, 0, 5, 0, 0, 8, 9, 6, 5, 0, 0, 3, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 5, 6, 0, 3, 0, 0, 0, 0, 0, 7, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 8, 3, 0, 0, 1, 0, 0, 5, 2, 2, 1, 0, 0, 0, 0, 0, 0, 7],
	// "Phist",
	// [1, 2, 0, 0, 0, 0, 0, 8, 0, 9, 0, 0, 0, 8, 7, 0, 1, 3, 0, 0, 0, 1, 0, 9, 4, 0, 0, 0, 0, 2, 7, 6, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 3, 9, 7, 0, 0, 0, 1, 0, 0, 8, 5, 0, 0, 2, 7, 0, 0, 0, 0, 0, 9, 1, 8, 0, 0, 0, 0, 0, 0, 4, 7],
	// "Phist",
	// [1, 2, 0, 4, 0, 0, 0, 8, 9, 4, 5, 6, 0, 0, 8, 0, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 7, 0, 0, 0, 0, 6, 0, 1, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 0, 0, 9, 0, 1, 4, 2, 4, 1, 0, 0, 0, 0, 3, 8],
	// "Phist Easy",
	// [0, 0, 3, 0, 5, 0, 7, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 7, 8, 3, 9, 1, 0, 4, 0, 0, 1, 0, 4, 0, 3, 0, 2, 0, 7, 4, 0, 0, 0, 5, 1, 0, 0, 0, 8, 0, 0, 7, 4, 0, 0, 0, 0, 5, 2, 9, 4, 8, 0, 0, 4, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	// "Phist",
	// [0, 2, 0, 0, 0, 6, 0, 8, 9, 5, 8, 0, 3, 0, 0, 0, 0, 6, 0, 0, 6, 2, 0, 1, 0, 0, 0, 0, 4, 1, 0, 2, 0, 6, 0, 0, 0, 0, 9, 0, 3, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 5, 0, 4, 0, 0, 2, 5, 0, 3, 9, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 4, 1],
	// "Phist",
	// [0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 4, 0, 9, 8, 3, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 8, 0, 0, 2, 9, 0, 0, 0, 0, 1, 6, 0, 0, 2, 0, 0, 0, 0, 2, 1, 0, 8, 5, 0, 6, 0, 0, 0, 0, 0, 7, 0, 9, 2, 0, 4, 0, 0, 0, 0, 0, 0, 0],
	// "Phist",
	// [0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 7, 8, 9, 1, 2, 0, 0, 0, 1, 8, 0, 0, 9, 6, 7, 0, 7, 0, 4, 0, 0, 2, 5, 0, 8, 0, 0, 2, 0, 0, 0, 9, 0, 0, 0, 0, 5, 7, 1, 4, 8, 9, 0, 0, 8, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 1, 5, 0],
	// "Phist",
	// [1, 2, 0, 0, 0, 0, 0, 8, 9, 4, 6, 0, 0, 0, 0, 3, 2, 1, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 4, 1, 7, 0, 0, 0, 0, 0, 0, 0, 0, 5, 9, 0, 0, 0, 7, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1, 0, 0, 0, 0, 6, 7, 4, 2, 7, 0, 6, 0, 0, 0, 9, 3],
	// "Phist",
	// [0, 0, 0, 0, 0, 6, 0, 8, 0, 0, 4, 0, 0, 7, 0, 0, 0, 2, 0, 0, 7, 3, 9, 2, 1, 0, 0, 5, 0, 2, 8, 0, 0, 4, 0, 7, 0, 0, 9, 0, 4, 0, 3, 0, 0, 0, 0, 4, 0, 0, 3, 6, 0, 0, 4, 0, 1, 6, 8, 9, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 7, 0, 0, 0, 0, 0],
	// "Phist",
	// [0, 0, 0, 0, 0, 0, 7, 0, 9, 0, 0, 0, 0, 0, 8, 0, 3, 0, 0, 0, 8, 3, 1, 7, 5, 0, 0, 0, 0, 4, 1, 0, 5, 9, 0, 0, 6, 0, 9, 0, 0, 0, 3, 5, 0, 0, 0, 7, 0, 0, 0, 2, 0, 0, 0, 0, 5, 7, 8, 9, 1, 0, 0, 0, 9, 0, 0, 0, 1, 0, 0, 0, 3, 0, 0, 5, 0, 0, 0, 0, 0],
	// "Phist Easy",
	// [1, 2, 0, 0, 5, 0, 0, 8, 9, 6, 8, 0, 9, 0, 0, 0, 3, 5, 0, 0, 9, 0, 8, 0, 2, 4, 0, 0, 6, 0, 0, 0, 5, 0, 0, 0, 0, 0, 8, 0, 0, 9, 0, 0, 0, 0, 0, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 9, 0, 0, 8, 1, 0, 0, 0, 0, 0, 5, 3, 9, 3, 0, 0, 0, 0, 0, 1, 2],
	// "Phist",
	// [0, 2, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 4, 7, 8, 2, 1, 0, 0, 0, 0, 8, 2, 0, 0, 9, 0, 0, 0, 0, 6, 0, 0, 0, 2, 3, 0, 0, 0, 2, 0, 9, 4, 0, 0, 0, 0, 0, 9, 8, 4, 5, 6, 0, 0, 6, 5, 0, 0, 0, 3, 0, 9, 0, 0, 4, 0, 0, 0, 0, 0, 2, 0],
	// "Phist",
	// [1, 2, 0, 0, 0, 0, 0, 8, 9, 4, 5, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 3, 0, 0, 0, 1, 0, 8, 0, 6, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 8, 0, 0, 3, 8, 4, 6, 0, 0, 3, 0, 9, 1, 3, 1, 0, 0, 0, 0, 0, 6, 5],
	// "Phist",
	// [0, 0, 0, 4, 0, 0, 0, 8, 0, 0, 5, 0, 0, 0, 0, 0, 3, 0, 0, 0, 6, 3, 7, 9, 5, 0, 0, 0, 0, 2, 0, 0, 0, 1, 6, 5, 0, 0, 1, 0, 0, 0, 9, 2, 0, 0, 0, 5, 1, 0, 0, 8, 0, 0, 0, 0, 9, 7, 6, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 8, 0, 2, 0, 1],
	// "20",
	// '003006700070000500040018000650100000000000200000000008000000003500002000280900004'.split(''),
	// "20",
	// '023006000080000010000170040060000002910000008000000630000800000000000970000501000'.split(''),
	// "20",
	// '000400700050000010000800300000000000805207000430000600000005000002001007900000402'.split(''),
	// "20",
	// '100006000000000013908000600006000200030070000070003800000140900000930000050000000'.split(''),
	// "20",
	// '000000000000020104600000002002080000004000096000063000000048001090000005750000030'.split(''),
	// "20 X",
	// '100450000000000060090000002006000090002130007000040000000802001089000500000000006'.split(''),
	// "20",
	// '020050009600008000000000000004010000070300920000007008000040000090000370061080000'.split(''),
	// "20",
	// '003000000000700001000100006050000007010590000460003008070000000502000300000010900'.split(''),
	// "20",
	// '020000080007390010060000000002000500589000072000004000000005900801000000000200000'.split(''),
	// "20 X",
	// '000000780400200000065100000800000000000500000000002904040090603001800005000000400'.split(''),
	// "20",
	// '020050080007000640000308000000000000000002008030040010902001070000030000006000900'.split(''),
	// "20",
	// '100000000089001000000000003000042000050000697000000500060000300000090102005704000'.split(''),
	// "41.6805 YWing N2",
	// '000000709050000043000002000000000000000049000090800675530010000800000027700500800'.split(''),
	// "Jellyfish2 N2 YWing",
	// '103400700800030056060900000000090000000500090009004002001000500300080000000100478'.split(''),
	// "Jellyfish3 1258",
	// '003000000050080100080902000800500000400620090091040056000000900007000240000078001'.split(''),
	// "Jellyfish4 N2 Deadly YWing",
	// '000000700060020005009000026800500000000700800001630900500004090086300000002007010'.split(''),
	// "Jellyfish5 N2",
	// '000000700000010340804000000302048600090000410000060000908020000007000006041680000'.split(''),
	// "Jellyfish3",
	// '100006700070000000608000540000740000785000000040000102200090005001020003050800000'.split(''),
	// "Jellyfish1",
	// '023000700400000005570003604040002008000000302900075000200508000001600000008000050'.split(''),	
	// "Jellyfish4",
	// '003000080000000005090370000030020600500900040207010050600000892080005006000600000'.split(''),
	// "Jellyfish9",
	// '000400089500700040408000002005002000030140500002030100001000008300080270000000000'.split(''),
	// "Jellyfish5 0367",
	// '103006080006900400000080000072091000030640002040000000009000007200030060008007503'.split(''),
	// "Jellyfish5 1478",
	// '000400709000071240000800000059000010007008000401902000790000300000040020000003170'.split(''),
	// "Jellyfish2",
	// '020000000000130064860090000401700000000000070680010000000085001500640090000000408'.split(''),
	// "Jellyfish3",
	// '000000080009720000000001240800270590000049002007005800000000600381600050700004020'.split(''),
	// "Jellyfish5",
	// '103000000087010400060007000090300000040900008000004200004000030730002906000560007'.split(''),
	// "Jellyfish1",
	// '000050709050000030607000020400300000080072000092008060070000900204007000960500000'.split(''),
	// "Jellyfish8",
	// '020006000500700340800090100001005270050000000004100000402070030000000017090000005'.split(''),
	// "Seed 1",
	// '123456789845397162967812534291648357654173928738529641486931275312785496579264813'.split(''),
	// "Seed 2",
	// '000406080090803400004907061000680040048091000200074010005760124710040030400130597'.split(''),
	// "N532 Deadly",
	// '000406780000000452080020000070000003340000600200000010000009004010542030060130000'.split(''),
	// "N5 Simple",
	// '100056000090000400000920360000080000008000670006304900830700000700042000002030000'.split(''),
	"Phist 2YWing Deadly Naked4322",
	'100056080500000000064109300200000890000000000038001200402000010000070908050000060'.split(''),
	// "N5 Swordfish YWing",
	// '100050000400000000009831400000003801006700302000000900008602000000000007630019008'.split(''),
	// "N5 YWing",
	// '100000089000130400090020300840500070000860000500010000000000803000670200060000540'.split(''),
	// "N532",
	// '103000080400021000007090000000030050000108000090500670040000060700000805050000027'.split(''),
	// "N5 Deadly",
	// '000050009000098040000700000030014008600000090005632000300500000000000901080043500'.split(''),
	// "N52 yWing Deadly",
	// '023400700600008400000007000037004090500709008000000060090000620810000000000005000'.split(''),
	// "N5332 Deadly",
	// '003000780000000510400000000350000000010780006080960100002800005000040600030070040'.split(''),
	// "N5432",
	// '103000080005090100760000500006040030050001090001600070000008300000000000004513800'.split(''),
	// "N52 yWing",
	// '000050000050008023000007410006000500090071004075034200000902000031000900000800000'.split(''),
	// "N53",
	// '000006009040009300805007000000800030000030040000025000970000020080040073030000001'.split(''),
	"XYZ Y Wing",
	'000000080850009010060030004001020000030001027000790500000005800000300070010800063'.split(''),
];
const sudokuSamples = [];
for (let rawIndex = 0; rawIndex < raws.length; rawIndex += 2) {
	const name = raws[rawIndex];
	const raw = raws[rawIndex + 1];
	const puzzle = [];
	for (let i = 0, index = 0; i < 9; i++) {
		const row = [];
		for (let j = 0; j < 9; j++, index++) {
			row[j] = raw[index];
		}
		puzzle[i] = row;
	}
	puzzle[9] = name;
	sudokuSamples.push(puzzle);
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
	board.setGrid(index < sudokuSamples.length ? sudokuSamples[index] : sudokuSamples[index - sudokuSamples.length]);
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

markerButton.addEventListener('click', () => {
	for (const cell of board.cells) {
		cell.show = true;
	}

	const result = fillSolve(board.cells, window.location.search);
	console.log("-----");
	for (const line of consoleOut(result)) console.log(line);

	draw();
	saveGrid();
});
document.body.appendChild(markerButton);

const generateButton = document.createElement('button');
generateButton.appendChild(document.createTextNode("+"));
generateButton.style.position = 'absolute';
generateButton.style.width = '32px';
generateButton.style.height = '32px';

let worker = null;
generateButton.addEventListener('click', () => {
	if (worker) {
		worker.terminate();
		worker = null;
	} else {
		try {
			worker = new Worker("worker.js", { type: "module" });
			worker.postMessage({ cells: board.cells.toData(), search: window.location.search });
			worker.onmessage = (e) => {
				board.cells.fromData(e.data.cells);
				if (e.data.message) {
					for (const line of e.data.message) console.log(line);
				}
				draw();
			};
		} catch (error) {
			console.error(error);
		}
	}
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
