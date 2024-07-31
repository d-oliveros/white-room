// export default {
//   plugins: {
//     'postcss-preset-env': {},
//     tailwindcss: {},
//     autoprefixer: {},
//   },
// }
export default {
  plugins: {
    // 'postcss-import': {},
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    'postcss-preset-env': {
      features: { 'nesting-rules': false },
    },
    // 'postcss-preset-env': {},
    // tailwindcss: {},
    autoprefixer: {},
  },
};
