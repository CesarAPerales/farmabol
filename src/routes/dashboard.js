// src/routes/dashboard.js
// Dashboard que muestra productos con stock bajo (<5 unidades) y el total de ventas del día.
const express = require('express');
const pool = require('../config/db');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireLogin, async (req, res) => {
  // Productos con stock bajo
  const [stockBajo] = await pool.query('SELECT * FROM productos WHERE stock < 5 ORDER BY stock ASC');

  // Total de ventas del día de hoy
  const [[resumen]] = await pool.query(
    `SELECT COALESCE(SUM(total), 0) AS total_dia, COUNT(*) AS num_ventas
     FROM ventas WHERE date(fecha) = date('now','localtime')`
  );

  // Totales generales
  const [[inventario]] = await pool.query(
    'SELECT COUNT(*) AS total_productos, COALESCE(SUM(stock),0) AS unidades FROM productos'
  );

  res.render('dashboard', {
    user: req.session.user,
    stockBajo,
    totalDia: resumen.total_dia,
    numVentas: resumen.num_ventas,
    inventario
  });
});

module.exports = router;
