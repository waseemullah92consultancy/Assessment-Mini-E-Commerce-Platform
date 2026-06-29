import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface LoadingSpinnerProps {
  label?: string;
  fullPage?: boolean;
  size?: number;
}

export function LoadingSpinner({
  label,
  fullPage = false,
  size = 40,
}: LoadingSpinnerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minHeight: fullPage ? '60vh' : 160,
        width: '100%',
      }}
    >
      <CircularProgress
        size={size}
        thickness={3}
        sx={{
          color: '#6C63FF',
          '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
        }}
      />
      {label && (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      )}
    </Box>
  );
}
