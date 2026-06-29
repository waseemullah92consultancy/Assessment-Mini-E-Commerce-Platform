import { act } from 'react';
import { useCartStore } from '../cartStore';
import type { CartItem } from '../cartStore';

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    itemId: 'item-001',
    productId: 'prod-001',
    name: 'Test Product',
    price: 1000,
    quantity: 1,
    image: '',
    stockQuantity: 10,
    ...overrides,
  };
}

// Reset store state before each test
beforeEach(() => {
  act(() => {
    useCartStore.setState({ items: [], itemCount: 0, total: 0 });
  });
});

describe('cartStore', () => {
  describe('addItem()', () => {
    it('increases itemCount by the item quantity when adding a new item', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 3 }));
      });

      expect(useCartStore.getState().itemCount).toBe(3);
    });

    it('adds the item to the items array', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem());
      });

      expect(useCartStore.getState().items).toHaveLength(1);
    });

    it('merges quantity when the same productId is added twice', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 2 }));
        useCartStore.getState().addItem(makeItem({ quantity: 3 }));
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].quantity).toBe(5);
      expect(state.itemCount).toBe(5);
    });

    it('appends a new entry when a different productId is added', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ productId: 'prod-001', quantity: 1 }));
        useCartStore.getState().addItem(makeItem({ productId: 'prod-002', quantity: 2 }));
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(2);
      expect(state.itemCount).toBe(3);
    });

    it('calculates the correct total (price × quantity)', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ price: 500, quantity: 2 }));
        useCartStore.getState().addItem(makeItem({ productId: 'prod-002', price: 1200, quantity: 1 }));
      });

      // 500×2 + 1200×1 = 2200
      expect(useCartStore.getState().total).toBe(2200);
    });
  });

  describe('removeItem()', () => {
    it('removes the item and updates itemCount', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 3 }));
        useCartStore.getState().removeItem('prod-001');
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.itemCount).toBe(0);
      expect(state.total).toBe(0);
    });

    it('only removes the targeted product', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ productId: 'prod-001', quantity: 1 }));
        useCartStore.getState().addItem(makeItem({ productId: 'prod-002', quantity: 2 }));
        useCartStore.getState().removeItem('prod-001');
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].productId).toBe('prod-002');
      expect(state.itemCount).toBe(2);
    });
  });

  describe('updateQuantity()', () => {
    it('updates the quantity and recalculates itemCount', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 1 }));
        useCartStore.getState().updateQuantity('prod-001', 5);
      });

      expect(useCartStore.getState().itemCount).toBe(5);
    });

    it('removes the item when quantity is set to 0', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 3 }));
        useCartStore.getState().updateQuantity('prod-001', 0);
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.itemCount).toBe(0);
    });
  });

  describe('clearCart()', () => {
    it('empties all items and resets counts to 0', () => {
      act(() => {
        useCartStore.getState().addItem(makeItem({ quantity: 2 }));
        useCartStore.getState().addItem(makeItem({ productId: 'prod-002', quantity: 3 }));
        useCartStore.getState().clearCart();
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(0);
      expect(state.itemCount).toBe(0);
      expect(state.total).toBe(0);
    });
  });

  describe('setCart()', () => {
    it('populates state from an API cart response', () => {
      const apiCart = {
        items: [
          {
            _id: 'item-abc',
            productId: {
              _id: 'prod-xyz',
              name: 'Smartwatch',
              price: 25000,
              images: ['https://example.com/watch.jpg'],
              stockQuantity: 5,
            },
            quantity: 2,
          },
        ],
      };

      act(() => {
        useCartStore.getState().setCart(apiCart);
      });

      const state = useCartStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].name).toBe('Smartwatch');
      expect(state.items[0].quantity).toBe(2);
      expect(state.items[0].price).toBe(25000);
      expect(state.itemCount).toBe(2);
      expect(state.total).toBe(50000);
    });
  });
});
