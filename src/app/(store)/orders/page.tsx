'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ReceiptRoundedIcon from '@mui/icons-material/ReceiptRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';

import { getOrders } from '../../../lib/api';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { EmptyState } from '../../../components/ui/EmptyState';
import { StatusChip } from '../../../components/ui/StatusChip';
import type { OrderStatus } from '../../../components/ui/StatusChip';
import { PriceDisplay } from '../../../components/ui/PriceDisplay';
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const shortId = order._id.slice(-8).toUpperCase();

  return (
    <Paper
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: (t) =>
          t.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(0,0,0,0.06)',
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2.5,
          flexWrap: 'wrap',
          cursor: 'pointer',
          '&:hover': { bgcolor: (t) => t.palette.action.hover },
          transition: 'background 150ms',
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.75rem', mb: 0.25 }}
          >
            Order #{shortId}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {formatDate(order.createdAt)}
          </Typography>
        </Box>

        <StatusChip status={order.status} />

        <Box sx={{ textAlign: 'right' }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: '0.75rem', mb: 0.25 }}
          >
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </Typography>
          <PriceDisplay price={order.total}  />
        </Box>

        <IconButton size="small" sx={{ ml: 0.5, flexShrink: 0 }}>
          {expanded ? (
            <ExpandLessRoundedIcon fontSize="small" />
          ) : (
            <ExpandMoreRoundedIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      {/* Expandable details */}
      <Collapse in={expanded}>
        <Divider />
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 0 }}>
          {order.items.map((item, idx) => (
            <Box key={idx}>
              {idx > 0 && <Divider sx={{ my: 1.5 }} />}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, mb: 0.25 }}
                  >
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Qty: {item.quantity}
                  </Typography>
                </Box>
                <PriceDisplay price={item.price * item.quantity} size="small" />
              </Box>
            </Box>
          ))}

          <Divider sx={{ mt: 2.5, mb: 2 }} />

          {/* Shipping address */}
          <Box
            sx={{
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(0,0,0,0.02)',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'text.secondary',
                display: 'block',
                mb: 1,
              }}
            >
              Delivered to
            </Typography>
            <Typography variant="body2">
              {order.shippingAddress.street},{' '}
              {order.shippingAddress.city},{' '}
              {order.shippingAddress.state}{' '}
              {order.shippingAddress.zipCode},{' '}
              {order.shippingAddress.country}
            </Typography>
          </Box>

          {/* Order total */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Order Total
            </Typography>
            <PriceDisplay price={order.total}  />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(({ data }) => setOrders((data.data as any).orders ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <PageWrapper>
      <Typography
        variant="h4"
        sx={{ mb: 5, letterSpacing: '-0.02em', fontWeight: 700 }}
      >
        Order History
      </Typography>

      {orders.length === 0 ? (
        <EmptyState
          icon={<ReceiptRoundedIcon sx={{ fontSize: 56 }} />}
          title="No orders yet"
          description="When you place an order, it will appear here so you can track its progress."
          action={
            <Button
              component={Link}
              href="/products"
              variant="contained"
              sx={{ borderRadius: 2 }}
            >
              Start Shopping
            </Button>
          }
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <OrderRow key={order._id} order={order} />
          ))}
        </Box>
      )}
    </PageWrapper>
  );
}
