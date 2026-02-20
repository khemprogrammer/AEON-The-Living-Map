/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aeon: {
          primary: '#3b82f6',
          dark: '#0f172a'
        }
      }
    },
  },
  plugins: [],
}
