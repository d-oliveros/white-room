import { fileURLToPath } from 'url';
import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import compact from 'lodash/fp/compact.js';

const { NODE_ENV, COMMIT_HASH } = process.env;
const isProd = NODE_ENV === 'production';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'public', 'dist');
const srcPath = path.resolve(__dirname, 'src');

// Read src folder to get list of folder names
// then, build an object { [foldername]: path.resolve(srcPath, foldername)}

const webpackConfig = {
  mode: isProd ? 'production' : 'development',
  devtool: isProd ? 'source-map' : 'cheap-module-source-map',
  entry: [
    path.resolve(srcPath, 'client', 'initializeBrowser.js'),
  ],
  output: {
    path: buildPath,
    filename: `bundle${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.js`,
    publicPath: isProd ? '/' : '/dist/',
  },
  resolve: {
    modules: [srcPath, 'node_modules'],
    alias: {
      '@src': srcPath,
    },
    // fallback: {
    //   path: require.resolve('path-browserify'),
    // },
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
            configFile: path.resolve(__dirname, 'babel.client.config.js'),
          },
        },
      },
      {
        test: /\.less$/,
        exclude: [path.resolve(srcPath, 'client/style')],
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
          'less-loader',
          {
            loader: 'text-transform-loader',
            options: {
              prependText: (
                `@import "${srcPath}/client/style/fonts.less";\n` +
                `@import "${srcPath}/client/style/variables.less";\n`
              ),
            },
          },
        ],
      },
      {
        test: /\.less$/,
        include: [path.resolve(srcPath, 'client/style')],
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: false,
              importLoaders: 1,
            },
          },
          'postcss-loader',
          'less-loader',
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
  plugins: compact([
    isProd && new MiniCssExtractPlugin({
      filename: `style${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.css`,
      chunkFilename: '[id].css',
    }),
    !isProd && new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
      'process.browser': true,
      'process.env': {
        NODE_ENV: JSON.stringify(NODE_ENV),
      },
    }),
    isProd && new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ]),
};

export default webpackConfig;
