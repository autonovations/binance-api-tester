import { useState } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import { ParamPanel } from '../params/ParamPanel';
import { ResultTabs } from '../results/ResultTabs';
import { LoadingState } from '../results/LoadingState';
import { ErrorState } from '../results/ErrorState';
import { useBinancePing } from '../../hooks/useBinancePing';
import { ENDPOINT_MAP } from '../../config/endpoints';

export function PingView() {
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading, error, refetch } = useBinancePing(enabled);
  const theme = useTheme();

  const handleExecute = () => {
    if (enabled) {
      refetch();
    } else {
      setEnabled(true);
    }
  };

  const getLatencyColor = (ms: number) => {
    if (ms < 100) return '#02C076';
    if (ms < 300) return '#F0B90B';
    return '#F6465D';
  };

  return (
    <Box>
      <ParamPanel
        endpoint={ENDPOINT_MAP['ping']}
        onExecute={handleExecute}
        isLoading={isLoading}
      />

      {isLoading && <LoadingState message="Pinging Binance API..." />}
      {error && <ErrorState error={error as Error} />}

      {data && !isLoading && !error && (
        <ResultTabs rawData={data}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minWidth: 180,
                p: 3,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 48, color: '#02C076' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#02C076' }}>
                Connected
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Binance API is reachable
              </Typography>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minWidth: 180,
                p: 3,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <SpeedIcon
                sx={{
                  fontSize: 48,
                  color: getLatencyColor(data.latencyMs),
                }}
              />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: getLatencyColor(data.latencyMs),
                }}
              >
                {data.latencyMs}
                <Typography component="span" variant="h6" sx={{ ml: 0.5, opacity: 0.7 }}>
                  ms
                </Typography>
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Round-trip latency
              </Typography>
            </Paper>
          </Box>
        </ResultTabs>
      )}
    </Box>
  );
}
