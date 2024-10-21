const headerHeight = 32;
const iconSize = headerHeight;
const buttonSize = 48;

const mainBar = document.createElement('DIV');
const toolBar = document.createElement('DIV');
const pickerBar = document.createElement('DIV');
const autoBar = document.createElement('DIV');

mainBar.style.position = 'absolute';
mainBar.style.height = iconSize + 'px';
mainBar.style.display = 'flex';
mainBar.style.flexDirection = 'row';
mainBar.style.flexWrap = 'nowrap';

toolBar.style.position = 'absolute';
toolBar.style.height = iconSize + 'px';
toolBar.style.display = 'flex';
toolBar.style.flexDirection = 'row';
toolBar.style.flexWrap = 'nowrap';

pickerBar.style.position = 'absolute';
pickerBar.style.display = 'flex';
pickerBar.style.flexWrap = 'nowrap';

pickerBar.style.height = buttonSize + 'px';
pickerBar.style.flexDirection = 'row';
const pickerBarLandscape = (state) => {
	if (state) {
		pickerBar.style.removeProperty('width');
		pickerBar.style.height = buttonSize + 'px';
		pickerBar.style.flexDirection = 'row';
	} else {
		pickerBar.style.removeProperty('height');
		pickerBar.style.width = buttonSize + 'px';
		pickerBar.style.flexDirection = 'column';
	}
}

autoBar.style.position = 'absolute';
autoBar.style.display = 'flex';
autoBar.style.flexWrap = 'nowrap';
const autoBarLandscape = (state) => {
	if (state) {
		autoBar.style.flexDirection = 'row';
	} else {
		autoBar.style.flexDirection = 'column';
	}
}

const createIcon = (src, size = iconSize) => {
	const backing = document.createElement("DIV");
	backing.style.width = size + "px";
	backing.style.height = size + "px";

	const ratio = size * 0.8;
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

const backing = document.createElement('DIV');
backing.style.position = 'fixed';
backing.style.top = '10%';
backing.style.left = '0%';
backing.style.backgroundColor = 'blue';
backing.style.zIndex = 1;

const menu = createIcon("./icons/menu.svg");
const home = createIcon("./icons/home.svg");
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

const markerButton = createIcon("./icons/edit.svg", buttonSize);
const deleteButton = createIcon("./icons/backspace.svg", buttonSize);
pickerBar.appendChild(markerButton);
pickerBar.appendChild(deleteButton);

// autoBar.appendChild(markerButton);
// autoBar.appendChild(deleteButton);

toolBar.appendChild(settings);
if (document.fullscreenEnabled) {
	const fullscreen = createIcon("./icons/fullscreen.svg");
	const fullscreenExit = createIcon("./icons/fullscreen_exit.svg");

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
	document.addEventListener("fullscreenchange", () => {
		updateFullscreen();
	});
	document.addEventListener("fullscreenerror", () => {
		updateFullscreen();
	});
}

export { backing, mainBar, toolBar, pickerBar, autoBar, headerHeight };
export { newPuzzle, reset, settings, menu, markerButton, deleteButton };
export { pickerBarLandscape };