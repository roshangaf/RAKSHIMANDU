// Color values mirror src/theme/colors.ts (kept duplicated here in plain JS since
// this file is loaded by Node directly, without TypeScript transpilation).
const colors = {
  background: '#080808',
  foreground: '#FFFFFF',
  card: { DEFAULT: '#0F0F0F', foreground: '#FFFFFF' },
  popover: { DEFAULT: '#080808', foreground: '#FFFFFF' },
  primary: { DEFAULT: '#310F0C', foreground: '#FFFFFF' },
  secondary: { DEFAULT: '#1A1A1A', foreground: '#FFFFFF' },
  muted: { DEFAULT: '#262626', foreground: '#A6A6A6' },
  accent: { DEFAULT: '#FFFFFF', foreground: '#000000' },
  destructive: { DEFAULT: '#7F1D1D', foreground: '#FAFAFA' },
  border: '#1F1F1F',
  input: '#1F1F1F',
  ring: '#4A1512',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        headline: ['BebasNeue'],
        body: ['OpenSans'],
      },
      borderRadius: {
        lg: 8,
        md: 6,
        sm: 4,
      },
    },
  },
  plugins: [],
};
