'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Pagination from '@mui/material/Pagination';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { getProducts, addToCart } from '../../../lib/api';
import type { Product } from '../../../lib/api';
import { useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';
import { ProductCard } from '../../../components/ui/ProductCard';
import { PageWrapper } from '../../../components/layout/PageWrapper';
import { EmptyState } from '../../../components/ui/EmptyState';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

const PRICE_MIN = 0;
const PRICE_MAX = 200000;

function FilterPanel({
  category,
  priceRange,
  inStock,
  onCategory,
  onPrice,
  onInStock,
}: {
  category: string;
  priceRange: [number, number];
  inStock: boolean;
  onCategory: (c: string) => void;
  onPrice: (r: [number, number]) => void;
  onInStock: (v: boolean) => void;
}) {
  return (
    <Box sx={{ p: 0 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.72rem', color: 'text.secondary' }}
      >
        Category
      </Typography>
      <FormGroup>
        {CATEGORIES.map((cat) => (
          <FormControlLabel
            key={cat}
            control={
              <Checkbox
                size="small"
                checked={category === cat}
                onChange={() => onCategory(category === cat ? '' : cat)}
                sx={{ '&.Mui-checked': { color: '#6C63FF' }, py: 0.5 }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: '0.88rem' }}>
                {cat}
              </Typography>
            }
            sx={{ mb: 0 }}
          />
        ))}
      </FormGroup>

      <Divider sx={{ my: 2.5 }} />

      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, mb: 2, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.72rem', color: 'text.secondary' }}
      >
        Price Range
      </Typography>
      <Box sx={{ px: 1 }}>
        <Slider
          value={priceRange}
          onChange={(_, v) => onPrice(v as [number, number])}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={1000}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) =>
            v >= 1000 ? `PKR ${(v / 1000).toFixed(0)}k` : `PKR ${v}`
          }
          sx={{ color: '#6C63FF' }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            PKR {priceRange[0].toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PKR {priceRange[1].toLocaleString()}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2.5 }} />

      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={inStock}
            onChange={(e) => onInStock(e.target.checked)}
            sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C63FF' } }}
          />
        }
        label={
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.88rem' }}>
            In Stock Only
          </Typography>
        }
      />
    </Box>
  );
}

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const setCart = useCartStore((s) => s.setCart);

  const urlCategory = searchParams.get('category') ?? '';
  const urlSearch = searchParams.get('search') ?? '';
  const urlSortBy = (searchParams.get('sortBy') ?? 'newest') as SortOption;
  const urlPage = Math.max(1, Number(searchParams.get('page') ?? 1));
  const urlMinPrice = Number(searchParams.get('minPrice') ?? PRICE_MIN);
  const urlMaxPrice = Number(searchParams.get('maxPrice') ?? PRICE_MAX);
  const urlInStock = searchParams.get('inStock') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Local state for controls that update the URL on commit
  const [localSearch, setLocalSearch] = useState(urlSearch);
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    urlMinPrice,
    urlMaxPrice,
  ]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', ok: true });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const priceCommitRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Keep local inputs in sync when URL changes externally (e.g., back button)
  useEffect(() => {
    setLocalSearch(urlSearch);
    setLocalPriceRange([urlMinPrice, urlMaxPrice]);
  }, [urlSearch, urlMinPrice, urlMaxPrice]);

  const pushParams = useCallback(
    (updates: Record<string, string | number | boolean | null>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '' || v === false || (k === 'minPrice' && v === PRICE_MIN) || (k === 'maxPrice' && v === PRICE_MAX)) {
          sp.delete(k);
        } else {
          sp.set(k, String(v));
        }
      });
      router.replace(`${pathname}?${sp.toString()}`);
    },
    [pathname, router, searchParams],
  );

  // Fetch products whenever URL params change
  useEffect(() => {
    setLoading(true);
    getProducts({
      search: urlSearch || undefined,
      category: urlCategory || undefined,
      minPrice: urlMinPrice > PRICE_MIN ? urlMinPrice : undefined,
      maxPrice: urlMaxPrice < PRICE_MAX ? urlMaxPrice : undefined,
      sortBy: urlSortBy,
      page: urlPage,
      limit: 12,
    })
      .then(({ data }) => {
        const fetched: Product[] = data.data.products;
        setProducts(urlInStock ? fetched.filter((p) => p.stockQuantity > 0) : fetched);
        setTotalPages(data.data.totalPages);
        setTotalCount(data.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch, urlCategory, urlSortBy, urlPage, urlMinPrice, urlMaxPrice, urlInStock]);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      pushParams({ search: value || null, page: null });
    }, 300);
  };

  const handlePriceChange = (range: [number, number]) => {
    setLocalPriceRange(range);
    clearTimeout(priceCommitRef.current);
    priceCommitRef.current = setTimeout(() => {
      pushParams({ minPrice: range[0], maxPrice: range[1], page: null });
    }, 400);
  };

  const handleAddToCart = async (productId: string) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    try {
      const { data } = await addToCart(productId, 1);
      setCart(data.data);
      setSnack({ open: true, msg: 'Added to cart!', ok: true });
    } catch (err: any) {
      setSnack({
        open: true,
        msg: err?.response?.data?.message ?? 'Could not add to cart',
        ok: false,
      });
    }
  };

  const filterProps = {
    category: urlCategory,
    priceRange: localPriceRange,
    inStock: urlInStock,
    onCategory: (c: string) => pushParams({ category: c || null, page: null }),
    onPrice: handlePriceChange,
    onInStock: (v: boolean) => pushParams({ inStock: v || null, page: null }),
  };

  return (
    <PageWrapper>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Typography
          variant="h4"
          sx={{ flex: 1, minWidth: 160, letterSpacing: '-0.02em' }}
        >
          Products
        </Typography>

        <TextField
          size="small"
          placeholder="Search…"
          value={localSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <SearchRoundedIcon
                  sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }}
                />
              ),
              endAdornment: localSearch ? (
                <IconButton
                  size="small"
                  onClick={() => handleSearchChange('')}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              ) : null,
            },
          }}
          sx={{ width: { xs: '100%', sm: 240 } }}
        />

        <TextField
          select
          size="small"
          value={urlSortBy}
          onChange={(e) =>
            pushParams({ sortBy: e.target.value, page: null })
          }
          sx={{ minWidth: 190 }}
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <MenuItem key={value} value={value}>
              {label}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="outlined"
          size="small"
          startIcon={<TuneRoundedIcon />}
          onClick={() => setMobileFiltersOpen(true)}
          sx={{ display: { md: 'none' }, borderRadius: 2 }}
        >
          Filters
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* ── Desktop sidebar ─────────────────────────────────────── */}
        <Box
          component="aside"
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 220,
            flexShrink: 0,
            position: 'sticky',
            top: 88,
            alignSelf: 'flex-start',
          }}
        >
          <FilterPanel {...filterProps} />
        </Box>

        {/* ── Product grid ────────────────────────────────────────── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {loading ? 'Loading…' : `${totalCount} product${totalCount !== 1 ? 's' : ''} found`}
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2,1fr)',
                  sm: 'repeat(3,1fr)',
                  lg: 'repeat(3,1fr)',
                },
                gap: 2,
              }}
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCard key={i} loading />
              ))}
            </Box>
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search terms."
              action={
                <Button
                  variant="contained"
                  onClick={() => {
                    router.replace(pathname);
                    setLocalSearch('');
                    setLocalPriceRange([PRICE_MIN, PRICE_MAX]);
                  }}
                  sx={{ borderRadius: 2 }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(2,1fr)',
                    sm: 'repeat(3,1fr)',
                    lg: 'repeat(3,1fr)',
                  },
                  gap: 2,
                }}
              >
                {products.map((p) => (
                  <Box
                    key={p._id}
                    component={Link}
                    href={`/products/${p._id}`}
                    sx={{ textDecoration: 'none' }}
                  >
                    <ProductCard product={p} onAddToCart={handleAddToCart} />
                  </Box>
                ))}
              </Box>

              {totalPages > 1 && (
                <Box
                  sx={{
                    mt: 5,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={urlPage}
                    onChange={(_, p) => pushParams({ page: p })}
                    color="primary"
                    shape="rounded"
                    sx={{
                      '& .Mui-selected': {
                        background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
                        color: '#fff',
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* ── Mobile filter drawer ─────────────────────────────────────── */}
      <Drawer
        anchor="bottom"
        open={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '80vh',
              overflow: 'auto',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            pb: 0,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Filters
          </Typography>
          <IconButton onClick={() => setMobileFiltersOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 2.5 }}>
          <FilterPanel {...filterProps} />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, borderRadius: 2 }}
            onClick={() => setMobileFiltersOpen(false)}
          >
            Show results
          </Button>
        </Box>
      </Drawer>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.ok ? 'success' : 'error'}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  );
}
