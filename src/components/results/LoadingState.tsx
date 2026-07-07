
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Fetching data from Binance...' }: LoadingStateProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 8,
        color: 'text.secondary',
      }}
    >
      <CircularProgress
        size={48}
        thickness={3}
        sx={{ color: theme.palette.primary.main }}
      />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {message}
      </Typography>
    </Box>
  );
}
