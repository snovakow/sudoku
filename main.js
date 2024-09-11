const src = document.currentScript.src;
import("../snovakow/lib/main.js").then(
	main => {
		const urlComicSans = 'url(../snovakow/assets/fonts/comic-sans-ms/design.graffiti.comicsansms.ttf)';
		const urlOpenSansRegular = 'url(../snovakow/assets/fonts/Open_Sans/static/OpenSans-Regular.ttf)';
		const urlOpenSansLight = 'url(../snovakow/assets/fonts/Open_Sans/static/OpenSans-Light.ttf)';

		const fontOpenSansLight = new FontFace("LIGHT", urlOpenSansLight);
		const fontOpenSansRegular = new FontFace("REGULAR", urlOpenSansRegular);
		const fontComicSans = new FontFace("COMIC", urlComicSans);

		document.fonts.add(fontOpenSansLight);
		document.fonts.add(fontOpenSansRegular);
		document.fonts.add(fontComicSans);

		fontOpenSansLight.load();
		fontOpenSansRegular.load();
		fontComicSans.load();

		document.fonts.ready.then(() => {
			const gtag = (window.location.host === "snovakow.com") ? 'G-DV1KLMY93N' : false;
			const options = { main: src, gtag };
			main.initialize(options).then(() => import("./app.js"));
		});
	}
);
