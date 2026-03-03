/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Vibrant blue/purple primary
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Warm accent for buttons/badges
        accent: {
          400: '#fb7185',
          500: '#f97373',
          600: '#ef4444',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5f5',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'bounce-soft': 'bounceSoft 0.5s ease-out',
        'cart-pop': 'cartPop 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        cartPop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'gradient-hero':
          'linear-gradient(135deg, #eef2ff 0%, #e0f2fe 35%, #fdf2ff 70%, #fee2e2 100%)',
        'gradient-warm':
          'linear-gradient(180deg, #fef9c3 0%, #ffedd5 50%, #fee2e2 100%)',
        'gradient-surface':
          'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        'gradient-card':
          'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
      },
      boxShadow: {
        card:
          '0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.06)',
        'card-hover':
          '0 18px 45px -15px rgb(15 23 42 / 0.35), 0 10px 25px -10px rgb(15 23 42 / 0.25)',
        'inner-soft': 'inset 0 2px 4px 0 rgb(15 23 42 / 0.04)',
      },
    },
  },
  plugins: [],
};
