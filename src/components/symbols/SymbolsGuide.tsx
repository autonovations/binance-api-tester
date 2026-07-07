import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Collapse,
  useTheme,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  ContentCopy as CopyIcon,
  MenuBook as BookIcon,
  Star as StarIcon,
  Storage as DbIcon,
  Check as CheckIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material';
import { useSymbolsGuide } from '../../context/SymbolsGuideContext';
import { useBinanceExchangeInfo } from '../../hooks/useBinanceExchangeInfo';
import { ASSET_NAMES } from '../../config/assetNames';
import type { Symbol } from '../../types/binance';

interface PopularSymbolItem {
  symbol: string;
  base: string;
  quote: string;
  description: string;
}

const POPULAR_SYMBOLS: PopularSymbolItem[] = [
  { symbol: 'BTCUSDT', base: 'BTC', quote: 'USDT', description: 'Bitcoin / Tether USD (El par con mayor liquidez del mercado)' },
  { symbol: 'ETHUSDT', base: 'ETH', quote: 'USDT', description: 'Ethereum / Tether USD (Principal contrato inteligente)' },
  { symbol: 'BNBUSDT', base: 'BNB', quote: 'USDT', description: 'BNB / Tether USD (Token nativo del ecosistema Binance)' },
  { symbol: 'SOLUSDT', base: 'SOL', quote: 'USDT', description: 'Solana / Tether USD (Transacciones de alta velocidad y bajo costo)' },
  { symbol: 'XRPUSDT', base: 'XRP', quote: 'USDT', description: 'Ripple / Tether USD (Par de pagos transfronterizos)' },
  { symbol: 'ADAUSDT', base: 'ADA', quote: 'USDT', description: 'Cardano / Tether USD (Plataforma blockchain de investigación académica)' },
  { symbol: 'DOGEUSDT', base: 'DOGE', quote: 'USDT', description: 'Dogecoin / Tether USD (La memecoin original e histórica)' },
  { symbol: 'ETHBTC', base: 'ETH', quote: 'BTC', description: 'Ethereum / Bitcoin (Relación de fuerza entre las dos criptomonedas principales)' },
  { symbol: 'BTCFDUSD', base: 'BTC', quote: 'FDUSD', description: 'Bitcoin / First Digital USD (Par comercial con comisiones reducidas/cero)' },
  { symbol: 'LINKUSDT', base: 'LINK', quote: 'USDT', description: 'Chainlink / Tether USD (Red de oráculos descentralizados)' },
];

