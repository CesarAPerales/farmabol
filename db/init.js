// db/init.js
// Crea las tablas y carga datos iniciales (un admin, un vendedor y productos de ejemplo).
// Se ejecuta una sola vez con: npm run init-db
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function init() {
  try {
    // 1. Crear tablas a partir del archivo schema.sql
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    const statements = schema.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    console.log('Tablas creadas correctamente.');

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
    console.log('Usuarios por defecto creados (admin / vendedor).');

    // 3. Cargar productos de ejemplo
    await pool.query(
      `INSERT OR IGNORE INTO productos (codigo, nombre, precio, stock, laboratorio) VALUES
        ('P001', 'Paracetamol 500mg', 5.50, 120, 'Bago'),
        ('P002', 'Ibuprofeno 400mg', 8.00, 3, 'Genfar'),
        ('P003', 'Amoxicilina 500mg', 15.00, 45, 'Bayer'),
        ('P004', 'Vitamina C 1g', 12.50, 4, 'Inti'),
        ('P005', 'Suero fisiologico', 10.00, 80, 'Inti')`
    );
    console.log('Productos de ejemplo cargados.');

    console.log('\nBase de datos lista. Ya puedes iniciar el sistema con: npm start');
    process.exit(0);
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err.message);
    process.exit(1);
  }
}

init();
