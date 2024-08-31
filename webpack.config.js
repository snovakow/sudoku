const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
	mode: "production",
	entry: './main.js',
	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, '../../live/sudoku'),
		chunkFilename: '[chunkhash].js',
		clean: true,
		publicPath: ''
	},
	plugins: [
		new CopyPlugin({
			patterns: [
				{ from: '../sudokulib/sudoku.php', to: '../sudokulib/sudoku.php' },
				{ from: 'index.html', to: 'index.html' }
			]
		})
	]
};
