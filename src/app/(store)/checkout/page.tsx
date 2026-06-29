'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

import { getCart, createOrder } from '../../../lib/api';
import { useCartStore } from '../../../store/cartStore';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { PriceDisplay } from '../../../components/ui/PriceDisplay';
import { LoadingSpinner } from '../../../components/layout/LoadingSpinner';

const FREE_SHIPPING_THRESHOLD = 5000;
const SHIPPING_COST = 500;

const STEPS = ['Shipping', 'Payment', 'Confirmation'];

// ── Schemas ──────────────────────────────────────────────────────────────────

const shippingSchema = yup.object({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  address: yup.string().required('Address is required'),
  city: yup.string().required('City is required'),
  state: yup.string().required('State / Province is required'),
  postalCode: yup.string().required('Postal code is required'),
  country: yup.string().required('Country is required'),
});

const paymentSchema = yup.object({
  cardholderName: yup.string().required('Cardholder name is required'),
  cardNumber: yup
    .string()
    .matches(/^\d{16}$/, 'Enter a valid 16-digit card number')
    .required('Card number is required'),
  expiry: yup
    .string()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Format: MM/YY')
    .required('Expiry date is required'),
  cvv: yup
    .string()
    .matches(/^\d{3,4}$/, 'Enter 3 or 4 digit CVV')
    .required('CVV is required'),
});

type ShippingData = yup.InferType<typeof shippingSchema>;
type PaymentData = yup.InferType<typeof paymentSchema>;

// ── Shipping form ─────────────────────────────────────────────────────────────

function ShippingStep({
  onNext,
}: {
  onNext: (data: ShippingData) => void;
}) {
  const { control, handleSubmit } = useForm<ShippingData>({
    resolver: yupResolver(shippingSchema),
    defaultValues: {
      name: '',
      email: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onNext)}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2.5 }}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Full name"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Email address"
              type="email"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box>

      <Controller
        name="address"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Street address"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2.5 }}>
        <Controller
          name="city"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="City"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="state"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="State / Province"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { sm: '1fr 1fr' }, gap: 2.5 }}>
        <Controller
          name="postalCode"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Postal code"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="country"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Country"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        size="large"
        sx={{ mt: 1, borderRadius: 2, alignSelf: 'flex-end', px: 4 }}
      >
        Continue to Payment
      </Button>
    </Box>
  );
}

// ── Payment form ──────────────────────────────────────────────────────────────

function PaymentStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: (data: PaymentData) => Promise<void>;
}) {
  const [apiError, setApiError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<PaymentData>({
    resolver: yupResolver(paymentSchema),
    defaultValues: { cardholderName: '', cardNumber: '', expiry: '', cvv: '' },
  });

  const onSubmit = async (data: PaymentData) => {
    setApiError('');
    try {
      await onNext(data);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ?? 'Order failed. Please try again.',
      );
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      <Alert severity="info" icon={<LockRoundedIcon />} sx={{ mb: 0.5 }}>
        This is a demo checkout. Use any 16-digit card number.
      </Alert>

      {apiError && <Alert severity="error">{apiError}</Alert>}

      <Controller
        name="cardholderName"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Cardholder name"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        name="cardNumber"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Card number"
            placeholder="1234567890123456"
            fullWidth
            inputMode="numeric"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            onChange={(e) =>
              field.onChange(e.target.value.replace(/\D/g, '').slice(0, 16))
            }
          />
        )}
      />

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
        <Controller
          name="expiry"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Expiry (MM/YY)"
              placeholder="12/28"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              onChange={(e) => {
                let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
                field.onChange(v);
              }}
            />
          )}
        />
        <Controller
          name="cvv"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="CVV"
              placeholder="123"
              fullWidth
              inputMode="numeric"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              onChange={(e) =>
                field.onChange(e.target.value.replace(/\D/g, '').slice(0, 4))
              }
            />
          )}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 1 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={onBack}
          disabled={isSubmitting}
          sx={{ borderRadius: 2 }}
        >
          Back
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <LockRoundedIcon />
            )
          }
          sx={{ borderRadius: 2, px: 4 }}
        >
          {isSubmitting ? 'Placing order…' : 'Place Order'}
        </Button>
      </Box>
    </Box>
  );
}

