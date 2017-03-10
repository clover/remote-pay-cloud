const gulp = require('gulp');
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

gulp.task('default', ['clean:dist', 'build:src']);
