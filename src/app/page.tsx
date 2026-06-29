'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ElectricBoltRoundedIcon from '@mui/icons-material/ElectricBoltRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

import { getProducts, getPersonalizedRecs, addToCart } from '../lib/api';
import type { Product } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { ProductCard } from '../components/ui/ProductCard';
import { PageWrapper } from '../components/layout/PageWrapper';
import { LoadingSpinner } from '../components/layout/LoadingSpinner';

const CATEGORIES = [
  { label: 'Electronics', Icon: ElectricBoltRoundedIcon, color: '#6C63FF', q: 'Electronics' },
  { label: 'Clothing', Icon: CheckroomRoundedIcon, color: '#FF6B6B', q: 'Clothing' },
  { label: 'Books', Icon: MenuBookRoundedIcon, color: '#00C896', q: 'Books' },
  { label: 'Home', Icon: HomeRoundedIcon, color: '#FF9800', q: 'Home' },
  { label: 'Sports', Icon: SportsSoccerRoundedIcon, color: '#2196F3', q: 'Sports' },
];

export default function HomePage() {
  const { user } = useAuthStore();
  const setCart = useCartStore((s) => s.setCart);

  const [arrivals, setArrivals] = useState<Product[]>([]);
  const [recs, setRecs] = useState<Product[]>([]);
  const [loadingArrivals, setLoadingArrivals] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', ok: true });

  useEffect(() => {
    getProducts({ sortBy: 'newest', limit: 8 })
      .then(({ data }) => setArrivals(data.data.products))
      .catch(() => {})
      .finally(() => setLoadingArrivals(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoadingRecs(true);
    getPersonalizedRecs()
      .then(({ data }) => setRecs(data.data))
      .catch(() => {})
      .finally(() => setLoadingRecs(false));
  }, [user]);

  const handleAddToCart = async (productId: string) => {
    try {
      const { data } = await addToCart(productId, 1);
      setCart(data.data);
      setSnack({ open: true, msg: 'Added to cart!', ok: true });
    } catch (err: any) {
      setSnack({
        open: true,
        msg: err?.response?.data?.message ?? 'Could not add to cart',
        ok: false,
      });
    }
  };

  return (
    <Box>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <Box
        sx={{
          background:
            'linear-gradient(135deg, #0A0A0B 0%, #12122A 40%, #0A0A0B 100%)',
          minHeight: { xs: 480, md: 600 },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '30%',
            left: '40%',
            width: 900,
            height: 900,
            background:
              'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 65%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: 'auto',
            px: { xs: 2, md: 3 },
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: '#6C63FF',
              letterSpacing: '0.16em',
              mb: 2,
              display: 'block',
            }}
          >
            New Season · 2025
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.6rem', sm: '3.6rem', md: '4.8rem' },
              maxWidth: 720,
              mb: 2.5,
              lineHeight: 1.07,
              letterSpacing: '-0.03em',
              color: '#FFFFFF',
            }}
          >
            Discover Something{' '}
            <Box
              component="span"
              sx={{
                background:
                  'linear-gradient(135deg, #6C63FF 0%, #8B85FF 55%, #FF6B6B 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Extraordinary
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.55)',
              maxWidth: 480,
              mb: 4,
              lineHeight: 1.85,
              fontSize: '1.05rem',
            }}
          >
            Curated products across every category — premium quality,
            unbeatable prices, fast delivery.
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              component={Link}
              href="/products"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ borderRadius: 2, px: 3.5, py: 1.5 }}
            >
              Shop Now
            </Button>
            <Button
              component={Link}
              href="/products"
              variant="outlined"
              size="large"
              sx={{ borderRadius: 2, px: 3.5, py: 1.5 }}
            >
              Browse Categories
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── Categories ───────────────────────────────────────────────── */}
      <PageWrapper>
        <Typography variant="h4" sx={{ mb: 4, letterSpacing: '-0.02em' }}>
          Shop by Category
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(5, minmax(130px, 1fr))',
              md: 'repeat(5, 1fr)',
            },
            gap: 2,
            overflowX: { xs: 'auto', md: 'visible' },
            pb: { xs: 1, md: 0 },
            '&::-webkit-scrollbar': { display: 'none' },
            scrollbarWidth: 'none',
          }}
        >
          {CATEGORIES.map(({ label, Icon, color, q }) => (
            <Box
              key={label}
              component={Link}
              href={`/products?category=${q}`}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: (t) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                textDecoration: 'none',
                backgroundColor: (t) => t.palette.background.paper,
                transition: 'all 200ms ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  borderColor: `${color}55`,
                  boxShadow: `0 8px 24px ${color}18`,
                },
              }}
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  backgroundColor: `${color}18`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color,
                }}
              >
                <Icon sx={{ fontSize: 26 }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  color: (t) => t.palette.text.primary,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </PageWrapper>

      {/* ── New Arrivals ──────────────────────────────────────────────── */}
      <PageWrapper
        sx={{
          borderTop: '1px solid',
          borderColor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.06)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
          }}
        >
          <Typography variant="h4" sx={{ letterSpacing: '-0.02em' }}>
            New Arrivals
          </Typography>
          <Button
            component={Link}
            href="/products?sortBy=newest"
            variant="text"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ color: '#6C63FF' }}
          >
            View all
          </Button>
        </Box>

        {loadingArrivals ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2,1fr)',
                sm: 'repeat(3,1fr)',
                md: 'repeat(4,1fr)',
              },
              gap: 2,
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCard key={i} loading />
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2,1fr)',
                sm: 'repeat(3,1fr)',
                md: 'repeat(4,1fr)',
              },
              gap: 2,
            }}
          >
            {arrivals.map((p) => (
              <Box
                key={p._id}
                component={Link}
                href={`/products/${p._id}`}
                sx={{ textDecoration: 'none' }}
              >
                <ProductCard product={p} onAddToCart={handleAddToCart} />
              </Box>
            ))}
          </Box>
        )}
      </PageWrapper>

      {/* ── Personalised Recommendations ─────────────────────────────── */}
      <PageWrapper
        sx={{
          borderTop: '1px solid',
          borderColor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(0,0,0,0.06)',
        }}
      >
        <Typography variant="h4" sx={{ mb: 4, letterSpacing: '-0.02em' }}>
          Picked for You
        </Typography>

        {!user ? (
          <Box
            sx={{
              border: '1px solid rgba(108,99,255,0.22)',
              borderRadius: 3,
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              background:
                'linear-gradient(135deg, rgba(108,99,255,0.04), rgba(108,99,255,0.08))',
            }}
          >
            <LockRoundedIcon sx={{ fontSize: 44, color: '#6C63FF', mb: 2 }} />
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontWeight: 700,
              }}
            >
              Sign in for personalised picks
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 360, mx: 'auto' }}
            >
              We analyse your purchase history to surface products you&apos;ll
              love.
            </Typography>
            <Button
              component={Link}
              href="/auth/login"
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Sign in
            </Button>
          </Box>
        ) : loadingRecs ? (
          <LoadingSpinner />
        ) : recs.length === 0 ? (
          <Typography color="text.secondary" variant="body2">
            Place your first order to unlock personalised recommendations.
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2,1fr)',
                sm: 'repeat(3,1fr)',
                md: 'repeat(4,1fr)',
              },
              gap: 2,
            }}
          >
            {recs.slice(0, 8).map((p) => (
              <Box
                key={p._id}
                component={Link}
                href={`/products/${p._id}`}
                sx={{ textDecoration: 'none' }}
              >
                <ProductCard product={p} onAddToCart={handleAddToCart} />
              </Box>
            ))}
          </Box>
        )}
      </PageWrapper>

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
    </Box>
  );
}
