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
				{ from: 'icons', to: 'icons' },
				{ from: '../sudokulib/generate.html', to: '../sudokulib/generate.html' },
				{ from: '../sudokulib/sudoku.php', to: '../sudokulib/sudoku.php' },
				{ from: '../sudokulib/feed.php', to: '../sudokulib/feed.php' },
				{ from: '../sudokulib/generate.php', to: '../sudokulib/generate.php' },
				{ from: '../sudokulib/tables.php', to: '../sudokulib/tables.php' },
				{ from: '../sudokulib/worker.js', to: '../sudokulib/worker.js' },
				{ from: '../sudokulib/Grid.js', to: '../sudokulib/Grid.js' },
				{ from: '../sudokulib/generator.js', to: '../sudokulib/generator.js' },
				{ from: '../sudokulib/solver.js', to: '../sudokulib/solver.js' },
				{ from: '../sudokulib/process.js', to: '../sudokulib/process.js' },
				{ from: 'about.html', to: 'about.html' },
				{ from: 'index.html', to: 'index.html' }
			]
		})
	]
};
