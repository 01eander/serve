import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Helper to get company_id from request
const getCompanyId = (req) => {
  return parseInt(req.headers['x-company-id'] || req.query.company_id || req.body?.company_id || '1', 10);
};

router.get('/stats', async (req, res) => {
  const companyId = getCompanyId(req);

  try {
    // 1. Today's Sales & Order Count
    const todayRes = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) AS total_sales,
        COUNT(id) AS total_orders
      FROM orders 
      WHERE company_id = $1 AND DATE(created_at) = CURRENT_DATE
    `, [companyId]);

    const totalSales = parseFloat(todayRes.rows[0].total_sales || 0);
    const totalOrders = parseInt(todayRes.rows[0].total_orders || 0, 10);
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

    // 2. Active Staff Count
    const staffRes = await pool.query(`
      SELECT COUNT(id) AS staff_count 
      FROM users 
      WHERE company_id = $1 AND active = true
    `, [companyId]);

    const staffCount = parseInt(staffRes.rows[0].staff_count || 0, 10);

    // 3. Last 7 Days Daily Sales
    const weeklyRes = await pool.query(`
      SELECT 
        TO_CHAR(d.day, 'Dy') AS day_name,
        COALESCE(SUM(o.total_amount), 0) AS sales
      FROM (
        SELECT generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day')::date AS day
      ) d
      LEFT JOIN orders o ON DATE(o.created_at) = d.day AND o.company_id = $1
      GROUP BY d.day
      ORDER BY d.day ASC
    `, [companyId]);

    const salesData = weeklyRes.rows.map(r => ({
      day: r.day_name,
      sales: parseFloat(r.sales || 0)
    }));

    // 4. Top Selling Items
    const topItemsRes = await pool.query(`
      SELECT 
        m.name,
        c.name AS category,
        COALESCE(SUM(oi.quantity), 0) AS sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN menu_items m ON oi.menu_item_id = m.id
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE o.company_id = $1
      GROUP BY m.id, m.name, c.name
      ORDER BY sales DESC
      LIMIT 5
    `, [companyId]);

    const totalTopSales = topItemsRes.rows.reduce((acc, r) => acc + parseInt(r.sales, 10), 0);
    const topItems = topItemsRes.rows.map(r => ({
      name: r.name,
      category: r.category || 'Sin categoría',
      sales: parseInt(r.sales, 10),
      percentage: totalTopSales > 0 ? Math.round((parseInt(r.sales, 10) / totalTopSales) * 100) : 0
    }));

    // 5. Staff Performance
    const staffPerfRes = await pool.query(`
      SELECT 
        u.name,
        u.role,
        COUNT(o.id) AS orders,
        COALESCE(SUM(o.total_amount), 0) AS total
      FROM users u
      LEFT JOIN orders o ON o.company_id = u.company_id AND DATE(o.created_at) = CURRENT_DATE
      WHERE u.company_id = $1 AND u.active = true
      GROUP BY u.id, u.name, u.role
      ORDER BY total DESC
    `, [companyId]);

    const staffPerformance = staffPerfRes.rows.map(r => ({
      name: r.name,
      role: r.role === 'admin' ? 'Administrador' : 'Mesero',
      orders: parseInt(r.orders || 0, 10),
      total: parseFloat(r.total || 0),
      status: parseFloat(r.total || 0) > 0 ? 'Activo' : 'Sin ventas hoy'
    }));

    // 6. Payment Distribution (Cash vs Card)
    const paymentsRes = await pool.query(`
      SELECT 
        payment_method, 
        COUNT(id) AS count,
        COALESCE(SUM(total_amount), 0) AS total
      FROM orders
      WHERE company_id = $1 AND DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days'
        AND status = 'paid'
      GROUP BY payment_method
    `, [companyId]);

    const paymentStats = paymentsRes.rows.map(r => ({
      name: r.payment_method === 'cash' ? 'Efectivo' : (r.payment_method === 'card' ? 'Tarjeta' : 'Otro'),
      value: parseFloat(r.total)
    }));

    // 7. Heatmap (Sales by Day of Week and Hour - last 30 days)
    const heatmapRes = await pool.query(`
      SELECT 
        EXTRACT(DOW FROM created_at) AS day_of_week,
        EXTRACT(HOUR FROM created_at) AS hour_of_day,
        COUNT(id) AS order_count
      FROM orders
      WHERE company_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY day_of_week, hour_of_day
    `, [companyId]);

    // Format heatmap data for the frontend (0=Sunday, 1=Monday... 6=Saturday)
    // We want to return an array of objects: { day: 0..6, hour: 0..23, value: count }
    const heatmapData = heatmapRes.rows.map(r => ({
      day: parseInt(r.day_of_week, 10),
      hour: parseInt(r.hour_of_day, 10),
      value: parseInt(r.order_count, 10)
    }));

    res.json({
      metrics: {
        todaySales: totalSales,
        todayOrdersCount: totalOrders,
        avgTicket: avgTicket,
        activeStaffCount: staffCount
      },
      salesTrend: salesData,
      topItems: topItems,
      staffPerformance: staffPerformance,
      paymentStats: paymentStats,
      heatmapData: heatmapData
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
