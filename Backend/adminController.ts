import { Request, Response, NextFunction } from 'express';
import { query, queryOne } from '../config/database';

export async function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [stats] = await query<{
      total_users: string;
      total_products: string;
      total_orders: string;
      total_revenue: string;
    }>(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
        (SELECT COUNT(*) FROM products WHERE is_active = true) AS total_products,
        (SELECT COUNT(*) FROM orders) AS total_orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid') AS total_revenue
    `);

    const ordersByStatus = await query<{ status: string; count: string }>(
      `SELECT status, COUNT(*) FROM orders GROUP BY status`
    );

    const recentOrders = await query(
      `SELECT o.id, o.status, o.total_amount, o.created_at, u.name AS user_name, u.email
       FROM orders o JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC LIMIT 10`
    );

    const topProducts = await query(
      `SELECT p.name, SUM(oi.quantity) AS units_sold, SUM(oi.subtotal) AS revenue
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       GROUP BY p.id, p.name ORDER BY units_sold DESC LIMIT 5`
    );

    const revenueByMonth = await query(
      `SELECT TO_CHAR(created_at, 'Mon YYYY') AS month,
              SUM(total_amount) AS revenue,
              COUNT(*) AS order_count
       FROM orders
       WHERE payment_status = 'paid' AND created_at > NOW() - INTERVAL '6 months'
       GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at)`
    );

    res.json({
      stats: {
        totalUsers: parseInt(stats.total_users),
        totalProducts: parseInt(stats.total_products),
        totalOrders: parseInt(stats.total_orders),
        totalRevenue: parseFloat(stats.total_revenue),
      },
      ordersByStatus,
      recentOrders,
      topProducts,
      revenueByMonth,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = 20;
    const offset = (page - 1) * limit;

    const [{ count }] = await query<{ count: string }>('SELECT COUNT(*) FROM users');
    const users = await query(
      `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ data: users, total: parseInt(count), page, totalPages: Math.ceil(parseInt(count) / limit) });
  } catch (err) {
    next(err);
  }
}
