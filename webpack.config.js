require('./util/loadenv');

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const auth = require('./config/auth');

const env = process.env;
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'build');
const srcPath = path.resolve(__dirname, 'src');
const babelConfig = JSON.parse(fs.readFileSync(path.resolve('./.babelrc')));

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    'webpack-dev-server/client?http://localhost:8001',
    'webpack/hot/only-dev-server',
    path.resolve(__dirname, 'src', 'client', 'main.js')
  ],
  output: {
    path: buildPath,
    filename: 'bundle.js',
    publicPath: 'http://localhost:8001/build'
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    alias: {
      src: srcPath
    }
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        loaders: ['isomorphine'],
        exclude: [nodeModulesPath]
      }
    ],
    loaders: [
      {
        loader: 'babel',
        test: /\.jsx?$/,
        exclude: [nodeModulesPath],
        query: babelConfig
      },
      {
        loader: 'json',
        test: /\.json$/
      }
    ]
  },
  devServer: {
    host: 'localhost',
    port: 8001,
    publicPath: 'http://localhost:8001/build',
    hot: true,
    contentBase: buildPath
  },
  node: {
    fs: 'empty',
    __filename: true
  },
  debug: true,
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV:                `"${env.NODE_ENV}"`,
        APP_HOST:                `"${env.APP_HOST}"`,
        IMAGE_HOST:              `"${env.IMAGE_HOST}"`,
        OAUTH_GOOGLE_ID:         `"${auth.google.client_id}"`,
        OAUTH_GOOGLE_SCOPE:      `"${auth.google.scope}"`,
        OAUTH_GOOGLE_REDIRECT:   `"${auth.google.redirect_uri}"`,
        OAUTH_FACEBOOK_ID:       `"${auth.facebook.client_id}"`,
        OAUTH_FACEBOOK_REDIRECT: `"${auth.facebook.redirect_uri}"`,
        OAUTH_FACEBOOK_SCOPE:    `"${auth.facebook.scope}"`,
        OAUTH_LINKEDIN_ID:       `"${env.OAUTH_LINKEDIN_ID}"`,
        OAUTH_LINKEDIN_REDIRECT: `"${auth.linkedin.redirect_uri}"`
      }
    })
  ]
};
