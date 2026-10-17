/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          dark: '#0B0F19',
          card: '#111827',
          cardHover: '#162032',
          border: 'rgba(255, 255, 255, 0.08)',
          emerald: '#10B981',
          emeraldGlow: 'rgba(16, 185, 129, 0.15)',
          gold: '#F59E0B',
          goldGlow: 'rgba(245, 158, 11, 0.15)',
          indigo: '#6366F1',
          violet: '#8B5CF6',
          cyan: '#06B6D4',
          rose: '#F43F5E',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'fintech-sm': '0 2px 8px -2px rgba(0, 0, 0, 0.3), 0 1px 4px -1px rgba(255, 255, 255, 0.03)',
        'fintech': '0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 2px 8px -2px rgba(255, 255, 255, 0.05)',
        'fintech-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.5), 0 4px 12px -2px rgba(99, 102, 241, 0.12)',
        'glow-emerald': '0 0 24px -4px rgba(16, 185, 129, 0.35)',
        'glow-indigo': '0 0 24px -4px rgba(99, 102, 241, 0.35)',
        'glow-gold': '0 0 24px -4px rgba(245, 158, 11, 0.35)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
