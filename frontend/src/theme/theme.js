// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const getCustomTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: { main: '#1976d2' },
    secondary: { main: '#ffa000' },
    background: {
        default: mode === 'dark' ? '#121212' : '#f0f2f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
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
        root: ({ theme }) => ({
          backgroundImage: 'none',
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiTableContainer: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: theme.shape.borderRadius,
            }),
        },
    },
    /* MuiTableBody: {
        styleOverrides: {
            root: {
                '& tr:last-child td, & tr:last-child th': {
                    border: 0,
                },
            },
        },
    },
    */
    MuiTableCell: {
      styleOverrides: {
        stickyHeader: ({ theme }) => ({
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
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