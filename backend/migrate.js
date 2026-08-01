import pool from './src/db.js';

async function migrate() {
  const sql = `
    CREATE TABLE IF NOT EXISTS invoices (
        id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        order_id INT NOT NULL REFERENCES orders(id),
        company_id INT NOT NULL,
        rfc VARCHAR(20) NOT NULL,
        razon_social VARCHAR(255) NOT NULL,
        cp VARCHAR(10) NOT NULL,
        regimen_fiscal VARCHAR(100) NOT NULL,
        uso_cfdi VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(sql);
    console.log('invoices table created successfully');
  } catch (err) {
    console.error('Error creating invoices table:', err);
  } finally {
    pool.end();
  }
}

migrate();
