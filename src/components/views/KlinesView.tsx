import React, { useState, useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { ParamPanel } from '../params/ParamPanel';
import { ResultTabs } from '../results/ResultTabs';
import { LoadingState } from '../results/LoadingState';
import { ErrorState } from '../results/ErrorState';
import { CandlestickChart } from '../../charts/CandlestickChart';
import { useBinanceKlines } from '../../hooks/useBinanceKlines';
import { ENDPOINT_MAP } from '../../config/endpoints';
import type { Kline, KlineInterval, KlineRaw } from '../../types/binance';

function parseKlines(raw: KlineRaw[]): Kline[] {
  return raw.map((k) => ({
    openTime: k[0],
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
    volume: parseFloat(k[5]),
    closeTime: k[6],
    quoteVolume: parseFloat(k[7]),
    trades: k[8],
    takerBuyBaseVol: parseFloat(k[9]),
    takerBuyQuoteVol: parseFloat(k[10]),
  }));
}

export function KlinesView() {
  const [enabled, setEnabled] = useState(false);
  const [params, setParams] = useState({ symbol: 'BTCUSDT', interval: '1h' as KlineInterval, limit: 100 });
  const { data, isLoading, error, refetch } = useBinanceKlines(params.symbol, params.interval, params.limit, enabled);
  const theme = useTheme();

  const handleExecute = (p: Record<string, string | number>) => {
    setParams({
      symbol: String(p.symbol),
      interval: String(p.interval) as KlineInterval,
      limit: Number(p.limit) || 100,
    });
    if (enabled) refetch();
    else setEnabled(true);
  };

  const klines = useMemo(() => (data ? parseKlines(data) : []), [data]);

  const columns: MRT_ColumnDef<Kline>[] = [
    {
      accessorKey: 'openTime',
      header: 'Open Time',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'text.secondary' }}>
          {new Date(cell.getValue<number>()).toLocaleString()}
        </Typography>
      ),
    },
    {
      accessorKey: 'open',
      header: 'Open',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
          {cell.getValue<number>().toFixed(2)}
        </Typography>
      ),
    },
    {
      accessorKey: 'high',
      header: 'High',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#02C076' }}>
          {cell.getValue<number>().toFixed(2)}
        </Typography>
      ),
    },
    {
      accessorKey: 'low',
      header: 'Low',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#F6465D' }}>
          {cell.getValue<number>().toFixed(2)}
        </Typography>
      ),
    },
    {
      accessorKey: 'close',
      header: 'Close',
      Cell: ({ row, cell }) => {
        const isUp = cell.getValue<number>() >= row.original.open;
        return (
          <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.82rem', color: isUp ? '#02C076' : '#F6465D' }}>
            {cell.getValue<number>().toFixed(2)}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'volume',
      header: 'Volume',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem', color: 'text.secondary' }}>
          {cell.getValue<number>().toLocaleString('en-US', { maximumFractionDigits: 2 })}
        </Typography>
      ),
    },
    {
      accessorKey: 'trades',
      header: 'Trades',
      Cell: ({ cell }) => (
        <Typography sx={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
          {cell.getValue<number>().toLocaleString()}
        </Typography>
      ),
    },
  ];

  return (
    <Box>
      <ParamPanel endpoint={ENDPOINT_MAP['klines']} onExecute={handleExecute} isLoading={isLoading} />

      {isLoading && <LoadingState message="Fetching candlestick data..." />}
      {error && <ErrorState error={error as Error} />}

      {klines.length > 0 && !isLoading && !error && (
        <ResultTabs rawData={data}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <CandlestickChart data={klines} symbol={params.symbol} interval={params.interval} />
            <MaterialReactTable
              columns={columns}
              data={klines}
              enablePagination
              initialState={{ pagination: { pageSize: 15, pageIndex: 0 } }}
              muiTablePaperProps={{ elevation: 0, sx: { border: `1px solid ${theme.palette.divider}`, borderRadius: 2 } }}
              muiTableHeadCellProps={{ sx: { fontWeight: 700, fontSize: '0.75rem' } }}
              muiTableBodyCellProps={{ sx: { py: 0.75 } }}
            />
          </Box>
        </ResultTabs>
      )}
    </Box>
  );
}
