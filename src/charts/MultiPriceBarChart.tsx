import { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import type { TickerPrice } from '../types/binance';

interface MultiPriceBarChartProps {
  data: TickerPrice[];
}

// Show top N USDT pairs sorted by price (descending), excluding stablecoin pairs
const TOP_N = 20;
const STABLECOINS = ['USDT', 'BUSD', 'USDC', 'DAI', 'TUSD', 'PAX', 'UST', 'FDUSD'];

export function MultiPriceBarChart({ data }: MultiPriceBarChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const filtered = useMemo(() => {
    return data
      .filter((t) => {
        if (!t.symbol.endsWith('USDT')) return false;
        const base = t.symbol.replace('USDT', '');
        if (STABLECOINS.includes(base)) return false;
        return true;
      })
      .map((t) => ({ symbol: t.symbol, price: parseFloat(t.price) }))
      .sort((a, b) => b.price - a.price)
      .slice(0, TOP_N);
  }, [data]);

  if (!filtered.length) return null;

  const maxPrice = filtered[0].price;

  return (
    <Box
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
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'primary.main' }}>
          Top {TOP_N} USDT Pairs by Price
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
          Excluding stablecoins
        </Typography>
      </Box>

      {/* Bar chart body */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {filtered.map((item, i) => {
          const widthPct = (item.price / maxPrice) * 100;
          // Color gradient based on rank
          const hue = Math.round(120 - (i / (TOP_N - 1)) * 80); // 120 (green) → 40 (yellow-orange)
          const barColor = `hsl(${hue}, 72%, 52%)`;

          return (
            <Box
              key={item.symbol}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover .bar-fill': { opacity: 1 },
              }}
            >
              {/* Rank */}
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  width: 18,
                  flexShrink: 0,
                  textAlign: 'right',
                }}
              >
                {i + 1}
              </Typography>

              {/* Symbol */}
              <Typography
                sx={{
                  fontSize: '0.73rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: 'text.primary',
                  width: 90,
                  flexShrink: 0,
                }}
              >
                {item.symbol}
              </Typography>

              {/* Bar track */}
              <Box sx={{ flex: 1, height: 18, bgcolor: isDark ? '#2B3139' : '#F0F2F5', borderRadius: 1, overflow: 'hidden' }}>
                <Box
                  className="bar-fill"
                  sx={{
                    height: '100%',
                    width: `${widthPct}%`,
                    bgcolor: barColor,
                    borderRadius: 1,
                    opacity: 0.8,
                    transition: 'width 0.4s ease, opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    px: 0.75,
                    overflow: 'hidden',
                    minWidth: widthPct > 25 ? 'auto' : 0,
                  }}
                >
                  {widthPct > 25 && (
                    <Typography
                      sx={{
                        fontSize: '0.62rem',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: '#fff',
                        whiteSpace: 'nowrap',
                        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                      }}
                    >
                      ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Price label (outside for small bars) */}
              {widthPct <= 25 && (
                <Typography
                  sx={{
                    fontSize: '0.68rem',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: barColor,
                    flexShrink: 0,
                    minWidth: 90,
                  }}
                >
                  ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
