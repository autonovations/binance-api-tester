import React, { useState } from 'react';
import { Box, Tabs, Tab, useTheme } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { JsonViewer } from './JsonViewer';

interface ResultTabsProps {
  rawData: unknown;
  children: React.ReactNode; // visual view
}

export function ResultTabs({ rawData, children }: ResultTabsProps) {
  const [tab, setTab] = useState(0);
  const theme = useTheme();

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          background:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.02)',
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            minHeight: 40,
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
            '& .MuiTab-root': {
              minHeight: 40,
              fontSize: '0.8rem',
              fontWeight: 600,
              textTransform: 'none',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab
            icon={<DashboardIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Visual"
          />
          <Tab
            icon={<CodeIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="Raw JSON"
          />
        </Tabs>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {tab === 0 && children}
        {tab === 1 && <JsonViewer data={rawData} />}
      </Box>
    </Box>
  );
}
