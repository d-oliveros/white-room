const nodemon = require('gulp-nodemon');

module.exports = function startNodemon() {
  nodemon({
    script: 'init.js',
    ext: 'js,hbs',
    ignore: ['client/*', 'util/*', 'build/*', 'node_modules/*'],
    debug: true
  });
};
