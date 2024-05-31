import path from 'path';

export default {
  path: '/src/client/style',
  options: {
    dest: '/build/css',
    compress: false,
    pathRoot: path.resolve(new URL('.', import.meta.url).pathname, '..'),
    render: {
      sourceMap: {
        sourceMapFileInline: true,
      },
    },
  },
};
