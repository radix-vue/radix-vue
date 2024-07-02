const { blackA, grass, green, red } = require('@radix-ui/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./**/*.vue'],
  theme: {
    extend: {
      colors: {
        ...blackA,
        ...grass,
        ...green,
        ...red,
      },
    },
  },
  plugins: [],
}
