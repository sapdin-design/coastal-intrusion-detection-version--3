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
        ocean: {
          950: '#030712',
          900: '#060b13',
          850: '#0a101d',
          800: '#0f172a',
          750: '#15203b',
          700: '#1e293b',
          600: '#334155',
          500: '#475569',
          400: '#64748b'
        },
        radar: {
          green: '#10b981',
          lightGreen: '#34d399',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          amber: '#f59e0b',
          crimson: '#ef4444',
          glow: '#00ff88'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'beacon': 'beacon 1.5s ease-out infinite'
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        beacon: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.4)', opacity: '0' }
        }
      }
    },
  },
  plugins: [],
}
