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
        canvas: '#F5F7F2',
        surface: '#FFFFFF',
        ink: '#14201C',
        muted: '#66736D',
        line: '#E1E7E3',
        brand: '#173F35',
        accent: '#B8F04A',
        accentSoft: '#EAF8C9',
        protein: '#28A879',
        proteinSoft: '#DDF4EA',
        carbs: '#F2A93B',
        carbsSoft: '#FFF0D5',
        fats: '#E76F51',
        fatsSoft: '#FBE5DF',
        danger: '#B74036',
        dangerSoft: '#FBE8E5',
        successSoft: '#E2F4EA',
      },
      boxShadow: {
        card: '0 16px 48px rgba(23, 63, 53, 0.08)',
      },
    },
  },
  plugins: [],
}
