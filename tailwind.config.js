import flowbite from 'flowbite-react/tailwind';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.jsx',
    // './node_modules/flowbite/**/*.js',
    flowbite.content(),
  ],
  plugins: [
    // '@tailwindcss/forms',
    flowbite.plugin(),
  ],
};
