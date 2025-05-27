/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  safelist: [
    'dark',
    { pattern: /dark:(bg|text|border)-(gray|blue|red|green|purple)-(50|100|200|300|400|500|600|700|800|900)/ }
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 