'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { keyframes } from '@emotion/react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WbSunnyRoundedIcon from '@mui/icons-material/WbSunnyRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useThemeMode } from '../../providers/ThemeProvider';

const badgePulse = keyframes`
  0%   { transform: scale(1) translate(50%, -50%); }
  40%  { transform: scale(1.45) translate(30%, -65%); }
  100% { transform: scale(1) translate(50%, -50%); }
`;

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Categories', href: '/categories' },
];

export interface NavbarUser {
  name: string;
  email: string;
  avatar?: string;
}

export interface NavbarProps {
  cartItemCount?: number;
  user?: NavbarUser | null;
  onLogout?: () => void;
  onSearchOpen?: () => void;
}

export function Navbar({
  cartItemCount = 0,
  user = null,
  onLogout,
  onSearchOpen,
}: NavbarProps) {
  const { mode, toggleMode } = useThemeMode();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [pulsing, setPulsing] = useState(false);
  const prevCount = useRef(cartItemCount);

  // Detect scroll for glass effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Pulse badge on cart count increase
  useEffect(() => {
    if (cartItemCount > prevCount.current) {
      setPulsing(true);
      const id = setTimeout(() => setPulsing(false), 550);
      prevCount.current = cartItemCount;
      return () => clearTimeout(id);
    }
    prevCount.current = cartItemCount;
  }, [cartItemCount]);

  const handleUserMenuOpen = (e: React.MouseEvent<HTMLElement>) =>
    setUserMenuAnchor(e.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  const handleLogout = () => {
    handleUserMenuClose();
    onLogout?.();
  };

  const dark = mode === 'dark';
  const glassBackground = scrolled
    ? dark
      ? 'rgba(10,10,11,0.82)'
      : 'rgba(250,250,250,0.82)'
    : 'transparent';

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          top: 0,
          backgroundColor: glassBackground,
          backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
          boxShadow: scrolled
            ? dark
              ? '0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.4)'
              : '0 1px 0 rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.08)'
            : 'none',
          borderBottom: `1px solid ${scrolled ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)') : 'transparent'}`,
          transition: 'background-color 200ms ease, box-shadow 200ms ease, backdrop-filter 200ms ease',
          zIndex: 1100,
        }}
      >
        <Toolbar
          sx={{
            maxWidth: 1280,
            width: '100%',
            mx: 'auto',
            px: { xs: 2, md: 3 },
            height: { xs: 60, md: 68 },
            gap: 1,
          }}
        >
          {/* Logo */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              mr: { xs: 0, md: 4 },
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'var(--font-syne), Syne, sans-serif',
                fontWeight: 800,
                fontSize: '1.35rem',
                letterSpacing: '-0.02em',
                color: dark ? '#FFFFFF' : '#0A0A0B',
                lineHeight: 1,
              }}
            >
              NOIR
            </Typography>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#6C63FF',
                ml: '3px',
                mt: '-8px',
                flexShrink: 0,
              }}
            />
          </Box>

          {/* Desktop nav links */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 0.5,
              flex: 1,
            }}
          >
            {NAV_LINKS.map((link) => (
              <Button
                key={link.href}
                component={Link}
                href={link.href}
                sx={{
                  color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.7)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  minWidth: 0,
                  '&:hover': {
                    color: '#6C63FF',
                    backgroundColor: 'rgba(108,99,255,0.08)',
                  },
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flex: { xs: 1, md: 'none' } }} />

          {/* Right actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="Search">
              <IconButton
                onClick={onSearchOpen}
                size="small"
                sx={{ color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.65)' }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Theme toggle with rotation animation */}
            <Tooltip title={dark ? 'Light mode' : 'Dark mode'}>
              <IconButton
                onClick={toggleMode}
                size="small"
                sx={{
                  color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.65)',
                  transition: 'transform 400ms ease, color 200ms ease',
                  transform: dark ? 'rotate(0deg)' : 'rotate(180deg)',
                  '&:hover': { color: '#6C63FF' },
                }}
              >
                {dark ? (
                  <WbSunnyRoundedIcon fontSize="small" />
                ) : (
                  <DarkModeRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            {/* Cart icon with pulsing badge */}
            <Tooltip title="Cart">
              <IconButton
                component={Link}
                href="/cart"
                size="small"
                sx={{ color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.65)' }}
              >
                <Badge
                  badgeContent={cartItemCount}
                  color="primary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.65rem',
                      minWidth: 17,
                      height: 17,
                      padding: '0 4px',
                      background: 'linear-gradient(135deg, #6C63FF 0%, #8B85FF 100%)',
                      animation: pulsing
                        ? `${badgePulse} 0.5s cubic-bezier(0.36,0.07,0.19,0.97)`
                        : 'none',
                    },
                  }}
                >
                  <ShoppingCartIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* User area */}
            {user ? (
              <>
                <Tooltip title={user.name}>
                  <IconButton
                    onClick={handleUserMenuOpen}
                    size="small"
                    sx={{ ml: 0.5 }}
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: '0.8rem',
                        bgcolor: '#6C63FF',
                        fontFamily: 'var(--font-syne), Syne, sans-serif',
                        fontWeight: 700,
                      }}
                    >
                      {user.name[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        minWidth: 200,
                        backgroundImage: 'none',
                        border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem
                    component={Link}
                    href="/profile"
                    onClick={handleUserMenuClose}
                    sx={{ gap: 1.5, py: 1.25 }}
                  >
                    <PersonOutlineRoundedIcon fontSize="small" sx={{ opacity: 0.7 }} />
                    <Typography variant="body2">Profile</Typography>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    href="/orders"
                    onClick={handleUserMenuClose}
                    sx={{ gap: 1.5, py: 1.25 }}
                  >
                    <ReceiptLongRoundedIcon fontSize="small" sx={{ opacity: 0.7 }} />
                    <Typography variant="body2">Orders</Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    sx={{ gap: 1.5, py: 1.25, color: '#FF4757' }}
                  >
                    <LogoutRoundedIcon fontSize="small" />
                    <Typography variant="body2">Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box
                sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, ml: 1 }}
              >
                <Button
                  component={Link}
                  href="/auth/login"
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2, px: 2 }}
                >
                  Log in
                </Button>
                <Button
                  component={Link}
                  href="/auth/register"
                  variant="contained"
                  size="small"
                  sx={{ borderRadius: 2, px: 2 }}
                >
                  Sign up
                </Button>
              </Box>
            )}

            {/* Mobile hamburger */}
            <IconButton
              onClick={() => setDrawerOpen(true)}
              size="small"
              sx={{
                display: { xs: 'flex', md: 'none' },
                ml: 0.5,
                color: dark ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.65)',
              }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{ paper: { sx: { width: 280 } } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1.2rem',
              letterSpacing: '-0.02em',
            }}
          >
            NOIR
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                backgroundColor: '#6C63FF',
                ml: '3px',
                mb: '6px',
              }}
            />
          </Typography>
          <IconButton onClick={() => setDrawerOpen(false)} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider />

        <List sx={{ pt: 1 }}>
          {NAV_LINKS.map((link) => (
            <ListItem key={link.href} disablePadding>
              <ListItemButton
                component={Link}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                sx={{ px: 2.5, py: 1.25, borderRadius: 2, mx: 1, mb: 0.5 }}
              >
                <ListItemText
                  primary={link.label}
                  slotProps={{
                    primary: {
                      sx: {
                        fontFamily: 'var(--font-syne), Syne, sans-serif',
                        fontWeight: 600,
                        fontSize: '1rem',
                      },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {!user && (
          <Box sx={{ px: 2.5, mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              component={Link}
              href="/auth/login"
              variant="outlined"
              fullWidth
              onClick={() => setDrawerOpen(false)}
            >
              Log in
            </Button>
            <Button
              component={Link}
              href="/auth/register"
              variant="contained"
              fullWidth
              onClick={() => setDrawerOpen(false)}
            >
              Sign up
            </Button>
          </Box>
        )}
      </Drawer>
    </>
  );
}
