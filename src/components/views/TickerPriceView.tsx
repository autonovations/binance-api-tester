import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { ParamPanel } from '../params/ParamPanel';
import { ResultTabs } from '../results/ResultTabs';
import { LoadingState } from '../results/LoadingState';
import { ErrorState } from '../results/ErrorState';
import { MultiPriceBarChart } from '../../charts/MultiPriceBarChart';
import { useBinanceTickerPrice } from '../../hooks/useBinanceTickerPrice';
import { ENDPOINT_MAP } from '../../config/endpoints';
import type { TickerPrice } from '../../types/binance';

export function TickerPriceView() {
  const [enabled, setEnabled] = useState(false);
  const [symbol, setSymbol] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const { data, isLoading, error, refetch } = useBinanceTickerPrice(symbol, enabled);
  const theme = useTheme();

  const handleExecute = (p: Record<string, string | number>) => {
    const sym = String(p.symbol).trim() || undefined;
    setSymbol(sym);
    if (enabled) refetch();
    else setEnabled(true);
  };

  const isList = Array.isArray(data);
  const listData = useMemo(() => {
    if (!isList || !data) return [];
    const q = search.toUpperCase();
    return (data as TickerPrice[]).filter((t) => t.symbol.includes(q));
  }, [data, search, isList]);

  const columns: MRT_ColumnDef<TickerPrice>[] = [
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: 'primary.main' }}>
          {cell.getValue<string>()}
        </Typography>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 600 }}>
          {parseFloat(cell.getValue<string>()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      <ParamPanel endpoint={ENDPOINT_MAP['tickerPrice']} onExecute={handleExecute} isLoading={isLoading} />

      {isLoading && <LoadingState message="Fetching prices..." />}
      {error && <ErrorState error={error as Error} />}

      {data && !isLoading && !error && (
        <ResultTabs rawData={data}>
          {!isList ? (
            // Single ticker card
            <Paper
              elevation={0}
              sx={{
                p: 4,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                background: `linear-gradient(135deg, rgba(240,185,11,0.05) 0%, transparent 100%)`,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {(data as TickerPrice).symbol}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: 'monospace' }}>
                  ${parseFloat((data as TickerPrice).price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Paper>
          ) : (
            // All tickers
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <MultiPriceBarChart data={data as TickerPrice[]} />
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Paper elevation={0} sx={{ px: 2, py: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Total Pairs</Typography>
                  <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {(data as TickerPrice[]).length}
                  </Typography>
                </Paper>
                <TextField
                  placeholder="Search symbol..."
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
                  sx={{ maxWidth: 280 }}
                />
              </Box>

              <MaterialReactTable
                columns={columns}
                data={listData}
                enablePagination
                initialState={{ pagination: { pageSize: 20, pageIndex: 0 } }}
                muiTablePaperProps={{ elevation: 0, sx: { border: `1px solid ${theme.palette.divider}`, borderRadius: 2 } }}
                muiTableHeadCellProps={{ sx: { fontWeight: 700 } }}
                muiTableBodyCellProps={{ sx: { py: 0.75 } }}
              />
            </Box>
          )}
        </ResultTabs>
      )}
    </Box>
  );
}
