import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { Box, useTheme } from '@mui/material';
import type { Kline } from '../types/binance';

interface CandlestickChartProps {
  data: Kline[];
  symbol: string;
  interval: string;
}

export function CandlestickChart({ data, symbol, interval }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: {
          type: ColorType.Solid,
          color: isDark ? '#161A1E' : '#FFFFFF',
        },
        textColor: isDark ? '#848E9C' : '#707A8A',
        fontFamily: '"Inter", sans-serif',
        fontSize: 14,
      },
      grid: {
        vertLines: { color: isDark ? '#2B3139' : '#E6E8EA' },
        horzLines: { color: isDark ? '#2B3139' : '#E6E8EA' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: isDark ? '#F0B90B' : '#D4A209',
          labelBackgroundColor: isDark ? '#F0B90B' : '#D4A209',
        },
        horzLine: {
          color: isDark ? '#F0B90B' : '#D4A209',
          labelBackgroundColor: isDark ? '#F0B90B' : '#D4A209',
        },
      },
      rightPriceScale: {
        borderColor: isDark ? '#2B3139' : '#E6E8EA',
      },
      timeScale: {
        borderColor: isDark ? '#2B3139' : '#E6E8EA',
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: 420,
    });

    // ── Candlestick series (v5 API) ───────────────────────────────────────────
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#02C076',
      downColor: '#F6465D',
      borderUpColor: '#02C076',
      borderDownColor: '#F6465D',
      wickUpColor: '#02C076',
      wickDownColor: '#F6465D',
    });

    // ── Volume histogram (secondary scale, v5 API) ────────────────────────────
    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
      borderVisible: false,
    });

    const chartData = data.map((k) => ({
      time: Math.floor(k.openTime / 1000) as UTCTimestamp,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    }));

    const volData = data.map((k) => ({
      time: Math.floor(k.openTime / 1000) as UTCTimestamp,
      value: k.volume,
      color: k.close >= k.open
        ? 'rgba(2, 192, 118, 0.5)'
        : 'rgba(246, 70, 93, 0.5)',
    }));

    series.setData(chartData);
    volSeries.setData(volData);
    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = series;

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
  }, [data, isDark]);

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
          gap: 1.5,
          alignItems: 'center',
          bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        }}
      >
        <Box sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'primary.main' }}>
          {symbol}
        </Box>
        <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', bgcolor: 'rgba(240,185,11,0.1)', px: 1, py: 0.25, borderRadius: 1, fontWeight: 600 }}>
          {interval}
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, ml: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: 'rgba(2,192,118,0.5)' }} />
            <Box sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>Vol ▲</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: 'rgba(246,70,93,0.5)' }} />
            <Box sx={{ fontSize: '0.68rem', color: 'text.secondary' }}>Vol ▼</Box>
          </Box>
        </Box>
        <Box sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
          TradingView Lightweight Charts™
        </Box>
      </Box>
      <div ref={containerRef} style={{ width: '100%' }} />
    </Box>
  );
}
