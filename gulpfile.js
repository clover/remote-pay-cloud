const gulp = require('gulp');
const typedoc = require("gulp-typedoc");
const ts = require('gulp-typescript');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');

var tsProject = ts.createProject('tsconfig.json', {
	allowJs: true
});

gulp.task('clean:dist', function() {
	return del([
		'dist/**/*'
	]);
});

gulp.task('build:src', ['clean:dist'], () => {
	var tsResult = gulp.src(["src/**/*.ts"])
		.pipe(sourcemaps.init())
		.pipe(tsProject());
	return tsResult.js
		.pipe(sourcemaps.write('maps/'))
		.pipe(gulp.dest('dist/'));
});

gulp.task("typedoc", function() {
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
            ]
        )
		.pipe(typedoc({
            excludeExternals: true,
			module: "commonjs",
			target: "es5",
			out: "docs/",
			name: "Clover SDK for Javascript Integration"
		}))
		;
});

gulp.task('default', ['clean:dist', 'build:src', "typedoc"]);
