const { generateScopedNameFactory } = require('@dr.pogodin/babel-plugin-react-css-modules/utils');

module.exports = {
  // Apply these settings only to React files.
  overrides: [
    {
      test: /\.jsx$/,
      presets: [
        '@babel/preset-react',
      ],
      plugins: [
        './babel-plugin-transform-glob-imports',
        // 'react-refresh/babel',
        // ['@babel/plugin-transform-runtime', { corejs: 3 }],
        // ['@babel/plugin-proposal-decorators', { legacy: true }],
        // '@babel/plugin-transform-class-properties',
        // '@babel/plugin-syntax-import-meta',
        // '@babel/plugin-transform-export-namespace-from',
        // '@babel/plugin-transform-optional-chaining',
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        [
          '@dr.pogodin/react-css-modules',
          {
            removeImport: true,
            // webpackHotModuleReloading: true,
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
    },
  ],
};
