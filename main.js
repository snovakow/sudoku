const src = document.currentScript.src;
import("../snovakow/main.js").then(
	main => {
		const gtag = (window.location.host === "snovakow.com") ? 'G-DV1KLMY93N' : false;
		main.initialize(src, gtag).then(() => import("./app.js"));
	}
);