// ── Confirmation ──────────────────────────────────────────────────────────────

function ConfirmationStep({ orderId }: { orderId: string }) {
  const shortId = orderId.slice(-8).toUpperCase();

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          bgcolor: 'rgba(0,200,150,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 3,
        }}
      >
        <CheckCircleRoundedIcon sx={{ fontSize: 48, color: '#00C896' }} />
      </Box>

      <Typography
        variant="h4"
        sx={{
          fontFamily: 'var(--font-syne), Syne, sans-serif',
          fontWeight: 800,
          mb: 1.5,
          letterSpacing: '-0.02em',
        }}
      >
        Order Confirmed!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 0.75 }}>
        Your order #{shortId} has been placed successfully.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 5 }}>
        You&apos;ll receive a confirmation once it&apos;s shipped.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          component={Link}
          href="/orders"
          variant="contained"
          startIcon={<ShoppingBagRoundedIcon />}
          sx={{ borderRadius: 2 }}
        >
          View my orders
        </Button>
        <Button
          component={Link}
          href="/products"
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Continue Shopping
        </Button>
      </Box>
    </Box>
  );
}

// ── Order summary sidebar ─────────────────────────────────────────────────────

function OrderSummary() {
  const { items, total } = useCartStore();
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
        Order Summary
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
        {items.map((item) => (
          <Box
            key={item.itemId}
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {item.name}{' '}
              <Box component="span" sx={{ color: 'text.disabled' }}>
                ×{item.quantity}
              </Box>
            </Typography>
            <PriceDisplay price={item.price * item.quantity} size="small" />
          </Box>
        ))}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>
          <PriceDisplay price={total} size="small" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Shipping
          </Typography>
          {shipping === 0 ? (
            <Typography variant="body2" sx={{ color: '#00C896', fontWeight: 600 }}>
              Free
            </Typography>
          ) : (
            <PriceDisplay price={shipping} size="small" />
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          Total
        </Typography>
        <PriceDisplay price={total + shipping} size="large" />
      </Box>
    </Paper>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, setCart, clearCart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    getCart()
      .then(({ data }) => {
        setCart(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [setCart]);

  useEffect(() => {
    if (!loading && items.length === 0 && activeStep < 2) {
      router.replace('/cart');
    }
  }, [loading, items.length, activeStep, router]);

  const handleShippingNext = (data: ShippingData) => {
    setShippingData(data);
    setActiveStep(1);
  };

  const handlePaymentNext = async (_data: PaymentData) => {
    if (!shippingData) return;
    const { data } = await createOrder({
      street: shippingData.address,
      city: shippingData.city,
      state: shippingData.state,
      zipCode: shippingData.postalCode,
      country: shippingData.country,
    });
    setOrderId(data.data._id);
    clearCart();
    setActiveStep(2);
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <PageWrapper>
      <Typography
        variant="h4"
        sx={{ mb: 5, letterSpacing: '-0.02em', fontWeight: 700 }}
      >
        Checkout
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
          gap: 4,
          alignItems: 'flex-start',
        }}
      >
        {/* ── Main checkout form ──────────────────────────────────── */}
        <Box>
          <Stepper
            activeStep={activeStep}
            sx={{ mb: 5 }}
            alternativeLabel={false}
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Paper sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
            {activeStep === 0 && (
              <ShippingStep onNext={handleShippingNext} />
            )}
            {activeStep === 1 && (
              <PaymentStep
                onBack={() => setActiveStep(0)}
                onNext={handlePaymentNext}
              />
            )}
            {activeStep === 2 && (
              <ConfirmationStep orderId={orderId} />
            )}
          </Paper>
        </Box>

        {/* ── Order summary sidebar ────────────────────────────────── */}
        {activeStep < 2 && (
          <Box sx={{ position: 'sticky', top: 88 }}>
            <OrderSummary />
          </Box>
        )}
      </Box>
    </PageWrapper>
  );
}
