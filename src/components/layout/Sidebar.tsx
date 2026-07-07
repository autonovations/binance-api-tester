
import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  useTheme,
  Chip,
} from '@mui/material';
import { ENDPOINTS } from '../../config/endpoints';

export const SIDEBAR_WIDTH = 240;

interface SidebarProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const CATEGORIES = ['General', 'Market Data', 'Tickers'];

const CATEGORY_COLORS: Record<string, string> = {
  General: '#1E88E5',
  'Market Data': '#7B61FF',
  Tickers: '#02C076',
};

export function Sidebar({ selectedId, onSelect }: SidebarProps) {
  const theme = useTheme();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          background: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', py: 1 }}>
        {CATEGORIES.map((category) => {
          const categoryEndpoints = ENDPOINTS.filter((e) => e.category === category);
          return (
            <Box key={category}>
              <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 3,
                    height: 14,
                    borderRadius: 1,
                    bgcolor: CATEGORY_COLORS[category],
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: 'text.secondary',
                    fontSize: '0.68rem',
                  }}
                >
                  {category}
                </Typography>
              </Box>
              <List dense disablePadding>
                {categoryEndpoints.map((ep) => {
                  const isSelected = ep.id === selectedId;
                  return (
                    <ListItemButton
                      key={ep.id}
                      selected={isSelected}
                      onClick={() => onSelect(ep.id)}
                      sx={{
                        mx: 1,
                        mb: 0.5,
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 0.75,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&.Mui-selected': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(240,185,11,0.12)' : 'rgba(240,185,11,0.08)',
                          borderLeft: `3px solid ${theme.palette.primary.main}`,
                          boxShadow: '0 4px 12px rgba(240,185,11,0.1)',
                          '&:hover': {
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(240,185,11,0.18)' : 'rgba(240,185,11,0.12)',
                            transform: 'translateX(4px)',
                          },
                        },
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          transform: 'translateX(4px)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, width: '100%' }}>
                        <ListItemText
                          primary={ep.label}
                          slotProps={{
                            primary: {
                              sx: {
                                fontWeight: isSelected ? 700 : 500,
                                fontSize: '0.85rem',
                                color: isSelected ? 'primary.main' : 'text.primary',
                              }
                            }
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontSize: '0.65rem',
                            fontFamily: 'monospace',
                          }}
                        >
                          {ep.path}
                        </Typography>
                      </Box>
                      <Chip
                        label="GET"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.58rem',
                          fontWeight: 700,
                          bgcolor: 'rgba(2,192,118,0.15)',
                          color: '#02C076',
                          border: '1px solid rgba(2,192,118,0.3)',
                          ml: 0.5,
                          flexShrink: 0,
                        }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
              <Divider sx={{ my: 1, mx: 2, opacity: 0.3 }} />
            </Box>
          );
        })}
      </Box>
    </Drawer>
  );
}
