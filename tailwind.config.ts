import type { Config } from 'tailwindcss';
export default {
  content: ['./client/index.html', './client/src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { accent: { 50: '#ecfdf5', 500: '#10b981', 600: '#059669', 700: '#047857' } } } },
  plugins: []
} satisfies Config;
