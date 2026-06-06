// db/init.js
// Crea las tablas y carga datos iniciales (un admin, un vendedor y productos de ejemplo).
// Se ejecuta manualmente con: npm run init-db
const { setupDatabase } = require('./setup');

(async () => {
  try {
    await setupDatabase();
    console.log('Tablas creadas correctamente.');
    console.log('Usuarios por defecto creados (admin / vendedor).');
    console.log('Productos de ejemplo cargados.');
    console.log('\nBase de datos lista. Ya puedes iniciar el sistema con: npm start');
    process.exit(0);
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err.message);
    process.exit(1);
  }
})();