function Row({
  row,
  onSelect,
  copiedSymbol,
  onCopy,
}: {
  row: Symbol;
  onSelect?: (s: string) => void;
  copiedSymbol: string | null;
  onCopy: (s: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const baseName = ASSET_NAMES[row.baseAsset] || row.baseAsset;
  const quoteName = ASSET_NAMES[row.quoteAsset] || row.quoteAsset;
  const definition = `${baseName} (${row.baseAsset}) cotizado en ${quoteName} (${row.quoteAsset})`;

  // Extract filters for easy display
  const priceFilter = row.filters.find((f) => f.filterType === 'PRICE_FILTER');
  const lotSize = row.filters.find((f) => f.filterType === 'LOT_SIZE');
  const minNotional = row.filters.find((f) => f.filterType === 'NOTIONAL' || f.filterType === 'MIN_NOTIONAL');

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell width="50">
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <ArrowUpIcon /> : <ArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>
            {row.symbol}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {baseName} / {quoteName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {definition}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Chip
            label={row.status}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.62rem',
              bgcolor: row.status === 'TRADING' ? 'rgba(2,192,118,0.12)' : 'rgba(132,142,156,0.12)',
              color: row.status === 'TRADING' ? '#02C076' : '#848E9C',
              border: `1px solid ${row.status === 'TRADING' ? 'rgba(2,192,118,0.25)' : 'rgba(132,142,156,0.25)'}`,
            }}
          />
        </TableCell>
        <TableCell align="right">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title="Copiar símbolo">
              <IconButton size="small" onClick={() => onCopy(row.symbol)}>
                {copiedSymbol === row.symbol ? <CheckIcon sx={{ color: 'success.main', fontSize: 18 }} /> : <CopyIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
            {onSelect && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => onSelect(row.symbol)}
                sx={{
                  py: 0.2,
                  px: 1,
                  fontSize: '0.75rem',
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    bgcolor: 'rgba(240,185,11,0.08)',
                  },
                }}
              >
                Usar
              </Button>
            )}
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, p: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="subtitle2" gutterBottom component="div" sx={{ fontWeight: 700, color: 'text.primary', borderBottom: `1px solid ${theme.palette.divider}`, pb: 0.5, mb: 1.5 }}>
                Reglas de Operación (Filtros del Exchange)
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                    Precisión de Activos:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    Base: {row.baseAssetPrecision} decimales
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    Cotización: {row.quoteAssetPrecision} decimales
                  </Typography>
                </Box>

                {priceFilter && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      Filtro de Precios (PRICE_FILTER):
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Min Price: {priceFilter.minPrice}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Max Price: {priceFilter.maxPrice}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Tick Size: {priceFilter.tickSize}
                    </Typography>
                  </Box>
                )}

                {lotSize && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      Tamaño de Lote (LOT_SIZE):
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Min Qty: {lotSize.minQty}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Max Qty: {lotSize.maxQty}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Step Size: {lotSize.stepSize}
                    </Typography>
                  </Box>
                )}

                {minNotional && (
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                      Monto Mínimo de Orden (NOTIONAL):
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      Mínimo requerido: {minNotional.minNotional || minNotional.notional || '0'} {row.quoteAsset}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2', md: 'span 3' } }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 600 }}>
                    Permisos de Trading:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {row.permissions.map((p) => (
                      <Chip key={p} label={p} size="small" sx={{ fontSize: '0.62rem', height: 18 }} />
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export function SymbolsGuide() {
  const { isOpen, closeGuide, searchQuery, setSearchQuery, onSelectSymbol } = useSymbolsGuide();
  const { data: exchangeInfo, isLoading, error } = useBinanceExchangeInfo(isOpen);
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState(0);
  const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleCopy = (symbol: string) => {
    navigator.clipboard.writeText(symbol);
    setCopiedSymbol(symbol);
    setTimeout(() => setCopiedSymbol(null), 2000);
  };

  const handleSelect = (symbol: string) => {
    if (onSelectSymbol) {
      onSelectSymbol(symbol);
      closeGuide();
    }
  };

  // Filter symbols based on search
  const filteredSymbols = useMemo(() => {
    if (!exchangeInfo?.symbols) return [];
    const query = searchQuery.trim().toUpperCase();
    if (!query) return exchangeInfo.symbols;

    return exchangeInfo.symbols.filter((s) => {
      const baseName = (ASSET_NAMES[s.baseAsset] || '').toUpperCase();
      const quoteName = (ASSET_NAMES[s.quoteAsset] || '').toUpperCase();
      return (
        s.symbol.includes(query) ||
        s.baseAsset.includes(query) ||
        s.quoteAsset.includes(query) ||
        baseName.includes(query) ||
        quoteName.includes(query)
      );
    });
  }, [exchangeInfo, searchQuery]);

  // Reset page when search query changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginatedSymbols = useMemo(() => {
    return filteredSymbols.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredSymbols, page, rowsPerPage]);

  return (
    <Dialog
      open={isOpen}
      onClose={closeGuide}
      maxWidth="md"
      fullWidth
      scroll="paper"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          backgroundImage: 'none',
          boxShadow: theme.palette.mode === 'dark' ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BookIcon sx={{ color: 'primary.main', fontSize: 26 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Guía de Símbolos y Activos
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Aprende y busca la definición de todos los pares de trading de Binance
            </Typography>
          </Box>
        </Box>
        <IconButton aria-label="close" onClick={closeGuide} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Tabs Selector */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<BookIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Conceptos Básicos" sx={{ fontWeight: 600, py: 1.5 }} />
          <Tab icon={<StarIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Símbolos Populares" sx={{ fontWeight: 600, py: 1.5 }} />
          <Tab icon={<DbIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Base de Datos Completa" sx={{ fontWeight: 600, py: 1.5 }} />
        </Tabs>
      </Box>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 3, minHeight: 350, display: 'flex', flexDirection: 'column' }}>
        {/* TAB 1: Conceptos Básicos */}
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              En los exchanges de criptomonedas como Binance, la negociación se realiza a través de <strong>Pares de Negociación (Trading Pairs)</strong>, comúnmente llamados <strong>Símbolos (Symbols)</strong>.
            </Typography>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, background: 'linear-gradient(135deg, rgba(240,185,11,0.03) 0%, rgba(240,185,11,0.06) 100%)', border: '1px solid rgba(240,185,11,0.2)' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                ¿Cómo se compone un Símbolo? (Ejemplo: BTCUSDT)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 1.5 }}>
                <Paper variant="outlined" sx={{ p: 2, flex: 1, textAlign: 'center', borderColor: 'primary.light' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>
                    BTC
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mt: 0.5 }}>
                    ACTIVO BASE (Base Asset)
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Es la criptomoneda que estás <strong>comprando</strong> o <strong>vendiendo</strong>. En BTCUSDT, estás operando Bitcoin.
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, flex: 1, textAlign: 'center', borderColor: 'secondary.light' }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main', fontFamily: 'monospace' }}>
                    USDT
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mt: 0.5 }}>
                    ACTIVO DE COTIZACIÓN (Quote Asset)
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Es la moneda en la que se <strong>expresa el precio</strong> del activo base. Indica cuántos USDT cuesta 1 BTC.
                  </Typography>
                </Paper>
              </Box>
            </Paper>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
              Conceptos Técnicos Fundamentales
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  Filtro de Precios (PRICE_FILTER)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Define los rangos de precio permitidos. El parámetro clave es <strong>Tick Size</strong>, que determina el cambio de precio mínimo (por ejemplo, si el tick size de BTCUSDT es 0.01, los precios deben ser múltiplos de 0.01, como 31200.55).
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                  Tamaño de Lote (LOT_SIZE)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Define las cantidades mínimas y máximas de activo base permitidas en una orden. El valor <strong>Step Size</strong> determina los incrementos de cantidad válidos (ej. si es 0.0001, puedes comprar 0.0012 BTC pero no 0.00125 BTC).
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.main', mb: 0.5 }}>
                  Monto Mínimo de Orden (NOTIONAL)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Indica el valor total mínimo que debe tener la transacción (Cantidad × Precio). Generalmente en Binance Spot, el monto mínimo requerido para abrir cualquier orden es de <strong>5 USD o 10 USD</strong> en valor equivalente.
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'secondary.main', mb: 0.5 }}>
                  Precisión (Decimales)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Determina cuántos decimales puede tener la cantidad del Activo Base (Base Asset Precision) y el precio en el Activo de Cotización (Quote Asset Precision) para ser procesados correctamente por la API.
                </Typography>
              </Paper>
            </Box>
          </Box>
        )}

        {/* TAB 2: Símbolos Populares */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              Estos son los pares comerciales de mayor volumen y uso estándar en Binance. Úsalos como punto de partida para tus consultas de la API:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {POPULAR_SYMBOLS.map((item) => {
                const baseName = ASSET_NAMES[item.base] || item.base;
                const quoteName = ASSET_NAMES[item.quote] || item.quote;
                return (
                  <Paper
                    key={item.symbol}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', lineHeight: 1.2 }}>
                        {item.symbol}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block', mt: 0.5 }}>
                        {baseName} / {quoteName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2, pr: 1 }}>
                        {item.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                      <Tooltip title="Copiar símbolo">
                        <IconButton size="small" onClick={() => handleCopy(item.symbol)}>
                          {copiedSymbol === item.symbol ? <CheckIcon sx={{ color: 'success.main', fontSize: 18 }} /> : <CopyIcon sx={{ fontSize: 18 }} />}
                        </IconButton>
                      </Tooltip>
                      {onSelectSymbol && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleSelect(item.symbol)}
                          sx={{
                            fontSize: '0.72rem',
                            py: 0.2,
                            px: 1,
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              borderColor: 'primary.dark',
                              bgcolor: 'rgba(240,185,11,0.08)',
                            },
                          }}
                        >
                          Usar
                        </Button>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}

        {/* TAB 3: Base de Datos Completa */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Buscar símbolo (ej: BTCUSDT), activo base (ej: Solana) o de cotización..."
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 1 }}
            />

            {isLoading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2, flexGrow: 1 }}>
                <CircularProgress color="primary" />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Cargando información oficial desde Binance API...
                </Typography>
              </Box>
            )}

            {error && (
              <Box sx={{ py: 3 }}>
                <Alert severity="error">
                  No se pudo cargar la información de Binance. Por favor verifica tu conexión. Error: {(error as Error).message}
                </Alert>
              </Box>
            )}

            {exchangeInfo && !isLoading && !error && (
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400, borderRadius: 2 }}>
                  <Table stickyHeader size="small" aria-label="symbols table">
                    <TableHead>
                      <TableRow>
                        <TableCell width="50" />
                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700 }}>Par (Símbolo)</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontWeight: 700 }}>Definición / Descripción</Typography></TableCell>
                        <TableCell align="center"><Typography variant="caption" sx={{ fontWeight: 700 }}>Estado</Typography></TableCell>
                        <TableCell align="right"><Typography variant="caption" sx={{ fontWeight: 700 }}>Acciones</Typography></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSymbols.length > 0 ? (
                        paginatedSymbols.map((sym: Symbol) => (
                          <Row
                            key={sym.symbol}
                            row={sym}
                            onSelect={onSelectSymbol ? handleSelect : undefined}
                            copiedSymbol={copiedSymbol}
                            onCopy={handleCopy}
                          />
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              No se encontraron símbolos que coincidan con tu búsqueda.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  component="div"
                  count={filteredSymbols.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
                  sx={{ borderTop: `1px solid ${theme.palette.divider}` }}
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={closeGuide} color="inherit" variant="outlined" sx={{ px: 3 }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
