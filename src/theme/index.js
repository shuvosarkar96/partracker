import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6750A4', light: '#EADDFF', dark: '#4F378B', contrastText: '#FFFFFF' },
    secondary: { main: '#625B71', light: '#E8DEF8', dark: '#1D192B' },
    error: { main: '#B3261E', light: '#F9DEDC' },
    warning: { main: '#E67E22', light: '#FEF3DD' },
    success: { main: '#2E7D32', light: '#E8F5E9' },
    background: { default: '#FFFBFE', paper: '#FFFBFE' },
    surface: { main: '#FFFBFE' },
    surfaceVariant: { main: '#E7E0EC' },
    outline: { main: '#79747E' },
  },
  typography: {
    fontFamily: "'Roboto', sans-serif",
    h4: { fontWeight: 400, letterSpacing: 0 },
    h5: { fontWeight: 400 },
    h6: { fontWeight: 500 },
    subtitle1: { fontWeight: 500 },
    body2: { color: '#49454F' },
    labelLarge: { fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.006em' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
          border: '1px solid #E7E0EC',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 50, textTransform: 'none', fontWeight: 500, padding: '10px 24px' },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: '0 1px 3px rgba(0,0,0,0.2)' } },
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
      styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } } }
    },
    MuiBottomNavigation: {
      styleOverrides: { root: { borderTop: '1px solid #E7E0EC', height: 64 } }
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 8 } }
    },
    MuiFab: {
      styleOverrides: { root: { borderRadius: 16, boxShadow: '0 3px 8px rgba(0,0,0,0.2)' } }
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 28, padding: '8px 0' } }
    },
    MuiSwitch: {
      styleOverrides: {
        root: { width: 52, height: 32, padding: 0 },
        switchBase: { padding: 4, '&.Mui-checked': { transform: 'translateX(20px)' } },
        thumb: { width: 24, height: 24 },
        track: { borderRadius: 16, opacity: 1, backgroundColor: '#E7E0EC' }
      }
    }
  }
})

export default theme
