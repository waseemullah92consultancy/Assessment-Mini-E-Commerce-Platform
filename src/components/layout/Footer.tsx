import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from 'next/link';

const FOOTER_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
  { label: 'About', href: '/about' },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0A0A0B',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        mt: 'auto',
      }}
    >
      <Box
        sx={{
          maxWidth: 1280,
          mx: 'auto',
          px: { xs: 2, md: 3 },
          py: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1.15rem',
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
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
              backgroundColor: '#6C63FF',
              ml: '3px',
              mt: '-7px',
            }}
          />
        </Box>

        {/* Links */}
        <Box
          component="nav"
          sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 2, sm: 3 } }}
        >
          {FOOTER_LINKS.map((link) => (
            <Typography
              key={link.href}
              component={Link}
              href={link.href}
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.45)',
                textDecoration: 'none',
                fontSize: '0.8rem',
                transition: 'color 200ms ease',
                '&:hover': { color: 'rgba(255,255,255,0.85)' },
              }}
            >
              {link.label}
            </Typography>
          ))}
        </Box>

        {/* Copyright */}
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}
        >
          © {year} NOIR MARKET
        </Typography>
      </Box>
    </Box>
  );
}
