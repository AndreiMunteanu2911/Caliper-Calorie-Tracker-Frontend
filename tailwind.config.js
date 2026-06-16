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
      fontFamily: {
        sans: ['Manrope'],
        medium: ['Manrope-Medium'],
        semibold: ['Manrope-SemiBold'],
        bold: ['Manrope-Bold'],
        black: ['Manrope-ExtraBold'],
      },
      colors: {
        canvas: '#F5F4EF',
        surface: '#FFFFFF',
        raised: '#F3F2ED',
        ink: '#101010',
        muted: '#77756F',
        line: '#E5E2DA',
        brand: '#101010',
        accent: '#FF5A16',
        accentSoft: '#FFE7DE',
        protein: '#45C588',
        proteinSoft: '#DFF7EA',
        carbs: '#F5F378',
        carbsSoft: '#FBFABD',
        fats: '#DDC0FF',
        fatsSoft: '#EFE2FF',
        danger: '#C64035',
        dangerSoft: '#FCE6E2',
        successSoft: '#DDF7EB',
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [],
}
