export default {
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
    // 'react-refresh/babel',
    ['@babel/plugin-transform-runtime', { corejs: 3 }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    '@babel/plugin-transform-class-properties',
    '@babel/plugin-syntax-import-meta',
    '@babel/plugin-transform-export-namespace-from',
    '@babel/plugin-transform-optional-chaining',
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
        generateScopedName: '[name]--[local]--[hash:base64:5]',
      },
    ],
  ],
};
