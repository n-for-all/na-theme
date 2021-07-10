//Gulp to compile typescript
console.log((new Date).getTime());
var gulp = require('gulp');
var gutil = require("gulp-util");
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');


gulp.task('sass:watch', function() {
    gulp.watch(['./scss/*.scss'], gulp.parallel('sass'));
});

gulp.task('sass', function(done) {
    var sass_files = ['./scss/*.scss', './scss/**/*.scss'];
    var src = null;
    if (gutil.env && gutil.env.NODE_ENV == 'development') {
        src = gulp.src(sass_files)
            .pipe(sourcemaps.init())
            .pipe(sass().on('error', sass.logError))
            .pipe(sourcemaps.write());
    } else {
        src = gulp.src(sass_files)
            .pipe(sass({
                outputStyle: 'compressed'
            }).on('error', sass.logError));
    }
    src.pipe(gulp.dest('../css/'));
    done();
});

/**
 * Webpack Config
 */
var webpack = require("webpack");
var webpackConfig = require("./webpack.config.js");

gulp.task('webpack:build-dev', function(done) {
    //watch each alone so we don't have to build everything on change
    gulp.watch(["./tsx/**/**/*", "./ts/**/**/*"], gulp.series("webpack:build")).on('change', function() {
        gutil.env.NODE_ENV = 'development';
    });
    done();
});

gulp.task('webpack:build', function(done) {
    webpack(webpackConfig(gutil.env.NODE_ENV), function(err, stats) {
        if (err) throw new gutil.PluginError("webpack:dev", err);
        gutil.log(gutil.colors.green('scripts'), " -----------");
        gutil.log("[webpack:build --env " + gutil.env.NODE_ENV + "]\n", stats.toString({
            maxModules: 100,
            excludeModules: [/copy-webpack-plugin/],
            modulesSort: '!size',
            logging: 'normal',
            colors: true,
            hash: false,
            timings: false,
            assets: true,
            modules: false,
            children: false
        }));
        gutil.log(gutil.colors.green('scripts'), " -----------");
    });
    done();
});

gulp.task('dev', function(done) {
    console.log("Welcome...");

    if (!gutil.env.NODE_ENV) {
        gutil.env = {
            NODE_ENV: 'development'
        };
    }
    return new Promise(gulp.parallel(
        'sass:watch',
        'webpack:build-dev'));
});

gulp.task('build', function() {
    console.log("Building...");

    if (!gutil.env.NODE_ENV) {
        gutil.env = {
            NODE_ENV: 'production'
        };
    }

    return new Promise(gulp.parallel(
        'sass',
        'webpack:build'
    ));
});
