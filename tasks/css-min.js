const gulp = require('gulp');
const cssmin = require('gulp-cssmin');
const rename = require('gulp-rename');
const pkg = require('../package');

const files = ['./build/app.css'];

module.exports = function cssMin() {
  return gulp.src(files)
    .pipe(cssmin())
    .pipe(rename({ suffix: '.min-v' + pkg.version }))
    .pipe(gulp.dest('./public/dist'));
};

module.exports.dependencies = ['css-concat'];
