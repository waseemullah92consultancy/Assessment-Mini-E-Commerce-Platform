import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';

interface PageWrapperProps {
  children: React.ReactNode;
  /** Extra sx overrides for the inner content container */
  sx?: SxProps<Theme>;
  /** Removes default top/bottom padding — useful for full-bleed sections */
  noPadding?: boolean;
}

export function PageWrapper({ children, sx, noPadding = false }: PageWrapperProps) {
  return (
    <Box
      component="main"
      sx={{
        flex: 1,
        width: '100%',
        py: noPadding ? 0 : { xs: 4, md: 6 },
      }}
    >
      <Box
        sx={{
          maxWidth: 1280,
          mx: 'auto',
          px: { xs: 2, md: 3 },
          ...sx,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
