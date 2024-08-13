import type { StorybookConfig } from '@storybook/react-webpack5';
import webpack from 'webpack';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../app/**/*.mdx', '../app/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-webpack5-compiler-swc',
    '@storybook/addon-essentials',
    '@storybook/addon-actions',
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        rules: [
          {
            test: /\.css$/,
            use: [
              'style-loader',
              'css-loader',
              'postcss-loader',
            ],
          },
        ],
      },
    },
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  webpackFinal: async (config) => {
    return {
      ...config,
      plugins: [
        new webpack.ProvidePlugin({
          React: 'react',
        }),
        ...(config.plugins || []),
      ],
    };
  },
};
export default config;
