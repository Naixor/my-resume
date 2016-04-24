/* jshint node: true */
"use strict";

const gulp = require('gulp');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');
const sourcemaps = require('gulp-sourcemaps');
const inject = require('gulp-inject');
const connect = require('gulp-connect');
const del = require("del");
const tsProject = ts.createProject('tsconfig.json');
const Config = require('./gulpfile.config');

const config = new Config();

gulp.task('lint', () => {
    return gulp.src(config.tsFiles).pipe(tslint()).pipe(tslint.report('prose')); 
});

gulp.task('compile', ['clean'], () => {
    let tsResult = gulp.src(config.tsFiles).pipe(sourcemaps.init()).pipe(ts(tsProject));
    // tsResult.dts.pipe(gulp.dest(config.outputPath));
    return tsResult.js.pipe(sourcemaps.write('.')).pipe(gulp.dest('dist/src'));
});

gulp.task("resources", () => {
    return gulp.src(["src/**/*", "!**/*.ts"])
        .pipe(gulp.dest("dist/src"));
});

gulp.task("libs", () => {
    return gulp.src([
            'es6-shim/es6-shim.min.js',
            'systemjs/dist/system-polyfills.js',
            'angular2/bundles/angular2-polyfills.js',
            'angular2/es6/dev/src/testing/shims_for_IE.js',
            'systemjs/dist/system.src.js',
            'rxjs/bundles/Rx.js',
            'angular2/bundles/angular2.dev.js',
            'angular2/bundles/router.dev.js'
        ], {cwd: "node_modules/**"}) /* Glob required here. */
        .pipe(gulp.dest("dist/lib"));
});

gulp.task('dev', () => {
    let mainfile = config.src + config.mainFileName;
    let systemjsStr = `System.import('${mainfile}').then(null, console.error.bind(console));`;
    
    return gulp.src(config.mainPage)
            .pipe(inject(gulp.src(config.stylesheets, {read: false}), {
                name: 'stylesheets'
            }))
            .pipe(inject(gulp.src(config.libs, {read: false}), {
                name: 'libs'
            }))
            .pipe(inject(gulp.src(config.ag2.initialFiles, {read: false}), {
                name: 'ng2initial'
            }))
            .pipe(inject(gulp.src([config.systemJs.configFile.dev]), {
                starttag: '<!-- inject:system:{{ext}} -->',
                transform: function (filepath, file) {
                    return `<script>
                    ${[file.contents.toString('utf-8'), systemjsStr].join('\n')}
                    </script>`;
                }
            }))
            .pipe(gulp.dest('./'));
});

gulp.task('clean', (cb) => {
    return del(["dist"], cb);
});

gulp.task('connect', () => {
    connect.server({
        port: 3000,
        livereload: true
    });
});

gulp.task('watch', () => {
    let htmlFiles = ['./src/*.html', './src/**/*.html']; 
    gulp.watch(htmlFiles, () => {
        gulp.src(htmlFiles)
            .pipe(connect.reload());
    });
    gulp.watch(config.tsFiles, () => {
        gulp.src(config.tsFiles)
            .pipe(connect.reload());
    });
});

gulp.task('server', ['connect', 'watch']);

gulp.task("build", ['compile', 'resources', 'libs'], () => {
    console.log("Building the project ...");
});