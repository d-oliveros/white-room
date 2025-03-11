const { esbuildDecorators } = require('esbuild-decorators');

module.exports = {
  sourcemap: true,
  plugins: [
    esbuildDecorators({
      tsconfig: './tsconfig.app.json',
      cwd: __dirname,
    }),
  ],
  outExtension: {
    '.js': '.js',
  },
  keepNames: true,
};
