const gulp = require('gulp');
const eslint = require('gulp-eslint');

const lintFiles = [
  'src/**/*.jsx',
  'src/**/*.js',
  'test/**/*.js',
  'util/data-generator.js'
  // 'config/**/*.js',
  // 'tasks/**/*.js',
  // 'init.js',
  // 'gulpfile.js'
];

module.exports = function lint() {
  const clearSeq = '\u001B[2J\u001B[0;0f';
  process.stdout.write(clearSeq);

  return gulp.src(lintFiles)
    .pipe(eslint())
    .pipe(eslint.formatEach(null, console.log.bind(console)))
    .pipe(eslint.failAfterError());
};
