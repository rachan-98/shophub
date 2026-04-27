export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: string | null;
  category_name?: string;
  image_url: string | null;
  images: string[];
  brand: string | null;
  rating: number;
  review_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: ShippingAddress;
  payment_intent_id: string | null;
  payment_status: PaymentStatus;
  notes: string | null;
  items?: OrderItem[];
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Pick<Product, 'name' | 'image_url'>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Augment Express Request with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'role'>;
    }
  }
}
