// Configuración alternativa con SQLite para desarrollo
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear base de datos SQLite
const dbPath = path.join(__dirname, 'cronox.db');
const db = new sqlite3.Database(dbPath);

// Función para probar la conexión
async function testConnection() {
    return new Promise((resolve, reject) => {
        db.get("SELECT 1", (err, row) => {
            if (err) {
                console.error('❌ Error conectando a SQLite:', err.message);
                reject(err);
            } else {
                console.log('✅ Conexión a SQLite establecida correctamente');
                resolve(true);
            }
        });
    });
}

// Función para ejecutar consultas
async function query(text, params = []) {
    return new Promise((resolve, reject) => {
        db.all(text, params, (err, rows) => {
            if (err) {
                console.error('❌ Error en query:', err);
                reject(err);
            } else {
                resolve({ rows, rowCount: rows.length });
            }
        });
    });
}

// Función para obtener un cliente
async function getClient() {
    return db;
}

module.exports = {
    db,
    query,
    getClient,
    testConnection
};
