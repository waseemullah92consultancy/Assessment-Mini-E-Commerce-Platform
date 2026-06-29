import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';

const ACCENT = '#6C63FF';
const ACCENT_LIGHT = '#8B85FF';
const ACCENT_DARK = '#5A52E0';
const CORAL = '#FF6B6B';
const SUCCESS = '#00C896';
const ERR = '#FF4757';

// 25-element custom shadows: 1=subtle, 8=medium, 16=large
const buildShadows = (dark: boolean): Shadows => {
  const a = dark ? 0.6 : 0.18;
  const subtle = `0 1px 4px rgba(0,0,0,${a * 0.45}), 0 1px 2px rgba(0,0,0,${a * 0.3})`;
  const medium = `0 4px 16px rgba(0,0,0,${a * 0.65}), 0 2px 6px rgba(0,0,0,${a * 0.4})`;
  const large = `0 12px 36px rgba(0,0,0,${a * 0.8}), 0 4px 12px rgba(0,0,0,${a * 0.5})`;
  return [
    'none', subtle, subtle, medium, medium, medium, medium, medium, medium,
    large, large, large, large, large, large, large, large, large,
    large, large, large, large, large, large, large,
  ] as Shadows;
};

export function createNoirTheme(mode: 'light' | 'dark') {
  const dark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: ACCENT, light: ACCENT_LIGHT, dark: ACCENT_DARK },
      secondary: { main: CORAL },
      success: { main: SUCCESS },
      error: { main: ERR },
      background: dark
        ? { default: '#0A0A0B', paper: '#1A1A1D' }
        : { default: '#FAFAFA', paper: '#FFFFFF' },
      text: dark
        ? { primary: '#FFFFFF', secondary: 'rgba(255,255,255,0.58)' }
        : { primary: '#0A0A0B', secondary: 'rgba(0,0,0,0.58)' },
      divider: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    },

    typography: {
      fontFamily:
        'var(--font-inter), Inter, system-ui, -apple-system, sans-serif',
      h1: { fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 800 },
      h2: { fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 700 },
      h3: { fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 700 },
      h4: { fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600 },
      h5: { fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600 },
      h6: { fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
      overline: { letterSpacing: '0.1em' },
    },

    shape: { borderRadius: 12 },

    shadows: buildShadows(dark),

    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 22px',
            fontSize: '0.9rem',
            transition: 'all 200ms ease',
            '&:active': { transform: 'scale(0.97)' },
          },
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_LIGHT} 100%)`,
              boxShadow: `0 4px 20px ${ACCENT}40`,
              '&:hover': {
                background: `linear-gradient(135deg, ${ACCENT_DARK} 0%, ${ACCENT} 100%)`,
                boxShadow: `0 6px 28px ${ACCENT}60`,
              },
            },
          },
          {
            props: { variant: 'outlined', color: 'primary' },
            style: {
              borderColor: ACCENT,
              color: ACCENT,
              '&:hover': {
                backgroundColor: `${ACCENT}14`,
                borderColor: ACCENT_LIGHT,
              },
            },
          },
        ],
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            boxShadow: 'none',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: 12,
            transition: 'all 200ms ease',
            backgroundImage: 'none',
          },
        },
      },

      MuiCardContent: {
        styleOverrides: {
          root: { '&:last-child': { paddingBottom: 16 } },
        },
      },

      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
              transition: 'box-shadow 200ms ease',
              '&.Mui-focused': {
                boxShadow: `0 0 0 3px ${ACCENT}28`,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: ACCENT,
                borderWidth: 2,
              },
              '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
                borderColor: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              },
            },
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 500, fontSize: '0.73rem' },
        },
      },

      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            backgroundColor: dark ? '#0A0A0B' : '#FFFFFF',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
            borderRadius: 16,
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          },
        },
      },

      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: {
          tooltip: { fontSize: '0.75rem' },
        },
      },

      MuiSkeleton: {
        defaultProps: { animation: 'wave' },
      },
    },
  });
}
