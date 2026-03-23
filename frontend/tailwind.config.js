// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn:  'fadeIn 0.15s ease',
        slideUp: 'slideUp 0.2s ease',
      },
      colors: {
        primary: {
          DEFAULT: '#c2621a',
          dark:    '#a34f12',
          light:   '#d97c3a',
          bg:      '#fdf0e6',
        },
        surface: {
          DEFAULT: '#ffffff',
          2:       '#f9f8f6',
        },
        sidebar: {
          bg:     '#1a1108',
          text:   '#e8d9c8',
          muted:  '#8a7060',
          hover:  'rgba(255,255,255,0.06)',
          active: 'rgba(194,98,26,0.18)',
        },
        admin: {
          bg:     '#f5f4f2',
          border: '#e8e2db',
          'border-light': '#f0ebe4',
          muted:  '#9a8878',
          secondary: '#4a3f35',
        },
        status: {
          'success-bg': '#eaf5ee',
          'success':    '#2d7a4a',
          'warning-bg': '#fef6e4',
          'warning':    '#b87a10',
          'danger-bg':  '#fdecea',
          'danger':     '#c0392b',
          'info-bg':    '#e8f3fb',
          'info':       '#1a6fa8',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      borderRadius: {
        'xl2': '20px',
      },
      width: {
        sidebar: '240px',
        'sidebar-collapsed': '64px',
      },
      minWidth: {
        sidebar: '240px',
      },
      height: {
        topbar: '60px',
      },
    },
  },
  plugins: [],
}
