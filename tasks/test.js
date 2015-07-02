'use strict';

var gulp = require('gulp');
var bower = require('gulp-bower');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var eslint = require('gulp-eslint');
var gls = require('gulp-live-server');
var open = require('gulp-open');

// Default task and watch configuration
gulp.task('test', ['test-open-server', 'test-watch']);

gulp.task('test-watch', function () {
  gulp.watch('./assets/sass/**/*.sass', ['sass']);
  gulp.watch('./assets/js/**/*.js', ['lint']);
  gulp.watch('./assets/jade/**/*.jade', ['jade']);
});

// Install all bower dependencies
gulp.task('test-bower', function () {
  return bower();
});

// Generate HTML via jade
gulp.task('test-jade', function () {
  return gulp.src('./test/assets/jade/**/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('./test'));
});

// Generate css via libsass
gulp.task('test-sass', ['test-bower'], function () {
  return gulp.src('./test/assets/sass/**/*.sass')
    .pipe(sass({
      indentedSyntax: true,
      errLogToConsole: true,
      includePaths: ['./test/assets/vendor/normalize-scss/']
    }))
    .pipe(autoprefixer('last 2 version'))
    .pipe(gulp.dest('./test/assets/css'));
});

// Javscript linting
gulp.task('test-lint', function () {
  return gulp.src('./test/assets/js/**/*.js')
    .pipe(eslint({
      globals: {
        jQuery: false
      }
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

// Spawn test server
gulp.task('test-run-server', ['test-bower', 'test-jade', 'test-sass', 'test-lint'], function () {
  var server = gls.static(['test/'], '3001');
  server.start();

  gulp.watch('./test/**/*', function () {
    server.notify.apply(server, arguments);
  });
});

gulp.task('test-open-server', ['test-run-server'], function () {
  return gulp.src('./test/index.html')
    .pipe(open('', {url: 'http://localhost:3001'}));
});
