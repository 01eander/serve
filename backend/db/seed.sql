-- Seed Initial Demo Company
INSERT INTO companies (name, email, password, currency, tax_rate, currency_configured, status, plan)
VALUES ('Demo Restaurant', 'demo@oleander.com', 'admin123', 'USD', 16.00, true, 'active', 'pro')
ON CONFLICT (email) DO NOTHING;

-- Seed Demo Users (Company ID 1)
INSERT INTO users (company_id, name, role, pin, active) 
VALUES 
  (1, 'Juan Pérez', 'mesero', '1234', true),
  (1, 'Ana Gómez', 'admin', '1234', true),
  (1, 'Carlos Ruiz', 'mesero', '4321', true)
ON CONFLICT DO NOTHING;

-- Seed Demo Categories (Company ID 1)
INSERT INTO categories (company_id, name, description, active) 
VALUES 
  (1, 'Bebidas', 'Refrescos, jugos, cervezas', true),
  (1, 'Desayunos', 'Huevos, chilaquiles, pan', true),
  (1, 'Platos Fuertes', 'Carnes, hamburguesas, pizzas', true),
  (1, 'Postres', 'Pasteles, helados', true),
  (1, 'Entradas', 'Sopas, ensaladas, botanas', true)
ON CONFLICT DO NOTHING;

-- Seed Demo Menu Items (Company ID 1)
INSERT INTO menu_items (company_id, category_id, name, price, active) 
VALUES 
  (1, 1, 'Cerveza Artesanal', 4.50, true),
  (1, 2, 'Café Americano', 2.00, true),
  (1, 3, 'Hamburguesa Clásica', 8.50, true),
  (1, 4, 'Tarta de Queso', 5.00, true),
  (1, 1, 'Jugo Natural', 3.00, true),
  (1, 3, 'Pizza Margarita', 10.00, true),
  (1, 3, 'Corte Ribeye 300g', 25.00, true),
  (1, 1, 'Agua Mineral', 2.50, true),
  (1, 5, 'Guacamole con Totopos', 6.00, true),
  (1, 5, 'Ensalada César', 7.50, true)
ON CONFLICT DO NOTHING;

-- Seed Demo Tables (Company ID 1)
INSERT INTO tables (company_id, table_number, capacity, status) 
VALUES 
  (1, '1', 4, 'available'),
  (1, '2', 2, 'available'),
  (1, '3', 6, 'available'),
  (1, '4', 4, 'occupied'),
  (1, '5', 8, 'available'),
  (1, 'Terraza 1', 4, 'available'),
  (1, 'VIP 1', 10, 'available')
ON CONFLICT DO NOTHING;
