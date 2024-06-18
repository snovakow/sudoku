const appInitialize = (title, version, css) => {
	document.title = title;

	if (css) {
		const link = document.createElement('link');
		link.rel = "stylesheet";
		link.href = css + "?" + version;
		document.head.appendChild(link);
	}

	import("./app.js").then(module => {
		// console.log(module);
	});

	console.log(title + " Version: " + version);
}
appInitialize("Sudoku", "0.3.2");

document.body.style.color = 'black';
document.body.style.backgroundColor = 'white';
