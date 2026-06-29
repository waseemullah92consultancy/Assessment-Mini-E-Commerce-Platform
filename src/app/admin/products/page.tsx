'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ImageNotSupportedRoundedIcon from '@mui/icons-material/ImageNotSupportedRounded';
import FormHelperText from '@mui/material/FormHelperText';

import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from '../../../lib/api';
import type { Product } from '../../../lib/api';

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Shoes',
  'Accessories',
  'Home & Living',
  'Books',
  'Sports',
  'Beauty',
  'Toys',
  'Other',
];

const productSchema = yup.object({
  name: yup.string().min(2, 'Min 2 characters').required('Required'),
  description: yup.string().min(10, 'Min 10 characters').required('Required'),
  price: yup
    .number()
    .typeError('Must be a number')
    .positive('Must be positive')
    .required('Required'),
  category: yup.string().required('Required'),
  stockQuantity: yup
    .number()
    .typeError('Must be a number')
    .integer('Must be a whole number')
    .min(0, 'Cannot be negative')
    .required('Required'),
  imageUrl: yup
    .string()
    .url('Must be a valid URL')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  isActive: yup.boolean().default(true),
});

type ProductFormValues = yup.InferType<typeof productSchema>;

// ── Confirm Delete Dialog ─────────────────────────────────────────────────────

