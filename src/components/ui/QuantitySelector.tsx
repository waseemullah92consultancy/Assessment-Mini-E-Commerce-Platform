'use client';

import { forwardRef, useId } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

export interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export const QuantitySelector = forwardRef<HTMLDivElement, QuantitySelectorProps>(
  function QuantitySelector(
    { value, onChange, min = 1, max, disabled = false, size = 'medium' },
    ref,
  ) {
    const labelId = useId();
    const isSmall = size === 'small';
    const btnSize = isSmall ? 26 : 32;
    const fontSize = isSmall ? '0.82rem' : '0.95rem';

    const decrement = () => {
      if (value > min) onChange(value - 1);
    };

    const increment = () => {
      if (max === undefined || value < max) onChange(value + 1);
    };

    return (
      <Box
        ref={ref}
        role="group"
        aria-labelledby={labelId}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.14)'
              : 'rgba(0,0,0,0.14)',
          borderRadius: 2,
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        <IconButton
          aria-label="Decrease quantity"
          onClick={decrement}
          disabled={disabled || value <= min}
          size="small"
          sx={{
            width: btnSize,
            height: btnSize,
            borderRadius: 0,
            color: 'text.secondary',
            '&:not(:disabled):hover': { color: '#6C63FF' },
          }}
        >
          <RemoveRoundedIcon sx={{ fontSize: isSmall ? 14 : 16 }} />
        </IconButton>

        <Box
          aria-live="polite"
          aria-atomic
          sx={{
            minWidth: isSmall ? 32 : 40,
            textAlign: 'center',
            borderLeft: '1px solid',
            borderRight: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.1)',
            height: btnSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize,
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {value}
          </Typography>
        </Box>

        <IconButton
          aria-label="Increase quantity"
          onClick={increment}
          disabled={disabled || (max !== undefined && value >= max)}
          size="small"
          sx={{
            width: btnSize,
            height: btnSize,
            borderRadius: 0,
            color: 'text.secondary',
            '&:not(:disabled):hover': { color: '#6C63FF' },
          }}
        >
          <AddRoundedIcon sx={{ fontSize: isSmall ? 14 : 16 }} />
        </IconButton>
      </Box>
    );
  },
);
