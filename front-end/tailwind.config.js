module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#256c20',
          dark: '#8dd97e',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          dark: '#003a02',
        },
        'primary-container': {
          DEFAULT: '#a8f697',
          dark: '#035307',
        },
        'on-primary-container': {
          DEFAULT: '#002201',
          dark: '#a8f697',
        },
        'secondary': {
          DEFAULT: '#53634e',
          dark: '#bbccb2',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          dark: '#263422',
        },
        'secondary-container': {
          DEFAULT: '#d7e8cd',
          dark: '#3c4b37',
        },
        'on-secondary-container': {
          DEFAULT: '#121f0f',
          dark: '#d7e8cd',
        },
        'tertiary': {
          DEFAULT: '#386569',
          dark: '#a0cfd2',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          dark: '#00373a',
        },
        'tertiary-container': {
          DEFAULT: '#bcebef',
          dark: '#1e4d51',
        },
        'on-tertiary-container': {
          DEFAULT: '#002022',
          dark: '#bcebef',
        },
        'error': {
          DEFAULT: '#ba1a1a',
          dark: '#ffb4ab',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          dark: '#690005',
        },
        'error-container': {
          DEFAULT: '#ffdad6',
          dark: '#93000a',
        },
        'on-error-container': {
          DEFAULT: '#410002',
          dark: '#ffdad6',
        },
        'background': {
          DEFAULT: '#fcfdf6',
          dark: '#1a1c18',
        },
        'on-background': {
          DEFAULT: '#1a1c18',
          dark: '#e2e3dd',
        },
        'surface': {
          DEFAULT: '#fcfdf6',
          dark: '#2f312d',
          0: '#000000',
          10: '#1a1c18',
          20: '#2f312d',
          25: '#3a3c38', 
          30: '#454743', 
          40: '#5d5f5a',
          50: '#767872',
          60: '#90918c',
          70: '#abaca6',
          80: '#c6c7c1',
          90: '#e2e3dd',
          95: '#f1f1eb',
          98: '#f9faf3',
          99: '#fcfdf6',
          100: '#ffffff',
        },
        'on-surface': {
          DEFAULT: '#1a1c18',
          dark: '#e2e3dd',
        },
        'surface-variant': {
          DEFAULT: '#dfe4d8',
          dark: '#42493f',
        },
        'on-surface-variant': {
          DEFAULT: '#42493f',
          dark: '#c2c8bc',
        },
        'outline': {
          DEFAULT: '#73796e',
          dark: '#8d9387',
        },
        'outline-variant': {
          DEFAULT: '#73796e',
          dark: '#42493f',
        },
        'inverse-surface': {
          DEFAULT: '#fcfdf6',
          dark: '#1a1c18',
        },
        'on-inverse-surface': {
          DEFAULT: '#1a1c18',
          dark: '#e2e3dd',
        },
        'inverse-primary': {
          DEFAULT: '#fcfdf6',
          dark: '#256c20',
        },
        'shadow': {
          DEFAULT: '#000000',
          dark: '#666666',
        },
        'surface-tint': {
          DEFAULT: '#8dd97e',
          dark: '#8dd97e',
        },
        'scrim': {
          DEFAULT: '#000000',
          dark: '#000000',
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('tailwind-scrollbar')({ nocompatible: true })],
  darkMode: "class"
}