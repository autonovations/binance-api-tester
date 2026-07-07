
import { Typography, Alert, AlertTitle } from '@mui/material';
import { ErrorOutlined as ErrorIcon } from '@mui/icons-material';

interface ErrorStateProps {
  error: Error | null;
  title?: string;
}

export function ErrorState({ error, title = 'Request Failed' }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      icon={<ErrorIcon />}
      sx={{
        borderRadius: 2,
        border: '1px solid rgba(246,70,93,0.3)',
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
        {error?.message ?? 'An unknown error occurred.'}
      </Typography>
    </Alert>
  );
}
