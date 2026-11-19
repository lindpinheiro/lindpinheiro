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
          // Subtítulos mais apagados que os títulos, para separar as duas camadas de texto.
          text: dark ? { primary: '#eef0f4', secondary: '#949bab' } : { primary: '#1a1d24', secondary: '#687082' },
        },
        shape: { borderRadius: 16 },
        typography: {
          fontFamily: '"Lexend Variable", system-ui, sans-serif',
          h4: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.5rem', lineHeight: 1.25 },
          h5: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1.25rem', lineHeight: 1.3 },
          h6: { fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.35 },
          subtitle1: { fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1.4 },
          subtitle2: { fontWeight: 600, fontSize: '0.875rem' },
          body1: { fontSize: '0.9375rem', lineHeight: 1.5 },
          body2: { fontSize: '0.8125rem', lineHeight: 1.45 },
          caption: { fontSize: '0.75rem' },
          button: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem' },
        },
        components: {
          MuiCssBaseline: { styleOverrides: { 'html, body': { overscrollBehaviorX: 'none' } } },
          MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { backgroundImage: 'none' } } },
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: { root: { minHeight: 40, paddingInline: 16 }, sizeSmall: { minHeight: 32, paddingInline: 10 }, sizeLarge: { minHeight: 52, fontSize: '0.9375rem' } },
          },
          MuiToggleButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 40 } } },
          MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', minHeight: 44 } } },
          MuiChip: { styleOverrides: { label: { fontSize: '0.8125rem' } } },
          MuiBottomNavigationAction: { styleOverrides: { label: { fontSize: '0.75rem', '&.Mui-selected': { fontSize: '0.75rem' } } } },
          MuiDialogTitle: { styleOverrides: { root: { fontSize: '1.0625rem', fontWeight: 600 } } },
          MuiInputBase: { styleOverrides: { input: { fontSize: '0.9375rem' } } },
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
