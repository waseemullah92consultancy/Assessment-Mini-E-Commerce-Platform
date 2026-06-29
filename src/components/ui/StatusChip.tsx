import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

interface StatusConfig {
  label: string;
  color: string;
  dot: string;
}

const STATUS_MAP: Record<OrderStatus, StatusConfig> = {
  pending: { label: 'Pending', color: '#FF9800', dot: '#FF9800' },
  processing: { label: 'Processing', color: '#2196F3', dot: '#2196F3' },
  shipped: { label: 'Shipped', color: '#9C27B0', dot: '#9C27B0' },
  delivered: { label: 'Delivered', color: '#00C896', dot: '#00C896' },
  cancelled: { label: 'Cancelled', color: '#FF4757', dot: '#FF4757' },
};

export interface StatusChipProps {
  status: OrderStatus;
  size?: 'small' | 'medium';
}

export const StatusChip = forwardRef<HTMLDivElement, StatusChipProps>(
  function StatusChip({ status, size = 'medium' }, ref) {
    const cfg = STATUS_MAP[status] ?? STATUS_MAP.pending;
    const isSmall = size === 'small';

    return (
      <Box
        ref={ref}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: isSmall ? 0.6 : 0.75,
          px: isSmall ? 1 : 1.25,
          py: isSmall ? 0.3 : 0.5,
          borderRadius: 1.5,
          backgroundColor: `${cfg.color}15`,
          border: `1px solid ${cfg.color}35`,
        }}
      >
        {/* Animated dot for active statuses */}
        <Box
          sx={{
            width: isSmall ? 6 : 7,
            height: isSmall ? 6 : 7,
            borderRadius: '50%',
            backgroundColor: cfg.dot,
            flexShrink: 0,
            ...(status === 'processing' || status === 'shipped'
              ? {
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                    '50%': { opacity: 0.55, transform: 'scale(0.75)' },
                  },
                  animation: 'pulse 1.8s ease-in-out infinite',
                }
              : {}),
          }}
        />
        <Typography
          component="span"
          sx={{
            fontSize: isSmall ? '0.7rem' : '0.78rem',
            fontWeight: 600,
            color: cfg.color,
            lineHeight: 1,
            letterSpacing: '0.02em',
          }}
        >
          {cfg.label}
        </Typography>
      </Box>
    );
  },
);
