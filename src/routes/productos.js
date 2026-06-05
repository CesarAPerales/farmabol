// src/routes/productos.js
// CRUD completo de productos. Solo el ADMIN puede crear, editar y eliminar.
const express = require('express');
const pool = require('../config/db');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Listar productos (cualquier usuario logueado puede ver el stock)
router.get('/', requireLogin, async (req, res) => {
  const [productos] = await pool.query('SELECT * FROM productos ORDER BY nombre');
  res.render('productos', { user: req.session.user, productos });
});

// Formulario para crear producto nuevo (solo admin)
router.get('/nuevo', requireLogin, requireAdmin, (req, res) => {
  res.render('producto_form', { user: req.session.user, producto: null });
});

// Guardar producto nuevo
router.post('/nuevo', requireLogin, requireAdmin, async (req, res) => {
  const { codigo, nombre, precio, stock, laboratorio } = req.body;
  await pool.query(
    'INSERT INTO productos (codigo, nombre, precio, stock, laboratorio) VALUES (?, ?, ?, ?, ?)',
    [codigo, nombre, Number(precio), parseInt(stock, 10), laboratorio || null]
  );
  res.redirect('/productos');
});

// Formulario para editar (solo admin)
router.get('/editar/:id', requireLogin, requireAdmin, async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [parseInt(req.params.id, 10)]);
  if (rows.length === 0) return res.redirect('/productos');
  res.render('producto_form', { user: req.session.user, producto: rows[0] });
});

// Guardar cambios de edición
router.post('/editar/:id', requireLogin, requireAdmin, async (req, res) => {
  const { codigo, nombre, precio, stock, laboratorio } = req.body;
  await pool.query(
    'UPDATE productos SET codigo=?, nombre=?, precio=?, stock=?, laboratorio=? WHERE id=?',
    [codigo, nombre, Number(precio), parseInt(stock, 10), laboratorio || null, parseInt(req.params.id, 10)]
  );
  res.redirect('/productos');
});

// Eliminar producto (solo admin)
router.post('/eliminar/:id', requireLogin, requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM productos WHERE id = ?', [parseInt(req.params.id, 10)]);
  res.redirect('/productos');
});

module.exports = router;
