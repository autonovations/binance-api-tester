import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';

type ThemeMode = 'dark' | 'light';

interface ThemeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'dark',
  toggleMode: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export function useThemeMode() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>('dark');

  const toggleMode = () => setMode((m) => (m === 'dark' ? 'light' : 'dark'));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'dark'
            ? {
                primary: { main: '#F0B90B' },
                secondary: { main: '#1E88E5' },
                background: {
                  default: '#0B0E11',
                  paper: '#161A1E',
                },
                text: {
                  primary: '#EAECEF',
                  secondary: '#848E9C',
                },
                success: { main: '#02C076' },
                error: { main: '#F6465D' },
                divider: '#2B3139',
              }
            : {
                primary: { main: '#F0B90B' },
                secondary: { main: '#1E88E5' },
                background: {
                  default: '#F5F5F5',
                  paper: '#FFFFFF',
                },
                text: {
                  primary: '#1E2329',
                  secondary: '#707A8A',
                },
                success: { main: '#02C076' },
                error: { main: '#F6465D' },
                divider: '#E6E8EA',
              }),
        },
        typography: {
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontWeight: 700 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 600 },
          h4: { fontWeight: 600 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        shape: { borderRadius: 8 },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 600,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { fontWeight: 600 },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
