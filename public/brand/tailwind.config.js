module.exports = {
  theme: {
    extend: {
      colors: {
        pilot: {
          bg:           '#0b0b0a',
          'bg-2':       '#111110',
          'bg-deep':    '#070706',
          ink:          '#eceae3',
          'ink-dim':    '#8a8a83',
          'ink-faint':  '#3a3a37',
          line:         '#1d1d1b',
          'line-2':     '#26261f',
          accent:       '#C5F000',
          'accent-ink': '#0b0b0a',
          term:         '#060605',
        },
        'pilot-light': {
          bg:           '#fafaf7',
          'bg-2':       '#f0efea',
          'bg-deep':    '#e9e8e2',
          ink:          '#0b0b0a',
          'ink-dim':    '#5a5a54',
          'ink-faint':  '#c7c6be',
          line:         '#e6e5df',
          'line-2':     '#d8d7d0',
          accent:       '#82AA14',
        },
      },
      fontFamily: {
        sans:  ['"Inter Tight"', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'ui-monospace', 'Menlo', 'monospace'],
        serif: ['"Instrument Serif"', '"Times New Roman"', 'serif'],
      },
      maxWidth: {
        wrap: '1440px',
      },
    },
  },
}
