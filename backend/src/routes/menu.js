import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Helper to get company_id from request
const getCompanyId = (req) => {
  return parseInt(req.headers['x-company-id'] || req.query.company_id || req.body?.company_id || '1', 10);
};

// Helper to check franchise edit permissions
const checkMenuEditPermission = async (companyId, res) => {
  const companyRes = await pool.query('SELECT parent_company_id FROM companies WHERE id = $1', [companyId]);
  const parentId = companyRes.rows[0]?.parent_company_id;
  if (parentId) {
    const parentRes = await pool.query('SELECT allow_child_menu_edit FROM companies WHERE id = $1', [parentId]);
    if (parentRes.rows.length > 0 && parentRes.rows[0].allow_child_menu_edit === false) {
      res.status(403).json({ error: '🔒 Tu Franquicia corporativa ha bloqueado la edición del menú local.' });
      return false;
    }
  }
  return true;
};

// Get Categories and Items
router.get('/', async (req, res) => {
  const companyId = getCompanyId(req);
  try {
    const companyRes = await pool.query('SELECT parent_company_id FROM companies WHERE id = $1', [companyId]);
    const parentId = companyRes.rows[0]?.parent_company_id;
    const parentIdParam = parentId || companyId; // If no parent, just use companyId to avoid null issues in ANY

    let canEdit = true;
    if (parentId) {
      const parentRes = await pool.query('SELECT allow_child_menu_edit FROM companies WHERE id = $1', [parentId]);
      if (parentRes.rows.length > 0 && parentRes.rows[0].allow_child_menu_edit === false) {
        canEdit = false;
      }
    }

    const categoriesResult = await pool.query(
      'SELECT * FROM categories WHERE company_id = $1 OR company_id = $2 ORDER BY id', 
      [companyId, parentIdParam]
    );
    const itemsResult = await pool.query(`
      SELECT m.*, c.name as category_name 
      FROM menu_items m 
      JOIN categories c ON m.category_id = c.id 
      WHERE m.company_id = $1 OR m.company_id = $2
      ORDER BY m.id
    `, [companyId, parentIdParam]);
    res.json({ categories: categoriesResult.rows, items: itemsResult.rows, canEdit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Category CRUD
router.post('/categories', async (req, res) => {
  const companyId = getCompanyId(req);
  const { name, description, active } = req.body;
  try {
    const canEdit = await checkMenuEditPermission(companyId, res);
    if (!canEdit) return;

    const companyRes = await pool.query('SELECT plan FROM companies WHERE id = $1', [companyId]);
    const isFreemium = companyRes.rows[0]?.plan !== 'pro';
    if (isFreemium) {
      const countRes = await pool.query('SELECT COUNT(*) FROM categories WHERE company_id = $1', [companyId]);
      if (parseInt(countRes.rows[0].count, 10) >= 3) {
        return res.status(403).json({
          isLimitReached: true,
          limitType: 'categories',
          error: '⚡ Has alcanzado el límite de 3 categorías del plan Freemium. Actualiza a la versión 👑 PRO para catálogo ilimitado.'
        });
      }
    }

    const result = await pool.query(
      'INSERT INTO categories (company_id, name, description, active) VALUES ($1, $2, $3, $4) RETURNING *',
      [companyId, name, description, active ?? true]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  const companyId = getCompanyId(req);
  const { id } = req.params;
  const { name, description, active } = req.body;
  try {
    const canEdit = await checkMenuEditPermission(companyId, res);
    if (!canEdit) return;

    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2, active = $3 WHERE id = $4 AND company_id = $5 RETURNING *',
      [name, description, active, id, companyId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta categoría (¿Pertenece al Corporativo?).' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  const companyId = getCompanyId(req);
  const { id } = req.params;
  try {
    const canEdit = await checkMenuEditPermission(companyId, res);
    if (!canEdit) return;

    const result = await pool.query('DELETE FROM categories WHERE id = $1 AND company_id = $2 RETURNING id', [id, companyId]);
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta categoría.' });
    }
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Ensure image column exists
pool.query('ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image TEXT').catch(console.error);

// Menu Item CRUD
router.post('/items', async (req, res) => {
  const companyId = getCompanyId(req);
  const { category_id, name, price, image, active } = req.body;
  try {
    const canEdit = await checkMenuEditPermission(companyId, res);
    if (!canEdit) return;

    const companyRes = await pool.query('SELECT plan FROM companies WHERE id = $1', [companyId]);
    const isFreemium = companyRes.rows[0]?.plan !== 'pro';
    if (isFreemium) {
      const countRes = await pool.query('SELECT COUNT(*) FROM menu_items WHERE company_id = $1', [companyId]);
      if (parseInt(countRes.rows[0].count, 10) >= 15) {
        return res.status(403).json({
          isLimitReached: true,
          limitType: 'dishes',
          error: '⚡ Has alcanzado el límite de 15 platillos del plan Freemium. Actualiza a la versión 👑 PRO para catálogo ilimitado.'
        });
      }
    }

    const result = await pool.query(
      'INSERT INTO menu_items (company_id, category_id, name, price, image, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [companyId, category_id, name, price, image || null, active ?? true]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/items/:id', async (req, res) => {
  const companyId = getCompanyId(req);
  const { id } = req.params;
  const { category_id, name, price, image, active } = req.body;
  try {
    const canEdit = await checkMenuEditPermission(companyId, res);
    if (!canEdit) return;

    const result = await pool.query(
      'UPDATE menu_items SET category_id = $1, name = $2, price = $3, image = $4, active = $5 WHERE id = $6 AND company_id = $7 RETURNING *',
      [category_id, name, price, image || null, active, id, companyId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para editar este platillo (¿Pertenece al Corporativo?).' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/items/:id', async (req, res) => {
  const companyId = getCompanyId(req);
  const { id } = req.params;
  try {
    const canEdit = await checkMenuEditPermission(companyId, res);
    if (!canEdit) return;

    const result = await pool.query('DELETE FROM menu_items WHERE id = $1 AND company_id = $2 RETURNING id', [id, companyId]);
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este platillo.' });
    }
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
