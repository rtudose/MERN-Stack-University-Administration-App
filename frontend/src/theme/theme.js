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
    borderRadius: 26,
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
    // Avoid double rounding seams: TableContainer should be flat; outer frame handles radius
    MuiTableContainer: {
        styleOverrides: {
            root: {
                borderRadius: 0,
                border: 'none',
                backgroundColor: 'transparent',
            },
        },
    },
    MuiTableBody: {
      styleOverrides: {
          root: {
              // Target the last row specifically within the table body
              '& tr:last-child td, & tr:last-child th': {
                  border: 0,
              },
          },
      },
  },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          // Ensure header cells have the correct background and color
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[1800] : theme.palette.grey[300],
          color: theme.palette.text.primary,
          fontWeight: 'bold',
        }),
        // Apply rounded corners to the first and last header cells
        stickyHeader: ({ theme }) => ({
            '&:first-of-type': {
                borderTopLeftRadius: theme.shape.borderRadius,
            },
            '&:last-of-type': {
                borderTopRightRadius: theme.shape.borderRadius,
            },
        }),
      }
    },
  },
});

export default getCustomTheme;