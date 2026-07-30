import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Helper to get company_id from request
const getCompanyId = (req) => {
  return parseInt(req.headers['x-company-id'] || req.query.company_id || req.body?.company_id || '1', 10);
};

router.get('/', async (req, res) => {
  const companyId = getCompanyId(req);
  try {
    const result = await pool.query('SELECT * FROM users WHERE company_id = $1 ORDER BY id', [companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const companyId = getCompanyId(req);
  const { name, role, pin, active } = req.body;
  try {
    const companyRes = await pool.query('SELECT plan FROM companies WHERE id = $1', [companyId]);
    const isFreemium = companyRes.rows[0]?.plan !== 'pro';
    if (isFreemium) {
      const countRes = await pool.query('SELECT COUNT(*) FROM users WHERE company_id = $1', [companyId]);
      if (parseInt(countRes.rows[0].count, 10) >= 3) {
        return res.status(403).json({
          isLimitReached: true,
          limitType: 'users',
          error: '⚡ Has alcanzado el límite de 3 usuarios del plan Freemium. Actualiza a la versión 👑 PRO para usuarios ilimitados.'
        });
      }
    }

    const result = await pool.query(
      'INSERT INTO users (company_id, name, role, pin, active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [companyId, name, role, pin, active ?? true]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, role, pin, active } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, role = $2, pin = $3, active = $4 WHERE id = $5 RETURNING *',
      [name, role, pin, active, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
