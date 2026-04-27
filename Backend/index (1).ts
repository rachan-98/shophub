import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as auth from '../controllers/authController';
import * as products from '../controllers/productController';
import * as cart from '../controllers/cartController';
import * as orders from '../controllers/orderController';
import * as admin from '../controllers/adminController';

const router = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', authenticate, auth.getMe);

// ── Products ──────────────────────────────────────────────────────────────────
router.get('/products', products.getProducts);
router.get('/products/:id', products.getProduct);
router.post('/products', authenticate, requireRole('admin'), products.createProduct);
router.put('/products/:id', authenticate, requireRole('admin'), products.updateProduct);
router.delete('/products/:id', authenticate, requireRole('admin'), products.deleteProduct);

// ── Cart ──────────────────────────────────────────────────────────────────────
router.get('/cart', authenticate, cart.getCart);
router.post('/cart', authenticate, cart.addToCart);
router.put('/cart/:id', authenticate, cart.updateCartItem);
router.delete('/cart/:id', authenticate, cart.removeFromCart);
router.delete('/cart', authenticate, cart.clearCart);

// ── Orders ────────────────────────────────────────────────────────────────────
router.post('/orders/checkout', authenticate, orders.createOrder);
router.get('/orders', authenticate, orders.getOrders);
router.get('/orders/:id', authenticate, orders.getOrder);
router.patch('/orders/:id/cancel', authenticate, orders.cancelOrder);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get('/admin/dashboard', authenticate, requireRole('admin'), admin.getDashboard);
router.get('/admin/users', authenticate, requireRole('admin'), admin.getAllUsers);
router.patch('/admin/orders/:id/status', authenticate, requireRole('admin'), orders.updateOrderStatus);

export default router;
