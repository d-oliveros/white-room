import { fileURLToPath } from 'url';
import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';

const {
  NODE_ENV,
  COMMIT_HASH,
  WEBPACK_DEVELOPMENT_SERVER_PORT,
} = process.env;

const isProd = NODE_ENV === 'production';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'public', isProd ? 'dist' : 'build');
const srcPath = path.resolve(__dirname, 'src');
const devServerPort = parseInt(WEBPACK_DEVELOPMENT_SERVER_PORT, 10) || 8001;

const webpackConfig = {
  cache: false, // TODO: Set to true
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? 'source-map' : 'cheap-module-source-map',
  target: 'web',
  entry: [
    // !isProd && `webpack-dev-server/client?http://localhost:${devServerPort}`,
    // !isProd && 'webpack/hot/only-dev-server',
    path.resolve(srcPath, 'client', 'initializeBrowser.jsx'),
  ].filter(Boolean),
  output: {
    path: buildPath,
    filename: `bundle${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.js`,
    publicPath: isProd ? '/' : `http://localhost:${devServerPort}/build`,
    // publicPath: isProd ? '/' : '/build',
  },
  resolve: {
    modules: [srcPath, 'node_modules'],
    alias: {
      '@src': srcPath,
    },
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
    splitChunks: {
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [nodeModulesPath],
        use: {
          loader: 'babel-loader',
          options: {
            configFile: path.resolve(__dirname, 'babel.webpack.config.cjs'),
          },
        },
      },
      {
        test: /\.less$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]--[local]--[hash:base64:5]',
              },
              importLoaders: 1,
            },
          },
          'postcss-loader',
          {
            loader: 'less-loader',
            options: {
              additionalData: (
                `@import "${srcPath}/client/style/variables.less";\n`
              ),
            },
          },
        ],
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
    ],
  },
  plugins: [
    new NodePolyfillPlugin({
      onlyAliases: ['path', 'url', 'fs'],
    }),
    isProd && new MiniCssExtractPlugin({
      filename: `style${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.css`,
      chunkFilename: '[id].css',
    }),
    new webpack.DefinePlugin({
      'process.browser': JSON.stringify(true),
      'process.env': JSON.stringify({}),
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'global': 'window',
    }),
    // isProd && new webpack.optimize.LimitChunkCountPlugin({
    //   maxChunks: 1,
    // }),
  ].filter(Boolean),
  devServer: isProd ? null : {
    host: '0.0.0.0',
    port: devServerPort,
    static: {
      directory: buildPath,
      publicPath: '/build/',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    compress: true,
    // hot: true,
    hot: false,
    client: {
      webSocketTransport: 'ws',
      progress: true,
      overlay: true,
      webSocketURL: {
        hostname: 'localhost',
        pathname: '/ws',
        port: devServerPort,
        protocol: 'ws',
      },
    },
  },
};

export default webpackConfig;
