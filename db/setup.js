// db/setup.js
// Función reutilizable que crea las tablas y carga datos de ejemplo si no existen.
// La usan tanto db/init.js (manual) como src/app.js (automático al arrancar).
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function setupDatabase() {
  // 1. Crear tablas a partir del archivo schema.sql
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const statements = schema.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await pool.query(stmt);
  }

  // 2. Crear usuarios por defecto (solo si no existen)
  const adminPass = await bcrypt.hash('admin123', 10);
  const vendPass = await bcrypt.hash('vendedor123', 10);
  await pool.query(
    `INSERT OR IGNORE INTO usuarios (usuario, password, rol) VALUES (?, ?, ?)`,
    ['admin', adminPass, 'ADMIN']
  );
  await pool.query(
    `INSERT OR IGNORE INTO usuarios (usuario, password, rol) VALUES (?, ?, ?)`,
    ['vendedor', vendPass, 'VENDEDOR']
  );

  // 3. Cargar productos de ejemplo
  await pool.query(
    `INSERT OR IGNORE INTO productos (codigo, nombre, precio, stock, laboratorio) VALUES
      ('P001', 'Paracetamol 500mg', 5.50, 120, 'Bago'),
      ('P002', 'Ibuprofeno 400mg', 8.00, 3, 'Genfar'),
      ('P003', 'Amoxicilina 500mg', 15.00, 45, 'Bayer'),
      ('P004', 'Vitamina C 1g', 12.50, 4, 'Inti'),
      ('P005', 'Suero fisiologico', 10.00, 80, 'Inti')`
  );
}

module.exports = { setupDatabase };
