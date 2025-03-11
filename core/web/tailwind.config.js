const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const flowbite = require('flowbite-react/tailwind');
const { join, resolve } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'index.html'),
    join(__dirname, 'src/**/*!(*.stories|*.spec).{ts,tsx}'),
    flowbite.content({ base: `${resolve(__dirname, '../..')}/` }),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {},
  },
  plugins: [flowbite.plugin()],
};
