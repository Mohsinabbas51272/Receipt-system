/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffbf0',
          100: '#fef5d6',
          200: '#fce7a8',
          300: '#fad371',
          400: '#f7bb38',
          500: '#e59e13',
          600: '#ca7d0c',
          700: '#a35a0d',
          800: '#834712',
          900: '#6d3b13',
        }
      }
    },
  },
  plugins: [],
}

