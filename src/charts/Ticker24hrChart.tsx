import { useMemo } from 'react';
import { Box, Typography, useTheme, Paper } from '@mui/material';
import type { Ticker24hr } from '../types/binance';

interface Ticker24hrChartProps {
  data: Ticker24hr;
}

function PriceRangeBar({ low, high, current, isDark }: { low: number; high: number; current: number; isDark: boolean }) {
  const range = high - low;
  const pct = range > 0 ? ((current - low) / range) * 100 : 50;
  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Typography sx={{ fontSize: '0.72rem', color: '#F6465D', fontFamily: 'monospace', fontWeight: 600 }}>
          L ${low.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
          24h Range
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: '#02C076', fontFamily: 'monospace', fontWeight: 600 }}>
          H ${high.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Typography>
      </Box>
      {/* Track */}
      <Box sx={{ position: 'relative', height: 8, borderRadius: 4, overflow: 'visible',
        background: isDark
          ? 'linear-gradient(to right, rgba(246,70,93,0.3), rgba(240,185,11,0.2), rgba(2,192,118,0.3))'
          : 'linear-gradient(to right, rgba(246,70,93,0.2), rgba(240,185,11,0.15), rgba(2,192,118,0.2))',
      }}>
        {/* Filled portion */}
        <Box sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${clamped}%`,
          borderRadius: 4,
          background: 'linear-gradient(to right, #F6465D, #F0B90B, #02C076)',
          transition: 'width 0.6s ease',
        }} />
        {/* Thumb */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: `${clamped}%`,
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          borderRadius: '50%',
          bgcolor: isDark ? '#FFFFFF' : '#1A1A2E',
          border: '2.5px solid #F0B90B',
          boxShadow: '0 0 8px rgba(240,185,11,0.6)',
          zIndex: 2,
          transition: 'left 0.6s ease',
        }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Typography sx={{ fontSize: '0.72rem', color: '#F0B90B', fontFamily: 'monospace', fontWeight: 700 }}>
          Current: ${current.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', ml: 1 }}>
          ({clamped.toFixed(1)}% of range)
        </Typography>
      </Box>
    </Box>
  );
}

function ChangeGauge({ pct, isDark }: { pct: number; isDark: boolean }) {
  // Gauge: -10% to +10% mapped to 0–180 deg arc
  const maxPct = 10;
  const clamped = Math.max(-maxPct, Math.min(maxPct, pct));
  const angleDeg = ((clamped + maxPct) / (maxPct * 2)) * 180; // 0 = far left, 180 = far right

  const cx = 100;
  const cy = 90;
  const r = 72;

  // Arc: start at left (-10%), end at right (+10%)
  // Start angle: 180deg (left), end: 0deg (right) — in SVG coords
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Background arc: from 180 to 0 (half circle)
  const arcStart = { x: cx - r, y: cy };
  const arcEnd = { x: cx + r, y: cy };

  // Needle angle: 180 - angleDeg (SVG: 0 = right, measured CCW from right)
  const needleAngle = 180 - angleDeg;
  const needleX = cx + r * 0.8 * Math.cos(toRad(needleAngle));
  const needleY = cy - r * 0.8 * Math.sin(toRad(needleAngle));

  const isPositive = pct >= 0;
  const color = isPositive ? '#02C076' : '#F6465D';

  // Filled arc from start to current position
  const fillAngle = 180 - angleDeg; // in standard math angle
  const fillX = cx + r * Math.cos(toRad(fillAngle));
  const fillY = cy - r * Math.sin(toRad(fillAngle));
  const largeArc = angleDeg > 90 ? 1 : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="200" height="110" viewBox="0 0 200 110">
        {/* Background arc */}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke={isDark ? '#2B3139' : '#E6E8EA'}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${largeArc} 1 ${fillX} ${fillY}`}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r="5" fill={isDark ? '#2B3139' : '#E6E8EA'} />
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleX}
          y2={needleY}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Labels */}
        <text x="15" y="100" fill={isDark ? '#848E9C' : '#707A8A'} fontSize="12" fontFamily="Inter,sans-serif">-10%</text>
        <text x="152" y="100" fill={isDark ? '#848E9C' : '#707A8A'} fontSize="12" fontFamily="Inter,sans-serif">+10%</text>
        <text x="88" y="40" fill={isDark ? '#848E9C' : '#707A8A'} fontSize="11" fontFamily="Inter,sans-serif">0%</text>
      </svg>
      <Typography sx={{ fontWeight: 700, fontSize: '1.3rem', color, fontFamily: 'monospace', mt: -1.5 }}>
        {isPositive ? '+' : ''}{pct.toFixed(2)}%
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>
        24h Price Change
      </Typography>
    </Box>
  );
}

export function Ticker24hrChart({ data }: Ticker24hrChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const vals = useMemo(() => ({
    low: parseFloat(data.lowPrice),
    high: parseFloat(data.highPrice),
    current: parseFloat(data.lastPrice),
    pct: parseFloat(data.priceChangePercent),
    volume: parseFloat(data.volume),
    quoteVolume: parseFloat(data.quoteVolume),
    vwap: parseFloat(data.weightedAvgPrice),
  }), [data]);

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'primary.main' }}>
          {data.symbol}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
          24h Market Overview
        </Typography>
      </Box>

      {/* Content */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          gap: 4,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Gauge */}
        <ChangeGauge pct={vals.pct} isDark={isDark} />

        {/* Price range + volume */}
        <Box sx={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <PriceRangeBar low={vals.low} high={vals.high} current={vals.current} isDark={isDark} />

          {/* Volume bars */}
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 700, mb: 1 }}>
              VOLUME BREAKDOWN
            </Typography>
            {/* Base volume bar */}
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Base Volume ({data.symbol.replace('USDT', '')})</Typography>
                <Typography sx={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600 }}>
                  {vals.volume.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? '#2B3139' : '#E6E8EA', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: '70%', bgcolor: '#F0B90B', borderRadius: 3, opacity: 0.8 }} />
              </Box>
            </Box>
            {/* Quote volume bar */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>Quote Volume (USDT)</Typography>
                <Typography sx={{ fontSize: '0.72rem', fontFamily: 'monospace', fontWeight: 600 }}>
                  {vals.quoteVolume.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </Typography>
              </Box>
              <Box sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? '#2B3139' : '#E6E8EA', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: '100%', bgcolor: '#F0B90B', borderRadius: 3, opacity: 0.5 }} />
              </Box>
            </Box>
          </Box>

          {/* VWAP */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1.25,
              borderRadius: 1.5,
              border: `1px solid ${isDark ? 'rgba(240,185,11,0.2)' : 'rgba(212,162,9,0.2)'}`,
              bgcolor: isDark ? 'rgba(240,185,11,0.05)' : 'rgba(240,185,11,0.04)',
            }}
          >
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 700 }}>
              VWAP
            </Typography>
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: '#F0B90B', fontSize: '1rem' }}>
              ${vals.vwap.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
              Volume Weighted Avg Price
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
