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
      boxShadow: {
        card: '0 22px 60px rgba(16, 16, 16, 0.16)',
        soft: '0 8px 24px rgba(16, 16, 16, 0.08)',
        glow: '0 12px 34px rgba(255, 90, 47, 0.24)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.14)',
      },
    },
  },
  plugins: [],
}
