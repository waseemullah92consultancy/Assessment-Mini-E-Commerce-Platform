'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

interface Props {
  children: ReactNode;
  /** Optional custom fallback; overrides the default error UI */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <Box
        role="alert"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 360,
          gap: 2.5,
          p: 4,
          textAlign: 'center',
        }}
      >
        <ErrorOutlineRoundedIcon
          sx={{ fontSize: 64, color: '#FF4757', opacity: 0.85 }}
        />
        <Box>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontFamily: 'var(--font-syne), Syne, sans-serif', fontWeight: 700 }}
          >
            Something went wrong
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.7 }}
          >
            {this.state.error?.message?.slice(0, 200) ||
              'An unexpected error occurred. Refresh the page or try again.'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshRoundedIcon />}
          onClick={this.reset}
        >
          Try again
        </Button>
      </Box>
    );
  }
}
