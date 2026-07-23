/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
      },
      colors: {
        primary: '#00694c',
        secondary: '#31647f',
        tertiary: '#825100',
        surface: '#f7f9fb',
        'on-surface': '#191c1e',
        'surface-container-low': '#f2f4f6',
        'surface-container-highest': '#e0e3e5',
        'outline-variant': '#bccac1',
      },
    },
  },
  plugins: [],
}
