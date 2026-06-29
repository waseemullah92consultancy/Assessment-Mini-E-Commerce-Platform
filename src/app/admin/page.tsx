'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import PendingRoundedIcon from '@mui/icons-material/PendingRounded';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

import { getAdminAnalytics, adminGetProducts } from '../../lib/api';
import type { Analytics } from '../../lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending: '#FF9800',
  processing: '#2196F3',
  shipped: '#9C27B0',
  delivered: '#00C896',
  cancelled: '#FF4757',
};

function StatCard({
  label,
  value,
  sub,
  Icon,
  color,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  Icon: React.ElementType;
  color: string;
  loading: boolean;
}) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
            flexShrink: 0,
          }}
        >
          <Icon />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 0.5, fontSize: '0.8rem' }}
          >
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" sx={{ fontSize: '1.6rem', width: '60%' }} />
          ) : (
            <Typography
              sx={{
                fontSize: '1.6rem',
                fontWeight: 800,
                lineHeight: 1.1,
                fontFamily: 'var(--font-syne), Syne, sans-serif',
              }}
            >
              {value}
            </Typography>
          )}
          {sub && (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ fontSize: '0.72rem' }}
            >
              {sub}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
}

function formatCurrency(n: number) {
  if (n >= 1_000_000) return `PKR ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `PKR ${(n / 1_000).toFixed(0)}k`;
  return `PKR ${n.toFixed(0)}`;
}

function formatDate(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeProductsCount, setActiveProductsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminAnalytics(),
      adminGetProducts({ limit: 1 }),
    ])
      .then(([analyticsRes, productsRes]) => {
        setAnalytics(analyticsRes.data.data);
        setActiveProductsCount(productsRes.data.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pieData = analytics
    ? Object.entries(analytics.ordersByStatus)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const chartData = (analytics?.revenueByDay ?? []).map((d) => ({
    ...d,
    dateLabel: formatDate(d.date),
  }));

  return (
    <Box>
      {/* ── Stat cards ──────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 4,
        }}
      >
        <StatCard
          label="Total Revenue"
          value={analytics ? formatCurrency(analytics.totalRevenue) : '—'}
          sub="Delivered orders"
          Icon={AttachMoneyRoundedIcon}
          color="#00C896"
          loading={loading}
        />
        <StatCard
          label="Total Orders"
          value={analytics ? analytics.totalOrders.toLocaleString() : '—'}
          sub="All statuses"
          Icon={ShoppingCartRoundedIcon}
          color="#6C63FF"
          loading={loading}
        />
        <StatCard
          label="Active Products"
          value={
            activeProductsCount !== null
              ? activeProductsCount.toLocaleString()
              : '—'
          }
          sub="In catalogue"
          Icon={InventoryRoundedIcon}
          color="#FF9800"
          loading={loading}
        />
        <StatCard
          label="Pending Orders"
          value={
            analytics
              ? (analytics.ordersByStatus['pending'] ?? 0).toLocaleString()
              : '—'
          }
          sub="Awaiting processing"
          Icon={PendingRoundedIcon}
          color="#FF6B6B"
          loading={loading}
        />
      </Box>

      {/* ── Charts row ──────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 2.5,
          mb: 4,
        }}
      >
        {/* Revenue line chart */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
            Revenue — Last 30 Days
          </Typography>
          {loading ? (
            <Skeleton variant="rectangular" height={260} sx={{ borderRadius: 2 }} />
          ) : chartData.length === 0 ? (
            <Box
              sx={{
                height: 260,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.disabled">
                No revenue data yet
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={chartData}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(128,128,128,0.15)"
                />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                  }
                />
                <ReTooltip
                  formatter={(value) => [
                    `PKR ${Number(value).toLocaleString()}`,
                    'Revenue',
                  ]}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid rgba(108,99,255,0.3)',
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6C63FF"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#6C63FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Paper>

        {/* Orders by status donut */}
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            Orders by Status
          </Typography>
          {loading ? (
            <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
          ) : pieData.length === 0 ? (
            <Box
              sx={{
                height: 220,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.disabled">
                No orders yet
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={62}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={STATUS_COLORS[entry.name] ?? '#999'}
                    />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: 12, textTransform: 'capitalize' }}>
                      {value}
                    </span>
                  )}
                />
                <ReTooltip
                  formatter={(value, name) => [
                    value,
                    String(name).charAt(0).toUpperCase() + String(name).slice(1),
                  ]}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>

      {/* ── Top products table ───────────────────────────────────── */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Top 5 Products by Sales
          </Typography>
        </Box>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, py: 1.5, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Rank
                </TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Product
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, py: 1.5, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Units Sold
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, py: 1.5, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Revenue
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))
                : (analytics?.topProducts ?? []).map((p, i) => (
                    <TableRow
                      key={p.productId}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        '&:last-child td': { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            bgcolor:
                              i === 0
                                ? '#FFD700'
                                : i === 1
                                ? '#C0C0C0'
                                : i === 2
                                ? '#CD7F32'
                                : 'action.selected',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: i < 3 ? '#000' : 'text.primary',
                          }}
                        >
                          {i + 1}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{p.name}</TableCell>
                      <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {p.totalSold.toLocaleString()}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontVariantNumeric: 'tabular-nums', color: '#6C63FF', fontWeight: 600 }}
                      >
                        PKR {p.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  );
}
