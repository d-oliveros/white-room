const path = require('path');

const webpackConfig = require('../webpack.config');
const srcPath = path.resolve(__dirname, '..', 'src');

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  webpackFinal: (config, { configType }) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          ...webpackConfig.module.rules.filter(({ test }) => {
            // Remove the .woff font url-loader rule, as it is messing with
            // Storybook's ability to serve the static font files.
            return !test.test('some-font.woff');
          }),
        ],
      },
      resolve: {
        ...config.resolve,
        modules: [
          srcPath,
          ...config.resolve.modules,
        ],
      }
    };
  }
}
