import { useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  useTheme,
  Chip,
  Divider,
  Autocomplete,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Refresh as RefreshIcon,
  HelpOutlined as HelpIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import type { EndpointConfig } from '../../types/binance';
import { useBinanceExchangeInfo } from '../../hooks/useBinanceExchangeInfo';
import { useSymbolsGuide } from '../../context/SymbolsGuideContext';

interface ParamPanelProps {
  endpoint: EndpointConfig;
  onExecute: (params: Record<string, string | number>) => void;
  isLoading: boolean;
}

export function ParamPanel({ endpoint, onExecute, isLoading }: ParamPanelProps) {
  const theme = useTheme();
  const { openGuide } = useSymbolsGuide();

  const hasSymbolParam = endpoint.params.some((p) => p.type === 'symbol');
  const { data: exchangeInfo, isLoading: isSymbolsLoading } = useBinanceExchangeInfo(hasSymbolParam);

  const availableSymbols = useMemo(() => {
    if (!exchangeInfo?.symbols) return [];
    return exchangeInfo.symbols
      .filter((s) => s.status === 'TRADING')
      .map((s) => s.symbol)
      .sort();
  }, [exchangeInfo]);

  const { control, handleSubmit, reset } = useForm<Record<string, string | number>>({
    defaultValues: Object.fromEntries(
      endpoint.params.map((p) => [p.name, p.defaultValue ?? ''])
    ),
  });

  // Reset form when endpoint changes
  useEffect(() => {
    reset(
      Object.fromEntries(endpoint.params.map((p) => [p.name, p.defaultValue ?? '']))
    );
  }, [endpoint.id, reset, endpoint.params]);

  const onSubmit = (data: Record<string, string | number>) => {
    const normalizedData = { ...data };
    endpoint.params.forEach((param) => {
      if (param.type === 'symbol' && typeof normalizedData[param.name] === 'string') {
        normalizedData[param.name] = (normalizedData[param.name] as string).toUpperCase();
      }
    });
    onExecute(normalizedData);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background:
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(0,0,0,0.02)',
        }}
      >
        <Chip
          label="GET"
          size="small"
          sx={{
            fontWeight: 700,
            fontSize: '0.7rem',
            bgcolor: 'rgba(2,192,118,0.15)',
            color: '#02C076',
            border: '1px solid rgba(2,192,118,0.3)',
          }}
        />
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            color: 'text.secondary',
            fontSize: '0.82rem',
          }}
        >
          https://api.binance.com
        </Typography>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '0.82rem',
          }}
        >
          {endpoint.path}
        </Typography>
      </Box>

      {/* Description */}
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {endpoint.description}
        </Typography>
      </Box>

      {/* Params Form */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ px: 2.5, py: 2 }}
      >
        {endpoint.params.length > 0 ? (
          <>
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
              Query Parameters
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 2,
                mb: 2,
              }}
            >
              {endpoint.params.map((param) => (
                <Controller
                  key={param.name}
                  name={param.name}
                  control={control}
                  rules={{ required: param.required ? `${param.label} is required` : false }}
                  render={({ field, fieldState }) => {
                    if (param.type === 'select') {
                      return (
                        <TextField
                          {...field}
                          select
                          label={param.label}
                          size="small"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          required={param.required}
                          sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace' } }}
                        >
                          {(param.options ?? []).map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </TextField>
                      );
                    } else if (param.type === 'symbol') {
                      const { onChange, value, ...fieldProps } = field;
                      return (
                        <Autocomplete
                          freeSolo
                          options={availableSymbols}
                          loading={isSymbolsLoading}
                          value={String(value || '')}
                          onChange={(_, newValue) => {
                            onChange(newValue || '');
                          }}
                          onInputChange={(_, newInputValue) => {
                            onChange(newInputValue || '');
                          }}
                          {...fieldProps}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={param.label}
                              placeholder={param.placeholder}
                              size="small"
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                              required={param.required}
                              slotProps={{
                                ...params.slotProps,
                                input: {
                                  ...params.slotProps.input,
                                  endAdornment: (
                                    <>
                                      {isSymbolsLoading ? (
                                        <CircularProgress color="inherit" size={20} />
                                      ) : null}
                                      <Tooltip title="Ver guía de símbolos">
                                        <IconButton
                                          size="small"
                                          onClick={() => {
                                            openGuide(String(value || ''), (selectedSymbol) => {
                                              onChange(selectedSymbol);
                                            });
                                          }}
                                          sx={{ mr: 0.5, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                        >
                                          <HelpIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      {params.slotProps.input.endAdornment}
                                    </>
                                  ),
                                },
                              }}
                              sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace' } }}
                            />
                          )}
                        />
                      );
                    } else {
                      return (
                        <TextField
                          {...field}
                          type={param.type === 'number' ? 'number' : 'text'}
                          label={param.label}
                          placeholder={param.placeholder}
                          size="small"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                          required={param.required}
                          sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace' } }}
                        />
                      );
                    }
                  }}
                />
              ))}
            </Box>
            <Divider sx={{ mb: 2, opacity: 0.3 }} />
          </>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
              No parameters required for this endpoint.
            </Typography>
          </Box>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading}
          startIcon={isLoading ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <PlayArrowIcon />}
          sx={{
            px: 3,
            py: 1,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #F0B90B 0%, #F8D33A 100%)',
            color: '#000',
            '&:hover': {
              background: 'linear-gradient(135deg, #D4A209 0%, #F0B90B 100%)',
            },
            '@keyframes spin': {
              '0%': { transform: 'rotate(0deg)' },
              '100%': { transform: 'rotate(360deg)' },
            },
          }}
        >
          {isLoading ? 'Executing...' : 'Execute'}
        </Button>
      </Box>
    </Paper>
  );
}
