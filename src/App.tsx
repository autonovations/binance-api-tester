import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Box, Typography, useTheme } from '@mui/material';
import { ThemeProvider } from './context/ThemeContext';
import { AppShell } from './components/layout/AppShell';

// Views
import { PingView } from './components/views/PingView';
import { ServerTimeView } from './components/views/ServerTimeView';
import { ExchangeInfoView } from './components/views/ExchangeInfoView';
import { OrderBookView } from './components/views/OrderBookView';
import { RecentTradesView } from './components/views/RecentTradesView';
import { KlinesView } from './components/views/KlinesView';
import { TickerPriceView } from './components/views/TickerPriceView';
import { Ticker24hrView } from './components/views/Ticker24hrView';
import { BookTickerView } from './components/views/BookTickerView';
import { ENDPOINT_MAP } from './config/endpoints';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const VIEW_MAP: Record<string, React.ReactNode> = {
  ping: <PingView />,
  serverTime: <ServerTimeView />,
  exchangeInfo: <ExchangeInfoView />,
  orderBook: <OrderBookView />,
  recentTrades: <RecentTradesView />,
  klines: <KlinesView />,
  tickerPrice: <TickerPriceView />,
  ticker24hr: <Ticker24hrView />,
  bookTicker: <BookTickerView />,
};

function AppContent() {
  const [selectedEndpoint, setSelectedEndpoint] = useState('ping');
  const theme = useTheme();
  const endpoint = ENDPOINT_MAP[selectedEndpoint];

  return (
    <AppShell selectedEndpoint={selectedEndpoint} onSelectEndpoint={setSelectedEndpoint}>
      <Box>
        {/* Page Header */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            {endpoint?.label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              color: 'text.secondary',
              fontSize: '0.8rem',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              display: 'inline-flex',
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            GET — {endpoint?.path}
          </Typography>
        </Box>

        {/* Active View */}
        {VIEW_MAP[selectedEndpoint]}
      </Box>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
