module.exports = {
  // Apply these settings only to React files.
  overrides: [
    {
      test: /\.jsx$/,
      presets: [
        '@babel/preset-react',
      ],
      plugins: [
        // './babel-plugin-transform-glob-imports',
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        [
          '@dr.pogodin/react-css-modules',
          {
            replaceImport: true,
            webpackHotModuleReloading: true,
            // filetypes: {
            //   '.css': {
            //     syntax: 'postcss',
            //   },
            // },
            generateScopedName: '[name]--[local]--[hash:base64:6]',
          },
        ],
      ],
    },
  ],
};
