/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#FF5500',
        'primary-hover': '#E64D00',
        background: '#080808',
        surface: '#0D0D0D',
        elevated: '#141414',
        'text-primary': '#F5EFE0',
        'text-secondary': '#8A8A8A',
        'text-muted': '#757575',
        border: '#212121',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
      },
      fontFamily: {
        heading: ['Unbounded', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
      },
    },
  },
  plugins: [],
};
