/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'inner-xl': 'inset 0 0 20px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
};