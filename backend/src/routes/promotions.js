import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Auto-create promotions table if it does not exist
pool.query(`
  CREATE TABLE IF NOT EXISTS promotions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('category', 'item')),
    target_id INT NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'fixed_price')),
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE,
    end_date DATE,
    happy_hour_start TIME,
    happy_hour_end TIME,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )
`).catch(err => console.error('Promotions table creation error:', err));

// Initial seed if table is empty
async function seedInitialPromotions() {
  try {
    const check = await pool.query('SELECT COUNT(*) FROM promotions');
    if (parseInt(check.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO promotions (name, target_type, target_id, discount_type, discount_value, active)
        VALUES 
        ('Happy Hour Bebidas 20% OFF', 'category', 1, 'percent', 20.00, true),
        ('Especial Temporada Postres', 'category', 4, 'percent', 15.00, true)
      `);
    }
  } catch (err) {
    console.error('Seed promotions error:', err);
  }
}

seedInitialPromotions();

// Helper to get company_id from request
const getCompanyId = (req) => {
  return parseInt(req.headers['x-company-id'] || req.query.company_id || req.body?.company_id || '1', 10);
};

// Get all promotions
router.get('/', async (req, res) => {
  const companyId = getCompanyId(req);
  try {
    const result = await pool.query(`
      SELECT p.*,
        CASE 
          WHEN p.target_type = 'category' THEN c.name 
          WHEN p.target_type = 'item' THEN m.name 
        END as target_name
      FROM promotions p
      LEFT JOIN categories c ON p.target_type = 'category' AND p.target_id = c.id
      LEFT JOIN menu_items m ON p.target_type = 'item' AND p.target_id = m.id
      WHERE p.company_id = $1 OR p.company_id IS NULL
      ORDER BY p.id DESC
    `, [companyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create promotion
router.post('/', async (req, res) => {
  const companyId = getCompanyId(req);
  const { 
    name, target_type, target_id, discount_type, discount_value, 
    start_date, end_date, happy_hour_start, happy_hour_end, active 
  } = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO promotions (
        company_id, name, target_type, target_id, discount_type, discount_value, 
        start_date, end_date, happy_hour_start, happy_hour_end, active
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING *
    `, [
      companyId, name, target_type, target_id, discount_type, discount_value,
      start_date || null, end_date || null, 
      happy_hour_start || null, happy_hour_end || null,
      active ?? true
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update promotion
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    name, target_type, target_id, discount_type, discount_value, 
    start_date, end_date, happy_hour_start, happy_hour_end, active 
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE promotions SET 
        name = $1, target_type = $2, target_id = $3, discount_type = $4, 
        discount_value = $5, start_date = $6, end_date = $7, 
        happy_hour_start = $8, happy_hour_end = $9, active = $10
      WHERE id = $11
      RETURNING *
    `, [
      name, target_type, target_id, discount_type, discount_value,
      start_date || null, end_date || null, 
      happy_hour_start || null, happy_hour_end || null,
      active, id
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete promotion
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM promotions WHERE id = $1', [id]);
    res.json({ message: 'Promotion deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
