import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { Box, Typography, useTheme } from '@mui/material';
import type { Trade } from '../types/binance';

interface TradesVolumeChartProps {
  trades: Trade[];
  symbol: string;
}

export function TradesVolumeChart({ trades, symbol }: TradesVolumeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!containerRef.current || !trades.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#161A1E' : '#FFFFFF' },
        textColor: isDark ? '#848E9C' : '#707A8A',
        fontFamily: '"Inter", sans-serif',
        fontSize: 13,
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
      leftPriceScale: { visible: true, borderColor: isDark ? '#2B3139' : '#E6E8EA' },
      timeScale: {
        borderColor: isDark ? '#2B3139' : '#E6E8EA',
        timeVisible: true,
        secondsVisible: true,
      },
      width: containerRef.current.clientWidth,
      height: 240,
    });

    // Sort trades chronologically
    const sorted = [...trades].sort((a, b) => a.time - b.time);

    // Volume histogram — v5 API
    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'right',
    });

    // Price line — v5 API
    const priceSeries = chart.addSeries(LineSeries, {
      color: '#F0B90B',
      lineWidth: 2,
      priceScaleId: 'left',
      lastValueVisible: true,
      priceLineVisible: false,
    });

    const volData = sorted.map((t) => ({
      time: Math.floor(t.time / 1000) as UTCTimestamp,
      value: parseFloat(t.qty),
      color: t.isBuyerMaker ? 'rgba(246,70,93,0.8)' : 'rgba(2,192,118,0.8)',
    }));

    const priceData = sorted.map((t) => ({
      time: Math.floor(t.time / 1000) as UTCTimestamp,
      value: parseFloat(t.price),
    }));

    // Deduplicate same-second timestamps
    const deduped = priceData.filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);
    const dedupedVol = volData.filter((d, i, arr) => i === 0 || d.time !== arr[i - 1].time);

    volSeries.setData(dedupedVol);
    priceSeries.setData(deduped);
    chart.timeScale().fitContent();

    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) chart.applyOptions({ width: containerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [trades, isDark]);

  const buyCount = trades.filter((t) => !t.isBuyerMaker).length;
  const sellCount = trades.filter((t) => t.isBuyerMaker).length;

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
          Trade Volume &amp; Price
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, ml: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: '#02C076' }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#02C076' }}>BUY {buyCount}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: '#F6465D' }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#F6465D' }}>SELL {sellCount}</Typography>
          </Box>
        </Box>
      </Box>
      <div ref={containerRef} style={{ width: '100%' }} />
    </Box>
  );
}
