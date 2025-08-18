// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

export const getCustomTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: '#1976d2' },
    secondary: { main: '#ffa000' },
    background: {
        default: mode === 'dark' ? '#000000' : '#f0f2f5',
        paper: mode === 'dark' ? '#111111' : '#ffffff',
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTableContainer: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
            }),
        },
    },
    MuiTableCell: {
      styleOverrides: {
        stickyHeader: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
        }),
      }
    },
  },
});