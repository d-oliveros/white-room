module.exports = {
  presets: [
    // ['@babel/preset-env', {
    //   targets: {
    //     node: 'current',
    //   },
    // }],
    '@babel/preset-react',
  ],
  plugins: [
    [
      'react-css-modules',
      {
        generateScopedName: '[name]__[local]___[hash:base64:5]',
        webpackHotModuleReloading: true,
        filetypes: {
          '.less': {
            syntax: 'postcss-less',
          },
        },
        handleMissingStyleName: 'warn',
      },
    ],
  ],
};
