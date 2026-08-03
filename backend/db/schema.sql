-- OLEANDER SERVE - COMPLETE DATABASE SCHEMA FOR POSTGRESQL (NEON / RENDER)

-- Companies table (Multi-tenancy & SaaS Management)
CREATE TABLE IF NOT EXISTS companies (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    tax_rate DECIMAL(5, 2) DEFAULT 0.00,
    currency_configured BOOLEAN DEFAULT false,
    default_language VARCHAR(10) DEFAULT 'es',
    status VARCHAR(50) DEFAULT 'active',
    plan VARCHAR(50) DEFAULT 'freemium',
    billing_notes TEXT,
    billing_due_date TIMESTAMPTZ,
    parent_company_id INT REFERENCES companies(id),
    is_franchise_parent BOOLEAN DEFAULT false,
    allow_child_menu_edit BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Users (Waiters & Admins)
CREATE TABLE IF NOT EXISTS users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('mesero', 'admin')),
    pin VARCHAR(10) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    image TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tables
CREATE TABLE IF NOT EXISTS tables (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    table_number VARCHAR(10) NOT NULL,
    capacity INT,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved'))
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    table_id INT REFERENCES tables(id) ON DELETE SET NULL,
    waiter_id INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'served', 'paid', 'cancelled')),
    total_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(20) DEFAULT 'cash',
    tip_amount DECIMAL(10, 2) DEFAULT 0.00,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    is_printed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Promotions
CREATE TABLE IF NOT EXISTS promotions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('category', 'item')),
    target_id INT NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percent', 'fixed_price')),
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date DATE,
    end_date DATE,
    happy_hour_start TIME,
    happy_hour_end TIME,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cash Drawer Sessions
CREATE TABLE IF NOT EXISTS cash_drawer_sessions (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    opened_by INT REFERENCES users(id),
    opened_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMPTZ,
    initial_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    final_balance DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

-- Cash Transactions
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

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id),
    company_id INT REFERENCES companies(id) ON DELETE CASCADE,
    rfc VARCHAR(20) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    cp VARCHAR(10) NOT NULL,
    regimen_fiscal VARCHAR(100) NOT NULL,
    uso_cfdi VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_tables_company ON tables(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(company_id);
