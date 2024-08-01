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
    ['@babel/plugin-transform-runtime', { corejs: 3 }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    [
      '@dr.pogodin/react-css-modules',
      {
        replaceImport: false,
        webpackHotModuleReloading: true,
        generateScopedName: '[name]--[local]--[hash:base64:6]',
      },
    ],
  ],
};
