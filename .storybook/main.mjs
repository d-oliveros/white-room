export default {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
    '../app/**/*.mdx',
    '../app/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  // webpackFinal: (config, { configType }) => {
  //   return {
  //     ...config,
  //     module: {
  //       ...config.module,
  //       rules: [
  //         ...config.module.rules,
  //         ...webpackConfig.module.rules.filter(({ test }) => {
  //           // Remove the .woff font url-loader rule, as it is messing with
  //           // Storybook's ability to serve the static font files.
  //           return !test.test('some-font.woff');
  //         }),
  //       ],
  //     },
  //     resolve: {
  //       ...config.resolve,
  //       modules: [
  //         srcPath,
  //         ...config.resolve.modules,
  //       ],
  //     }
  //   };
  // }
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-webpack5-compiler-babel'
  ],

  framework: {
    name: '@storybook/react-webpack5',
    options: {}
  },

  docs: {},

  typescript: {
    reactDocgen: 'react-docgen-typescript'
  }
};
