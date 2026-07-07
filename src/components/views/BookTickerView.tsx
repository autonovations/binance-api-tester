import React, { useState } from 'react';
import { Box, Paper, Typography, useTheme, Chip } from '@mui/material';
import { ParamPanel } from '../params/ParamPanel';
import { ResultTabs } from '../results/ResultTabs';
import { LoadingState } from '../results/LoadingState';
import { ErrorState } from '../results/ErrorState';
import { useBinanceBookTicker } from '../../hooks/useBinanceBookTicker';
import { ENDPOINT_MAP } from '../../config/endpoints';

export function BookTickerView() {
  const [enabled, setEnabled] = useState(false);
  const [params, setParams] = useState({ symbol: 'BTCUSDT' });
  const { data, isLoading, error, refetch } = useBinanceBookTicker(params.symbol, enabled);
  const theme = useTheme();

  const handleExecute = (p: Record<string, string | number>) => {
    setParams({ symbol: String(p.symbol) });
    if (enabled) refetch();
    else setEnabled(true);
  };

  const spread = data
    ? (parseFloat(data.askPrice) - parseFloat(data.bidPrice)).toFixed(8)
    : null;
  const spreadPct = data
    ? ((parseFloat(data.askPrice) - parseFloat(data.bidPrice)) / parseFloat(data.bidPrice) * 100).toFixed(4)
    : null;

  return (
    <Box>
      <ParamPanel endpoint={ENDPOINT_MAP['bookTicker']} onExecute={handleExecute} isLoading={isLoading} />

      {isLoading && <LoadingState message="Fetching book ticker..." />}
      {error && <ErrorState error={error as Error} />}

      {data && !isLoading && !error && (
        <ResultTabs rawData={data}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{data.symbol}</Typography>
              <Chip label="BOOK TICKER" size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', bgcolor: 'rgba(240,185,11,0.1)', color: 'primary.main', border: '1px solid rgba(240,185,11,0.3)' }} />
            </Box>

            {/* Bid / Ask cards */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  p: 3,
                  border: '2px solid rgba(2,192,118,0.3)',
                  borderRadius: 2,
                  background: 'rgba(2,192,118,0.05)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#02C076', fontWeight: 700, display: 'block', mb: 1 }}>
                  ▲ BEST BID
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#02C076', fontFamily: 'monospace' }}>
                  ${parseFloat(data.bidPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontFamily: 'monospace' }}>
                  Qty: {parseFloat(data.bidQty).toFixed(6)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Total: ${(parseFloat(data.bidPrice) * parseFloat(data.bidQty)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  p: 3,
                  border: '2px solid rgba(246,70,93,0.3)',
                  borderRadius: 2,
                  background: 'rgba(246,70,93,0.05)',
                }}
              >
                <Typography variant="caption" sx={{ color: '#F6465D', fontWeight: 700, display: 'block', mb: 1 }}>
                  ▼ BEST ASK
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#F6465D', fontFamily: 'monospace' }}>
                  ${parseFloat(data.askPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontFamily: 'monospace' }}>
                  Qty: {parseFloat(data.askQty).toFixed(6)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Total: ${(parseFloat(data.askPrice) * parseFloat(data.askQty)).toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </Typography>
              </Paper>
            </Box>

            {/* Spread card */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                borderTop: `3px solid ${theme.palette.primary.main}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                  SPREAD
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>
                  {spread}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                  SPREAD %
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>
                  {spreadPct}%
                </Typography>
              </Box>
            </Paper>
          </Box>
        </ResultTabs>
      )}
    </Box>
  );
}
