/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#001b40',
        blue: '#003580',
        green: '#009543',
        red: '#d21034',
        yellow: '#ffce00',
        slate: '#0d1117'
      }
    }
  },
  plugins: []
};

