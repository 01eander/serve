import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  try {
    console.log('Reading init_db.sql...');
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'init_db.sql'), 'utf-8');
    
    console.log('Applying schema...');
    await pool.query(schema);
    console.log('Schema applied successfully.');

    // Seed Data
    console.log('Seeding initial data...');
    
    // Users
    await pool.query(`
      INSERT INTO users (name, role, pin, active) 
      VALUES 
        ('Juan Pérez', 'mesero', '1234', true),
        ('Ana Gómez', 'admin', '5678', true),
        ('Carlos Ruiz', 'mesero', '4321', true),
        ('Sofía López', 'mesero', '1111', false),
        ('Miguel Soto', 'admin', '9999', true)
      ON CONFLICT DO NOTHING;
    `);

    // Categories
    await pool.query(`
      INSERT INTO categories (name, description, active) 
      VALUES 
        ('Bebidas', 'Refrescos, jugos, cervezas', true),
        ('Desayunos', 'Huevos, chilaquiles, pan', true),
        ('Platos Fuertes', 'Carnes, hamburguesas, pizzas', true),
        ('Postres', 'Pasteles, helados', true),
        ('Entradas', 'Sopas, ensaladas, botanas', true),
        ('Temporada', 'Especiales de mes', false)
      ON CONFLICT DO NOTHING;
    `);

    // Menu Items
    await pool.query(`
      INSERT INTO menu_items (category_id, name, price, active) 
      VALUES 
        (1, 'Cerveza Artesanal', 4.50, true),
        (2, 'Café Americano', 2.00, true),
        (3, 'Hamburguesa Clásica', 8.50, true),
        (4, 'Tarta de Queso', 5.00, true),
        (1, 'Jugo Natural', 3.00, true),
        (3, 'Pizza Margarita', 10.00, true),
        (3, 'Corte Ribeye 300g', 25.00, true),
        (1, 'Agua Mineral', 2.50, true),
        (5, 'Guacamole con Totopos', 6.00, true),
        (5, 'Ensalada César', 7.50, true),
        (4, 'Volcán de Chocolate', 6.50, false),
        (2, 'Chilaquiles Verdes', 7.00, true)
      ON CONFLICT DO NOTHING;
    `);

    // Tables
    await pool.query(`
      INSERT INTO tables (table_number, capacity, status) 
      VALUES 
        ('1', 4, 'available'),
        ('2', 2, 'available'),
        ('3', 6, 'available'),
        ('4', 4, 'occupied'),
        ('5', 8, 'available'),
        ('6', 2, 'reserved'),
        ('Terraza 1', 4, 'available'),
        ('Terraza 2', 4, 'available'),
        ('VIP 1', 10, 'available')
      ON CONFLICT (table_number) DO NOTHING;
    `);

    console.log('Data seeded successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    pool.end();
  }
}

seed();
