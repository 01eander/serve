import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET: Fetch order details for public portal
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const query = `
      SELECT o.id, o.total_amount as total, o.status, o.created_at
      FROM orders o
      WHERE o.id = $1
    `;
    const orderRes = await db.query(query, [orderId]);
    
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const order = orderRes.rows[0];
    
    const taxRate = 0.16;
    const subtotal = order.total / (1 + taxRate);
    const tax = order.total - subtotal;

    const invQuery = `SELECT * FROM invoices WHERE order_id = $1`;
    const invRes = await db.query(invQuery, [orderId]);
    if (invRes.rows.length > 0) {
      return res.status(400).json({ error: 'Esta orden ya ha sido facturada o está en proceso.' });
    }

    res.json({
      order: {
        id: order.id,
        total: order.total,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        status: order.status,
        date: order.created_at
      }
    });

  } catch (error) {
    console.error('Error fetching order for invoice:', error);
    res.status(500).json({ error: 'Error al obtener la orden' });
  }
});

// POST: Request an invoice (Public)
router.post('/request', async (req, res) => {
  try {
    const { orderId, rfc, razonSocial, cp, regimenFiscal, usoCfdi, email } = req.body;

    if (!orderId || !rfc || !razonSocial || !cp || !regimenFiscal || !usoCfdi || !email) {
      return res.status(400).json({ error: 'Faltan datos requeridos para facturar' });
    }

    const orderRes = await db.query('SELECT status FROM orders WHERE id = $1', [orderId]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (orderRes.rows[0].status !== 'paid') {
      return res.status(400).json({ error: 'La orden debe estar cobrada para poder facturarse' });
    }

    const insertQuery = `
      INSERT INTO invoices (order_id, company_id, rfc, razon_social, cp, regimen_fiscal, uso_cfdi, email, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, status
    `;
    
    // Asumimos company_id = 1 para el MVP B2B2C simplificado
    const companyId = 1; 

    const result = await db.query(insertQuery, [
      orderId, 
      companyId, 
      rfc, 
      razonSocial, 
      cp, 
      regimenFiscal, 
      usoCfdi, 
      email, 
      'generated' // Simulating instant success
    ]);

    res.json({ success: true, invoice: result.rows[0], message: 'Factura generada y enviada exitosamente.' });
  } catch (error) {
    console.error('Error requesting invoice:', error);
    if (error.code === '23505') {
       return res.status(400).json({ error: 'Esta orden ya fue facturada' });
    }
    res.status(500).json({ error: 'Error al generar la factura' });
  }
});

// GET: Admin fetch all invoices
router.get('/', async (req, res) => {
  try {
    const companyId = req.headers['x-company-id'];
    if (!companyId) return res.status(400).json({ error: 'Company ID requerido' });

    // Enforce PRO plan restriction
    const companyRes = await db.query('SELECT plan FROM companies WHERE id = $1', [companyId]);
    if (companyRes.rows.length === 0) {
      return res.status(404).json({ error: 'Empresa no encontrada' });
    }
    if (companyRes.rows[0].plan !== 'pro') {
      return res.status(403).json({ error: 'Facturación exclusiva para plan PRO' });
    }

    const query = `
      SELECT i.*, o.total_amount as total
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      WHERE i.company_id = $1
      ORDER BY i.created_at DESC
    `;
    const result = await db.query(query, [companyId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Error al obtener facturas' });
  }
});

export default router;
