import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Hub as HubIcon,
} from '@mui/icons-material';
import { useThemeMode } from '../../context/ThemeContext';

export function TopBar() {
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        background:
          mode === 'dark'
            ? 'linear-gradient(90deg, #0B0E11 0%, #161A1E 100%)'
            : 'linear-gradient(90deg, #FFFFFF 0%, #F5F5F5 100%)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mr: 2,
          }}
        >
          <HubIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                lineHeight: 1,
                fontSize: '1.1rem',
                letterSpacing: '-0.3px',
              }}
            >
              Binance Explorer
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontSize: '0.68rem' }}
            >
              REST API Visual Explorer
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            bgcolor: mode === 'dark' ? 'rgba(240,185,11,0.08)' : 'rgba(240,185,11,0.1)',
            border: '1px solid',
            borderColor: 'rgba(240,185,11,0.3)',
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#02C076',
              boxShadow: '0 0 8px #02C076',
            }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            api.binance.com
          </Typography>
        </Box>

        <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
          <IconButton onClick={toggleMode} size="small" sx={{ color: 'text.secondary' }}>
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
