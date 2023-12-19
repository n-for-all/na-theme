//Gulp to compile typescript
console.log(new Date().getTime());
var gulp = require("gulp");
var gutil = require("gulp-util");
var sass = require("gulp-sass")(require("sass"));
var sourcemaps = require("gulp-sourcemaps");
var { rollup, watch } = require("rollup");
var autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
var plumber = require("gulp-plumber");
var browserSync = require("browser-sync").create();
const path = require("path");
const { doesNotMatch } = require("assert");

gulp.task("sass:watch", function () {
	gulp.watch(["./scss/*.scss"], gulp.parallel("sass"));
});

gulp.task("sass", function (done) {
	var sass_files = ["./scss/*.scss", "./scss/**/*.scss"];
	var src = null;
	if (process.env.dev == "true") {
		src = gulp
			.src(sass_files)
			.pipe(sourcemaps.init({ largeFile: true }))
			.pipe(sourcemaps.identityMap())
			.pipe(sass().on("error", sass.logError))
			.pipe(postcss([autoprefixer("last 2 versions")]))
			.pipe(sourcemaps.write());
	} else {
		src = gulp
			.src(sass_files)
			.pipe(
				sass({
					outputStyle: "compressed",
				}).on("error", sass.logError)
			)
			.pipe(postcss([autoprefixer("last 2 versions")]));
	}
	src.pipe(gulp.dest("../css/")).pipe(browserSync.stream());
	done();
});

gulp.task("rollup:build-dev", function (done) {
	return new Promise(gulp.series("rollup:watch"));
});

gulp.task("rollup:build", function (done) {
	var rollupConfig = require(path.resolve(__dirname, "./rollup.config.js"));
    console.log(rollupConfig);
	rollupConfig.map((conf) => {
		rollup(conf)
			.then((bundle) => {
                console.log('output', conf.output);
				bundle
					.write(conf.output)
					.then((e) => {
						done();
					})
					.catch((e) => {
						console.error(e);
						done();
					});
			})
			.catch((e) => {
				console.error('Error', e);
				done();
			});
	});
});

gulp.task("rollup:watch", function (done) {
	console.log("Watching...");
	var rollupConfig = require(path.resolve(__dirname, "./rollup.config.js"));
	const watcher = watch(rollupConfig);
	watcher.on("event", (out) => {
		if (out) {
			if (out.code == "ERROR") {
				console.error(out.error);
				return;
			}
			const { result } = out;
			if (result) {
				console.log("saving...");
				result.close && result.close();
				done();
			}
		} else {
			console.log("failed saving!");
		}
	});
});

gulp.task("dev", function (done) {
	console.log("Welcome...");

	process.env.dev = "true";
	return new Promise(gulp.parallel("sass:watch", "rollup:build-dev"));
});

gulp.task("build", function () {
	console.log("Building...");

	return new Promise(gulp.parallel("sass", "rollup:build"));
});
