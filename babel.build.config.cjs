// Use the same base configuration as the one used for running locally (development),
// but with the replace-import-extension plugin to transform file extensions to JS for production build.
const babelConfigBase = require('./babel.config.cjs');

const rewriteImportsPlugin = [
  'babel-plugin-transform-rewrite-imports',
  {
    replaceExtensions: {
      '.jsx': '.js',
      '.tsx': '.js',
      '.ts': '.js',
    },
  },
];

const overrides = babelConfigBase.overrides.map((config) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    rewriteImportsPlugin,
  ],
}));

overrides.push({
  test: /\.js$/,
  plugins: [rewriteImportsPlugin],
});

module.exports = {
  ...babelConfigBase,
  overrides,
  ignore: [
    ...(babelConfigBase.ignore || []),
    '**/*.stories.*',
  ],
};
