const gulp = require('gulp');
const less = require('gulp-less');

module.exports = function cssCompile() {
  return gulp.src('./src/client/style/*.less')
    .pipe(less())
    .pipe(gulp.dest('./build/css'));
};

module.exports.dependencies = ['clean'];
