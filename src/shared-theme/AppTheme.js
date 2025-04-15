import React, { useMemo, useState, createContext, useContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: '#003366',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FFCC00',
    },
    background: {
      default: mode === 'light' ? '#ffffff' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1E1E1E',
    },
    text: {
      primary: mode === 'light' ? '#003366' : '#ffffff',
      secondary: '#444444',
    },
  },
  typography: {
    fontFamily: 'Georgia, serif',
    h4: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#FFCC00',
            color: '#003366',
          },
        },
        outlinedPrimary: {
          borderColor: '#003366',
          color: '#003366',
          '&:hover': {
            backgroundColor: '#003366',
            color: '#ffffff',
          },
        },
      },
    },
  },
});

export default function AppTheme({ children }) {
  const [mode, setMode] = useState('light');

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    []
  );

  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
