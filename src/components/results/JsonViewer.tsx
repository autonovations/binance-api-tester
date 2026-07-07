import React from 'react';
import { Box, useTheme } from '@mui/material';
import JSONPretty from 'react-json-pretty';

interface JsonViewerProps {
  data: unknown;
}

export function JsonViewer({ data }: JsonViewerProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: 'auto',
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: isDark ? '#0D1117' : '#F6F8FA',
        p: 2,
        maxHeight: '600px',
        '& .__json-pretty__': {
          fontFamily: '"Fira Code", "Cascadia Code", monospace',
          fontSize: '0.8rem',
          lineHeight: 1.6,
          margin: 0,
          background: 'transparent !important',
        },
        '& .__json-key__': {
          color: isDark ? '#79C0FF' : '#0550AE',
        },
        '& .__json-value__': {
          color: isDark ? '#A5F3B8' : '#0A6940',
        },
        '& .__json-string__': {
          color: isDark ? '#FFB86C' : '#C24E00',
        },
        '& .__json-boolean__': {
          color: isDark ? '#F0B90B' : '#8B6600',
        },
      }}
    >
      <JSONPretty data={data} space={2} />
    </Box>
  );
}
