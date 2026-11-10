import React, { useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme, useMediaQuery } from '@mui/material'
import '@fontsource-variable/lexend'
import App from './App.jsx'

function Root() {
  const dark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: dark ? 'dark' : 'light',
          primary: { main: dark ? '#a5b4fc' : '#4f46e5' },
          success: { main: dark ? '#6ee7b7' : '#059669' },
          background: dark ? { default: '#0f1115', paper: '#181b21' } : { default: '#f6f7f9', paper: '#ffffff' },
        },
        shape: { borderRadius: 16 },
        typography: {
          fontFamily: '"Lexend Variable", system-ui, sans-serif',
          fontSize: 16,
          htmlFontSize: 14,
          h4: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.75rem', lineHeight: 1.2 },
          h6: { fontWeight: 600 },
          subtitle1: { fontWeight: 500 },
          button: { textTransform: 'none', fontWeight: 600 },
        },
        components: {
          MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: 'none' } } },
          MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { sizeLarge: { paddingBlock: 14 } } },
          MuiAccordion: {
            defaultProps: { disableGutters: true },
            styleOverrides: { root: { '&::before': { display: 'none' } } },
          },
        },
      }),
    [dark],
  )
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(<Root />)

// Permite instalar como app e abrir sem internet. Service worker exige https (ou localhost).
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('treino-sw.js').catch(() => {})
}
