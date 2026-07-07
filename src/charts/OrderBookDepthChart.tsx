import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  AreaSeries,
  type IChartApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { Box, Typography, useTheme } from '@mui/material';
import type { OrderBookEntry } from '../types/binance';

interface OrderBookDepthChartProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  symbol: string;
}

export function OrderBookDepthChart({ bids, asks, symbol }: OrderBookDepthChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!containerRef.current || !bids.length || !asks.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#161A1E' : '#FFFFFF' },
        textColor: isDark ? '#848E9C' : '#707A8A',
        fontFamily: '"Inter", sans-serif',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: isDark ? '#2B3139' : '#E6E8EA' },
        horzLines: { color: isDark ? '#2B3139' : '#E6E8EA' },
      },
      crosshair: {
        vertLine: { color: isDark ? '#F0B90B' : '#D4A209', labelBackgroundColor: isDark ? '#F0B90B' : '#D4A209' },
        horzLine: { color: isDark ? '#F0B90B' : '#D4A209', labelBackgroundColor: isDark ? '#F0B90B' : '#D4A209' },
      },
      rightPriceScale: { borderColor: isDark ? '#2B3139' : '#E6E8EA' },
      timeScale: { borderColor: isDark ? '#2B3139' : '#E6E8EA', timeVisible: false },
      width: containerRef.current.clientWidth,
      height: 280,
    });

    // Bids: sorted ascending by price
    const sortedBids = [...bids].sort((a, b) => a.price - b.price);
    // Asks: sorted ascending by price
    const sortedAsks = [...asks].sort((a, b) => a.price - b.price);

    // v5 API: chart.addSeries(AreaSeries, options)
    const bidSeries = chart.addSeries(AreaSeries, {
      lineColor: '#02C076',
      topColor: 'rgba(2, 192, 118, 0.35)',
      bottomColor: 'rgba(2, 192, 118, 0.02)',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const askSeries = chart.addSeries(AreaSeries, {
      lineColor: '#F6465D',
      topColor: 'rgba(246, 70, 93, 0.35)',
      bottomColor: 'rgba(246, 70, 93, 0.02)',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    // Map price → fake UTCTimestamp (price * 100 as integer)
    const bidData = sortedBids.map((b) => ({
      time: Math.round(b.price * 100) as UTCTimestamp,
      value: b.total,
    }));

    const askData = sortedAsks.map((a) => ({
      time: Math.round(a.price * 100) as UTCTimestamp,
      value: a.total,
    }));

    bidSeries.setData(bidData);
    askSeries.setData(askData);
    chart.timeScale().fitContent();

    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [bids, asks, isDark]);

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2,
      }}
    >
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
          {symbol}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary' }}>
          Order Book Depth
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
          {[
            { label: '▲ Bids', color: '#02C076' },
            { label: '▼ Asks', color: '#F6465D' },
          ].map(({ label, color }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
              <Typography sx={{ fontSize: '0.72rem', color }}>{label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <div ref={containerRef} style={{ width: '100%' }} />
    </Box>
  );
}
