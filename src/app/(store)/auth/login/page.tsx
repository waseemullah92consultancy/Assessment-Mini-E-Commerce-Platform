'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import { loginUser } from '../../../../lib/api';
import { useAuthStore } from '../../../../store/authStore';

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

type FormData = yup.InferType<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      const res = await loginUser(data.email, data.password);
      const { accessToken, user } = res.data.data;
      login(accessToken, user);
      const redirect = searchParams.get('redirect') ?? '/';
      router.push(redirect);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ?? 'Login failed. Please try again.',
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, md: 4.5 },
          borderRadius: 4,
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3.5 }}>
          <Typography
            sx={{
              fontFamily: 'var(--font-syne), Syne, sans-serif',
              fontWeight: 800,
              fontSize: '1.4rem',
              letterSpacing: '-0.02em',
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
              bgcolor: '#6C63FF',
              ml: '3px',
              mb: '8px',
            }}
          />
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontFamily: 'var(--font-syne), Syne, sans-serif',
            fontWeight: 700,
            mb: 0.75,
          }}
        >
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
          Sign in to your NOIR MARKET account
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2.5 }}>
            {apiError}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Email address"
                type="email"
                fullWidth
                autoComplete="email"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Password"
                type={showPw ? 'text' : 'password'}
                fullWidth
                autoComplete="current-password"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPw((p) => !p)}
                          edge="end"
                          size="small"
                        >
                          {showPw ? (
                            <VisibilityOffRoundedIcon fontSize="small" />
                          ) : (
                            <VisibilityRoundedIcon fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
            sx={{ mt: 0.5, borderRadius: 2, py: 1.4 }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Box
            component={Link}
            href="/auth/register"
            sx={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none' }}
          >
            Create account
          </Box>
        </Typography>
      </Paper>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
