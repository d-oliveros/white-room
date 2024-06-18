const { generateScopedNameFactory } = require('@dr.pogodin/babel-plugin-react-css-modules/utils');

module.exports = {
  presets: [
    ['@babel/preset-env', {
      loose: true,
      useBuiltIns: 'usage',
      corejs: 3,
      targets: '> 0.35%, not dead',
    }],
    '@babel/preset-react',
  ],
  plugins: [
    'react-refresh/babel',
    './babel-plugin-transform-glob-imports',
    ['@babel/plugin-transform-runtime', { corejs: 3 }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    [
      '@dr.pogodin/react-css-modules',
      {
        removeImport: false,
        webpackHotModuleReloading: true,
        filetypes: {
          '.less': {
            syntax: 'postcss-less',
          },
        },
        generateScopedName: (
          generateScopedNameFactory('[name]--[local]--[hash:base64:6]')
        ),
      },
    ],
  ],
};
