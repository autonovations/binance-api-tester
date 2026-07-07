import React, { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { useTheme } from '@mui/material';
import { ParamPanel } from '../params/ParamPanel';
import { ResultTabs } from '../results/ResultTabs';
import { LoadingState } from '../results/LoadingState';
import { ErrorState } from '../results/ErrorState';
import { useBinanceRecentTrades } from '../../hooks/useBinanceRecentTrades';
import { ENDPOINT_MAP } from '../../config/endpoints';
import type { Trade } from '../../types/binance';

export function RecentTradesView() {
  const [enabled, setEnabled] = useState(false);
  const [params, setParams] = useState({ symbol: 'BTCUSDT', limit: 20 });
  const { data, isLoading, error, refetch } = useBinanceRecentTrades(params.symbol, params.limit, enabled);
  const theme = useTheme();

  const handleExecute = (p: Record<string, string | number>) => {
    setParams({ symbol: String(p.symbol), limit: Number(p.limit) || 20 });
    if (enabled) refetch();
    else setEnabled(true);
  };

  const columns: MRT_ColumnDef<Trade>[] = [
    {
      accessorKey: 'id',
      header: 'Trade ID',
      size: 110,
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
          {cell.getValue<number>()}
        </Typography>
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      Cell: ({ row, cell }) => (
        <Typography sx={{
          fontFamily: 'monospace',
          fontWeight: 700,
          fontSize: '0.82rem',
          color: row.original.isBuyerMaker ? '#F6465D' : '#02C076',
        }}>
          {parseFloat(cell.getValue<string>()).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      accessorKey: 'qty',
      header: 'Quantity',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
          {parseFloat(cell.getValue<string>()).toFixed(6)}
        </Typography>
      ),
    },
    {
      accessorKey: 'quoteQty',
      header: 'Quote Qty',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'text.secondary' }}>
          {parseFloat(cell.getValue<string>()).toLocaleString('en-US', { maximumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      accessorKey: 'time',
      header: 'Time',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
          {new Date(cell.getValue<number>()).toLocaleTimeString()}
        </Typography>
      ),
    },
    {
      accessorKey: 'isBuyerMaker',
      header: 'Side',
      size: 80,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue<boolean>() ? 'SELL' : 'BUY'}
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.65rem',
            bgcolor: cell.getValue<boolean>() ? 'rgba(246,70,93,0.15)' : 'rgba(2,192,118,0.15)',
            color: cell.getValue<boolean>() ? '#F6465D' : '#02C076',
            border: `1px solid ${cell.getValue<boolean>() ? 'rgba(246,70,93,0.3)' : 'rgba(2,192,118,0.3)'}`,
          }}
        />
      ),
    },
  ];

  return (
    <Box>
      <ParamPanel endpoint={ENDPOINT_MAP['recentTrades']} onExecute={handleExecute} isLoading={isLoading} />

      {isLoading && <LoadingState message="Fetching recent trades..." />}
      {error && <ErrorState error={error as Error} />}

      {data && !isLoading && !error && (
        <ResultTabs rawData={data}>
          <MaterialReactTable
            columns={columns}
            data={data}
            enablePagination
            initialState={{ pagination: { pageSize: 20, pageIndex: 0 } }}
            muiTablePaperProps={{ elevation: 0, sx: { border: `1px solid ${theme.palette.divider}`, borderRadius: 2 } }}
            muiTableHeadCellProps={{ sx: { fontWeight: 700, fontSize: '0.75rem' } }}
            muiTableBodyCellProps={{ sx: { py: 0.75 } }}
          />
        </ResultTabs>
      )}
    </Box>
  );
}
