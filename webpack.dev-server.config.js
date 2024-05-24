require('./util/loadenv');

// const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');
const { parse } = require('url');

const {
  APP_URL,
  WEBPACK_DEVELOPMENT_SERVER_PORT,
  WEBPACK_DEVELOPMENT_SERVER_PUBLIC_PORT,
} = process.env;

const buildPath = path.resolve(__dirname, 'build');

const webpackConfig = require('./webpack.config');

const webpackDevServerUrl = (
  `${parse(APP_URL).hostname}:` +
  (WEBPACK_DEVELOPMENT_SERVER_PUBLIC_PORT || WEBPACK_DEVELOPMENT_SERVER_PORT)
);

const webpackDevConfig = {
  ...webpackConfig,
  entry: [
    `webpack-dev-server/client?${webpackDevServerUrl}`,
    'webpack/hot/only-dev-server',
    ...webpackConfig.entry,
  ],
  output: {
    ...webpackConfig.output,
    publicPath: '/build/',
  },
  devServer: {
    host: parse(APP_URL).hostname,
    port: WEBPACK_DEVELOPMENT_SERVER_PORT,
    static: {
      directory: buildPath,
      publicPath: '/build/',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    compress: true,
    hot: true,
    webSocketServer: 'ws',
    client: {
      webSocketTransport: 'ws',
      progress: true,
      overlay: true,
      webSocketURL: {
        hostname: parse(APP_URL).hostname,
        port: WEBPACK_DEVELOPMENT_SERVER_PUBLIC_PORT || WEBPACK_DEVELOPMENT_SERVER_PORT,
        pathname: '/ws',
        protocol: 'ws',
      },
    },
  },
  // plugins: [
  //   new ReactRefreshWebpackPlugin({
  //     overlay: {
  //       sockPort: 8000 || parseInt(WEBPACK_DEVELOPMENT_SERVER_PUBLIC_PORT || WEBPACK_DEVELOPMENT_SERVER_PORT, 10),
  //     },
  //   }),
  //   ...webpackConfig.plugins,
  // ],
};

module.exports = webpackDevConfig;
