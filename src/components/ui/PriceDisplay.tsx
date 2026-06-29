import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

type Currency = 'PKR' | 'USD';

const LOCALE: Record<Currency, string> = {
  PKR: 'en-PK',
  USD: 'en-US',
};

const SYMBOL: Record<Currency, string> = {
  PKR: 'PKR ',
  USD: '$',
};

function formatPrice(amount: number, currency: Currency): string {
  const decimals = currency === 'PKR' ? 0 : 2;
  return (
    SYMBOL[currency] +
    amount.toLocaleString(LOCALE[currency], {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}

export interface PriceDisplayProps {
  price: number;
  /** If provided, renders as a struck-through original price alongside */
  originalPrice?: number;
  currency?: Currency;
  /** Size variant — controls typography */
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

const SIZE_MAP = {
  small: { current: '0.9rem', original: '0.78rem' },
  medium: { current: '1.1rem', original: '0.9rem' },
  large: { current: '1.4rem', original: '1.05rem' },
} as const;

export const PriceDisplay = forwardRef<HTMLDivElement, PriceDisplayProps>(
  function PriceDisplay(
    { price, originalPrice, currency = 'PKR', size = 'medium', sx },
    ref,
  ) {
    const sizeMap = SIZE_MAP[size];
    const hasDiscount = originalPrice !== undefined && originalPrice > price;

    return (
      <Box
        ref={ref}
        sx={{ display: 'flex', alignItems: 'baseline', gap: 1, ...sx }}
      >
        <Typography
          component="span"
          sx={{
            fontWeight: 700,
            fontSize: sizeMap.current,
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            color: '#6C63FF',
            lineHeight: 1,
          }}
        >
          {formatPrice(price, currency)}
        </Typography>

        {hasDiscount && (
          <>
            <Typography
              component="span"
              sx={{
                fontWeight: 400,
                fontSize: sizeMap.original,
                color: 'text.secondary',
                textDecoration: 'line-through',
                lineHeight: 1,
              }}
            >
              {formatPrice(originalPrice!, currency)}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#FF6B6B',
                backgroundColor: 'rgba(255,107,107,0.12)',
                border: '1px solid rgba(255,107,107,0.25)',
                borderRadius: 1,
                px: 0.75,
                py: 0.2,
                lineHeight: 1.5,
              }}
            >
              {Math.round(((originalPrice! - price) / originalPrice!) * 100)}%
            </Typography>
          </>
        )}
      </Box>
    );
  },
);
