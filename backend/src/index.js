import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import usersRouter from './routes/users.js';
import tablesRouter from './routes/tables.js';
import menuRouter from './routes/menu.js';
import ordersRouter from './routes/orders.js';
import promotionsRouter from './routes/promotions.js';
import companiesRouter from './routes/companies.js';
import dashboardRouter from './routes/dashboard.js';
import masterRouter from './routes/master.js';
import cashRouter from './routes/cash.js';
import invoicesRouter from './routes/invoices.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/companies', companiesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/master', masterRouter);
app.use('/api/users', usersRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/cash', cashRouter);
app.use('/api/invoices', invoicesRouter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      db: 'connected',
      time: dbResult.rows[0].now
    });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({
      status: 'error',
      db: 'disconnected',
      error: err.message
    });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
