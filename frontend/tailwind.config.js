/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F9F9F9',
        primary: '#1A1A1A',
        secondary: '#6B6B6B',
        accent: '#D4C4B7', // Beige/Muted
        mutedGreen: '#8DA399',
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
