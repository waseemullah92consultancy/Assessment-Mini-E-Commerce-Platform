import { create } from 'zustand';

export interface CartItem {
  itemId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
  setCart: (apiCart: any) => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

function derive(items: CartItem[]) {
  return {
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    total:
      Math.round(items.reduce((s, i) => s + i.price * i.quantity, 0) * 100) / 100,
  };
}

export const useCartStore = create<CartState>()((set) => ({
  items: [],
  itemCount: 0,
  total: 0,

  setCart: (apiCart) => {
    const items: CartItem[] = (apiCart?.items ?? []).map((raw: any) => {
      const p = raw.productId;
      return {
        itemId: raw._id ?? raw.itemId ?? '',
        productId: typeof p === 'string' ? p : (p?._id ?? raw.productId),
        name: p?.name ?? '',
        price: p?.price ?? 0,
        quantity: raw.quantity,
        image: p?.images?.[0] ?? '',
        stockQuantity: p?.stockQuantity ?? 0,
      };
    });
    set({ items, ...derive(items) });
  },

  addItem: (newItem) =>
    set((state) => {
      const exists = state.items.find((i) => i.productId === newItem.productId);
      const items = exists
        ? state.items.map((i) =>
            i.productId === newItem.productId
              ? { ...i, quantity: i.quantity + newItem.quantity }
              : i,
          )
        : [...state.items, newItem];
      return { items, ...derive(items) };
    }),

  removeItem: (productId) =>
    set((state) => {
      const items = state.items.filter((i) => i.productId !== productId);
      return { items, ...derive(items) };
    }),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      const items =
        quantity <= 0
          ? state.items.filter((i) => i.productId !== productId)
          : state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            );
      return { items, ...derive(items) };
    }),

  clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
}));
