/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bricolage Grotesque', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          dark: '#04090A',
          forest: '#0D1F14',
          DEFAULT: '#22C55E',
          muted: '#16A34A',
          light: '#F0FDF4',
          amber: '#F59E0B',
        },
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 5s ease-in-out infinite',
        'scan': 'scan 1.8s ease-in-out infinite',
        'gradient-x': 'gradient-x 4s ease infinite',
        'pulse-ring': 'pulse-ring 1.5s ease-out infinite',
        'typewriter': 'typewriter 0.1s steps(1) forwards',
        'dash': 'dash 1.5s ease-in-out infinite',
        'orb': 'orb 8s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        scan: {
          '0%, 100%': { opacity: '0.4', transform: 'scaleX(0.8)' },
          '50%': { opacity: '1', transform: 'scaleX(1)' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        dash: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        orb: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 10px) scale(0.95)' },
        },
      },
      backgroundImage: {
        'dot-grid': "radial-gradient(circle, rgba(34,197,94,0.15) 1px, transparent 1px)",
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
      },
      backgroundSize: {
        'dot-grid': '24px 24px',
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(34, 197, 94, 0.25)',
        'glow': '0 0 24px rgba(34, 197, 94, 0.35)',
        'glow-lg': '0 0 48px rgba(34, 197, 94, 0.3)',
        'dark': '0 4px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
