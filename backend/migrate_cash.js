import pool from './src/db.js';

async function migrate() {
  try {
    console.log('Running cash management migration...');
    
    // Add payment_method to orders
    console.log('Adding payment_method to orders...');
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash';
    `);

    // Create cash_drawer_sessions
    console.log('Creating cash_drawer_sessions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cash_drawer_sessions (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          company_id INT NOT NULL,
          opened_by INT REFERENCES users(id),
          opened_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          closed_at TIMESTAMPTZ,
          initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
          final_balance DECIMAL(10, 2),
          status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed'))
      );
    `);

    // Create cash_transactions
    console.log('Creating cash_transactions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cash_transactions (
          id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          session_id INT NOT NULL REFERENCES cash_drawer_sessions(id) ON DELETE CASCADE,
          type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment')),
          amount DECIMAL(10, 2) NOT NULL,
          description TEXT,
          user_id INT REFERENCES users(id),
          order_id INT REFERENCES orders(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
