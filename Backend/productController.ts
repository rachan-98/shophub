import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Product, PaginatedResult } from '../types';

const productSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category_id: z.string().uuid().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  images: z.array(z.string().url()).optional(),
  brand: z.string().optional().nullable(),
  is_featured: z.boolean().optional(),
});

export async function getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const offset = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const categorySlug = req.query.category as string | undefined;
    const featured = req.query.featured === 'true';
    const sortBy = (req.query.sortBy as string) || 'created_at';
    const order = req.query.order === 'asc' ? 'ASC' : 'DESC';

    const allowedSort = ['price', 'rating', 'created_at', 'name'];
    const safeSort = allowedSort.includes(sortBy) ? sortBy : 'created_at';

    const conditions: string[] = ['p.is_active = true'];
    const params: unknown[] = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(p.name ILIKE $${params.length} OR p.description ILIKE $${params.length})`);
    }
    if (categorySlug) {
      params.push(categorySlug);
      conditions.push(`c.slug = $${params.length}`);
    }
    if (featured) {
      conditions.push('p.is_featured = true');
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where}`,
      params
    );
    const total = parseInt(countResult?.count ?? '0');

    params.push(limit, offset);
    const products = await query<Product>(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${where}
       ORDER BY p.${safeSort} ${order}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const result: PaginatedResult<Product> = {
      data: products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await queryOne<Product>(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.is_active = true`,
      [req.params.id]
    );
    if (!product) throw new AppError(404, 'Product not found');
    res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = productSchema.parse(req.body);
    const [product] = await query<Product>(
      `INSERT INTO products (name, description, price, stock, category_id, image_url, images, brand, is_featured)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        body.name, body.description, body.price, body.stock,
        body.category_id ?? null, body.image_url ?? null,
        body.images ?? [], body.brand ?? null,
        body.is_featured ?? false,
      ]
    );
    res.status(201).json(product);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = productSchema.partial().parse(req.body);
    const existing = await queryOne('SELECT id FROM products WHERE id = $1', [req.params.id]);
    if (!existing) throw new AppError(404, 'Product not found');

    const setClauses: string[] = [];
    const params: unknown[] = [];

    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined) {
        params.push(value);
        setClauses.push(`${key} = $${params.length}`);
      }
    });

    if (setClauses.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    params.push(req.params.id);
    const [updated] = await query<Product>(
      `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await queryOne('SELECT id FROM products WHERE id = $1', [req.params.id]);
    if (!existing) throw new AppError(404, 'Product not found');
    // Soft delete
    await query('UPDATE products SET is_active = false WHERE id = $1', [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
