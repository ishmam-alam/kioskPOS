/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(var(--primary-color)/0.1)',
          100: 'rgb(var(--primary-color)/0.2)',
          500: 'rgb(var(--primary-color)/1)',
          600: 'rgb(var(--primary-dark)/1)',
          700: 'rgb(var(--primary-darker)/1)',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
