'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import { useAuthStore } from '../../../store/authStore';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Middleware guards this route; this is a fallback for the brief hydration gap.
  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography color="text.secondary">Loading your profile…</Typography>
      </Container>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
    router.refresh();
  };

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Typography
        sx={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontWeight: 800,
          fontSize: { xs: '1.75rem', md: '2.25rem' },
          letterSpacing: '-0.02em',
          mb: 3,
        }}
      >
        My Account
      </Typography>

      {/* Identity card */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              fontSize: '1.4rem',
              fontWeight: 700,
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.2 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              {user.email}
            </Typography>
            <Chip
              label={user.role === 'admin' ? 'Administrator' : 'Customer'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                bgcolor: 'rgba(108,99,255,0.12)',
                color: '#6C63FF',
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        <InfoRow label="Name" value={user.name} />
        <Divider />
        <InfoRow label="Email" value={user.email} />
        <Divider />
        <InfoRow label="Account type" value={user.role === 'admin' ? 'Administrator' : 'Customer'} />
      </Paper>

      {/* Quick actions */}
      <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Button
          component={Link}
          href="/orders"
          fullWidth
          startIcon={<ReceiptLongRoundedIcon />}
          sx={{ justifyContent: 'flex-start', py: 1.5, px: 2, color: 'text.primary' }}
        >
          My Orders
        </Button>
        <Divider />
        <Button
          component={Link}
          href="/products"
          fullWidth
          startIcon={<ShoppingBagRoundedIcon />}
          sx={{ justifyContent: 'flex-start', py: 1.5, px: 2, color: 'text.primary' }}
        >
          Continue Shopping
        </Button>
        {user.role === 'admin' && (
          <>
            <Divider />
            <Button
              component={Link}
              href="/admin"
              fullWidth
              startIcon={<DashboardRoundedIcon />}
              sx={{ justifyContent: 'flex-start', py: 1.5, px: 2, color: '#6C63FF' }}
            >
              Admin Dashboard
            </Button>
          </>
        )}
      </Paper>

      <Button
        onClick={handleLogout}
        variant="outlined"
        color="error"
        fullWidth
        startIcon={<LogoutRoundedIcon />}
        sx={{ py: 1.25, borderRadius: 2 }}
      >
        Sign Out
      </Button>
    </Container>
  );
}
