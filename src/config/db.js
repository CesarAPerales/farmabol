// src/config/db.js
// Capa de acceso a datos usando el SQLite NATIVO de Node (node:sqlite).
// No requiere instalar ni compilar nada: viene incluido en Node 22.5+.
// Expone query() asíncrono que imita mysql2, para que las rutas no cambien.

// Verificación amable de la versión de Node antes de continuar.
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 5)) {
  console.error('\n========================================================');
  console.error(' ERROR: Tu version de Node.js es', process.version);
  console.error(' Este sistema necesita Node.js 22.5 o superior, porque');
  console.error(' usa el modulo SQLite incluido en Node (node:sqlite).');
  console.error(' Descarga la ultima version LTS en: https://nodejs.org');
  console.error('========================================================\n');
  process.exit(1);
}

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'db', 'farmabol.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');

const pool = {
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      try {
        const esSelect = /^\s*select/i.test(sql);
        const stmt = db.prepare(sql);
        if (esSelect) {
          const rows = stmt.all(...params);
          resolve([rows]);
        } else {
          const info = stmt.run(...params);
          resolve([{ insertId: info.lastInsertRowid, affectedRows: info.changes }]);
        }
      } catch (err) {
        reject(err);
      }
    });
  },

  async getConnection() {
    return {
      async beginTransaction() { db.exec('BEGIN'); },
      async commit() { db.exec('COMMIT'); },
      async rollback() { try { db.exec('ROLLBACK'); } catch (e) {} },
      release() {},
      query(sql, params = []) { return pool.query(sql, params); }
    };
  },

  _raw: db
};

module.exports = pool;
