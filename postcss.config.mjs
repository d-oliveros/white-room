export default {
  plugins: {
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    'postcss-preset-env': {
      features: { 'nesting-rules': false },
      browsers: ['> 0.5%', 'not op_mini all', 'not dead'],
    },
    autoprefixer: {},
  },
};
