import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  Divider,
} from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { ParamPanel } from '../params/ParamPanel';
import { ResultTabs } from '../results/ResultTabs';
import { LoadingState } from '../results/LoadingState';
import { ErrorState } from '../results/ErrorState';
import { useBinanceOrderBook } from '../../hooks/useBinanceOrderBook';
import { ENDPOINT_MAP } from '../../config/endpoints';
import type { OrderBookEntry } from '../../types/binance';

export function OrderBookView() {
  const [enabled, setEnabled] = useState(false);
  const [params, setParams] = useState({ symbol: 'BTCUSDT', limit: '20' });
  const { data, isLoading, error, refetch } = useBinanceOrderBook(
    params.symbol,
    Number(params.limit),
    enabled
  );
  const theme = useTheme();

  const handleExecute = (p: Record<string, string | number>) => {
    setParams({ symbol: String(p.symbol), limit: String(p.limit) });
    if (enabled) refetch();
    else setEnabled(true);
  };

  const processEntries = (entries: [string, string][]): OrderBookEntry[] => {
    let runningTotal = 0;
    return entries.map(([price, qty]) => {
      const q = parseFloat(qty);
      runningTotal += q;
      return {
        price: parseFloat(price),
        quantity: q,
        total: runningTotal,
      };
    });
  };

  const bids = useMemo(() => data ? processEntries(data.bids) : [], [data]);
  const asks = useMemo(() => data ? processEntries(data.asks) : [], [data]);

  const spread = useMemo(() => {
    if (!bids.length || !asks.length) return null;
    return (asks[0].price - bids[0].price).toFixed(2);
  }, [bids, asks]);

  const columns = (side: 'bid' | 'ask'): MRT_ColumnDef<OrderBookEntry>[] => [
    {
      accessorKey: 'price',
      header: 'Price (USDT)',
      Cell: ({ cell }) => (
        <Typography sx={{
          fontFamily: 'monospace',
          fontWeight: 700,
          color: side === 'bid' ? '#02C076' : '#F6465D',
          fontSize: '0.82rem',
        }}>
          {cell.getValue<number>().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
        </Typography>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Quantity',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
          {cell.getValue<number>().toFixed(6)}
        </Typography>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'text.secondary' }}>
          {cell.getValue<number>().toFixed(4)}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      <ParamPanel endpoint={ENDPOINT_MAP['orderBook']} onExecute={handleExecute} isLoading={isLoading} />

      {isLoading && <LoadingState message="Fetching order book..." />}
      {error && <ErrorState error={error as Error} />}

      {data && !isLoading && !error && (
        <ResultTabs rawData={data}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Stats row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[
                { label: 'Best Bid', value: bids[0]?.price.toFixed(2), color: '#02C076' },
                { label: 'Spread', value: spread, color: '#F0B90B' },
                { label: 'Best Ask', value: asks[0]?.price.toFixed(2), color: '#F6465D' },
              ].map(({ label, value, color }) => (
                <Paper
                  key={label}
                  elevation={0}
                  sx={{
                    flex: 1,
                    p: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}>
                    {label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color, fontFamily: 'monospace' }}>
                    {value ?? '—'}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {/* Dual tables */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: '#02C076', mb: 1, fontSize: '0.85rem' }}>
                  ▲ BIDS
                </Typography>
                <MaterialReactTable
                  columns={columns('bid')}
                  data={bids}
                  enablePagination={false}
                  enableSorting={false}
                  enableTopToolbar={false}
                  enableBottomToolbar={false}
                  muiTablePaperProps={{ elevation: 0, sx: { border: `1px solid rgba(2,192,118,0.2)`, borderRadius: 2 } }}
                  muiTableHeadCellProps={{ sx: { fontWeight: 700, fontSize: '0.72rem', py: 1 } }}
                  muiTableBodyCellProps={{ sx: { py: 0.75, fontSize: '0.8rem' } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 700, color: '#F6465D', mb: 1, fontSize: '0.85rem' }}>
                  ▼ ASKS
                </Typography>
                <MaterialReactTable
                  columns={columns('ask')}
                  data={asks}
                  enablePagination={false}
                  enableSorting={false}
                  enableTopToolbar={false}
                  enableBottomToolbar={false}
                  muiTablePaperProps={{ elevation: 0, sx: { border: `1px solid rgba(246,70,93,0.2)`, borderRadius: 2 } }}
                  muiTableHeadCellProps={{ sx: { fontWeight: 700, fontSize: '0.72rem', py: 1 } }}
                  muiTableBodyCellProps={{ sx: { py: 0.75, fontSize: '0.8rem' } }}
                />
              </Box>
            </Box>
          </Box>
        </ResultTabs>
      )}
    </Box>
  );
}
