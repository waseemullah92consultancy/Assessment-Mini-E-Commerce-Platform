'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';

import {
  getProduct,
  getProductRecommendations,
  addToCart,
} from '../../../../lib/api';
import type { Product } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';
import { useCartStore } from '../../../../store/cartStore';
import { ProductCard } from '../../../../components/ui/ProductCard';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { QuantitySelector } from '../../../../components/ui/QuantitySelector';
import { PriceDisplay } from '../../../../components/ui/PriceDisplay';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const setCart = useCartStore((s) => s.setCart);

  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [snack, setSnack] = useState({ open: false, msg: '', ok: true });

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(({ data }) => {
        setProduct(data.data);
        setActiveImage(0);
        setQuantity(1);
      })
      .catch(() => router.replace('/products'))
      .finally(() => setLoading(false));

    getProductRecommendations(id)
      .then(({ data }) => setRecommendations(data.data))
      .catch(() => {});
  }, [id, router]);

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!product) return;
    setAdding(true);
    try {
      const { data } = await addToCart(product._id, quantity);
      setCart(data.data);
      setSnack({ open: true, msg: `${quantity} × ${product.name} added to cart`, ok: true });
    } catch (err: any) {
      setSnack({
        open: true,
        msg: err?.response?.data?.message ?? 'Could not add to cart',
        ok: false,
      });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <Box sx={{ display: 'flex', gap: 6, flexDirection: { xs: 'column', md: 'row' } }}>
          <Skeleton variant="rectangular" sx={{ flex: 1, borderRadius: 3, aspectRatio: '1/1', maxWidth: 520 }} />
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Skeleton variant="text" sx={{ fontSize: '2rem', width: '70%' }} />
            <Skeleton variant="text" sx={{ width: '30%' }} />
            <Skeleton variant="text" height={80} />
            <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </PageWrapper>
    );
  }

  if (!product) return null;

  const inStock = product.stockQuantity > 0;
  const images = product.images ?? [];

  return (
    <PageWrapper>
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <Breadcrumbs
        separator={<NavigateNextRoundedIcon fontSize="small" />}
        sx={{ mb: 4 }}
      >
        <Box
          component={Link}
          href="/"
          sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'text.primary' } }}
        >
          Home
        </Box>
        <Box
          component={Link}
          href="/products"
          sx={{ color: 'text.secondary', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'text.primary' } }}
        >
          Products
        </Box>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
          {product.name}
        </Typography>
      </Breadcrumbs>

      {/* ── Main layout ─────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 4, md: 8 },
          flexDirection: { xs: 'column', md: 'row' },
          mb: 8,
        }}
      >
        {/* ── Images ─────────────────────────────────────────────── */}
        <Box sx={{ flex: 1, maxWidth: { md: 520 } }}>
          {/* Main image */}
          <Box
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.08)',
              mb: 2,
              aspectRatio: '1/1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: (t) => t.palette.background.paper,
            }}
          >
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.disabled',
                }}
              >
                <ImageNotSupportedRoundedIcon sx={{ fontSize: 64 }} />
                <Typography variant="caption">No image available</Typography>
              </Box>
            )}
          </Box>

          {/* Thumbnails */}
          {images.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              {images.map((src, i) => (
                <Box
                  key={i}
                  onClick={() => setActiveImage(i)}
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: i === activeImage ? '#6C63FF' : 'transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={src}
                    alt={`${product.name} ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* ── Details ─────────────────────────────────────────────── */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Category chip */}
          <Chip
            label={product.category}
            size="small"
            sx={{
              alignSelf: 'flex-start',
              mb: 2,
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              bgcolor: 'rgba(108,99,255,0.12)',
              color: '#6C63FF',
            }}
          />

          <Typography
            variant="h3"
            sx={{ mb: 1.5, letterSpacing: '-0.02em', lineHeight: 1.15 }}
          >
            {product.name}
          </Typography>

          <Box sx={{ mb: 2.5 }}>
            <PriceDisplay price={product.price} size="large" />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: inStock ? '#00C896' : '#FF4757',
                flexShrink: 0,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: inStock ? '#00C896' : '#FF4757',
                fontWeight: 600,
              }}
            >
              {inStock
                ? `In stock (${product.stockQuantity} available)`
                : 'Out of stock'}
            </Typography>
          </Box>

          {product.description && (
            <>
              <Divider sx={{ mb: 3 }} />
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, lineHeight: 1.85 }}
              >
                {product.description}
              </Typography>
            </>
          )}

          <Divider sx={{ mb: 3 }} />

          {inStock && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Quantity
              </Typography>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={Math.min(product.stockQuantity, 10)}
              />
            </Box>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!inStock || adding}
            startIcon={<ShoppingCartRoundedIcon />}
            onClick={handleAddToCart}
            sx={{ borderRadius: 2, py: 1.5, mb: 2 }}
          >
            {!inStock
              ? 'Out of Stock'
              : adding
              ? 'Adding…'
              : 'Add to Cart'}
          </Button>
        </Box>
      </Box>

      {/* ── Recommendations ─────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <>
          <Divider sx={{ mb: 5 }} />
          <Typography
            variant="h5"
            sx={{ mb: 3, letterSpacing: '-0.02em', fontWeight: 700 }}
          >
            You may also like
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: 2,
                bgcolor: 'divider',
              },
            }}
          >
            {recommendations.map((rec) => (
              <Box
                key={rec._id}
                component={Link}
                href={`/products/${rec._id}`}
                sx={{ minWidth: 220, flexShrink: 0, textDecoration: 'none' }}
              >
                <ProductCard product={rec} />
              </Box>
            ))}
          </Box>
        </>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.ok ? 'success' : 'error'}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
}
