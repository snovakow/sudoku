const headerHeight = 32;
const iconSize = headerHeight;

const mainBar = document.createElement('DIV');
const toolBar = document.createElement('DIV');

mainBar.style.position = 'absolute';
mainBar.style.height = headerHeight + 'px';
mainBar.style.display = 'flex';
mainBar.style.flexDirection = 'row';
mainBar.style.flexWrap = 'nowrap';

toolBar.style.position = 'absolute';
toolBar.style.height = headerHeight + 'px';
toolBar.style.display = 'flex';
toolBar.style.flexDirection = 'row';
toolBar.style.flexWrap = 'nowrap';

const createIcon = (src) => {
	const backing = document.createElement("DIV");
	backing.style.width = iconSize + "px";
	backing.style.height = iconSize + "px";

	const ratio = iconSize * 0.8;
	const icon = new Image();
	icon.src = src;
	icon.style.position = "relative";
	icon.style.left = "50%";
	icon.style.top = "50%";
	icon.style.width = ratio + "px";
	icon.style.height = ratio + "px";
	icon.style.transform = "translate(-50%, -50%)";
	backing.appendChild(icon);

	return backing;
}

const markerButton = createIcon("./icons/edit.svg");

const backing = document.createElement('DIV');
backing.style.position = 'fixed';
backing.style.top = '10%';
backing.style.left = '0%';
backing.style.backgroundColor = 'blue';
backing.style.zIndex = 1;

const menu = createIcon("./icons/menu.svg");
const home = createIcon("./icons/home.svg");
const fullscreen = createIcon("./icons/fullscreen.svg");
const fullscreenExit = createIcon("./icons/fullscreen_exit.svg");
const settings = createIcon("./icons/settings.svg");
const reset = createIcon("./icons/replay.svg");
const newPuzzle = createIcon("./icons/add_box.svg");
backing.appendChild(home);
backing.appendChild(document.createTextNode("Home"));
backing.appendChild(document.createTextNode("Singles"));
backing.appendChild(document.createTextNode("Naked Pairs"));
backing.appendChild(document.createTextNode("Naked Triples"));
backing.appendChild(document.createTextNode("Naked Quads"));
backing.appendChild(document.createTextNode("Hidden Pairs"));
backing.appendChild(document.createTextNode("Hidden Triples"));
backing.appendChild(document.createTextNode("Hidden Quads"));
backing.appendChild(document.createTextNode("Intersection Removal (Omissions)"));
backing.appendChild(document.createTextNode("Deadly Pattern (Unique Rectangle)"));
backing.appendChild(document.createTextNode("Y Wing"));
backing.appendChild(document.createTextNode("XYZ Wing"));
backing.appendChild(document.createTextNode("X Wing"));
backing.appendChild(document.createTextNode("Swordfish"));
backing.appendChild(document.createTextNode("Jellyfish"));
backing.appendChild(document.createTextNode("Puzzles none of these techniques can solve"));

mainBar.appendChild(menu);
mainBar.appendChild(newPuzzle);
mainBar.appendChild(reset);

toolBar.appendChild(settings);
toolBar.appendChild(fullscreen);
toolBar.appendChild(fullscreenExit);

const updateFullscreen = () => {
	if (document.fullscreenElement) {
		fullscreen.style.display = 'none';
		fullscreenExit.style.display = 'block';
	} else {
		fullscreen.style.display = 'block';
		fullscreenExit.style.display = 'none';
	}
}
const toggleFullscreen = () => {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
	} else if (document.exitFullscreen) {
		document.exitFullscreen();
	}
}
updateFullscreen();

fullscreen.addEventListener("click", () => {
	toggleFullscreen();
});
fullscreenExit.addEventListener("click", () => {
	toggleFullscreen();
});
document.addEventListener("fullscreenchange", (event) => {
	updateFullscreen();
});
// document.addEventListener("fullscreenerror", (event) => {
// 	console.log(event);
// });

export { backing, mainBar, toolBar, newPuzzle, reset, settings, menu, markerButton, headerHeight };