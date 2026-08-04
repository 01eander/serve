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

  if (!table_number || !table_number.trim()) {
    return res.status(400).json({ error: 'El nombre/número de mesa es requerido.' });
  }

  const cleanTableNumber = table_number.trim();

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

    // Check duplicate table name for this company
    const checkDup = await pool.query(
      'SELECT id FROM tables WHERE company_id = $1 AND LOWER(TRIM(table_number)) = LOWER($2)',
      [companyId, cleanTableNumber]
    );
    if (checkDup.rows.length > 0) {
      return res.status(400).json({ error: `Ya existe una mesa registrada como "${cleanTableNumber}". Por favor usa un nombre o número diferente.` });
    }

    const result = await pool.query(
      'INSERT INTO tables (company_id, table_number, capacity, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [companyId, cleanTableNumber, capacity, status || 'available']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const companyId = getCompanyId(req);
  const { table_number, capacity, status } = req.body;

  if (!table_number || !table_number.trim()) {
    return res.status(400).json({ error: 'El nombre/número de mesa es requerido.' });
  }

  const cleanTableNumber = table_number.trim();

  try {
    // Check duplicate table name for this company excluding current table
    const checkDup = await pool.query(
      'SELECT id FROM tables WHERE company_id = $1 AND LOWER(TRIM(table_number)) = LOWER($2) AND id != $3',
      [companyId, cleanTableNumber, id]
    );
    if (checkDup.rows.length > 0) {
      return res.status(400).json({ error: `Ya existe otra mesa registrada como "${cleanTableNumber}".` });
    }

    const result = await pool.query(
      'UPDATE tables SET table_number = $1, capacity = $2, status = $3 WHERE id = $4 AND company_id = $5 RETURNING *',
      [cleanTableNumber, capacity, status, id, companyId]
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
