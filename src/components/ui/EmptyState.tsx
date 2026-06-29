'use client';

import { forwardRef, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

export interface EmptyStateProps {
  /** An icon element — typically a MUI SvgIcon */
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Any React node — usually a Button */
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState({ icon, title, description, action, sx }, ref) {
    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 8,
          px: 3,
          textAlign: 'center',
          ...sx,
        }}
      >
        {icon && (
          <Box
            sx={{
              fontSize: 64,
              color: 'text.disabled',
              display: 'flex',
              '& > svg': { fontSize: 'inherit' },
            }}
          >
            {icon}
          </Box>
        )}

        <Box>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 700 }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 380, mx: 'auto', lineHeight: 1.7 }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {action && (
          <Box sx={{ mt: 0.5 }}>
            {action}
          </Box>
        )}
      </Box>
    );
  },
);
