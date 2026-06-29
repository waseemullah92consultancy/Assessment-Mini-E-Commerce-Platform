'use client';

import { forwardRef, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  href?: string;
}

export interface EmptyStateProps {
  /** An icon element — typically a MUI SvgIcon */
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
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
          <Button
            variant={action.variant ?? 'contained'}
            onClick={action.onClick}
            {...(action.href ? { href: action.href, component: 'a' } : {})}
            sx={{ mt: 0.5, borderRadius: 2 }}
          >
            {action.label}
          </Button>
        )}
      </Box>
    );
  },
);
