'use strict';

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// Javascript minification
gulp.task('release', ['lint-release'], function () {
  return gulp.src('./jquery.css-image-animator.js')
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('./'));
});
