const { nodeResolve } = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const terser = require("@rollup/plugin-terser");
const replace = require("@rollup/plugin-replace");
const path = require("path");
const fs = require("fs");
const sucrase = require("@rollup/plugin-sucrase");

const extensions = [".js", ".ts", ".tsx"];

const ScriptsWalker = function () {
	this.statSync = function (filename) {
		try {
			return fs.statSync(filename);
		} catch (e) {
			// console.error(e);
		}
		return false;
	};
	this.browse = function (filename) {
		try {
			return fs.readdirSync(filename);
		} catch (e) {
			// console.error(e);
		}
		return [];
	};
	/**
 * 
 * @param {string} dir 
 * @param {array} include 
 * @param {array} exclude 
 * @param {function} onFinish 
 * @param {function} onParse 
 * @returns Array<{
                namespace: string,
                type: string,
                name: string,
                path: string,
                compiler: string,
                root: string,
                copy: boolean,
                backend: boolean,
                frontend: boolean,
                account: boolean,
                bundle: boolean
            }>
 */
	this.walk = (dir, include, exclude) => {
		var files = [];

		try {
			var list = this.browse(dir);

			list.forEach((dirMain) => {
				if ((include && include.indexOf(dirMain) < 0) || (exclude && exclude.indexOf(dirMain) >= 0) || dirMain.startsWith(".")) {
					return;
				}
				var stat = this.statSync(dir + "/" + dirMain + "/ts/");
				if (stat && stat.isDirectory()) {
					stat = this.statSync(dir + "/" + dirMain + "/ts/module.json");
					if (stat) {
						var plugin = require(dir + "/" + dirMain + "/ts/module.json");
						if (plugin.frontend && plugin.frontend.ts && plugin.frontend.ts.src) {
							Object.keys(plugin.frontend.ts.src).map((key) => {
								files.push([key, dir + "/" + dirMain + "/ts/" + plugin.frontend.ts.src[key]]);
							});
						}
					}
				}
			});
			return files;
		} catch (e) {
			console.error(e);
		}
		if (!list.length) {
			console.error("No Plugins Found");
		}

		return files;
	};
};

let production = !(process.env.dev == "true");
let walker = new ScriptsWalker();
let files = walker.walk(path.resolve(__dirname, "../../inc"), null, ["node_modules"]);
files.push(["theme", path.resolve(__dirname, "./scripts/theme.ts")]);
console.log("TS Files:", files);

module.exports = files.map(([key, file]) => {
	return {
		input: file,
		output: {
			file: path.resolve(__dirname, "../js/" + key.toLowerCase() + ".js"),
			format: "iife",
			name: key.toLowerCase(),
		},

		plugins: [
			
			sucrase({
				exclude: ["./node_modules/**"],
				transforms: ["typescript"],
				production,
			}),
            nodeResolve({ extensions }),
			replace({
				"process.env.NODE_ENV": JSON.stringify(production ? "production" : "development"),
				ENVIRONMENT: JSON.stringify(production ? "production" : "development"),
				preventAssignment: true,
			}),

			production && terser(),
		],
	};
});
