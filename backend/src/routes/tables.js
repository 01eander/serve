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
    const result = await pool.query('SELECT * FROM tables WHERE company_id = $1 ORDER BY id', [companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const companyId = getCompanyId(req);
  const { table_number, capacity, status } = req.body;
  try {
    const companyRes = await pool.query('SELECT plan FROM companies WHERE id = $1', [companyId]);
    const isFreemium = companyRes.rows[0]?.plan !== 'pro';
    if (isFreemium) {
      const countRes = await pool.query('SELECT COUNT(*) FROM tables WHERE company_id = $1', [companyId]);
      if (parseInt(countRes.rows[0].count, 10) >= 5) {
        return res.status(403).json({
          isLimitReached: true,
          limitType: 'tables',
          error: '⚡ Has alcanzado el límite de 5 mesas del plan Freemium. Actualiza a la versión 👑 PRO para mapa de mesas ilimitado.'
        });
      }
    }

    const result = await pool.query(
      'INSERT INTO tables (company_id, table_number, capacity, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [companyId, table_number, capacity, status || 'available']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { table_number, capacity, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tables SET table_number = $1, capacity = $2, status = $3 WHERE id = $4 RETURNING *',
      [table_number, capacity, status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tables WHERE id = $1', [id]);
    res.json({ message: 'Table deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
