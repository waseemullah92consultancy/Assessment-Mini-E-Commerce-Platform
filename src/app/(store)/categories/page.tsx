'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ElectricBoltRoundedIcon from '@mui/icons-material/ElectricBoltRounded';
import CheckroomRoundedIcon from '@mui/icons-material/CheckroomRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const CATEGORIES = [
  {
    label: 'Electronics',
    Icon: ElectricBoltRoundedIcon,
    color: '#6C63FF',
    q: 'Electronics',
    blurb: 'Audio, tablets, displays and the gadgets that power your day.',
  },
  {
    label: 'Clothing',
    Icon: CheckroomRoundedIcon,
    color: '#FF6B6B',
    q: 'Clothing',
    blurb: 'Everyday essentials and statement pieces, thoughtfully made.',
  },
  {
    label: 'Books',
    Icon: MenuBookRoundedIcon,
    color: '#00C896',
    q: 'Books',
    blurb: 'Engineering classics and the titles every shelf deserves.',
  },
  {
    label: 'Home',
    Icon: HomeRoundedIcon,
    color: '#FF9800',
    q: 'Home',
    blurb: 'Appliances and pieces that make a space feel like yours.',
  },
  {
    label: 'Sports',
    Icon: SportsSoccerRoundedIcon,
    color: '#2196F3',
    q: 'Sports',
    blurb: 'Gear for training, the field, and everything in between.',
  },
];

export default function CategoriesPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Header */}
      <Box sx={{ mb: { xs: 4, md: 5 } }}>
        <Typography
          sx={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontWeight: 800,
            fontSize: { xs: '2rem', md: '2.75rem' },
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            mb: 1,
          }}
        >
          Shop by Category
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
          Five curated departments. Pick a lane and explore everything inside it.
        </Typography>
      </Box>

      {/* Category grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}
      >
        {CATEGORIES.map(({ label, Icon, color, q, blurb }) => (
          <Box
            key={q}
            component={Link}
            href={`/products?category=${q}`}
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 3,
              p: 3,
              minHeight: 180,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.paper',
              transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: `${color}66`,
                boxShadow: `0 12px 32px ${color}22`,
              },
              '&:hover .cat-arrow': { transform: 'translateX(4px)', opacity: 1 },
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${color}18`,
                color,
                mb: 2,
              }}
            >
              <Icon />
            </Box>

            <Box>
              <Typography
                sx={{
                  fontFamily: 'var(--font-syne), Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  mb: 0.5,
                }}
              >
                {label}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                {blurb}
              </Typography>
            </Box>

            <ArrowForwardRoundedIcon
              className="cat-arrow"
              sx={{
                position: 'absolute',
                top: 28,
                right: 24,
                fontSize: 20,
                color,
                opacity: 0.5,
                transition: 'transform 180ms ease, opacity 180ms ease',
              }}
            />
          </Box>
        ))}
      </Box>
    </Container>
  );
}
