'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { adminGetOrders, adminUpdateOrderStatus } from '../../../lib/api';
import type { AdminOrder, OrderStatus } from '../../../lib/api';
import { StatusChip } from '../../../components/ui/StatusChip';

// ── State-machine valid transitions ──────────────────────────────────────────

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const STATUS_TABS: Array<{ label: string; value: string }> = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function customerName(order: AdminOrder) {
  if (typeof order.userId === 'object') return order.userId.name ?? '—';
  return '—';
}

function customerEmail(order: AdminOrder) {
  if (typeof order.userId === 'object') return order.userId.email ?? '';
  return '';
}

function shortId(id: string) {
  return `…${id.slice(-8)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ── Order Detail Drawer ───────────────────────────────────────────────────────

function OrderDrawer({
  order,
  onClose,
  onStatusUpdated,
}: {
  order: AdminOrder | null;
  onClose: () => void;
  onStatusUpdated: (updated: AdminOrder) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setSelectedStatus('');
      setError('');
    }
  }, [order?._id]);

  if (!order) return null;

  const validNextStatuses = NEXT_STATUSES[order.status] ?? [];

  const handleUpdate = async () => {
    if (!selectedStatus) return;
    setSaving(true);
    setError('');
    try {
      const res = await adminUpdateOrderStatus(order._id, selectedStatus);
      onStatusUpdated({ ...order, status: res.data.data.status });
      onClose();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(
          err?.response?.data?.message ?? 'Failed to update status.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={!!order}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 440 },
            p: 0,
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 3,
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Typography sx={{ flex: 1, fontWeight: 700, fontSize: '1rem' }}>
          Order{' '}
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: '0.9rem' }}>
            {shortId(order._id)}
          </Box>
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2.5 }}>
        {/* Status */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="overline"
            color="text.disabled"
            sx={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}
          >
            Current Status
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <StatusChip status={order.status} />
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {/* Customer */}
        <Typography
          variant="overline"
          color="text.disabled"
          sx={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}
        >
          Customer
        </Typography>
        <Typography sx={{ fontWeight: 600, mt: 0.5 }}>{customerName(order)}</Typography>
        <Typography variant="body2" color="text.secondary">
          {customerEmail(order)}
        </Typography>

        <Divider sx={{ my: 2.5 }} />

        {/* Shipping address */}
        <Typography
          variant="overline"
          color="text.disabled"
          sx={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}
        >
          Shipping Address
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {order.shippingAddress?.street}
          <br />
          {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
          {order.shippingAddress?.zipCode}
          <br />
          {order.shippingAddress?.country}
        </Typography>

        <Divider sx={{ my: 2.5 }} />

        {/* Items */}
        <Typography
          variant="overline"
          color="text.disabled"
          sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', display: 'block', mb: 1 }}
        >
          Items ({order.items.length})
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {order.items.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'action.hover',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Qty: {item.quantity} · PKR {item.price.toLocaleString()} each
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}
              >
                PKR {(item.price * item.quantity).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Order total */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            px: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Order Total
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#6C63FF' }}>
            PKR {order.total.toLocaleString()}
          </Typography>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* Status update */}
        <Typography
          variant="overline"
          color="text.disabled"
          sx={{ fontSize: '0.7rem', letterSpacing: '0.1em', display: 'block', mb: 1.5 }}
        >
          Update Status
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {validNextStatuses.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No further status transitions available.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>New Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                label="New Status"
              >
                {validNextStatuses.map((s) => (
                  <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="contained"
              disabled={!selectedStatus || saving}
              onClick={handleUpdate}
              sx={{
                background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5A52E0, #7B75EF)',
                },
                '&.Mui-disabled': { opacity: 0.5 },
                flexShrink: 0,
                height: 40,
              }}
            >
              {saving ? 'Updating…' : 'Update'}
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}

// ── Access Denied ─────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 360,
        gap: 2,
        color: 'text.secondary',
      }}
    >
      <LockOutlinedIcon sx={{ fontSize: 56, color: 'error.main', opacity: 0.7 }} />
      <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
        Access Denied
      </Typography>
      <Typography variant="body2">
        You do not have permission to view this page.
      </Typography>
    </Box>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const fetchOrders = (
    statusVal = activeTab,
    pageVal = page,
    limitVal = rowsPerPage,
  ) => {
    setLoading(true);
    adminGetOrders({
      status: statusVal || undefined,
      page: pageVal + 1,
      limit: limitVal,
    })
      .then(({ data }) => {
        setOrders(data.data.orders);
        setTotal(data.data.total);
      })
      .catch((err) => {
        if (err?.response?.status === 403) setAccessDenied(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (accessDenied) return <AccessDenied />;

  const handleTabChange = (_: React.SyntheticEvent, val: string) => {
    setActiveTab(val);
    setPage(0);
    fetchOrders(val, 0, rowsPerPage);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
    fetchOrders(activeTab, newPage, rowsPerPage);
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limit = parseInt(e.target.value, 10);
    setRowsPerPage(limit);
    setPage(0);
    fetchOrders(activeTab, 0, limit);
  };

  const handleStatusUpdated = (updated: AdminOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updated._id ? updated : o)),
    );
    setSelectedOrder(updated);
  };

  return (
    <Box>
      {/* ── Status filter tabs ──────────────────────────────────────── */}
      <Paper
        sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}
        elevation={0}
        variant="outlined"
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
              minHeight: 48,
            },
            '& .Mui-selected': { color: '#6C63FF !important' },
            '& .MuiTabs-indicator': { bgcolor: '#6C63FF' },
          }}
        >
          {STATUS_TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Paper>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Order ID
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Date
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton width={100} /></TableCell>
                      <TableCell>
                        <Skeleton width={120} />
                        <Skeleton width={160} />
                      </TableCell>
                      <TableCell><Skeleton width={80} /></TableCell>
                      <TableCell align="right"><Skeleton width={70} /></TableCell>
                      <TableCell align="center"><Skeleton width={80} sx={{ mx: 'auto' }} /></TableCell>
                      <TableCell align="right"><Skeleton width={70} sx={{ ml: 'auto' }} /></TableCell>
                    </TableRow>
                  ))
                : orders.map((order) => (
                    <TableRow
                      key={order._id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:last-child td': { border: 0 },
                      }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 500,
                            color: 'text.secondary',
                          }}
                        >
                          {shortId(order._id)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                          {customerName(order)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {customerEmail(order)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(order.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}
                        >
                          PKR {order.total.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <StatusChip status={order.status} />
                      </TableCell>

                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedOrder(order)}
                          sx={{
                            fontSize: '0.75rem',
                            borderColor: 'rgba(108,99,255,0.4)',
                            color: '#6C63FF',
                            '&:hover': {
                              borderColor: '#6C63FF',
                              bgcolor: 'rgba(108,99,255,0.06)',
                            },
                          }}
                        >
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </Box>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsChange}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      {/* ── Order detail drawer ─────────────────────────────────────── */}
      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdated={handleStatusUpdated}
      />
    </Box>
  );
}
