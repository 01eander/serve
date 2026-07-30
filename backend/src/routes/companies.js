import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Auto-create companies table & migrate existing tables to support company_id multi-tenancy
async function initMultiTenancy() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        tax_rate DECIMAL(5, 2) DEFAULT 0.00,
        currency_configured BOOLEAN DEFAULT false,
        default_language VARCHAR(10) DEFAULT 'es',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add company_id to all relevant tables if missing
    const tablesToMigrate = ['users', 'tables', 'categories', 'menu_items', 'orders', 'promotions'];
    for (const tableName of tablesToMigrate) {
      await pool.query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS company_id INT`);
    }

    // Add status, plan, billing_notes columns to companies table
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'`);
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'freemium'`);
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS billing_notes TEXT`);
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS billing_due_date TIMESTAMPTZ`);
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS default_language VARCHAR(10) DEFAULT 'es'`);
    
    // Franchise Module columns
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS parent_company_id INT REFERENCES companies(id)`);
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_franchise_parent BOOLEAN DEFAULT false`);
    await pool.query(`ALTER TABLE companies ADD COLUMN IF NOT EXISTS allow_child_menu_edit BOOLEAN DEFAULT true`);

    // Drop legacy single-column UNIQUE constraint on table_number so each company can have Mesa 1, 2, etc.
    await pool.query(`ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_table_number_key`);

    // Check if demo company exists, if not seed it
    const checkCompany = await pool.query('SELECT COUNT(*) FROM companies');
    if (parseInt(checkCompany.rows[0].count, 10) === 0) {
      const demoRes = await pool.query(`
        INSERT INTO companies (name, email, password, currency, tax_rate, currency_configured, status, plan)
        VALUES ('Restaurante Demo Oleander', 'demo@oleander.com', 'admin123', 'USD', 0, true, 'active', 'pro')
        RETURNING id
      `);
      const demoId = demoRes.rows[0].id;

      // Assign existing orphaned records to demo company
      for (const tableName of tablesToMigrate) {
        await pool.query(`UPDATE ${tableName} SET company_id = $1 WHERE company_id IS NULL`, [demoId]);
      }
    }
  } catch (err) {
    console.error('Multi-tenancy initialization error:', err);
  }
}

initMultiTenancy();

