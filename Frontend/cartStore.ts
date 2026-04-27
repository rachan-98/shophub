import { create } from 'zustand';
import api from '../services/api';
import toast from 'react-hot-toast';

interface CartProduct {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: CartProduct;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/cart');
      set({ items: data.items, total: data.total, itemCount: data.itemCount });
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    await api.post('/cart', { product_id: productId, quantity });
    toast.success('Added to cart');
    await get().fetchCart();
  },

  updateItem: async (itemId, quantity) => {
    await api.put(`/cart/${itemId}`, { quantity });
    await get().fetchCart();
  },

  removeItem: async (itemId) => {
    await api.delete(`/cart/${itemId}`);
    await get().fetchCart();
  },

  clearCart: async () => {
    await api.delete('/cart');
    set({ items: [], total: 0, itemCount: 0 });
  },
}));
