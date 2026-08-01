import pool from '../src/db.js';

async function migrate() {
  try {
    console.log('Adding waiter_id to orders table...');
    await pool.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS waiter_id INT REFERENCES users(id) ON DELETE SET NULL;
    `);
    console.log('Migration successful.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    pool.end();
  }
}

migrate();
