
import { Box, Toolbar } from '@mui/material';
import { TopBar } from './TopBar';
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar';

interface AppShellProps {
  selectedEndpoint: string;
  onSelectEndpoint: (id: string) => void;
  children: React.ReactNode;
}

export function AppShell({ selectedEndpoint, onSelectEndpoint, children }: AppShellProps) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar />
      <Sidebar selectedId={selectedEndpoint} onSelect={onSelectEndpoint} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
