import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PoolClient } from 'pg';
import { query, queryOne, transaction } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Order, OrderStatus } from '../types';

const shippingSchema = z.object({
  full_name: z.string().min(1),
  address_line1: z.string().min(1),
  address_line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().min(2),
  phone: z.string().min(7),
});

const checkoutSchema = z.object({
  shipping_address: shippingSchema,
  notes: z.string().optional(),
  payment_intent_id: z.string().optional(),
});

export async function createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shipping_address, notes, payment_intent_id } = checkoutSchema.parse(req.body);
    const userId = req.user!.id;

    const order = await transaction(async (client: PoolClient) => {
      // Lock cart items
      const cartItems = await client.query<{
        product_id: string; quantity: number; price: number; stock: number; name: string;
      }>(
        `SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.user_id = $1 AND p.is_active = true
         FOR UPDATE OF p`,
        [userId]
      );

      if (cartItems.rows.length === 0) throw new AppError(400, 'Cart is empty');

      // Validate stock
      for (const item of cartItems.rows) {
        if (item.stock < item.quantity) {
          throw new AppError(400, `Insufficient stock for "${item.name}"`);
        }
      }

      const totalAmount = cartItems.rows.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
      );

      // Create order
      const orderResult = await client.query<Order>(
        `INSERT INTO orders (user_id, total_amount, shipping_address, payment_intent_id, notes, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [
          userId,
          totalAmount.toFixed(2),
          JSON.stringify(shipping_address),
          payment_intent_id ?? null,
          notes ?? null,
          payment_intent_id ? 'paid' : 'pending',
        ]
      );
      const newOrder = orderResult.rows[0];

      // Insert order items and decrement stock
      for (const item of cartItems.rows) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
           VALUES ($1, $2, $3, $4)`,
          [newOrder.id, item.product_id, item.quantity, item.price]
        );
        await client.query(
          'UPDATE products SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Clear cart
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);

      return newOrder;
    });

    res.status(201).json(order);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    next(err);
  }
}

export async function getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = 10;
    const offset = (page - 1) * limit;
    const userId = req.user!.id;

    const [{ count }] = await query<{ count: string }>(
      'SELECT COUNT(*) FROM orders WHERE user_id = $1', [userId]
    );

    const orders = await query<Order>(
      `SELECT o.*,
         json_agg(json_build_object(
           'id', oi.id,
           'product_id', oi.product_id,
           'quantity', oi.quantity,
           'unit_price', oi.unit_price,
           'subtotal', oi.subtotal,
           'product_name', p.name,
           'product_image', p.image_url
         )) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({ data: orders, total: parseInt(count), page, totalPages: Math.ceil(parseInt(count) / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    const order = await queryOne<Order>(
      `SELECT o.*,
         json_agg(json_build_object(
           'id', oi.id, 'product_id', oi.product_id,
           'quantity', oi.quantity, 'unit_price', oi.unit_price,
           'subtotal', oi.subtotal, 'product_name', p.name, 'product_image', p.image_url
         )) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.id = $1 ${isAdmin ? '' : 'AND o.user_id = $2'}
       GROUP BY o.id`,
      isAdmin ? [req.params.id] : [req.params.id, userId]
    );

    if (!order) throw new AppError(404, 'Order not found');
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = z.enum(['pending','processing','shipped','delivered','cancelled']).parse(req.body.status);

    const [order] = await query<Order>(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    if (!order) throw new AppError(404, 'Order not found');
    res.json(order);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }
    next(err);
  }
}

export async function cancelOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await queryOne<Order>(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );
    if (!order) throw new AppError(404, 'Order not found');
    if (!['pending', 'processing'].includes(order.status)) {
      throw new AppError(400, 'Order cannot be cancelled at this stage');
    }

    const [updated] = await query<Order>(
      `UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}
