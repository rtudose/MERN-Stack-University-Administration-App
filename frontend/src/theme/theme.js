// src/theme/theme.js (Advanced Version)
import { createTheme } from '@mui/material/styles';

const getCustomTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ffa000',
    },
    // THE FIX: Use a slightly lighter dark for better shadow contrast
    background: {
        default: mode === 'dark' ? '#121212' : '#fafafa', // Main background
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',   // Paper/Card background
    },
  },

  shape: {
    borderRadius: 26, // A slightly less extreme, more professional radius
  },

  typography: {
    h4: { fontWeight: 600 },
    h5: { fontWeight: 500 }
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { overflow: 'hidden' },
        '*::-webkit-scrollbar': { width: '8px' },
        '*::-webkit-scrollbar-track': { background: mode === 'dark' ? '#2b2b2b' : '#f1f1f1' },
        '*::-webkit-scrollbar-thumb': { background: mode === 'dark' ? '#555' : '#888', borderRadius: '4px' },
        '*::-webkit-scrollbar-thumb:hover': { background: mode === 'dark' ? '#777' : '#555' },
      },
    },
    MuiPaper: {
      defaultProps: {
          elevation: mode === 'dark' ? 6 : 4, // Use a stronger shadow in dark mode
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none', // Important for dark mode
          border: 'none',
        },
      },
    },
    // THE FIX: Ensure TableContainer matches the Paper's border radius
    MuiTableContainer: {
        styleOverrides: {
            root: ({ theme }) => ({
                // This makes the table corners rounded to match the container
                borderRadius: theme.shape.borderRadius,
            }),
        },
    },
  },
});

export default getCustomTheme;