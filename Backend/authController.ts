import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query, queryOne } from '../config/database';
import { generateTokens } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { User } from '../types';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function safeUser(user: User) {
  const { ...safe } = user as User & { password?: string };
  delete safe.password;
  return safe;
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [body.email]);
    if (existing) throw new AppError(409, 'Email already registered');

    const hashed = await bcrypt.hash(body.password, 12);
    const [user] = await query<User>(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
       RETURNING id, name, email, role, avatar_url, created_at, updated_at`,
      [body.name, body.email, hashed]
    );

    const token = generateTokens(user.id, user.role);
    res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = loginSchema.parse(req.body);
    const user = await queryOne<User & { password: string }>(
      `SELECT id, name, email, role, avatar_url, password, created_at, updated_at
       FROM users WHERE email = $1`,
      [body.email]
    );

    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      throw new AppError(401, 'Invalid email or password');
    }

    const token = generateTokens(user.id, user.role);
    res.json({ token, user: safeUser(user as unknown as User) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await queryOne<User>(
      `SELECT id, name, email, role, avatar_url, created_at, updated_at
       FROM users WHERE id = $1`,
      [req.user!.id]
    );
    if (!user) throw new AppError(404, 'User not found');
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
