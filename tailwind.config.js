/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#07110d',
        panel: '#102019',
        muted: '#8da399',
        lime: '#b7f34a',
        mint: '#57d99a',
        amber: '#ffbd59',
      },
    },
  },
  plugins: [],
}
