var webpack = require('webpack');
var path = require('path');
var gutil = require('gulp-util');
var TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const defaultConfig = require('@wordpress/scripts/config/webpack.config');

var CopyPlugin = require('copy-webpack-plugin');
var outputPath = path.resolve(__dirname, '../js/');

const externals = {};
// Define WordPress dependencies
const wpDependencies = ['components', 'element', 'blocks', 'utils', 'date'];
// Setup externals for all WordPress dependencies
wpDependencies.forEach((wpDependency) => {
	externals['@wordpress/' + wpDependency] = {
		this: ['wp', wpDependency],
	};
});

module.exports = (env) => {
	var production = true;
	var debugType = 'development';
	if (gutil.env && gutil.env.NODE_ENV == 'production') {
		production = true;
		debugType = 'production';
	}
	var config = {
		...defaultConfig,
		optimization: {
			emitOnErrors: true,
			concatenateModules: false,
			removeAvailableModules: false,
			removeEmptyChunks: false,
			splitChunks: false,
		},
		/*
		 * app.ts represents the entry point to your web application. Webpack will
		 * recursively go through every "require" statement in app.ts and
		 * efficiently build out the application's dependency tree.
		 */
		entry: {
			app: ['./ts/app.tsx'],
		},
		externals: {
			// react: 'react',
			// 'react-dom': 'ReactDOM',
			...externals,
		},
		/*
		 * The combination of path and filename tells Webpack what name to give to
		 * the final bundled JavaScript file and where to store this file.
		 */
		plugins: [
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(gutil.env && gutil.env.NODE_ENV == 'production' ? 'production' : 'development'),
			}),
			// new webpack.IgnorePlugin({resourceRegExp: /react$|react-dom$|es6-promise$|components$/}),
			new webpack.ProvidePlugin({
				Components: 'components',
				// ReactDOM: 'react-dom',
				// React: 'react',
			}),
			// new CopyPlugin({
			// 	patterns: [
			// 		{ from: 'node_modules/react/umd/react.development.js', to: outputPath },
			// 		{ from: 'node_modules/react-dom/umd/react-dom.development.js', to: outputPath },
			// 		{ from: 'node_modules/react/umd/react.production.min.js', to: outputPath },
			// 		{ from: 'node_modules/react-dom/umd/react-dom.production.min.js', to: outputPath },
			// 		// { from: 'node_modules/es6-promise/dist/es6-promise.min.js', to: outputPath },
			// 		// { from: 'node_modules/react-router-dom/umd/react-router-dom.min.js', to: outputPath },
			// 		// { from: 'node_modules/immutable/dist/immutable.min.js', to: outputPath },
			// 	],
			// }),
		],
		output: {
			//libraryTarget: 'amd',
			libraryExport: 'default',
			path: outputPath,
			filename: '[name].js',
		},

		/*
		 * resolve lets Webpack now in advance what file extensions you plan on
		 * "require"ing into the web application, and allows you to drop them
		 * in your code.
		 */
		resolve: {
			modules: ['node_modules', __dirname],
			extensions: ['.ts', '.tsx', '.jsx', '.js'],
			plugins: [
				new TsconfigPathsPlugin({
					configFile: path.resolve(__dirname, './tsconfig.json'),
				}),
			],
		},
		devtool: 'eval-source-map',
		module: {
			/*
			 * Each loader needs an associated Regex test that goes through each
			 * of the files you've included (or in this case, all files but the
			 * ones in the excluded directories) and finds all files that pass
			 * the test. Then it will apply the loader to that file. I haven't
			 * installed ts-loader yet, but will do that shortly.
			 */
			rules: [
				{
					test: /\.(ts|tsx)?$/,
					use: {
						loader: 'ts-loader',
						options: {
							transpileOnly: true,
						},
					},
				},
				{
					test: /\.css$/,
					use: {
						loader: 'css-loader',
					},
				},
			],
		},
		mode: debugType,
		context: __dirname,
		target: 'web',
		performance: {
			maxAssetSize: 100000,
		},
		stats: {
			modulesSort: '!size',
			excludeModules: [/copy-webpack-plugin/],
		},
	};

	if (production) {
		config.mode = 'production';
		config.devtool = false;
		config.plugins.push(new webpack.optimize.AggressiveMergingPlugin());
	}
	return config;
};
