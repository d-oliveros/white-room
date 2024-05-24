require('./util/loadenv');

const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');
const lodashCompact = require('lodash/fp/compact');

const { NODE_ENV, COMMIT_HASH } = process.env;
const nodeModulesPath = path.resolve(__dirname, 'node_modules');
const buildPath = path.resolve(__dirname, 'public', 'dist');
const srcPath = path.resolve(__dirname, 'src');

const isProd = NODE_ENV === 'production';

const appBabelConfig = require('./babel.config');

const webpackConfig = {
  optimization: isProd
    ? {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          test: /\.js(\?.*)?$/i,
          cache: true,
          parallel: 4,
          sourceMap: true,
          terserOptions: {
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {},
            mangle: true,
            module: false,
            output: null,
            toplevel: false,
            nameCache: null,
            ie8: false,
            keep_classnames: undefined,
            keep_fnames: false,
            safari10: false,
          },
        }),
        new OptimizeCSSAssetsPlugin(),
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
    }
    : undefined,
  devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map',
  entry: [
    '@babel/polyfill',
    path.resolve(__dirname, 'src', 'client', 'initializeBrowser.js'),
  ],
  output: {
    path: buildPath,
    filename: `bundle${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.js`,
    publicPath: isProd ? '/' : '/dist/',
  },
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ],
    alias: {
      src: srcPath,
    },
  },
  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.jsx?$/,
        exclude: [nodeModulesPath],
        options: {
          presets: appBabelConfig.presets,
          plugins: appBabelConfig.plugins.reduce((memo, plugin) => {
            if (Array.isArray(plugin) && plugin[0] === 'react-css-modules') {
              memo.push([
                plugin[0],
                {
                  ...plugin[1],
                  removeImport: false,
                },
              ]);
            }
            else {
              memo.push(plugin);
            }
            return memo;
          }, []),
        },
      },
      // New css-modules + storybook enabled .less setup
      {
        test: /\.less$/,
        exclude: [
          path.resolve(__dirname, 'src/client/style'),
        ],
        use: [
          isProd
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
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
      // Old Darius-style setup
      {
        test: /\.less$/,
        include: [
          path.resolve(__dirname, 'src/client/style'),
        ],
        use: [
          isProd
            ? MiniCssExtractPlugin.loader
            : 'style-loader',
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
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              mimetype: 'application/font-woff',
              name: 'fonts/[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  node: {
    fs: 'empty',
    __filename: true,
  },
  plugins: lodashCompact([
    isProd && new MiniCssExtractPlugin({
      filename: `style${COMMIT_HASH ? '-' + COMMIT_HASH : ''}.css`,
      chunkFilename: '[id].css',
      ignoreOrder: false,
    }),
    !isProd && new webpack.NoEmitOnErrorsPlugin(),
    !isProd && new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: `"${NODE_ENV}"`,
      },
    }),
    isProd && new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
  ]),
};

module.exports = webpackConfig;
