import { fileURLToPath } from 'url';
import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

const {
  NODE_ENV = 'development',
  COMMIT_HASH,
  WEBPACK_DEVELOPMENT_SERVER_PORT,
} = process.env;

const isProd = NODE_ENV === 'production';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildPath = path.resolve(__dirname, 'public', 'dist');

const whiteroomPath = path.resolve(__dirname, 'whiteroom');
const webpackDevServerPort = parseInt(WEBPACK_DEVELOPMENT_SERVER_PORT, 10) || 8001;

const webpackConfig = {
  cache: {
    type: 'filesystem',
  },
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? 'source-map' : 'cheap-module-source-map',
  target: 'web',
  entry: [
    path.resolve(whiteroomPath, 'client', 'initializeBrowser.jsx'),
  ],
  output: {
    path: buildPath,
    filename: `bundle${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.js`,
    // filename: isProd ? '[name].[contenthash].js' : '[name].bundle.js',
    // chunkFilename: isProd ? '[name].[contenthash].js' : '[name].bundle.js',

    // filename: isProd
    //   ? '[name].[contenthash].js'
    //   : '[name].bundle.js',
    publicPath: isProd ? '/' : `http://localhost:${webpackDevServerPort}/dist/`,
    clean: true,
  },
  resolve: {
    modules: [whiteroomPath, 'node_modules']
  },
  optimization: {
    minimize: isProd,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: true,
          mangle: true,
        },
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: false,
  },
  module: {
    rules: [
      {
        test: /\.(j|t)sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: path.resolve(__dirname, 'babel.web.config.cjs'),
          },
        },
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 8192,
            mimetype: 'application/font-woff',
            name: 'fonts/[name].[ext]',
          },
        },
      },
      // TailwindCSS
      {
        test: /\.css$/,
        include: /tailwind\.css$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      // CSS Modules
      {
        test: /\.css$/,
        exclude: /tailwind\.css$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]--[local]--[hash:base64:6]',
              },
              importLoaders: 1,
            },
          },
          'postcss-loader',
        ],
      },
    ],
  },
  plugins: [
    new NodePolyfillPlugin({
      onlyAliases: ['path', 'url', 'fs', 'assert'],
    }),
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    !isProd && new ReactRefreshWebpackPlugin({
      exclude: /node_modules/,
    }),
    isProd && new MiniCssExtractPlugin({
      filename: `style${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.css`,
      chunkFilename: '[id].css',
    }),
    new webpack.DefinePlugin({
      'process.browser': JSON.stringify(true),
      'process.env': JSON.stringify({
        NODE_ENV,
      }),
      'global': 'window',
    }),
  ].filter(Boolean),
  devServer: isProd ? false : {
    host: 'localhost',
    port: webpackDevServerPort,
    static: {
      directory: buildPath,
      publicPath: `http://localhost:${webpackDevServerPort}/dist/`,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    compress: true,
    hot: true,
    client: {
      webSocketURL: `ws://localhost:${webpackDevServerPort}/ws`,
    },
  },
};

export default webpackConfig;
