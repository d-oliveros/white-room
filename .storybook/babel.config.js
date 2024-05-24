const appBabelConfig = require('../babel.config.js');

const storybookBabelConfig = {
  ...appBabelConfig,
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
};

module.exports = storybookBabelConfig;
