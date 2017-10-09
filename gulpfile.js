const gulp = require('gulp');
const typedoc = require("gulp-typedoc");
const ts = require('gulp-typescript');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge2');
const webpack = require('webpack-stream');

gulp.task('clean', function () {
    return del([
        'dist/**/*'
    ]);
});

/**
 * transpiles the typescript source, generates source maps, and type definitions.
 */
gulp.task('transpile', ['clean'], () => {
    const tsProject = ts.createProject('tsconfig.json', {});
    const tsResult = gulp.src(["src/**/*.ts"])
        .pipe(sourcemaps.init())
        .pipe(tsProject());

    return merge([
        tsResult.dts.pipe(gulp.dest('dist/definitions')),
        tsResult.js
            .pipe(sourcemaps.write('maps/'))
            .pipe(gulp.dest('dist/'))
    ]);
});

gulp.task('bundle', ['transpile'], () => {
    return gulp.src('./index.js')
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('dist/bundle/'));
});

gulp.task("typedoc", () => {
    return gulp
        .src([
            "src/com/clover/remote/client/CloverConnectorFactoryBuilder.ts",
            "src/com/clover/remote/client/ICloverConnectorFactory.ts",
            "src/com/clover/remote/client/CloverConnectorFactoryV2.ts",
            "src/com/clover/remote/client/CloverConnectorFactory.ts",
            "src/com/clover/remote/client/CardEntryMethods.ts",

            "src/com/clover/remote/client/device/WebSocketPairedCloverDeviceConfiguration.ts",
            "src/com/clover/remote/client/device/WebSocketCloudCloverDeviceConfiguration.ts",

            "src/com/clover/websocket/CloverWebSocketInterface.ts",
            "src/com/clover/websocket/BrowserWebSocketImpl.ts",
            "src/com/clover/websocket/WebSocketListener.ts",
            "src/com/clover/websocket/WebSocketState.ts",

            "src/com/clover/util/ImageUtil.ts",
            "src/com/clover/util/IImageUtil.ts",
            "src/com/clover/Version.ts",
            "src/CloverID.ts"
        ])
    .pipe(typedoc({
        exclude: "**/*.d.ts",
        excludeExternals: true,
        module: "commonjs",
        target: "es5",
        out: "docs/",
        name: "Clover SDK for Javascript Integration"
    }));
});

gulp.task('default', ['clean', 'bundle', 'typedoc']);
