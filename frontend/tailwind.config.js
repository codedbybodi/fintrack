/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0f',
          card: '#0d0d14',
          border: '#1a1a28',
          hover: '#131320',
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
