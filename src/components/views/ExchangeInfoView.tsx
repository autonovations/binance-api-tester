import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { ParamPanel } from '../params/ParamPanel';
import { ResultTabs } from '../results/ResultTabs';
import { LoadingState } from '../results/LoadingState';
import { ErrorState } from '../results/ErrorState';
import { useBinanceExchangeInfo } from '../../hooks/useBinanceExchangeInfo';
import { ENDPOINT_MAP } from '../../config/endpoints';
import type { Symbol, RateLimit } from '../../types/binance';

const STATUS_COLORS: Record<string, string> = {
  TRADING: '#02C076',
  BREAK: '#F0B90B',
  HALT: '#F6465D',
  END_OF_DAY: '#848E9C',
};

export function ExchangeInfoView() {
  const [enabled, setEnabled] = useState(false);
  const [search, setSearch] = useState('');
  const { data, isLoading, error, refetch } = useBinanceExchangeInfo(enabled);
  const theme = useTheme();

  const handleExecute = () => {
    if (enabled) refetch();
    else setEnabled(true);
  };

  const filteredSymbols = useMemo(() => {
    if (!data) return [];
    const q = search.toUpperCase();
    return data.symbols.filter(
      (s) =>
        s.symbol.includes(q) ||
        s.baseAsset.includes(q) ||
        s.quoteAsset.includes(q)
    );
  }, [data, search]);

  const symbolColumns: MRT_ColumnDef<Symbol>[] = [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      size: 120,
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: 'primary.main' }}>
          {cell.getValue<string>()}
        </Typography>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 110,
      Cell: ({ cell }) => {
        const status = cell.getValue<string>();
        return (
          <Chip
            label={status}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.65rem',
              bgcolor: `${STATUS_COLORS[status] ?? '#848E9C'}22`,
              color: STATUS_COLORS[status] ?? '#848E9C',
              border: `1px solid ${STATUS_COLORS[status] ?? '#848E9C'}44`,
            }}
          />
        );
      },
    },
    { accessorKey: 'baseAsset', header: 'Base', size: 90 },
    { accessorKey: 'quoteAsset', header: 'Quote', size: 90 },
    {
      accessorKey: 'isSpotTradingAllowed',
      header: 'Spot',
      size: 80,
      Cell: ({ cell }) => (
        <Box sx={{ color: cell.getValue<boolean>() ? '#02C076' : '#F6465D', fontWeight: 700 }}>
          {cell.getValue<boolean>() ? '✓' : '✗'}
        </Box>
      ),
    },
    {
      accessorKey: 'orderTypes',
      header: 'Order Types',
      Cell: ({ cell }) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(cell.getValue<string[]>()).slice(0, 3).map((t) => (
            <Chip key={t} label={t} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
          ))}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <ParamPanel endpoint={ENDPOINT_MAP['exchangeInfo']} onExecute={handleExecute} isLoading={isLoading} />

      {isLoading && <LoadingState message="Loading exchange information..." />}
      {error && <ErrorState error={error as Error} />}

      {data && !isLoading && !error && (
        <ResultTabs rawData={data}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Summary Cards */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {[
                { label: 'Symbols', value: data.symbols.length, color: '#F0B90B' },
                { label: 'Timezone', value: data.timezone, color: '#1E88E5' },
                { label: 'Rate Limits', value: data.rateLimits.length, color: '#02C076' },
              ].map(({ label, value, color }) => (
                <Paper
                  key={label}
                  elevation={0}
                  sx={{
                    flex: 1,
                    minWidth: 140,
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    borderTop: `3px solid ${color}`,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700, color }}>
                    {value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {label}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Rate Limits */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {data.rateLimits.map((rl: RateLimit, i: number) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    p: 1.5,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    minWidth: 160,
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                    {rl.rateLimitType}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {rl.limit} / {rl.intervalNum}{rl.interval}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Search + Table */}
            <TextField
              placeholder="Search symbol, base or quote asset..."
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ maxWidth: 360 }}
            />

            <MaterialReactTable
              columns={symbolColumns}
              data={filteredSymbols}
              enableStickyHeader
              enablePagination
              initialState={{ pagination: { pageSize: 15, pageIndex: 0 } }}
              muiTablePaperProps={{ elevation: 0, sx: { border: `1px solid ${theme.palette.divider}`, borderRadius: 2 } }}
              muiTableProps={{ sx: { tableLayout: 'auto' } }}
              muiTableHeadCellProps={{ sx: { fontWeight: 700, fontSize: '0.75rem' } }}
              muiTableBodyCellProps={{ sx: { py: 1, fontSize: '0.8rem' } }}
            />
          </Box>
        </ResultTabs>
      )}
    </Box>
  );
}
