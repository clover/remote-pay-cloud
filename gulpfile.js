const gulp = require('gulp');
const ts = require('gulp-typescript');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('clean:dist', function() {
	return del([
		'dist/**/*'
	]);
});

gulp.task('build:src', () => {
	return gulp.src(["src/**/*.ts"])
		.pipe(sourcemaps.init())
		.pipe(ts({
			"module": "commonjs",
			"target": "es5",
			"noImplicitAny": false,
			"sourceMap": false,
			"allowJs": true
		}))
		.pipe(sourcemaps.write('maps/'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('default', ['clean:dist', 'build:src']);

// const gulp = require('gulp');
// const babel = require('gulp-babel');

// gulp.task('default', () => {
// 	return gulp.src('src/**/*.js')
// 		.pipe(babel({
// 			presets: ['es2015']
// 		}))
// 		.pipe(gulp.dest('.'));
// });
