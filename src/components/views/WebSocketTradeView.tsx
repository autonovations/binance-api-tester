import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  Tooltip,
  IconButton,
  Autocomplete,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Pause as PauseIcon,
  PlayArrowOutlined as ResumeIcon,
  ContentCopy as CopyIcon,
  DeleteSweep as ClearIcon,
  TrendingUp as UpIcon,
  TrendingDown as DownIcon,
  Speed as SpeedIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  ReceiptLong as ReceiptIcon,
  SignalCellularAlt as LatencyIcon,
} from '@mui/icons-material';
import { createChart, ColorType, AreaSeries, HistogramSeries, type IChartApi, type ISeriesApi, type UTCTimestamp } from 'lightweight-charts';
import { useBinanceExchangeInfo } from '../../hooks/useBinanceExchangeInfo';
import type { Trade, BinanceRawTradeEvent } from '../../types/binance';

export function WebSocketTradeView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [selectedSymbolInput, setSelectedSymbolInput] = useState('BTCUSDT');
  const [status, setStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<{ id: string; time: string; payload: string }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [connectTime, setConnectTime] = useState<number | null>(null);

  // Statistics
  const [price, setPrice] = useState<number | null>(null);
  const [priceFlash, setPriceFlash] = useState<'up' | 'down' | null>(null);
  const [flashCounter, setFlashCounter] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    priceChange: 'none' as 'up' | 'down' | 'none',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    totalQty: 0,
    totalVolume: 0,
    tradeCount: 0,
    buyCount: 0,
    sellCount: 0,
    networkLatency: null as number | null,
  });

  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const priceSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);
  const volSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const statsRef = useRef(sessionStats);
  const priceRef = useRef(price);

  // Sync ref with state to access inside websocket callback without closures issues
  useEffect(() => {
    statsRef.current = sessionStats;
  }, [sessionStats]);

  useEffect(() => {
    priceRef.current = price;
  }, [price]);

  // Load symbols list using hook
  const { data: exchangeInfo, isLoading: isSymbolsLoading } = useBinanceExchangeInfo(true);
  const availableSymbols = useMemo(() => {
    if (!exchangeInfo?.symbols) return [];
    return exchangeInfo.symbols
      .filter((s) => s.status === 'TRADING')
      .map((s) => s.symbol)
      .sort();
  }, [exchangeInfo]);

  // Chart Setup & Resize Effect
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? '#161A1E' : '#FFFFFF' },
        textColor: isDark ? '#848E9C' : '#707A8A',
        fontFamily: '"Inter", sans-serif',
        fontSize: 12,
      },
      grid: {
        vertLines: { color: isDark ? '#2B3139' : '#E6E8EA' },
        horzLines: { color: isDark ? '#2B3139' : '#E6E8EA' },
      },
      crosshair: {
        vertLine: { color: '#F0B90B', labelBackgroundColor: '#F0B90B' },
        horzLine: { color: '#F0B90B', labelBackgroundColor: '#F0B90B' },
      },
      rightPriceScale: {
        borderColor: isDark ? '#2B3139' : '#E6E8EA',
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: isDark ? '#2B3139' : '#E6E8EA',
        timeVisible: true,
        secondsVisible: true,
      },
      width: chartContainerRef.current.clientWidth,
      height: 320,
    });

    const priceSeries = chart.addSeries(AreaSeries, {
      lineColor: '#F0B90B',
      topColor: 'rgba(240, 185, 11, 0.22)',
      bottomColor: 'rgba(240, 185, 11, 0.0)',
      lineWidth: 2,
    });

    const volSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      borderVisible: false,
    });

    chartRef.current = chart;
    priceSeriesRef.current = priceSeries;
    volSeriesRef.current = volSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
      priceSeriesRef.current = null;
      volSeriesRef.current = null;
    };
  }, [isDark]);

  // Handle incoming trade
  const handleIncomingTrade = (rawData: BinanceRawTradeEvent) => {
    const priceVal = parseFloat(rawData.p);
    const qtyVal = parseFloat(rawData.q);
    const usdVolume = priceVal * qtyVal;
    const latency = Date.now() - rawData.E;

    // Price directional flash calculations
    const prevPrice = priceRef.current;
    if (prevPrice !== null) {
      if (priceVal > prevPrice) {
        setPriceFlash('up');
        setFlashCounter((c) => c + 1);
      } else if (priceVal < prevPrice) {
        setPriceFlash('down');
        setFlashCounter((c) => c + 1);
      }
    }
    setPrice(priceVal);

    // Update session statistics
    setSessionStats((prev) => {
      const nextMin = prev.minPrice === null ? priceVal : Math.min(prev.minPrice, priceVal);
      const nextMax = prev.maxPrice === null ? priceVal : Math.max(prev.maxPrice, priceVal);
      const nextCount = prev.tradeCount + 1;
      const nextQty = prev.totalQty + qtyVal;
      const nextVolume = prev.totalVolume + usdVolume;
      const nextBuy = rawData.m ? prev.buyCount : prev.buyCount + 1;
      const nextSell = rawData.m ? prev.sellCount + 1 : prev.sellCount;

      return {
        priceChange: prevPrice === null ? 'none' : priceVal > prevPrice ? 'up' : priceVal < prevPrice ? 'down' : prev.priceChange,
        minPrice: nextMin,
        maxPrice: nextMax,
        totalQty: nextQty,
        totalVolume: nextVolume,
        tradeCount: nextCount,
        buyCount: nextBuy,
        sellCount: nextSell,
        networkLatency: latency,
      };
    });

    // Append to live trades list (last 30)
    const newTrade: Trade = {
      id: rawData.t,
      price: rawData.p,
      qty: rawData.q,
      quoteQty: usdVolume.toString(),
      time: rawData.T,
      isBuyerMaker: rawData.m,
      isBestMatch: true,
    };
    setTrades((prev) => [newTrade, ...prev.slice(0, 29)]);

    // Update real-time chart series
    if (priceSeriesRef.current && volSeriesRef.current) {
      const timestampSec = Math.floor(rawData.T / 1000) as UTCTimestamp;
      priceSeriesRef.current.update({
        time: timestampSec,
        value: priceVal,
      });

      volSeriesRef.current.update({
        time: timestampSec,
        value: qtyVal,
        color: rawData.m ? 'rgba(246, 70, 93, 0.6)' : 'rgba(2, 192, 118, 0.6)',
      });
    }

    // Append to raw JSON logs console
    if (!isPaused) {
      setConsoleLogs((prev) => [
        {
          id: rawData.t.toString(),
          time: new Date(rawData.T).toLocaleTimeString() + '.' + String(rawData.T % 1000).padStart(3, '0'),
          payload: JSON.stringify(rawData, null, 2),
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  // Connect / Disconnect Action
  const toggleConnection = () => {
    if (status === 'CONNECTED' || status === 'CONNECTING') {
      disconnect();
    } else {
      connect(symbol);
    }
  };

  const connect = (sym: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    setStatus('CONNECTING');
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${sym.toLowerCase()}@trade`);

    ws.onopen = () => {
      setStatus('CONNECTED');
      setConnectTime(Date.now());
      setTrades([]);
      setPrice(null);
      setPriceFlash(null);
      setConsoleLogs([]);
      setSessionStats({
        priceChange: 'none',
        minPrice: null,
        maxPrice: null,
        totalQty: 0,
        totalVolume: 0,
        tradeCount: 0,
        buyCount: 0,
        sellCount: 0,
        networkLatency: null,
      });

      // Clear series data safely
      if (priceSeriesRef.current && volSeriesRef.current) {
        priceSeriesRef.current.setData([]);
        volSeriesRef.current.setData([]);
      }
    };

    ws.onmessage = (event) => {
      try {
        const rawData: BinanceRawTradeEvent = JSON.parse(event.data);
        handleIncomingTrade(rawData);
      } catch (err) {
        console.error('Error parsing WebSocket message', err);
      }
    };

    ws.onclose = () => {
      setStatus('DISCONNECTED');
    };

    ws.onerror = () => {
      setStatus('DISCONNECTED');
    };

    wsRef.current = ws;
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('DISCONNECTED');
    setConnectTime(null);
  };

  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleCopyLog = (id: string, payload: string) => {
    navigator.clipboard.writeText(payload);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Formatting helpers
  const formatPrice = (p: number | null) => {
    if (p === null) return '—';
    return p.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: symbol.includes('USDT') ? 2 : 8,
    });
  };

  const buyPercentage = useMemo(() => {
    const total = sessionStats.buyCount + sessionStats.sellCount;
    if (!total) return 50;
    return Math.round((sessionStats.buyCount / total) * 100);
  }, [sessionStats.buyCount, sessionStats.sellCount]);

  const tradesPerSecond = useMemo(() => {
    if (!connectTime || sessionStats.tradeCount === 0) return '0.0';
    const elapsed = (Date.now() - connectTime) / 1000;
    if (elapsed < 1) return sessionStats.tradeCount.toFixed(1);
    return (sessionStats.tradeCount / elapsed).toFixed(1);
  }, [sessionStats.tradeCount, connectTime]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Parameters & Connection Panel */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
          p: 2.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'text.secondary',
            display: 'block',
            mb: 1.5,
          }}
        >
          Configurar Conexión
        </Typography>

        <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Autocomplete
            freeSolo
            options={availableSymbols}
            loading={isSymbolsLoading}
            value={selectedSymbolInput}
            onChange={(_, newValue) => {
              const val = (newValue || '').toUpperCase();
              setSelectedSymbolInput(val);
              if (val) setSymbol(val);
            }}
            onInputChange={(_, newInputValue) => {
              const val = (newInputValue || '').toUpperCase();
              setSelectedSymbolInput(val);
              if (val) setSymbol(val);
            }}
            disabled={status !== 'DISCONNECTED'}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Symbol"
                size="small"
                placeholder="e.g. BTCUSDT"
                sx={{ width: 220, '& .MuiInputBase-root': { fontFamily: 'monospace' } }}
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps?.input,
                    endAdornment: (
                      <>
                        {isSymbolsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.slotProps?.input?.endAdornment}
                      </>
                    ),
                  },
                }}
              />
            )}
          />

          <Button
            variant="contained"
            onClick={toggleConnection}
            color={status === 'DISCONNECTED' ? 'primary' : 'error'}
            startIcon={
              status === 'DISCONNECTED' ? (
                <PlayIcon />
              ) : status === 'CONNECTING' ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <StopIcon />
              )
            }
            sx={{
              px: 3.5,
              py: 1,
              fontWeight: 700,
              background:
                status === 'DISCONNECTED'
                  ? 'linear-gradient(135deg, #F0B90B 0%, #F8D33A 100%)'
                  : status === 'CONNECTING'
                  ? '#707A8A'
                  : 'linear-gradient(135deg, #F6465D 0%, #ff6b81 100%)',
              color: status === 'DISCONNECTED' ? '#000' : '#FFF',
              '&:hover': {
                background:
                  status === 'DISCONNECTED'
                    ? 'linear-gradient(135deg, #D4A209 0%, #F0B90B 100%)'
                    : status === 'CONNECTING'
                    ? '#5E6673'
                    : 'linear-gradient(135deg, #CF304A 0%, #F6465D 100%)',
              },
            }}
          >
            {status === 'DISCONNECTED' ? 'Conectar' : status === 'CONNECTING' ? 'Conectando...' : 'Desconectar'}
          </Button>

          {/* LED Indicators */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: { sm: 'auto' } }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: status === 'CONNECTED' ? '#02C076' : status === 'CONNECTING' ? '#F0B90B' : '#707A8A',
                boxShadow:
                  status === 'CONNECTED'
                    ? '0 0 10px #02C076'
                    : status === 'CONNECTING'
                    ? '0 0 10px #F0B90B'
                    : 'none',
                animation: status === 'CONNECTING' || status === 'CONNECTED' ? 'gentle-pulse 1.5s infinite' : 'none',
                '@keyframes gentle-pulse': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.4, transform: 'scale(1.15)' },
                },
              }}
            />
            <Typography component="div" variant="body2" sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary' }}>
              {status === 'CONNECTED' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WifiIcon fontSize="small" sx={{ color: '#02C076' }} /> Connected
                </Box>
              ) : status === 'CONNECTING' ? (
                'Connecting...'
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WifiOffIcon fontSize="small" /> Disconnected
                </Box>
              )}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Real-time statistics cards */}
      <Grid container spacing={2}>
        {/* Price Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            key={priceFlash ? `price-${flashCounter}` : 'price-idle'}
            elevation={0}
            sx={{
              p: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              position: 'relative',
              overflow: 'hidden',
              animation:
                priceFlash === 'up'
                  ? 'bgFlashGreen 0.6s ease-out'
                  : priceFlash === 'down'
                  ? 'bgFlashRed 0.6s ease-out'
                  : 'none',
              '@keyframes bgFlashGreen': {
                '0%': { backgroundColor: 'rgba(2, 192, 118, 0.12)' },
                '100%': { backgroundColor: 'transparent' },
              },
              '@keyframes bgFlashRed': {
                '0%': { backgroundColor: 'rgba(246, 70, 93, 0.12)' },
                '100%': { backgroundColor: 'transparent' },
              },
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              PRECIO ACTUAL ({symbol})
            </Typography>
            <Typography
              key={flashCounter}
              variant="h4"
              sx={{
                fontWeight: 800,
                color: priceFlash === 'up' ? '#02C076' : priceFlash === 'down' ? '#F6465D' : 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontFamily: 'monospace',
                animation:
                  priceFlash === 'up'
                    ? 'textFlashGreen 0.6s ease-out'
                    : priceFlash === 'down'
                    ? 'textFlashRed 0.6s ease-out'
                    : 'none',
                '@keyframes textFlashGreen': {
                  '0%': { textShadow: '0 0 10px rgba(2, 192, 118, 0.6)' },
                  '100%': { textShadow: 'none' },
                },
                '@keyframes textFlashRed': {
                  '0%': { textShadow: '0 0 10px rgba(246, 70, 93, 0.6)' },
                  '100%': { textShadow: 'none' },
                },
              }}
            >
              {formatPrice(price)}
              {priceFlash === 'up' && <UpIcon sx={{ fontSize: 24, color: '#02C076' }} />}
              {priceFlash === 'down' && <DownIcon sx={{ fontSize: 24, color: '#F6465D' }} />}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Latencia: {sessionStats.networkLatency !== null ? `${sessionStats.networkLatency} ms` : '—'}
            </Typography>
          </Paper>
        </Grid>

        {/* Volume Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              VOLUMEN DE SESIÓN (USD)
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
              $
              {sessionStats.totalVolume.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Monedas operadas: {sessionStats.totalQty.toFixed(4)} {symbol.replace('USDT', '')}
            </Typography>
          </Paper>
        </Grid>

        {/* Range Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              RANGO DE PRECIO DE SESIÓN
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#02C076', fontWeight: 700 }}>
                  MAX:
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {formatPrice(sessionStats.maxPrice)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#F6465D', fontWeight: 700 }}>
                  MIN:
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {formatPrice(sessionStats.minPrice)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Spread:{' '}
              {sessionStats.maxPrice && sessionStats.minPrice
                ? (sessionStats.maxPrice - sessionStats.minPrice).toLocaleString('en-US', {
                    maximumFractionDigits: 4,
                  })
                : '—'}
            </Typography>
          </Paper>
        </Grid>

        {/* Transaction Count Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              TRADES EN SESIÓN
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
              {sessionStats.tradeCount}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'text.secondary' }}>
              <Typography variant="caption">Avg Size:</Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {sessionStats.tradeCount ? (sessionStats.totalQty / sessionStats.tradeCount).toFixed(4) : '0.0000'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
              <Typography variant="caption">Velocidad:</Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {tradesPerSecond} t/s
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Buyer vs Seller Flow bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="caption" sx={{ color: '#02C076', fontWeight: 700 }}>
            COMPRADORES (BUYS): {buyPercentage}% ({sessionStats.buyCount})
          </Typography>
          <Typography variant="caption" sx={{ color: '#F6465D', fontWeight: 700 }}>
            VENDEDORES (SELLS): {100 - buyPercentage}% ({sessionStats.sellCount})
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            height: 10,
            borderRadius: 5,
            overflow: 'hidden',
            bgcolor: 'rgba(255,255,255,0.05)',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              width: `${buyPercentage}%`,
              bgcolor: '#02C076',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          <Box
            sx={{
              width: `${100 - buyPercentage}%`,
              bgcolor: '#F6465D',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </Box>
      </Paper>

      {/* Real-time area chart */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SpeedIcon fontSize="small" /> Gráfico Tick-by-Tick en Tiempo Real ({symbol})
          </Typography>
          <Chip
            label="Live Stream"
            size="small"
            color="primary"
            sx={{
              height: 20,
              fontSize: '0.62rem',
              fontWeight: 700,
              bgcolor: 'rgba(240,185,11,0.15)',
              color: '#F0B90B',
              border: '1px solid rgba(240,185,11,0.3)',
              ml: 1,
            }}
          />
        </Box>
        <Box sx={{ p: 1.5 }}>
          {status === 'DISCONNECTED' && trades.length === 0 ? (
            <Box
              sx={{
                height: 320,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                gap: 1,
              }}
            >
              <WifiOffIcon sx={{ fontSize: 48, opacity: 0.4 }} />
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                Conéctate al WebSocket para visualizar el gráfico en tiempo real.
              </Typography>
            </Box>
          ) : null}
          <div
            ref={chartContainerRef}
            style={{
              width: '100%',
              display: status === 'DISCONNECTED' && trades.length === 0 ? 'none' : 'block',
            }}
          />
        </Box>
      </Paper>

      {/* Split view: trades table and json console */}
      <Grid container spacing={2.5}>
        {/* Trades history table */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden',
              height: 480,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon fontSize="small" sx={{ color: 'primary.main' }} /> Transacciones en Vivo
              </Typography>
              <Chip
                label={`${trades.length} mostrados`}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            </Box>
            <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Trade ID</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Precio</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Cantidad</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Total (USD)</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Hora</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>
                      Tipo
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary', fontStyle: 'italic' }}>
                        Esperando transacciones de WebSocket...
                      </TableCell>
                    </TableRow>
                  ) : (
                    trades.map((t) => (
                      <TableRow
                        key={t.id}
                        sx={{
                          transition: 'background-color 0.2s',
                          '&:hover': { bgcolor: 'rgba(240, 185, 11, 0.05) !important' },
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', py: 0.75 }}>{t.id}</TableCell>
                        <TableCell
                          sx={{
                            fontFamily: 'monospace',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: t.isBuyerMaker ? '#F6465D' : '#02C076',
                            py: 0.75,
                          }}
                        >
                          {parseFloat(t.price).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', py: 0.75 }}>
                          {parseFloat(t.qty).toFixed(6)}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', py: 0.75, color: 'text.secondary' }}>
                          $
                          {parseFloat(t.quoteQty).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', py: 0.75, color: 'text.secondary' }}>
                          {new Date(t.time).toLocaleTimeString()}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 0.75 }}>
                          <Chip
                            label={t.isBuyerMaker ? 'SELL' : 'BUY'}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 800,
                              bgcolor: t.isBuyerMaker ? 'rgba(246,70,93,0.12)' : 'rgba(2,192,118,0.12)',
                              color: t.isBuyerMaker ? '#F6465D' : '#02C076',
                              border: `1px solid ${t.isBuyerMaker ? 'rgba(246,70,93,0.25)' : 'rgba(2,192,118,0.25)'}`,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* JSON Event Stream Console */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden',
              height: 480,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: isDark ? '#0C0E12' : '#F6F8FA',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LatencyIcon fontSize="small" sx={{ color: 'primary.main' }} /> Terminal JSON Crudo
              </Typography>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Tooltip title={isPaused ? 'Reanudar transmisión' : 'Pausar transmisión'}>
                  <IconButton
                    size="small"
                    onClick={() => setIsPaused(!isPaused)}
                    sx={{ color: isPaused ? '#F0B90B' : 'text.secondary' }}
                  >
                    {isPaused ? <ResumeIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Limpiar terminal">
                  <IconButton size="small" onClick={() => setConsoleLogs([])} sx={{ color: 'text.secondary' }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                overflowY: 'auto',
                p: 2,
                fontFamily: 'Consolas, Monaco, monospace',
                fontSize: '0.72rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              {consoleLogs.length === 0 ? (
                <Box
                  sx={{
                    my: 'auto',
                    textAlign: 'center',
                    color: 'text.secondary',
                    fontStyle: 'italic',
                  }}
                >
                  Consola lista. Conecta el stream para ver eventos...
                </Box>
              ) : (
                consoleLogs.map((log) => (
                  <Box
                    key={log.id}
                    sx={{
                      borderBottom: `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      pb: 1.5,
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, color: '#F0B90B', fontWeight: 600 }}>
                      <span>Event Trade — ID: {log.id}</span>
                      <span style={{ opacity: 0.7 }}>{log.time}</span>
                    </Box>
                    <pre style={{ margin: 0, padding: 0, overflowX: 'auto', color: isDark ? '#A7B2C1' : '#333' }}>
                      {log.payload}
                    </pre>
                    <Tooltip title={copiedId === log.id ? '¡Copiado!' : 'Copiar evento'}>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyLog(log.id, log.payload)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          color: copiedId === log.id ? '#02C076' : 'text.secondary',
                          opacity: 0.6,
                          '&:hover': { opacity: 1 },
                        }}
                      >
                        <CopyIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
