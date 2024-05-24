const path = require('path');

module.exports = {
  path: '/src/client/style',
  options: {
    dest:     '/build/css',
    compress: false,
    pathRoot: path.resolve(__dirname, '..'),
    render: {
      sourceMap: {
        sourceMapFileInline: true,
      },
    },
  },
};
