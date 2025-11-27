/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    '../packages/react/src/**/*.{html,js,jsx,md,mdx,ts,tsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        train: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        train: 'train 2s linear infinite',
      },
      colors: {
        // codemirror-theme settings
        background: 'var(--background)',
        lineBackground: 'var(--lineBackground)',
        foreground: 'var(--foreground)',
        caret: 'var(--caret)',
        selection: 'var(--selection)',
        selectionMatch: 'var(--selectionMatch)',
        gutterBackground: 'var(--gutterBackground)',
        gutterForeground: 'var(--gutterForeground)',
        gutterBorder: 'var(--gutterBorder)',
        lineHighlight: 'var(--lineHighlight)',
      },
      spacing: {
        'app-height': 'var(--app-height)',
        'app-width': 'var(--app-width)',
      },
      typography(theme) {
        return {
          DEFAULT: {
            css: {
              'code::before': {
                content: 'none',
              },
              'code::after': {
                content: 'none',
              },
              color: 'var(--foreground)',
              lineHeight: '1.75',
              // Links
              a: {
                color: theme('colors.blue.400'),
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'color 0.15s ease-in-out',
                '&:hover': {
                  color: theme('colors.blue.300'),
                  textDecoration: 'underline',
                },
              },
              // Headings
              h1: {
                color: 'var(--foreground)',
                fontSize: '2.25em',
                fontWeight: '700',
                lineHeight: '1.2',
                marginTop: '0',
                marginBottom: '0.8em',
                letterSpacing: '-0.025em',
              },
              h2: {
                color: 'var(--foreground)',
                fontSize: '1.65em',
                fontWeight: '600',
                lineHeight: '1.3',
                marginTop: '1.8em',
                marginBottom: '0.8em',
                letterSpacing: '-0.02em',
                borderBottomWidth: '1px',
                borderBottomColor: theme('colors.gray.700'),
                paddingBottom: '0.3em',
              },
              h3: {
                color: 'var(--foreground)',
                fontSize: '1.25em',
                fontWeight: '600',
                lineHeight: '1.5',
                marginTop: '1.6em',
                marginBottom: '0.6em',
              },
              h4: {
                color: 'var(--foreground)',
                fontSize: '1.1em',
                fontWeight: '600',
                lineHeight: '1.5',
                marginTop: '1.4em',
                marginBottom: '0.5em',
              },
              // Paragraphs
              p: {
                marginTop: '1.25em',
                marginBottom: '1.25em',
              },
              // Lists
              ul: {
                marginTop: '1em',
                marginBottom: '1em',
                paddingLeft: '1.5em',
              },
              ol: {
                marginTop: '1em',
                marginBottom: '1em',
                paddingLeft: '1.5em',
              },
              li: {
                marginTop: '0.4em',
                marginBottom: '0.4em',
              },
              'ul > li::marker': {
                color: theme('colors.gray.500'),
              },
              'ol > li::marker': {
                color: theme('colors.gray.500'),
                fontWeight: '500',
              },
              // Code
              code: {
                color: theme('colors.pink.400'),
                backgroundColor: theme('colors.gray.800'),
                padding: '0.2em 0.4em',
                borderRadius: '0.25em',
                fontSize: '0.875em',
                fontWeight: '500',
              },
              pre: {
                color: 'var(--foreground)',
                backgroundColor: theme('colors.gray.900'),
                borderRadius: '0.5em',
                padding: '1em 1.25em',
                overflowX: 'auto',
                border: '1px solid',
                borderColor: theme('colors.gray.700'),
              },
              'pre code': {
                backgroundColor: 'transparent',
                padding: '0',
                color: 'inherit',
                fontSize: '0.875em',
              },
              // Blockquotes
              blockquote: {
                borderLeftWidth: '4px',
                borderLeftColor: theme('colors.blue.500'),
                backgroundColor: theme('colors.gray.800') + '40',
                paddingLeft: '1em',
                paddingRight: '1em',
                paddingTop: '0.5em',
                paddingBottom: '0.5em',
                marginTop: '1.5em',
                marginBottom: '1.5em',
                borderRadius: '0 0.5em 0.5em 0',
                fontStyle: 'normal',
              },
              'blockquote p': {
                marginTop: '0.5em',
                marginBottom: '0.5em',
              },
              'blockquote p:first-of-type::before': {
                content: 'none',
              },
              'blockquote p:last-of-type::after': {
                content: 'none',
              },
              // Strong/bold
              strong: {
                color: 'var(--foreground)',
                fontWeight: '600',
              },
              // Horizontal rule
              hr: {
                borderColor: theme('colors.gray.700'),
                marginTop: '2em',
                marginBottom: '2em',
              },
              // Tables
              table: {
                width: '100%',
                tableLayout: 'auto',
                marginTop: '1.5em',
                marginBottom: '1.5em',
              },
              thead: {
                borderBottomWidth: '2px',
                borderBottomColor: theme('colors.gray.600'),
              },
              'thead th': {
                color: 'var(--foreground)',
                fontWeight: '600',
                paddingBottom: '0.75em',
                paddingLeft: '0.75em',
                paddingRight: '0.75em',
              },
              'tbody tr': {
                borderBottomWidth: '1px',
                borderBottomColor: theme('colors.gray.700'),
              },
              'tbody td': {
                paddingTop: '0.75em',
                paddingBottom: '0.75em',
                paddingLeft: '0.75em',
                paddingRight: '0.75em',
              },
              // Images
              img: {
                borderRadius: '0.5em',
                marginTop: '1.5em',
                marginBottom: '1.5em',
              },
            },
          },
        };
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
};
