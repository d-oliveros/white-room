const jsxPlugins = [
  ['@babel/plugin-proposal-decorators', { legacy: true }],
  [
    '@dr.pogodin/react-css-modules',
    {
      replaceImport: true,
      webpackHotModuleReloading: true,
      generateScopedName: '[name]--[local]--[hash:base64:6]',
    },
  ],
];

module.exports = {
  overrides: [
    {
      test: /\.jsx$/,
      presets: [
        ['@babel/preset-react', {
          runtime: 'automatic',
        }],
      ],
      plugins: jsxPlugins,
    },
    {
      test: /\.tsx$/,
      presets: [
        '@babel/preset-typescript',
        ['@babel/preset-react', {
          runtime: 'automatic',
        }],
      ],
      plugins: jsxPlugins,
    },
    {
      test: /\.ts$/,
      presets: [
        '@babel/preset-typescript',
      ],
    },
  ],
};
