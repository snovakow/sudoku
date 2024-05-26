const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
	mode: "production",
	entry: './main.js',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, './build'),
		chunkFilename: '[chunkhash].js',
		clean: true,
		publicPath: ''
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: `./index.html`, to: 'index.html' },
				// { from: `${srcDir}/favicon_16x16.png`, to: 'favicon_16x16.png' },
				// { from: `${srcDir}/favicon_32x32.png`, to: 'favicon_32x32.png' },
				// { from: `${srcDir}/favicon_81x81.png`, to: 'favicon_81x81.png' },
				// { from: `${srcDir}/images`, to: 'images' }
			]
		})
	],
};
