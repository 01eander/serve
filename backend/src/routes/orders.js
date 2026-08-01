import express from 'express';
import pool from '../db.js';

const router = express.Router();

// Helper to get company_id from request
const getCompanyId = (req) => {
  return parseInt(req.headers['x-company-id'] || req.query.company_id || req.body?.company_id || '1', 10);
};

// Get active kitchen orders (pending, preparing, served)
router.get('/active', async (req, res) => {
  const companyId = getCompanyId(req);
  try {
    const ordersResult = await pool.query(`
      SELECT 
        o.id,
        o.table_id,
        t.table_number,
        o.status,
        o.is_printed,
        o.total_amount,
        o.waiter_id,
        u.name AS waiter_name,
        o.created_at,
        o.updated_at
      FROM orders o
      JOIN tables t ON o.table_id = t.id
      LEFT JOIN users u ON o.waiter_id = u.id
      WHERE (o.company_id = $1 OR o.company_id IS NULL) AND o.status IN ('pending', 'preparing', 'served')
      ORDER BY o.created_at ASC
    `, [companyId]);

    const orders = ordersResult.rows;

    if (orders.length === 0) {
      return res.json([]);
    }

    const orderIds = orders.map(o => o.id);
    const itemsResult = await pool.query(`
      SELECT 
        oi.id,
        oi.order_id,
        oi.menu_item_id,
        m.name AS item_name,
        oi.quantity,
        oi.unit_price,
        oi.notes
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ANY($1)
      ORDER BY oi.id ASC
    `, [orderIds]);

    const itemsByOrder = {};
    itemsResult.rows.forEach(item => {
      if (!itemsByOrder[item.order_id]) {
        itemsByOrder[item.order_id] = [];
      }
      itemsByOrder[item.order_id].push(item);
    });

    const populatedOrders = orders.map(order => ({
      ...order,
      items: itemsByOrder[order.id] || []
    }));

    res.json(populatedOrders);
  } catch (error) {
    console.error('Error fetching active orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get order history (recently paid orders)
router.get('/history', async (req, res) => {
  const companyId = getCompanyId(req);
  try {
    const ordersResult = await pool.query(`
      SELECT 
        o.id,
        o.table_id,
        t.table_number,
        o.status,
        o.payment_method,
        o.total_amount,
        o.tip_amount,
        o.discount_amount,
        o.created_at,
        o.updated_at
      FROM orders o
      LEFT JOIN tables t ON o.table_id = t.id
      WHERE (o.company_id = $1 OR o.company_id IS NULL) 
        AND o.status = 'paid'
      ORDER BY o.updated_at DESC
      LIMIT 100
    `, [companyId]);

    res.json(ordersResult.rows);
  } catch (error) {
    console.error('Error fetching order history:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create or update order (Send to Kitchen)
router.post('/', async (req, res) => {
  const { table_id, items, total_amount, waiter_id } = req.body;

  if (!table_id || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'table_id and items are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if table already has an active order
    const existingOrderRes = await client.query(
      `SELECT id, is_printed, waiter_id FROM orders WHERE table_id = $1 AND status IN ('pending', 'preparing', 'served') LIMIT 1`,
      [table_id]
    );

    let orderId;
    if (existingOrderRes.rows.length > 0) {
      if (existingOrderRes.rows[0].is_printed) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Order is printed and locked. Reopen the account to modify.' });
      }
      orderId = existingOrderRes.rows[0].id;
      // If order didn't have a waiter_id, assign it now
      const currentWaiterId = existingOrderRes.rows[0].waiter_id;
      const waiterQuery = currentWaiterId ? `` : `, waiter_id = $3`;
      const updateParams = currentWaiterId ? [total_amount || 0, orderId] : [total_amount || 0, orderId, waiter_id];

      // Delete previous items to re-insert updated cart
      await client.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);
      await client.query(
        `UPDATE orders SET total_amount = $1, status = 'pending', updated_at = CURRENT_TIMESTAMP${waiterQuery} WHERE id = $2`,
        updateParams
      );
    } else {
      const newOrderRes = await client.query(
        `INSERT INTO orders (table_id, status, total_amount, waiter_id) VALUES ($1, 'pending', $2, $3) RETURNING id`,
        [table_id, total_amount || 0, waiter_id || null]
      );
      orderId = newOrderRes.rows[0].id;
    }

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.id || item.menu_item_id, item.quantity, item.price || item.unit_price, item.notes || '']
      );
    }

    // Set table status to occupied
    await client.query(`UPDATE tables SET status = 'occupied' WHERE id = $1`, [table_id]);

    await client.query('COMMIT');

    res.status(201).json({ message: 'Order sent to kitchen', order_id: orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error saving order:', error);
    res.status(500).json({ error: 'Failed to save order' });
  } finally {
    client.release();
  }
});

// Update order status (Kitchen -> preparing / served / paid)
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, payment_method } = req.body;
  const companyId = getCompanyId(req);

  const validStatuses = ['pending', 'preparing', 'served', 'paid', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // If paying with cash, verify there is an open cash session first
    let sessionId = null;
    if (status === 'paid' && payment_method === 'cash') {
      const sessionRes = await client.query(
        `SELECT id FROM cash_drawer_sessions WHERE company_id = $1 AND status = 'open' LIMIT 1`,
        [companyId]
      );
      if (sessionRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Caja cerrada. Debes abrir caja antes de cobrar en efectivo.' });
      }
      sessionId = sessionRes.rows[0].id;
    }

    const orderRes = await client.query(
      `UPDATE orders SET status = $1, payment_method = COALESCE($2, payment_method), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING table_id, total_amount`,
      [status, payment_method, id]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const tableId = orderRes.rows[0].table_id;
    const totalAmount = orderRes.rows[0].total_amount;

    // Insert cash transaction if paid with cash
    if (status === 'paid' && payment_method === 'cash' && sessionId) {
      await client.query(
        `INSERT INTO cash_transactions (session_id, type, amount, description, order_id) 
         VALUES ($1, 'payment', $2, 'Pago de orden en efectivo', $3)`,
        [sessionId, totalAmount, id]
      );
    }

    // If paid or cancelled, free the table
    if (status === 'paid' || status === 'cancelled') {
      await client.query(`UPDATE tables SET status = 'available' WHERE id = $1`, [tableId]);
    }

    await client.query('COMMIT');
    res.json({ message: `Order status updated to ${status}`, order_id: id });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  } finally {
    client.release();
  }
});

// Pay order by table_id
router.patch('/table/:table_id/pay', async (req, res) => {
  const { table_id } = req.params;
  const { payment_method, tip_amount = 0, discount_amount = 0, final_total } = req.body;
  const companyId = getCompanyId(req);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // find active order for table
    const orderRes = await client.query(
      `SELECT id, total_amount FROM orders WHERE table_id = $1 AND status IN ('pending', 'preparing', 'served') LIMIT 1`,
      [table_id]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No active order found for table' });
    }
    const orderId = orderRes.rows[0].id;
    const actualTotal = final_total !== undefined ? final_total : orderRes.rows[0].total_amount;

    // Check cash session
    let sessionId = null;
    const needsCashSession = payment_method === 'cash' || (payment_method === 'card' && tip_amount > 0);
    
    if (needsCashSession) {
      const sessionRes = await client.query(
        `SELECT id FROM cash_drawer_sessions WHERE company_id = $1 AND status = 'open' LIMIT 1`,
        [companyId]
      );
      if (sessionRes.rows.length === 0) {
        await client.query('ROLLBACK');
        if (payment_method === 'card' && tip_amount > 0) {
          return res.status(400).json({ error: 'Caja cerrada. Debes abrir caja para poder registrar la salida de la propina en efectivo.' });
        }
        return res.status(400).json({ error: 'Caja cerrada. Debes abrir caja antes de cobrar en efectivo.' });
      }
      sessionId = sessionRes.rows[0].id;
    }

    // Update order
    await client.query(
      `UPDATE orders SET 
        status = 'paid', 
        payment_method = $1, 
        total_amount = $2,
        tip_amount = $3,
        discount_amount = $4,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5`,
      [payment_method, actualTotal, tip_amount, discount_amount, orderId]
    );

    // Insert cash tx for cash payment
    if (payment_method === 'cash' && sessionId) {
      await client.query(
        `INSERT INTO cash_transactions (session_id, type, amount, description, order_id) 
         VALUES ($1, 'payment', $2, 'Pago de orden en efectivo', $3)`,
        [sessionId, actualTotal, orderId]
      );
    }

    // Insert cash tx for card tip withdrawal
    if (payment_method === 'card' && tip_amount > 0 && sessionId) {
      await client.query(
        `INSERT INTO cash_transactions (session_id, type, amount, description, order_id) 
         VALUES ($1, 'withdrawal', $2, 'Propina pagada con tarjeta', $3)`,
        [sessionId, tip_amount, orderId]
      );
    }

    // Free table
    await client.query(`UPDATE tables SET status = 'available' WHERE id = $1`, [table_id]);

    await client.query('COMMIT');
    res.json({ message: 'Order paid successfully', order_id: orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error paying order by table:', error);
    res.status(500).json({ error: 'Failed to pay order' });
  } finally {
    client.release();
  }
});

// Mark order as printed by table_id
router.patch('/table/:table_id/print', async (req, res) => {
  const { table_id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `UPDATE orders SET is_printed = true, updated_at = CURRENT_TIMESTAMP WHERE table_id = $1 AND status IN ('pending', 'preparing', 'served') RETURNING id`,
      [table_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Active order not found for table' });
    res.json({ message: 'Order marked as printed', order_id: result.rows[0].id });
  } catch (error) {
    console.error('Error marking order as printed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// Reopen printed order by table_id
router.patch('/table/:table_id/reopen', async (req, res) => {
  const companyId = getCompanyId(req);
  const { table_id } = req.params;
  const client = await pool.connect();
  try {
    const companyRes = await client.query('SELECT plan FROM companies WHERE id = $1', [companyId]);
    if (companyRes.rows[0]?.plan !== 'pro') {
      return res.status(403).json({ error: 'Reabrir cuentas es una función exclusiva del plan PRO.' });
    }

    const result = await client.query(
      `UPDATE orders SET is_printed = false, updated_at = CURRENT_TIMESTAMP WHERE table_id = $1 AND status IN ('pending', 'preparing', 'served') RETURNING id`,
      [table_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Active order not found for table' });
    res.json({ message: 'Order reopened successfully', order_id: result.rows[0].id });
  } catch (error) {
    console.error('Error reopening order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// Transfer order to a new table
router.patch('/table/:table_id/transfer', async (req, res) => {
  const { table_id } = req.params;
  const { new_table_id } = req.body;
  const companyId = getCompanyId(req);

  if (!new_table_id) {
    return res.status(400).json({ error: 'new_table_id is required' });
  }

  const client = await pool.connect();
  try {
    const companyRes = await client.query('SELECT plan FROM companies WHERE id = $1', [companyId]);
    if (companyRes.rows[0]?.plan !== 'pro') {
      return res.status(403).json({ error: 'Traspasar mesas es una función exclusiva del plan PRO.' });
    }

    await client.query('BEGIN');

    // 1. Verify new table is available
    const newTableRes = await client.query(
      `SELECT status FROM tables WHERE id = $1 AND (company_id = $2 OR company_id IS NULL)`,
      [new_table_id, companyId]
    );

    if (newTableRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'New table not found' });
    }
    if (newTableRes.rows[0].status !== 'available') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'New table is not available' });
    }

    // 2. Find active order for current table
    const orderRes = await client.query(
      `SELECT id FROM orders WHERE table_id = $1 AND status IN ('pending', 'preparing', 'served') AND (company_id = $2 OR company_id IS NULL) LIMIT 1`,
      [table_id, companyId]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'No active order found on current table' });
    }

    const orderId = orderRes.rows[0].id;

    // 3. Move order to new table
    await client.query(
      `UPDATE orders SET table_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [new_table_id, orderId]
    );

    // 4. Update table statuses
    await client.query(`UPDATE tables SET status = 'available' WHERE id = $1`, [table_id]);
    await client.query(`UPDATE tables SET status = 'occupied' WHERE id = $1`, [new_table_id]);

    await client.query('COMMIT');
    res.json({ message: 'Table transferred successfully', order_id: orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error transferring table:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// Transfer order to a new waiter
router.patch('/table/:table_id/transfer-waiter', async (req, res) => {
  const { table_id } = req.params;
  const { new_waiter_id } = req.body;
  const companyId = getCompanyId(req);

  if (!new_waiter_id) {
    return res.status(400).json({ error: 'new_waiter_id is required' });
  }

  const client = await pool.connect();
  try {
    const companyRes = await client.query('SELECT plan FROM companies WHERE id = $1', [companyId]);
    if (companyRes.rows[0]?.plan !== 'pro') {
      return res.status(403).json({ error: 'Control de meseros es una función exclusiva del plan PRO.' });
    }

    const result = await client.query(
      `UPDATE orders 
       SET waiter_id = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE table_id = $2 AND status IN ('pending', 'preparing', 'served') AND (company_id = $3 OR company_id IS NULL) 
       RETURNING id`,
      [new_waiter_id, table_id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Active order not found for table' });
    }

    res.json({ message: 'Waiter transferred successfully', order_id: result.rows[0].id });
  } catch (error) {
    console.error('Error transferring waiter:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// Change payment method of a paid order
router.patch('/:id/payment-method', async (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;
  const companyId = getCompanyId(req);

  if (!['cash', 'card'].includes(payment_method)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  const client = await pool.connect();
  try {
    const companyRes = await client.query('SELECT plan FROM companies WHERE id = $1', [companyId]);
    if (companyRes.rows[0]?.plan !== 'pro') {
      return res.status(403).json({ error: 'Corregir métodos de pago es una función exclusiva del plan PRO.' });
    }

    await client.query('BEGIN');

    // 1. Get the current order
    const orderRes = await client.query(
      `SELECT id, payment_method, total_amount, tip_amount FROM orders WHERE id = $1 AND status = 'paid' AND (company_id = $2 OR company_id IS NULL)`,
      [id, companyId]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Paid order not found' });
    }

    const order = orderRes.rows[0];
    if (order.payment_method === payment_method) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Order is already using this payment method' });
    }

    // 2. We need the current open cash session
    const sessionRes = await client.query(
      `SELECT id FROM cash_drawer_sessions WHERE company_id = $1 AND status = 'open' LIMIT 1`,
      [companyId]
    );
    const sessionId = sessionRes.rows.length > 0 ? sessionRes.rows[0].id : null;

    if (!sessionId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No se puede cambiar el método de pago porque la caja de efectivo está cerrada.' });
    }

    // 3. Handle cash transactions based on the change
    if (order.payment_method === 'cash' && payment_method === 'card') {
      // CASH -> CARD
      // 1. Delete the 'payment' cash transaction for this order
      await client.query(`DELETE FROM cash_transactions WHERE order_id = $1 AND type = 'payment'`, [order.id]);
      
      // 2. If there is a tip, we must CREATE a 'withdrawal' cash transaction for the tip
      if (order.tip_amount > 0) {
        await client.query(
          `INSERT INTO cash_transactions (session_id, type, amount, description, order_id) 
           VALUES ($1, 'withdrawal', $2, 'Propina pagada con tarjeta (Corrección)', $3)`,
          [sessionId, order.tip_amount, order.id]
        );
      }
    } else if (order.payment_method === 'card' && payment_method === 'cash') {
      // CARD -> CASH
      // 1. Delete the 'withdrawal' cash transaction for the tip (if any)
      await client.query(`DELETE FROM cash_transactions WHERE order_id = $1 AND type = 'withdrawal'`, [order.id]);
      
      // 2. CREATE a 'payment' cash transaction for the total amount
      await client.query(
        `INSERT INTO cash_transactions (session_id, type, amount, description, order_id) 
         VALUES ($1, 'payment', $2, 'Pago de orden en efectivo (Corrección)', $3)`,
        [sessionId, order.total_amount, order.id]
      );
    }

    // 4. Update the order payment_method
    await client.query(
      `UPDATE orders SET payment_method = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [payment_method, order.id]
    );

    await client.query('COMMIT');
    res.json({ message: 'Payment method updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error changing payment method:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

export default router;
