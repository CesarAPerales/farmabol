// src/app.js
// Punto de entrada del sistema FARMABOL.
const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const dashboardRoutes = require('./routes/dashboard');
const { requireLogin } = require('./middleware/auth');

const app = express();

// Configuración de vistas (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares para leer formularios y archivos estáticos
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'farmabol-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Rutas
app.use('/', authRoutes);
app.use('/productos', productosRoutes);
app.use('/ventas', ventasRoutes);
app.use('/dashboard', dashboardRoutes);

// La raíz redirige al dashboard
app.get('/', requireLogin, (req, res) => res.redirect('/dashboard'));

// Manejo de error 404
app.use((req, res) => {
  res.status(404).render('error', {
    user: req.session.user,
    mensaje: 'Página no encontrada.'
  });
});

const PORT = process.env.PORT || 3000;

// Inicializa la base de datos (crea tablas y datos si no existen) y luego
// arranca el servidor. Esto permite que funcione en la nube sin pasos manuales.
const { setupDatabase } = require('../db/setup');

setupDatabase()
  .then(() => {
    console.log('Base de datos lista.');
    app.listen(PORT, () => {
      console.log(`Servidor FARMABOL corriendo en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('No se pudo inicializar la base de datos:', err.message);
    process.exit(1);
  });
