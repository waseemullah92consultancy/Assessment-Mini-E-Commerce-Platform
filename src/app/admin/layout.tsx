'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import { useAuthStore } from '../../store/authStore';

const SIDEBAR_WIDTH = 260;
const TOPBAR_HEIGHT = 64;

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', Icon: DashboardRoundedIcon },
  { label: 'Products', href: '/admin/products', Icon: InventoryRoundedIcon },
  { label: 'Orders', href: '/admin/orders', Icon: ShoppingBagRoundedIcon },
];

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: (t) =>
          t.palette.mode === 'dark' ? '#141418' : '#FAFAFA',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 3, py: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          sx={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontWeight: 800,
            fontSize: '1.3rem',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          NOIR
        </Typography>
        <Box
          sx={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            bgcolor: '#6C63FF',
            mb: '7px',
            ml: '2px',
          }}
        />
        <Typography
          sx={{
            ml: 1,
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'text.disabled',
            alignSelf: 'flex-end',
            mb: '3px',
          }}
        >
          Admin
        </Typography>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flex: 1, pt: 1.5, px: 1.5 }}>
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const isActive =
            href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href);
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              onClick={onClose}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                transition: 'all 150ms ease',
                color: isActive ? '#6C63FF' : 'text.secondary',
                backgroundColor: isActive
                  ? 'rgba(108,99,255,0.1)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isActive
                    ? 'rgba(108,99,255,0.14)'
                    : (t) => t.palette.action.hover,
                  color: isActive ? '#6C63FF' : 'text.primary',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 700 : 500,
                    },
                  },
                }}
              />
              {isActive && (
                <Box
                  sx={{
                    width: 3,
                    height: 18,
                    borderRadius: 2,
                    bgcolor: '#6C63FF',
                    ml: 0.5,
                    flexShrink: 0,
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider />

      {/* Footer branding */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ fontSize: '0.7rem' }}
        >
          NOIR MARKET · Admin Panel
        </Typography>
      </Box>
    </Box>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Enforce admin-only access client-side (middleware is the primary guard)
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.replace('/');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const pageTitle =
    NAV_ITEMS.find((item) =>
      item.href === '/admin'
        ? pathname === '/admin'
        : pathname.startsWith(item.href),
    )?.label ?? 'Admin';

  const initials = (user?.name ?? 'A')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* ── Desktop persistent sidebar ─────────────────────────── */}
      <Box
        component="nav"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          display: { xs: 'none', lg: 'block' },
        }}
      >
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: SIDEBAR_WIDTH,
            height: '100vh',
            zIndex: 1200,
          }}
        >
          <SidebarContent pathname={pathname} />
        </Box>
      </Box>

      {/* ── Mobile temporary drawer ────────────────────────────── */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{ paper: { sx: { width: SIDEBAR_WIDTH } } }}
        sx={{ display: { lg: 'none' } }}
      >
        <SidebarContent
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
        />
      </Drawer>

      {/* ── Main content area ──────────────────────────────────── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <Box
          component="header"
          sx={{
            height: TOPBAR_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            px: { xs: 2, md: 3 },
            gap: 2,
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            zIndex: 1100,
          }}
        >
          {/* Mobile menu toggle */}
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ display: { lg: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>

          {/* Page title */}
          <Typography
            variant="h6"
            sx={{
              flex: 1,
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontWeight: 700,
              fontSize: '1.05rem',
            }}
          >
            {pageTitle}
          </Typography>

          {/* User info + logout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                fontSize: '0.8rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography
                sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}
              >
                {user?.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: '0.72rem' }}
              >
                Administrator
              </Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton onClick={handleLogout} size="small" sx={{ ml: 0.5 }}>
                <LogoutRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, md: 3 },
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
