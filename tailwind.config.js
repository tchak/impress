/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/client/**/*.tsx'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
