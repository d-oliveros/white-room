const webpack = require('webpack');

module.exports = function build(callback) {
  const config = require('../webpack.config.prod.js');
  webpack(config, callback);
};

module.exports.dependencies = ['css-min', 'sdk-build', 'sdk-login-build'];