// Register a new company (Darse de alta como empresa)
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // Check if email already exists
    const check = await pool.query('SELECT id FROM companies WHERE email = $1', [email.toLowerCase().trim()]);
    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe una empresa registrada con este correo electrónico' });
    }

    // Insert new company (Default: active, freemium)
    const companyRes = await pool.query(`
      INSERT INTO companies (name, email, password, currency_configured, status, plan)
      VALUES ($1, $2, $3, false, 'active', 'freemium')
      RETURNING *
    `, [name.trim(), email.toLowerCase().trim(), password]);

    const company = companyRes.rows[0];

    // Automatically create ONLY 1 Admin user with PIN 1234 (no tables, no categories, no menu items)
    await pool.query(`
      INSERT INTO users (company_id, name, role, pin, active)
      VALUES ($1, 'Administrador Principal', 'admin', '1234', true)
    `, [company.id]);

    res.json({
      message: 'Empresa registrada con éxito',
      company,
      defaultAdmin: { name: 'Administrador Principal', pin: '1234' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login for company (Autenticación por Correo / Contraseña)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Ingresa correo y contraseña' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check Master Admin (Oleander Software SuperAdmin)
  if ((cleanEmail === 'oleander' || cleanEmail === 'oleander.gf@gmail.com') && password === 'admin123') {
    return res.json({
      isMasterAdmin: true,
      company: {
        id: 0,
        name: 'Oleander Software Master SuperAdmin',
        email: 'oleander.gf@gmail.com',
        currency: 'USD',
        tax_rate: 0,
        currency_configured: true,
        status: 'active',
        plan: 'master'
      }
    });
  }

  try {
    const result = await pool.query('SELECT * FROM companies WHERE email = $1 AND password = $2', [cleanEmail, password]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña de empresa incorrectos' });
    }

    const company = result.rows[0];

    // Check account status (Lockout for moroso/disabled companies)
    if (company.status === 'moroso' || company.status === 'disabled') {
      return res.status(403).json({ 
        error: '⚠️ Cuenta Suspendida por la Administración de Oleander Software (Estado: Cliente Moroso / Inactivo). Por favor contacte al soporte para regularizar su servicio.' 
      });
    }

    res.json({ company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ensure logo, address, ticket_footer_phrase columns exist
pool.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo TEXT').catch(console.error);
pool.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT').catch(console.error);
pool.query('ALTER TABLE companies ADD COLUMN IF NOT EXISTS ticket_footer_phrase TEXT').catch(console.error);

// Update company settings (Nombre, Logo, Dirección, Frase de Ticket, Moneda e Impuestos)
router.put('/:id/config', async (req, res) => {
  const { id } = req.params;
  const { name, logo, address, ticket_footer_phrase, currency, tax_rate, default_language } = req.body;

  try {
    const companyRes = await pool.query('SELECT plan FROM companies WHERE id = $1', [id]);
    const isFreemium = companyRes.rows[0]?.plan !== 'pro';

    if (isFreemium && (logo || address || ticket_footer_phrase)) {
      return res.status(403).json({
        isLimitReached: true,
        error: '⚡ Personalizar el Logotipo, Dirección del local y Frase del Ticket es una función exclusiva del plan 👑 PRO. Actualiza a la versión PRO para desbloquear la personalización de marca.'
      });
    }

    const result = await pool.query(`
      UPDATE companies 
      SET 
        name = COALESCE($1, name),
        logo = COALESCE($2, logo),
        address = COALESCE($3, address),
        ticket_footer_phrase = COALESCE($4, ticket_footer_phrase),
        currency = COALESCE($5, currency),
        tax_rate = COALESCE($6, tax_rate),
        currency_configured = true,
        default_language = COALESCE($7, default_language)
      WHERE id = $8
      RETURNING *
    `, [
      name || null, 
      logo || null, 
      address !== undefined ? address : null, 
      ticket_footer_phrase !== undefined ? ticket_footer_phrase : null, 
      currency || null, 
      tax_rate !== undefined ? tax_rate : null,
      default_language || null,
      id
    ]);

    res.json({ company: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get company details by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Franchise Endpoints ---

// 1. Enable Franchise Mode (Only for PRO)
router.patch('/:id/franchise/enable', async (req, res) => {
  const { id } = req.params;
  try {
    const companyRes = await pool.query('SELECT plan FROM companies WHERE id = $1', [id]);
    if (companyRes.rows[0]?.plan !== 'pro') {
      return res.status(403).json({ error: 'Franchise mode is exclusively for PRO accounts.' });
    }
    const result = await pool.query(
      'UPDATE companies SET is_franchise_parent = true WHERE id = $1 RETURNING *',
      [id]
    );
    res.json({ company: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Toggle Menu Permissions for Children
router.patch('/:id/franchise/menu-permissions', async (req, res) => {
  const { id } = req.params;
  const { allow_child_menu_edit } = req.body;
  try {
    const result = await pool.query(
      'UPDATE companies SET allow_child_menu_edit = $1 WHERE id = $2 AND is_franchise_parent = true RETURNING *',
      [allow_child_menu_edit, id]
    );
    res.json({ company: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get all branches for a franchise parent
router.get('/:id/branches', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM companies WHERE parent_company_id = $1 ORDER BY id ASC', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create a new branch under a franchise parent
router.post('/:id/branches', async (req, res) => {
  const parentId = req.params.id;
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if parent is PRO and is_franchise_parent
    const parentRes = await client.query('SELECT plan, is_franchise_parent FROM companies WHERE id = $1', [parentId]);
    if (parentRes.rows[0]?.plan !== 'pro' || !parentRes.rows[0]?.is_franchise_parent) {
      throw new Error('Only PRO franchise parents can create branches');
    }

    const checkEmail = await client.query('SELECT id FROM companies WHERE email = $1', [email.toLowerCase().trim()]);
    if (checkEmail.rows.length > 0) {
      throw new Error('Email already in use');
    }

    // Create branch (inherits pro status typically? Let's leave as freemium or active depending on billing. For now, active.)
    const newCompanyRes = await client.query(`
      INSERT INTO companies (name, email, password, parent_company_id, currency_configured, status, plan)
      VALUES ($1, $2, $3, $4, false, 'active', 'freemium')
      RETURNING *
    `, [name.trim(), email.toLowerCase().trim(), password, parentId]);
    
    const newCompany = newCompanyRes.rows[0];

    // Create default admin for branch
    await client.query(`
      INSERT INTO users (company_id, name, role, pin, active)
      VALUES ($1, 'Admin Sucursal', 'admin', '1234', true)
    `, [newCompany.id]);

    await client.query('COMMIT');
    res.json({ message: 'Branch created successfully', company: newCompany });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 5. Global Franchise Stats
router.get('/:id/franchise/stats', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Get Branches
    const branchesRes = await pool.query('SELECT id, name FROM companies WHERE parent_company_id = $1 OR id = $1', [id]);
    const branchIds = branchesRes.rows.map(b => b.id);
    
    if (branchIds.length === 0) return res.json({ totalSales: 0, activeTables: 0, branches: [] });

    // 2. Active Tables (where status is occupied)
    const tablesRes = await pool.query(`
      SELECT company_id, COUNT(*) as active_tables 
      FROM tables 
      WHERE company_id = ANY($1) AND status = 'occupied' 
      GROUP BY company_id
    `, [branchIds]);

    // 3. Today's Sales (Orders paid today)
    const salesRes = await pool.query(`
      SELECT company_id, SUM(total_amount) as total_sales
      FROM orders
      WHERE company_id = ANY($1) AND status = 'paid' AND created_at >= CURRENT_DATE
      GROUP BY company_id
    `, [branchIds]);

    // Aggregate
    const statsByBranch = branchesRes.rows.map(branch => {
      const activeTables = parseInt(tablesRes.rows.find(t => t.company_id === branch.id)?.active_tables || 0, 10);
      const totalSales = parseFloat(salesRes.rows.find(s => s.company_id === branch.id)?.total_sales || 0);
      return { id: branch.id, name: branch.name, activeTables, totalSales };
    });

    const globalSales = statsByBranch.reduce((sum, b) => sum + b.totalSales, 0);
    const globalTables = statsByBranch.reduce((sum, b) => sum + b.activeTables, 0);

    res.json({
      globalSales,
      globalTables,
      branches: statsByBranch
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
