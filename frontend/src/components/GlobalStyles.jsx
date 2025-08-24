// src/components/GlobalStyles.jsx
import React from 'react';
import { GlobalStyles as MuiGlobalStyles } from '@mui/material';

const GlobalStyles = () => (
  <MuiGlobalStyles
    styles={(theme) => ({
      '*::-webkit-scrollbar': {
        width: '10px',
        height: '8px',
      },
      '*::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
        borderRadius: '4px',
        border: '2px solid transparent',
        backgroundClip: 'content-box',
      },
      '*::-webkit-scrollbar-thumb:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[500],
      },
      'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
        // Use a box-shadow to cover the browser's blue background
        '-webkit-box-shadow': `0 0 0 1000px ${theme.palette.background.paper} inset !important`,
        // Set the text color to match your theme
        '-webkit-text-fill-color': `${theme.palette.text.primary} !important`,
        // A transition delay trick to prevent a brief blue flash
        transition: 'background-color 5000s ease-in-out 0s',
      },
    })}
  />
);

export default GlobalStyles;