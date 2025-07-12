/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#667eea',
          dark: '#5a67d8',
          light: '#7c88f0'
        },
        secondary: {
          DEFAULT: '#764ba2',
          dark: '#6b4596',
          light: '#8156ab'
        },
        accent: {
          DEFAULT: '#f093fb',
          dark: '#e87cf4',
          light: '#f4a8fc'
        },
        background: {
          primary: '#0a0b0f',
          secondary: '#1a1b23',
          card: '#2a2d3a',
          glass: 'rgba(42, 45, 58, 0.8)'
        },
        text: {
          primary: '#ffffff',
          secondary: '#b2b7c2',
          muted: '#6b7280'
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          light: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(255, 255, 255, 0.05)'
        },
        success: {
          DEFAULT: '#22c55e',
          dark: '#16a34a',
          light: '#4ade80'
        }
      },
      fontFamily: {
        primary: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        display: ['Inter', 'sans-serif']
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      lineHeight: {
        'tight': '1.25',
        'normal': '1.5',
        'relaxed': '1.75'
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '40px',
        '3xl': '64px'
      },
      animation: {
        'breathe': 'breathe 3s ease-in-out infinite',
        'shine': 'shine 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '100%' }
        },
        glow: {
          '0%': { filter: 'brightness(1)' },
          '100%': { filter: 'brightness(1.2)' }
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '120': '30rem'
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px'
      }
    },
  },
  plugins: [],
} 