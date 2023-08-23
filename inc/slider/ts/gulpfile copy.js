//Gulp to compile typescript
console.log(new Date().getTime());
var gulp = require("gulp");
var gutil = require("gulp-util");
var sass = require("gulp-sass")(require("sass"));
var sourcemaps = require("gulp-sourcemaps");
var { rollup } = require("rollup");
var autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");
var plumber = require("gulp-plumber");
var browserSync = require("browser-sync").create();
const path = require("path");

gulp.task("sass:watch", function () {
	gulp.watch(["../scss/*.scss"], gulp.parallel("sass"));
});

gulp.task("sass", function (done) {
	var sass_files = ["../scss/*.scss", "../scss/**/*.scss"];
	var src = null;
	if (gutil.env && gutil.env.NODE_ENV == "development") {
		src = gulp.src(sass_files).pipe(sourcemaps.init()).pipe(sass().on("error", sass.logError)).pipe(sourcemaps.write());
	} else {
		src = gulp.src(sass_files).pipe(
			sass({
				outputStyle: "compressed",
			}).on("error", sass.logError)
		);
	}
	src.pipe(postcss([autoprefixer("last 2 versions")]))
		.pipe(gulp.dest("../css/"))
		.pipe(browserSync.stream());
	done();
});

gulp.task("webpack:build-dev", function (done) {
	//watch each alone so we don't have to build everything on change
	gulp.watch(["./scripts/**/**/*"], gulp.series("webpack:build")).on("change", function () {
		gutil.env.NODE_ENV = "development";
	});
});

gulp.task("webpack:build", function (done) {
	console.log("Building...");
	var rollupConfig = require(path.resolve(__dirname, "./rollup.config.js"));
	rollup(rollupConfig)
		.then((bundle) => {
			bundle
				.write(rollupConfig.output)
				.then((e) => {
					done();
				})
				.catch((e) => {
					console.error(e);
					done();
				});
		})
		.catch((e) => {
			console.error(e);
			done();
		});
});

gulp.task("dev", function (done) {
	console.log("Welcome...");

	if (!gutil.env.NODE_ENV) {
		gutil.env = {
			NODE_ENV: "development",
		};
	}

	process.env.dev = "true";
	return new Promise(gulp.parallel("sass:watch", "webpack:build-dev"));
});

gulp.task("build", function () {
	console.log("Building...");

	if (!gutil.env.NODE_ENV) {
		gutil.env = {
			NODE_ENV: "production",
		};
	}

	return new Promise(gulp.parallel("sass", "webpack:build"));
});
