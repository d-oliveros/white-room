const { NODE_ENV } = process.env;

const isProd = NODE_ENV === 'production';

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

module.exports = {
  presets: [
    ['@babel/preset-env', {
      loose: true,
      useBuiltIns: 'usage',
      corejs: 3,
      targets: '> 0.35%, not dead',
    }],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
  plugins: [
    !isProd && 'react-refresh/babel',
    ['@babel/plugin-transform-runtime', { corejs: 3 }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    [
      '@dr.pogodin/react-css-modules',
      {
        replaceImport: false,
        webpackHotModuleReloading: isProd,
        generateScopedName: '[name]--[local]--[hash:base64:6]',
      },
    ],
    // isProd && rewriteImportsPlugin,
  ].filter(Boolean),
};
