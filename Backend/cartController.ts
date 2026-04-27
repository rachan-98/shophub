import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { CartItem } from '../types';

const addToCartSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

export async function getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await query<CartItem>(
      `SELECT ci.*, row_to_json(p.*) AS product
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND p.is_active = true`,
      [req.user!.id]
    );
    const total = items.reduce((sum, item) => {
      const price = (item.product as { price: number }).price;
      return sum + price * item.quantity;
    }, 0);
    res.json({ items, total: parseFloat(total.toFixed(2)), itemCount: items.length });
  } catch (err) {
    next(err);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { product_id, quantity } = addToCartSchema.parse(req.body);

    const product = await queryOne<{ id: string; stock: number }>(
      'SELECT id, stock FROM products WHERE id = $1 AND is_active = true',
      [product_id]
    );
    if (!product) throw new AppError(404, 'Product not found');
    if (product.stock < quantity) throw new AppError(400, 'Insufficient stock');

    const [item] = await query<CartItem>(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
       RETURNING *`,
      [req.user!.id, product_id, quantity]
    );
    res.status(201).json(item);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    next(err);
  }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const quantity = z.number().int().positive().max(99).parse(req.body.quantity);

    const [item] = await query<CartItem>(
      `UPDATE cart_items SET quantity = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [quantity, req.params.id, req.user!.id]
    );
    if (!item) throw new AppError(404, 'Cart item not found');
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function removeFromCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user!.id]
    );
    if (result.length === 0) throw new AppError(404, 'Cart item not found');
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await query('DELETE FROM cart_items WHERE user_id = $1', [req.user!.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
