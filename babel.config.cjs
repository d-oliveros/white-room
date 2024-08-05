module.exports = {
  // Apply these settings only to React files.
  overrides: [
    {
      test: /\.jsx$/,
      presets: [
        '@babel/preset-react',
      ],
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        [
          '@dr.pogodin/react-css-modules',
          {
            replaceImport: true,
            webpackHotModuleReloading: true,
            generateScopedName: '[name]--[local]--[hash:base64:6]',
          },
        ],
      ],
    },
  ],
};
