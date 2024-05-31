import path from 'path';

export default {
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
