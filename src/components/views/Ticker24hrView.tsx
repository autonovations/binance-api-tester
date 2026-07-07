import React, { useState } from 'react';
import { Box, Paper, Typography, useTheme, Divider } from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { ParamPanel } from '../params/ParamPanel';
import { ResultTabs } from '../results/ResultTabs';
import { LoadingState } from '../results/LoadingState';
import { ErrorState } from '../results/ErrorState';
import { useBinanceTicker24hr } from '../../hooks/useBinanceTicker24hr';
import { ENDPOINT_MAP } from '../../config/endpoints';

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  large?: boolean;
}

function KpiCard({ label, value, sub, color, large }: KpiCardProps) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 150,
        p: large ? 2.5 : 2,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        borderTop: color ? `3px solid ${color}` : undefined,
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 700,
          fontFamily: 'monospace',
          fontSize: large ? '1.4rem' : '1.1rem',
          color: color ?? 'text.primary',
        }}
      >
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

export function Ticker24hrView() {
  const [enabled, setEnabled] = useState(false);
  const [params, setParams] = useState({ symbol: 'BTCUSDT' });
  const { data, isLoading, error, refetch } = useBinanceTicker24hr(params.symbol, enabled);
  const theme = useTheme();

  const handleExecute = (p: Record<string, string | number>) => {
    setParams({ symbol: String(p.symbol) });
    if (enabled) refetch();
    else setEnabled(true);
  };

  const isPositive = data ? parseFloat(data.priceChangePercent) >= 0 : false;
  const changeColor = isPositive ? '#02C076' : '#F6465D';

  return (
    <Box>
      <ParamPanel endpoint={ENDPOINT_MAP['ticker24hr']} onExecute={handleExecute} isLoading={isLoading} />

      {isLoading && <LoadingState message="Fetching 24hr stats..." />}
      {error && <ErrorState error={error as Error} />}

      {data && !isLoading && !error && (
        <ResultTabs rawData={data}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Hero card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${changeColor}0D 0%, transparent 60%)`,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                flexWrap: 'wrap',
              }}
            >
              {isPositive
                ? <TrendingUpIcon sx={{ fontSize: 56, color: '#02C076' }} />
                : <TrendingDownIcon sx={{ fontSize: 56, color: '#F6465D' }} />
              }
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {data.symbol} — 24h Ticker
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    ${parseFloat(data.lastPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: changeColor }}>
                    {isPositive ? '+' : ''}{parseFloat(data.priceChangePercent).toFixed(2)}%
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: changeColor, fontWeight: 600 }}>
                  {isPositive ? '+' : ''}{parseFloat(data.priceChange).toFixed(2)} change
                </Typography>
              </Box>
            </Paper>

            {/* KPI Grid */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <KpiCard label="24h High" value={`$${parseFloat(data.highPrice).toLocaleString()}`} color="#02C076" />
              <KpiCard label="24h Low" value={`$${parseFloat(data.lowPrice).toLocaleString()}`} color="#F6465D" />
              <KpiCard label="VWAP" value={`$${parseFloat(data.weightedAvgPrice).toLocaleString()}`} color="#F0B90B" />
              <KpiCard label="Volume" value={parseFloat(data.volume).toLocaleString('en-US', { maximumFractionDigits: 2 })} sub="Base asset" />
              <KpiCard label="Quote Volume" value={parseFloat(data.quoteVolume).toLocaleString('en-US', { maximumFractionDigits: 0 })} sub="USDT" />
              <KpiCard label="Trade Count" value={data.count.toLocaleString()} sub="Total trades" />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <KpiCard label="Bid Price" value={`$${parseFloat(data.bidPrice).toLocaleString()}`} sub={`Qty: ${data.bidQty}`} />
              <KpiCard label="Ask Price" value={`$${parseFloat(data.askPrice).toLocaleString()}`} sub={`Qty: ${data.askQty}`} />
              <KpiCard label="Prev Close" value={`$${parseFloat(data.prevClosePrice).toLocaleString()}`} />
            </Box>
          </Box>
        </ResultTabs>
      )}
    </Box>
  );
}
