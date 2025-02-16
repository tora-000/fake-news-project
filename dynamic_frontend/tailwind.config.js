/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neutral': '#484f52',
        'primary': '#003c50',
        'secondary': '#00799a',
        'accent': '#fcb715',
        'alert': '#b71a51',
      },
      fontFamily: {
        'bree': ['Bree', 'sans-serif'],
        'din': ['Din', 'sans-serif'],
      },
    },
  },
  plugins: [],
};