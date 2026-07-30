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
        o.total_amount,
        o.created_at,
        o.updated_at
      FROM orders o
      JOIN tables t ON o.table_id = t.id
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

// Create or update order (Send to Kitchen)
router.post('/', async (req, res) => {
  const { table_id, items, total_amount } = req.body;

  if (!table_id || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: 'table_id and items are required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if table already has an active order
    const existingOrderRes = await client.query(
      `SELECT id FROM orders WHERE table_id = $1 AND status IN ('pending', 'preparing', 'served') LIMIT 1`,
      [table_id]
    );

    let orderId;
    if (existingOrderRes.rows.length > 0) {
      orderId = existingOrderRes.rows[0].id;
      // Delete previous items to re-insert updated cart
      await client.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);
      await client.query(
        `UPDATE orders SET total_amount = $1, status = 'pending', updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [total_amount || 0, orderId]
      );
    } else {
      const newOrderRes = await client.query(
        `INSERT INTO orders (table_id, status, total_amount) VALUES ($1, 'pending', $2) RETURNING id`,
        [table_id, total_amount || 0]
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
  const { status } = req.body;

  const validStatuses = ['pending', 'preparing', 'served', 'paid', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING table_id`,
      [status, id]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Order not found' });
    }

    const tableId = orderRes.rows[0].table_id;

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

export default router;
