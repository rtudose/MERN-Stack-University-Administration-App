// src/context/ThemeContext.jsx
import React, { createContext, useState, useMemo, useContext } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import getCustomTheme from '../theme/theme';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
  // Check localStorage for a saved mode, otherwise default to 'light'
  const [mode, setMode] = useState(localStorage.getItem('themeMode') || 'light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode); // Save the new mode
          return newMode;
        });
      },
    }),
    [],
  );

  const theme = useMemo(() => getCustomTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MUIThemeProvider theme={theme}>
        {children}
      </MUIThemeProvider>
    </ColorModeContext.Provider>
  );
};