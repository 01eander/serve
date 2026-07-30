import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET Master Dashboard Stats & All Companies Breakdown
router.get('/stats', async (req, res) => {
  try {
    // 1. Overview KPI Counts
    const overviewRes = await pool.query(`
      SELECT 
        COUNT(id) AS total_companies,
        COUNT(CASE WHEN status = 'active' THEN 1 END) AS active_companies,
        COUNT(CASE WHEN status = 'moroso' OR status = 'disabled' THEN 1 END) AS moroso_companies,
        COUNT(CASE WHEN plan = 'freemium' THEN 1 END) AS freemium_companies,
        COUNT(CASE WHEN plan = 'pro' THEN 1 END) AS pro_companies
      FROM companies
    `);

    const globalDishesRes = await pool.query(`SELECT COUNT(id) AS total_dishes FROM menu_items`);
    const totalDishes = parseInt(globalDishesRes.rows[0].total_dishes || 0, 10);

    // 2. Detailed Company Catalog & Billing Breakdown
    const companiesRes = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.currency,
        c.tax_rate,
        c.status,
        c.plan,
        c.billing_notes,
        c.billing_due_date,
        c.created_at,
        (SELECT COUNT(id) FROM menu_items WHERE company_id = c.id) AS dishes_count,
        (SELECT COUNT(id) FROM categories WHERE company_id = c.id) AS categories_count,
        (SELECT COUNT(id) FROM tables WHERE company_id = c.id) AS tables_count,
        (SELECT COUNT(id) FROM users WHERE company_id = c.id) AS users_count,
        (SELECT COUNT(id) FROM orders WHERE company_id = c.id) AS orders_count
      FROM companies c
      ORDER BY c.id DESC
    `);

    const companies = companiesRes.rows.map(r => ({
      ...r,
      dishes_count: parseInt(r.dishes_count || 0, 10),
      categories_count: parseInt(r.categories_count || 0, 10),
      tables_count: parseInt(r.tables_count || 0, 10),
      users_count: parseInt(r.users_count || 0, 10),
      orders_count: parseInt(r.orders_count || 0, 10)
    }));

    res.json({
      overview: {
        totalCompanies: parseInt(overviewRes.rows[0].total_companies || 0, 10),
        activeCompanies: parseInt(overviewRes.rows[0].active_companies || 0, 10),
        morosoCompanies: parseInt(overviewRes.rows[0].moroso_companies || 0, 10),
        freemiumCompanies: parseInt(overviewRes.rows[0].freemium_companies || 0, 10),
        proCompanies: parseInt(overviewRes.rows[0].pro_companies || 0, 10),
        totalDishes
      },
      companies
    });
  } catch (err) {
    console.error('Error fetching master stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update company status (active | moroso | disabled)
router.patch('/companies/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active', 'moroso', 'disabled'

  if (!['active', 'moroso', 'disabled'].includes(status)) {
    return res.status(400).json({ error: 'Estado no válido' });
  }

  try {
    const result = await pool.query(`
      UPDATE companies 
      SET status = $1 
      WHERE id = $2 
      RETURNING id, name, email, status, plan
    `, [status, id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json({ company: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update company plan (freemium | pro)
router.patch('/companies/:id/plan', async (req, res) => {
  const { id } = req.params;
  const { plan } = req.body; // 'freemium', 'pro'

  if (!['freemium', 'pro'].includes(plan)) {
    return res.status(400).json({ error: 'Plan no válido' });
  }

  try {
    let result;
    if (plan === 'pro') {
      // Set billing_due_date to 30 days from now if not already set in future
      const currentRes = await pool.query('SELECT billing_due_date FROM companies WHERE id = $1', [id]);
      const currentDueDate = currentRes.rows[0]?.billing_due_date ? new Date(currentRes.rows[0].billing_due_date) : null;
      const now = new Date();
      const newDueDate = (currentDueDate && currentDueDate > now) ? currentDueDate : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      result = await pool.query(`
        UPDATE companies 
        SET plan = 'pro', billing_due_date = $1 
        WHERE id = $2 
        RETURNING id, name, email, status, plan, billing_notes, billing_due_date
      `, [newDueDate.toISOString(), id]);
    } else {
      result = await pool.query(`
        UPDATE companies 
        SET plan = 'freemium' 
        WHERE id = $1 
        RETURNING id, name, email, status, plan, billing_notes, billing_due_date
      `, [id]);
    }

    if (result.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json({ company: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fast Renewal (+30 days PRO)
router.patch('/companies/:id/renew', async (req, res) => {
  const { id } = req.params;
  try {
    const currentRes = await pool.query('SELECT billing_due_date FROM companies WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    
    const currentDueDate = currentRes.rows[0]?.billing_due_date ? new Date(currentRes.rows[0].billing_due_date) : new Date();
    const now = new Date();
    const startDate = currentDueDate > now ? currentDueDate : now;
    
    // Add 30 days
    const newDueDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const result = await pool.query(`
      UPDATE companies 
      SET billing_due_date = $1, plan = 'pro', status = 'active'
      WHERE id = $2 
      RETURNING id, name, email, status, plan, billing_notes, billing_due_date
    `, [newDueDate.toISOString(), id]);

    res.json({ company: result.rows[0], message: 'Suscripción PRO renovada por 30 días adicionales' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update company billing notes & due date
router.put('/companies/:id/billing', async (req, res) => {
  const { id } = req.params;
  const { billing_notes, billing_due_date } = req.body;

  try {
    const result = await pool.query(`
      UPDATE companies 
      SET billing_notes = $1, billing_due_date = $2 
      WHERE id = $3 
      RETURNING id, name, email, status, plan, billing_notes, billing_due_date
    `, [billing_notes || null, billing_due_date || null, id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json({ company: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset company password
router.patch('/companies/:id/password', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'La nueva contraseña es requerida' });
  }

  try {
    const result = await pool.query(`
      UPDATE companies 
      SET password = $1 
      WHERE id = $2 
      RETURNING id, name, email
    `, [password, id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json({ message: 'Contraseña actualizada con éxito', company: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
