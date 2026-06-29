'use client';

import { forwardRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';

export interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  stockQuantity: number;
  isActive: boolean;
}

interface StockConfig {
  label: string;
  color: string;
}

function getStockConfig(qty: number): StockConfig {
  if (qty === 0) return { label: 'Out of Stock', color: '#FF4757' };
  if (qty <= 5) return { label: 'Low Stock', color: '#FF9800' };
  return { label: 'In Stock', color: '#00C896' };
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <Card sx={{ overflow: 'hidden' }}>
      {/* image area 4:3 */}
      <Skeleton variant="rectangular" sx={{ paddingTop: '75%' }} />
      <CardContent sx={{ pb: 0 }}>
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="85%" height={24} />
        <Skeleton variant="text" width="50%" height={24} sx={{ mt: 0.5 }} />
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Skeleton variant="rounded" width="100%" height={38} />
      </CardActions>
    </Card>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export interface ProductCardProps {
  product?: Product;
  loading?: boolean;
  onAddToCart?: (id: string) => void;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  function ProductCard({ product, loading = false, onAddToCart }, ref) {
    if (loading || !product) return <ProductCardSkeleton />;

    const stock = getStockConfig(product.stockQuantity);
    const outOfStock = product.stockQuantity === 0;
    const imageUrl = product.images[0] ?? '';

    return (
      <Card
        ref={ref}
        sx={{
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(108,99,255,0.22), 0 2px 8px rgba(0,0,0,0.5)'
                : '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
          },
          '&:hover .product-image': {
            transform: 'scale(1.05)',
          },
        }}
      >
        {/* Image — 4:3 aspect ratio */}
        <Box
          sx={{
            position: 'relative',
            paddingTop: '75%',
            overflow: 'hidden',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? '#2D2D30' : '#F5F5F5',
          }}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="product-image"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 200ms ease',
              }}
            />
          ) : (
            <Box
              className="product-image"
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 200ms ease',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'var(--font-syne), Syne, sans-serif',
                  fontWeight: 800,
                  fontSize: '2rem',
                  color: 'rgba(108,99,255,0.2)',
                  letterSpacing: '-0.05em',
                }}
              >
                NOIR
              </Typography>
            </Box>
          )}

          {/* Stock badge overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              px: 1.25,
              py: 0.4,
              borderRadius: 1.5,
              backgroundColor: `${stock.color}22`,
              backdropFilter: 'blur(8px)',
              border: `1px solid ${stock.color}40`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: stock.color,
                fontWeight: 600,
                fontSize: '0.68rem',
                letterSpacing: '0.03em',
              }}
            >
              {stock.label}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ flex: 1, pb: 1 }}>
          {/* Category */}
          <Chip
            label={product.category}
            size="small"
            sx={{
              mb: 1,
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(108,99,255,0.12)',
              color: '#6C63FF',
              border: '1px solid rgba(108,99,255,0.2)',
            }}
          />

          {/* Name */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              lineHeight: 1.35,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              mb: 0.75,
              fontSize: '0.95rem',
            }}
          >
            {product.name}
          </Typography>

          {/* Price */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: '1.1rem',
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              color: '#6C63FF',
            }}
          >
            PKR {product.price.toLocaleString('en-PK', { minimumFractionDigits: 0 })}
          </Typography>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button
            variant="contained"
            fullWidth
            size="small"
            startIcon={<AddShoppingCartRoundedIcon />}
            disabled={outOfStock}
            onClick={() => onAddToCart?.(product._id)}
            sx={{ borderRadius: 2 }}
          >
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </CardActions>
      </Card>
    );
  },
);
