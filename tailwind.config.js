/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          card: 'var(--bg-card)'
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          secondary: 'var(--accent-secondary)',
          light: 'var(--accent-light)'
        },
        border: 'var(--border)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)'
      },
      fontFamily: {
        vazirmatn: ['Vazirmatn', 'sans-serif'],
        inter: ['Inter', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        starfield: 'starfield 100s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' }
        },
        starfield: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-2000px)' }
        }
      }
    }
  },
  plugins: []
};
