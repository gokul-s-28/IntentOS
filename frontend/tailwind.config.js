/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // IntentOS Design System
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7ff',
          400: '#818cf8',
          500: '#6366f1', // primary indigo
          600: '#4f46e5',
          700: '#4338ca',
          900: '#1e1b4b',
        },
        surface: {
          DEFAULT: '#0f0f1a',
          card:    '#161626',
          border:  '#2a2a45',
          hover:   '#1e1e35',
        },
        accent: {
          cyan:   '#22d3ee',
          purple: '#a855f7',
          green:  '#10b981',
          red:    '#f43f5e',
          amber:  '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow':    'pulse 3s ease-in-out infinite',
        'fade-in':       'fadeIn 0.4s ease-out',
        'slide-up':      'slideUp 0.4s ease-out',
        'glow':          'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        glow:    { from: { boxShadow: '0 0 10px #6366f1' }, to: { boxShadow: '0 0 25px #818cf8, 0 0 50px #6366f125' } },
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        glow:     '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-sm':'0 0 10px rgba(99, 102, 241, 0.25)',
        card:     '0 4px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
