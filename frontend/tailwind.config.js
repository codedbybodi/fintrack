const { Card } = require('@radix-ui/themes');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0f',
          Card: '#',
          border: '',
          hover: '',
        },
        brand: {
         green: '#00d084',
          red: '#ff5555',
          blue: '#4d9fff',
          gold: '#f5a623',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
