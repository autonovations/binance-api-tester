import { useState } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { AccessTime as AccessTimeIcon } from '@mui/icons-material';
import { ParamPanel } from '../params/ParamPanel';
import { ResultTabs } from '../results/ResultTabs';
import { LoadingState } from '../results/LoadingState';
import { ErrorState } from '../results/ErrorState';
import { useBinanceServerTime } from '../../hooks/useBinanceServerTime';
import { ENDPOINT_MAP } from '../../config/endpoints';

export function ServerTimeView() {
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading, error, refetch } = useBinanceServerTime(enabled);
  const theme = useTheme();

  const handleExecute = () => {
    if (enabled) refetch();
    else setEnabled(true);
  };

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return {
      iso: date.toISOString(),
      local: date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      }),
      utc: date.toUTCString(),
    };
  };

  return (
    <Box>
      <ParamPanel
        endpoint={ENDPOINT_MAP['serverTime']}
        onExecute={handleExecute}
        isLoading={isLoading}
      />

      {isLoading && <LoadingState message="Fetching server time..." />}
      {error && <ErrorState error={error as Error} />}

      {data && !isLoading && !error && (() => {
        const formatted = formatDate(data.serverTime);
        return (
          <ResultTabs rawData={data}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  background: `linear-gradient(135deg, rgba(240,185,11,0.05) 0%, rgba(30,136,229,0.05) 100%)`,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 56, color: 'primary.main', flexShrink: 0 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {formatted.local}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    Unix timestamp: {data.serverTime}
                  </Typography>
                </Box>
              </Paper>

              <Box sx={{ display: 'flex', gap: 2 }}>
                {[
                  { label: 'ISO 8601', value: formatted.iso },
                  { label: 'UTC', value: formatted.utc },
                ].map(({ label, value }) => (
                  <Paper
                    key={label}
                    elevation={0}
                    sx={{
                      flex: 1,
                      p: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {value}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          </ResultTabs>
        );
      })()}
    </Box>
  );
}
