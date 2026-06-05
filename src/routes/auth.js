// src/routes/auth.js
// Maneja el inicio y cierre de sesión.
const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const router = express.Router();

// Muestra el formulario de login
router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.render('login', { error: null });
});

// Procesa el login
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    if (rows.length === 0) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos.' });
    }
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.render('login', { error: 'Usuario o contraseña incorrectos.' });
    }
    // Guardamos solo lo necesario en la sesión
    req.session.user = { id: user.id, usuario: user.usuario, rol: user.rol };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Error en el servidor. Intenta de nuevo.' });
  }
});

// Cierra la sesión
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;
