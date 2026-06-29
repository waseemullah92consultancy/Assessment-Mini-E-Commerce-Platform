import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

// ── Types ────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductsResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Cart {
  userId: string;
  items: Array<{ productId: Product; quantity: number }>;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order {
  _id: string;
  userId: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentIntentId: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
}

export interface OrdersResult {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const loginUser = (email: string, password: string) =>
  api.post<ApiResponse<{ accessToken: string; user: any }>>('/auth/login', {
    email,
    password,
  });

export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post<ApiResponse<{ accessToken: string; user: any }>>('/auth/register', data);

export const getMe = () => api.get<ApiResponse<any>>('/auth/me');

// ── Products ─────────────────────────────────────────────────────────────────

export type SortBy = 'price_asc' | 'price_desc' | 'newest';

export const getProducts = (params?: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortBy;
  page?: number;
  limit?: number;
}) => api.get<ApiResponse<ProductsResult>>('/products', { params });

export const getProduct = (id: string) =>
  api.get<ApiResponse<Product>>(`/products/${id}`);

export const getProductRecommendations = (id: string) =>
  api.get<ApiResponse<Product[]>>(`/products/${id}/recommendations`);

// ── Cart ─────────────────────────────────────────────────────────────────────

export const getCart = () => api.get<ApiResponse<Cart>>('/cart');

export const addToCart = (productId: string, quantity: number) =>
  api.post<ApiResponse<Cart>>('/cart/items', { productId, quantity });

export const updateCartItem = (productId: string, quantity: number) =>
  api.patch<ApiResponse<Cart>>(`/cart/items/${productId}`, { quantity });

export const removeCartItem = (productId: string) =>
  api.delete<ApiResponse<Cart>>(`/cart/items/${productId}`);

export const clearCartApi = () => api.delete<ApiResponse<void>>('/cart');

// ── Recommendations ───────────────────────────────────────────────────────────

export const getPersonalizedRecs = () =>
  api.get<ApiResponse<Product[]>>('/recommendations/personalized');

// ── Orders ───────────────────────────────────────────────────────────────────

export const createOrder = (shippingAddress: Order['shippingAddress']) =>
  api.post<ApiResponse<Order>>('/orders', { shippingAddress });

export const getOrders = (params?: { page?: number; limit?: number }) =>
  api.get<ApiResponse<OrdersResult>>('/orders', { params });

export const getOrder = (id: string) =>
  api.get<ApiResponse<Order>>(`/orders/${id}`);

// ── Admin types ───────────────────────────────────────────────────────────────

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  topProducts: Array<{
    productId: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

export interface AdminOrdersResult {
  orders: AdminOrder[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminOrder extends Omit<Order, 'userId'> {
  userId: { _id: string; name: string; email: string } | string;
}

// ── Admin APIs ────────────────────────────────────────────────────────────────

export const getAdminAnalytics = () =>
  api.get<ApiResponse<Analytics>>('/admin/analytics');

export const adminGetProducts = (params?: {
  search?: string;
  category?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}) => api.get<ApiResponse<ProductsResult>>('/admin/products', { params });

export const adminCreateProduct = (data: {
  name: string;
  description: string;
  price: number;
  category: string;
  stockQuantity: number;
  images?: string[];
  isActive?: boolean;
}) => api.post<ApiResponse<Product>>('/products', data);

export const adminUpdateProduct = (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    category: string;
    stockQuantity: number;
    images: string[];
    isActive: boolean;
  }>,
) => api.patch<ApiResponse<Product>>(`/products/${id}`, data);

export const adminDeleteProduct = (id: string) =>
  api.delete<ApiResponse<Product>>(`/products/${id}`);

export const adminGetOrders = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => api.get<ApiResponse<AdminOrdersResult>>('/admin/orders', { params });

export const adminUpdateOrderStatus = (id: string, status: string) =>
  api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status });
