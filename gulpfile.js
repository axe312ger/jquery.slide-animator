'use strict';

var gulp = require('gulp');
var requireDir = require('require-dir');
requireDir('./tasks');

// Default task and watch configuration
gulp.task('default', ['watch']);

gulp.task('watch', ['lint'], function () {
  gulp.watch(['./*.js', '!./*.min.js', './tasks/*.js'], ['lint']);
});
