import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Helper to get company_id from request
const getCompanyId = (req) => {
  return parseInt(req.headers['x-company-id'] || req.query.company_id || req.body?.company_id || '1', 10);
};

// GET current open session
router.get('/current', async (req, res) => {
  const companyId = getCompanyId(req);
  try {
    const sessionRes = await pool.query(
      `SELECT * FROM cash_drawer_sessions WHERE company_id = $1 AND status = 'open' LIMIT 1`,
      [companyId]
    );

    if (sessionRes.rows.length === 0) {
      return res.json({ session: null });
    }

    const session = sessionRes.rows[0];

    const transactionsRes = await pool.query(
      `SELECT * FROM cash_transactions WHERE session_id = $1 ORDER BY created_at DESC`,
      [session.id]
    );

    let currentBalance = parseFloat(session.initial_balance);
    const transactions = transactionsRes.rows;

    transactions.forEach(t => {
      const amount = parseFloat(t.amount);
      if (t.type === 'deposit' || t.type === 'payment') {
        currentBalance += amount;
      } else if (t.type === 'withdrawal') {
        currentBalance -= amount;
      }
    });

    res.json({
      session: {
        ...session,
        current_balance: currentBalance,
      },
      transactions
    });
  } catch (error) {
    console.error('Error fetching current cash session:', error);
    res.status(500).json({ error: 'Failed to fetch current cash session' });
  }
});

// POST open a new session
router.post('/open', async (req, res) => {
  const companyId = getCompanyId(req);
  const { initial_balance, user_id } = req.body;

  try {
    // Check if one is already open
    const openRes = await pool.query(
      `SELECT id FROM cash_drawer_sessions WHERE company_id = $1 AND status = 'open'`,
      [companyId]
    );
    if (openRes.rows.length > 0) {
      return res.status(400).json({ error: 'There is already an open cash session for this company.' });
    }

    const newSessionRes = await pool.query(
      `INSERT INTO cash_drawer_sessions (company_id, opened_by, initial_balance) 
       VALUES ($1, $2, $3) RETURNING *`,
      [companyId, user_id || null, initial_balance || 0]
    );

    res.status(201).json({ message: 'Cash session opened', session: newSessionRes.rows[0] });
  } catch (error) {
    console.error('Error opening cash session:', error);
    res.status(500).json({ error: 'Failed to open cash session' });
  }
});

// POST close the current session
router.post('/close', async (req, res) => {
  const companyId = getCompanyId(req);
  const { final_balance } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const openRes = await client.query(
      `SELECT id FROM cash_drawer_sessions WHERE company_id = $1 AND status = 'open' LIMIT 1 FOR UPDATE`,
      [companyId]
    );

    if (openRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No open cash session found.' });
    }

    const sessionId = openRes.rows[0].id;

    await client.query(
      `UPDATE cash_drawer_sessions 
       SET status = 'closed', closed_at = CURRENT_TIMESTAMP, final_balance = $1
       WHERE id = $2`,
      [final_balance, sessionId]
    );

    await client.query('COMMIT');
    res.json({ message: 'Cash session closed successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error closing cash session:', error);
    res.status(500).json({ error: 'Failed to close cash session' });
  } finally {
    client.release();
  }
});

// POST add transaction to current session
router.post('/transaction', async (req, res) => {
  const companyId = getCompanyId(req);
  const { type, amount, description, user_id } = req.body;

  if (!['deposit', 'withdrawal'].includes(type)) {
    return res.status(400).json({ error: 'Invalid transaction type' });
  }

  const client = await pool.connect();
  try {
    const companyRes = await client.query('SELECT plan FROM companies WHERE id = $1', [companyId]);
    if (companyRes.rows[0]?.plan !== 'pro') {
      return res.status(403).json({ error: 'Control avanzado de caja (retiros y depósitos manuales) es una función exclusiva del plan PRO.' });
    }

    await client.query('BEGIN');

    const openRes = await client.query(
      `SELECT id FROM cash_drawer_sessions WHERE company_id = $1 AND status = 'open' LIMIT 1`,
      [companyId]
    );

    if (openRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No open cash session to add transaction to.' });
    }

    const sessionId = openRes.rows[0].id;

    const newTxRes = await client.query(
      `INSERT INTO cash_transactions (session_id, type, amount, description, user_id) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [sessionId, type, amount, description || '', user_id || null]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Transaction added', transaction: newTxRes.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding transaction:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  } finally {
    client.release();
  }
});

export default router;
