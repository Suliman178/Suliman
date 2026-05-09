/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './client/src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { accent: '#16a34a' }
    }
  },
  plugins: []
};
