const nx = require('@nx/eslint-plugin');
const baseConfig = require('../../eslint.base.config.js');

module.exports = [
  ...nx.configs['flat/react'],
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
];
