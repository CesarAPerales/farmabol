// src/routes/ventas.js
// Registro de ventas. Al vender, se descuenta el stock automáticamente.
// Esta es la versión REFACTORIZADA del código (ver README, sección refactorización).
const express = require('express');
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();

// Muestra el formulario de venta con la lista de productos disponibles
router.get('/', requireLogin, async (req, res) => {
  const [productos] = await pool.query('SELECT * FROM productos WHERE stock > 0 ORDER BY nombre');
  const [ventas] = await pool.query(
    `SELECT v.id, p.nombre, v.cantidad, v.total, v.fecha
     FROM ventas v JOIN productos p ON v.producto_id = p.id
     ORDER BY v.fecha DESC LIMIT 20`
  );
  res.render('ventas', { user: req.session.user, productos, ventas, error: null });
});

// --- Funciones pequeñas extraídas tras refactorizar (Extract Method) ---

// Busca un producto y valida que exista
async function obtenerProducto(productoId) {
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [parseInt(productoId, 10)]);
  return rows[0] || null;
}

// Valida que haya stock suficiente para la cantidad pedida
function hayStockSuficiente(producto, cantidad) {
  return producto.stock >= cantidad && cantidad > 0;
}

// Registra la venta y descuenta el stock dentro de una transacción
async function registrarVenta(producto, cantidad, usuarioId) {
  const total = producto.precio * cantidad;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      'INSERT INTO ventas (producto_id, cantidad, total, usuario_id) VALUES (?, ?, ?, ?)',
      [producto.id, cantidad, total, usuarioId]
    );
    await conn.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, producto.id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Procesa una nueva venta
router.post('/', requireLogin, async (req, res) => {
  const { producto_id, cantidad } = req.body;
  const cant = parseInt(cantidad, 10);

  const producto = await obtenerProducto(producto_id);
  if (!producto) {
    return res.redirect('/ventas');
  }
  if (!hayStockSuficiente(producto, cant)) {
    const [productos] = await pool.query('SELECT * FROM productos WHERE stock > 0 ORDER BY nombre');
    const [ventas] = await pool.query(
      `SELECT v.id, p.nombre, v.cantidad, v.total, v.fecha
       FROM ventas v JOIN productos p ON v.producto_id = p.id
       ORDER BY v.fecha DESC LIMIT 20`
    );
    return res.render('ventas', {
      user: req.session.user, productos, ventas,
      error: `Stock insuficiente. Disponible: ${producto.stock}`
    });
  }

  await registrarVenta(producto, cant, req.session.user.id);
  res.redirect('/ventas');
});

module.exports = router;
