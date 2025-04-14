import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Button } from '@mui/material';
import { useState } from 'react';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#003366', // Blue
    },
    secondary: {
      main: '#FFD700', // Gold
    },
    background: {
      default: '#FFFFFF', // White
      paper: '#FFFFFF', // White
    },
    text: {
      primary: '#000000', // Black text for readability
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#003366', // Blue
    },
    secondary: {
      main: '#FFD700', // Gold
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1E1E1E', // Slightly lighter dark background
    },
    text: {
      primary: '#FFFFFF', // White text for readability
    },
  },
});

const ColorModeSelect = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Button onClick={toggleDarkMode} color="secondary" variant="contained">
        Toggle {darkMode ? 'Light' : 'Dark'} Mode
      </Button>
      {children}
    </ThemeProvider>
  );
};

export default ColorModeSelect;