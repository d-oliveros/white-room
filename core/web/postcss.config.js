const { join } = require('path');

module.exports = {
  plugins: {
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {
      config: join(__dirname, 'tailwind.config.js'),
    },
    'postcss-preset-env': {
      features: { 'nesting-rules': false },
      browsers: ['> 0.5%', 'not op_mini all', 'not dead'],
    },
    autoprefixer: {},
  },
};
