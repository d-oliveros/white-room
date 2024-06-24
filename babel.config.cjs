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
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        [
          '@dr.pogodin/react-css-modules',
          {
            removeImport: true,
            webpackHotModuleReloading: true,
            filetypes: {
              '.less': {
                syntax: 'postcss-less',
              },
            },
            generateScopedName: '[name]--[local]--[hash:base64:6]',
          },
        ],
      ],
    },
  ],
};
