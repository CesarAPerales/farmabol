// src/middleware/auth.js
// Funciones para proteger rutas según si el usuario inició sesión y según su rol.

// Verifica que haya una sesión activa. Si no, redirige al login.
function requireLogin(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/login');
}

// Verifica que el usuario tenga rol ADMIN. El VENDEDOR no puede gestionar productos.
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.rol === 'ADMIN') {
    return next();
  }
  return res.status(403).render('error', {
    user: req.session.user,
    mensaje: 'Acceso denegado: esta sección es solo para administradores.'
  });
}

module.exports = { requireLogin, requireAdmin };
