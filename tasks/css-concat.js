const gulp = require('gulp');
const concat = require('gulp-concat');

const files = [
  './build/css/normalize.css',
  './build/css/fonts.css',
  './build/css/base.css',
  './build/css/components.css',
  './build/css/icons.css',
  './build/css/responsive.css',
  './build/css/animations.css',
  './build/css/text-editor.css',
  './build/css/page-post.css',
  './build/css/page-user.css',
  './build/css/page-feed.css',
  './build/css/page-search.css',
  './build/css/page-admin.css'
];

module.exports = function cssConcat() {
  return gulp.src(files)
    .pipe(concat('app.css'))
    .pipe(gulp.dest('./build'));
};

module.exports.dependencies = ['css-compile'];
