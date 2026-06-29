'use client';

import { forwardRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import Box from '@mui/material/Box';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /** 'danger' styles the confirm button red; 'default' uses primary */
  variant?: 'danger' | 'default';
}

export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  function ConfirmDialog(
    {
      open,
      onClose,
      onConfirm,
      title,
      description,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      loading = false,
      variant = 'default',
    },
    ref,
  ) {
    const isDanger = variant === 'danger';

    return (
      <Dialog
        open={open}
        onClose={loading ? undefined : onClose}
        maxWidth="xs"
        fullWidth
        ref={ref}
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? 'confirm-dialog-description' : undefined}
      >
        <DialogTitle id="confirm-dialog-title" sx={{ pb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            {isDanger && (
              <WarningAmberRoundedIcon
                sx={{ color: '#FF4757', fontSize: 26, mt: 0.25, flexShrink: 0 }}
              />
            )}
            <Typography
              variant="h6"
              sx={{ fontFamily: 'var(--font-syne), Syne, sans-serif', lineHeight: 1.3, fontWeight: 700 }}
            >
              {title}
            </Typography>
          </Box>
        </DialogTitle>

        {description && (
          <DialogContent sx={{ pt: 0 }}>
            <Typography
              id="confirm-dialog-description"
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.7 }}
            >
              {description}
            </Typography>
          </DialogContent>
        )}

        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{ flex: 1, borderRadius: 2 }}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={loading}
            startIcon={
              loading ? <CircularProgress size={14} color="inherit" /> : undefined
            }
            sx={{
              flex: 1,
              borderRadius: 2,
              ...(isDanger && {
                background: 'linear-gradient(135deg, #FF4757 0%, #FF6B6B 100%)',
                boxShadow: '0 4px 16px rgba(255,71,87,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #E03545 0%, #FF4757 100%)',
                  boxShadow: '0 6px 24px rgba(255,71,87,0.5)',
                },
              }),
            }}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    );
  },
);
