'use strict';

var gulp = require('gulp');
var eslint = require('gulp-eslint');

// Javscript linting
gulp.task('lint', function () {
  return gulp.src(['./*.js', '!./*.min.js', './tasks/*.js'])
    .pipe(eslint())
    .pipe(eslint.format());
});

// Javscript linting
gulp.task('lint-release', function () {
  return gulp.src('./jquery.css-image-animator.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});