function ConfirmDialog({
  open,
  productName,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Delete Product</DialogTitle>
      <DialogContent>
        <Typography>
          Delete <strong>{productName}</strong>? This will mark the product as
          inactive and hide it from the storefront.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Product Form Dialog ───────────────────────────────────────────────────────

function ProductDialog({
  open,
  product,
  onClose,
  onSaved,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const isEdit = !!product;
  const [apiError, setApiError] = useState('');
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined as unknown as number,
      category: '',
      stockQuantity: undefined as unknown as number,
      imageUrl: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (open) {
      setApiError('');
      reset(
        product
          ? {
              name: product.name,
              description: product.description,
              price: product.price,
              category: product.category,
              stockQuantity: product.stockQuantity,
              imageUrl: product.images?.[0] ?? '',
              isActive: product.isActive,
            }
          : {
              name: '',
              description: '',
              price: undefined as unknown as number,
              category: '',
              stockQuantity: undefined as unknown as number,
              imageUrl: '',
              isActive: true,
            },
      );
    }
  }, [open, product, reset]);

  const onSubmit = async (values: ProductFormValues) => {
    setSaving(true);
    setApiError('');
    try {
      const payload = {
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        stockQuantity: values.stockQuantity,
        images: values.imageUrl ? [values.imageUrl] : [],
        isActive: values.isActive ?? true,
      };
      if (isEdit && product) {
        const res = await adminUpdateProduct(product._id, payload);
        onSaved(res.data.data);
      } else {
        const res = await adminCreateProduct(payload);
        onSaved(res.data.data);
      }
      onClose();
    } catch (err: any) {
      setApiError(
        err?.response?.data?.message ?? 'Failed to save. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEdit ? 'Edit Product' : 'Add Product'}
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '12px !important' }}>
        {apiError && (
          <Alert severity="error" sx={{ mb: 0 }}>
            {apiError}
          </Alert>
        )}

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Product Name"
              error={!!errors.name}
              helperText={errors.name?.message}
              size="small"
              fullWidth
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description?.message}
              size="small"
              fullWidth
            />
          )}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Controller
            name="price"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Price (PKR)"
                type="number"
                error={!!errors.price}
                helperText={errors.price?.message}
                size="small"
                fullWidth
                slotProps={{ input: { inputProps: { min: 0, step: '0.01' } } }}
              />
            )}
          />
          <Controller
            name="stockQuantity"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Stock Quantity"
                type="number"
                error={!!errors.stockQuantity}
                helperText={errors.stockQuantity?.message}
                size="small"
                fullWidth
                slotProps={{ input: { inputProps: { min: 0, step: 1 } } }}
              />
            )}
          />
        </Box>

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <FormControl size="small" fullWidth error={!!errors.category}>
              <InputLabel>Category</InputLabel>
              <Select {...field} label="Category">
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category.message}</FormHelperText>
              )}
            </FormControl>
          )}
        />

        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Image URL (optional)"
              error={!!errors.imageUrl}
              helperText={errors.imageUrl?.message}
              size="small"
              fullWidth
              placeholder="https://example.com/image.jpg"
            />
          )}
        />

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value ?? true}
                  onChange={(e) => field.onChange(e.target.checked)}
                  color="success"
                />
              }
              label="Active (visible in storefront)"
            />
          )}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          sx={{
            background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
            '&:hover': { background: 'linear-gradient(135deg, #5A52E0, #7B75EF)' },
          }}
        >
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchProducts = (
    searchVal = search,
    categoryVal = categoryFilter,
    pageVal = page,
    limitVal = rowsPerPage,
  ) => {
    setLoading(true);
    adminGetProducts({
      search: searchVal || undefined,
      category: categoryVal || undefined,
      page: pageVal + 1,
      limit: limitVal,
    })
      .then(({ data }) => {
        setProducts(data.data.products);
        setTotal(data.data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(0);
      fetchProducts(val, categoryFilter, 0, rowsPerPage);
    }, 300);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(0);
    fetchProducts(search, val, 0, rowsPerPage);
  };

  const handlePageChange = (_: unknown, newPage: number) => {
    setPage(newPage);
    fetchProducts(search, categoryFilter, newPage, rowsPerPage);
  };

  const handleRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const limit = parseInt(e.target.value, 10);
    setRowsPerPage(limit);
    setPage(0);
    fetchProducts(search, categoryFilter, 0, limit);
  };

  const handleSaved = (saved: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p._id === saved._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteProduct(deleteTarget._id);
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setTotal((t) => t - 1);
      setDeleteTarget(null);
    } catch {
      // keep dialog open so user sees it failed
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
          alignItems: 'center',
        }}
      >
        <TextField
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search products…"
          size="small"
          sx={{ flex: '1 1 220px', maxWidth: 340 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            label="Category"
          >
            <MenuItem value="">All</MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ flex: '1 0 0' }} />

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={() => {
            setEditingProduct(null);
            setDialogOpen(true);
          }}
          sx={{
            background: 'linear-gradient(135deg, #6C63FF, #8B85FF)',
            '&:hover': { background: 'linear-gradient(135deg, #5A52E0, #7B75EF)' },
            fontWeight: 700,
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Product
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Category
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Price
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Stock
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Skeleton variant="rounded" width={44} height={44} />
                          <Skeleton variant="text" width={140} />
                        </Box>
                      </TableCell>
                      <TableCell><Skeleton width={80} /></TableCell>
                      <TableCell align="right"><Skeleton width={60} /></TableCell>
                      <TableCell align="right"><Skeleton width={40} /></TableCell>
                      <TableCell align="center"><Skeleton width={60} sx={{ mx: 'auto' }} /></TableCell>
                      <TableCell align="right"><Skeleton width={70} sx={{ ml: 'auto' }} /></TableCell>
                    </TableRow>
                  ))
                : products.map((product) => (
                    <TableRow
                      key={product._id}
                      sx={{
                        '&:hover': { bgcolor: 'action.hover' },
                        '&:last-child td': { border: 0 },
                      }}
                    >
                      {/* Product name + thumbnail */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            src={product.images?.[0]}
                            variant="rounded"
                            sx={{ width: 44, height: 44, bgcolor: 'action.selected' }}
                          >
                            <ImageNotSupportedRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                          </Avatar>
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              maxWidth: 220,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {product.name}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {product.category}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}
                        >
                          PKR {product.price.toLocaleString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontVariantNumeric: 'tabular-nums',
                            color:
                              product.stockQuantity === 0
                                ? 'error.main'
                                : product.stockQuantity < 5
                                ? 'warning.main'
                                : 'text.primary',
                            fontWeight:
                              product.stockQuantity < 5 ? 600 : 400,
                          }}
                        >
                          {product.stockQuantity}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={product.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            bgcolor: product.isActive
                              ? 'rgba(0,200,150,0.12)'
                              : 'rgba(128,128,128,0.12)',
                            color: product.isActive ? '#00C896' : 'text.disabled',
                            border: 'none',
                          }}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingProduct(product);
                                setDialogOpen(true);
                              }}
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteTarget(product)}
                            >
                              <DeleteRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </Box>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsChange}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      {/* ── Dialogs ─────────────────────────────────────────────────── */}
      <ProductDialog
        open={dialogOpen}
        product={editingProduct}
        onClose={() => setDialogOpen(false)}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        productName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </Box>
  );
}
