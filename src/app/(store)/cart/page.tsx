'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';

import { getCart, updateCartItem, removeCartItem } from '../../../lib/api';
import { useCartStore } from '../../../store/cartStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { EmptyState } from '../../../components/ui/EmptyState';
import { QuantitySelector } from '../../../components/ui/QuantitySelector';
import { PriceDisplay } from '../../../components/ui/PriceDisplay';
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner';

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 500;

export default function CartPage() {
  const { items, total, setCart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null); // productId being updated
  const [snack, setSnack] = useState({ open: false, msg: '', ok: true });

  useEffect(() => {
    getCart()
      .then(({ data }) => setCart(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setCart]);

  const handleQuantityChange = async (itemId: string, qty: number) => {
    setUpdating(itemId);
    try {
      const { data } = await updateCartItem(itemId, qty);
      setCart(data.data);
    } catch {
      setSnack({ open: true, msg: 'Failed to update quantity', ok: false });
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const { data } = await removeCartItem(itemId);
      setCart(data.data);
      setSnack({ open: true, msg: 'Item removed from cart', ok: true });
    } catch {
      setSnack({ open: true, msg: 'Failed to remove item', ok: false });
    } finally {
      setUpdating(null);
    }
  };

  const shippingCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const orderTotal = total + shippingCost;

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <PageWrapper>
      <Typography
        variant="h4"
        sx={{ mb: 5, letterSpacing: '-0.02em', fontWeight: 700 }}
      >
        Your Cart
      </Typography>

      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingCartRoundedIcon sx={{ fontSize: 56 }} />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Discover our products and find something you'll love."
          action={
            <Button
              component={Link}
              href="/products"
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Browse Products
            </Button>
          }
        />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
            gap: 4,
            alignItems: 'flex-start',
          }}
        >
          {/* ── Items list ───────────────────────────────────────── */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {items.map((item, idx) => (
              <Box key={item.productId}>
                {idx > 0 && <Divider />}
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2.5,
                    py: 3,
                    alignItems: 'center',
                    opacity: updating === item.productId ? 0.5 : 1,
                    transition: 'opacity 200ms',
                  }}
                >
                  {/* Image */}
                  <Box
                    sx={{
                      width: { xs: 72, sm: 96 },
                      height: { xs: 72, sm: 96 },
                      flexShrink: 0,
                      borderRadius: 2,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: (t) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(0,0,0,0.08)',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <ImageNotSupportedRoundedIcon
                        sx={{ fontSize: 28, color: 'text.disabled' }}
                      />
                    )}
                  </Box>

                  {/* Name + price */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        mb: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </Typography>
                    <PriceDisplay price={item.price} size="small" />
                  </Box>

                  {/* Quantity */}
                  <Box sx={{ flexShrink: 0 }}>
                    {updating === item.productId ? (
                      <CircularProgress size={24} />
                    ) : (
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(qty) =>
                          handleQuantityChange(item.productId, qty)
                        }
                        min={1}
                        max={Math.min(item.stockQuantity, 10)}
                        size="small"
                      />
                    )}
                  </Box>

                  {/* Line total */}
                  <Box
                    sx={{
                      flexShrink: 0,
                      minWidth: 100,
                      textAlign: 'right',
                      display: { xs: 'none', sm: 'block' },
                    }}
                  >
                    <PriceDisplay
                      price={item.price * item.quantity}
                    />
                  </Box>

                  {/* Remove */}
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(item.productId)}
                    disabled={!!updating}
                    sx={{ color: 'text.secondary', flexShrink: 0 }}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>

          {/* ── Order Summary ────────────────────────────────────── */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              position: 'sticky',
              top: 88,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
              Order Summary
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})
                </Typography>
                <PriceDisplay price={total} size="small" />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Shipping
                </Typography>
                {shippingCost === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{ color: '#00C896', fontWeight: 600 }}
                  >
                    Free
                  </Typography>
                ) : (
                  <PriceDisplay price={shippingCost} size="small" />
                )}
              </Box>

              {shippingCost > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textAlign: 'right' }}
                >
                  Free shipping on orders over PKR{' '}
                  {FREE_SHIPPING_THRESHOLD.toLocaleString()}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2.5 }} />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                Total
              </Typography>
              <PriceDisplay price={orderTotal} size="large" />
            </Box>

            <Button
              component={Link}
              href="/checkout"
              variant="contained"
              size="large"
              fullWidth
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ borderRadius: 2 }}
            >
              Proceed to Checkout
            </Button>

            <Button
              component={Link}
              href="/products"
              variant="text"
              fullWidth
              sx={{ mt: 1.5, color: 'text.secondary' }}
            >
              Continue Shopping
            </Button>
          </Paper>
        </Box>
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
