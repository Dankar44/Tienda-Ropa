const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'cronox_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    max: 20, // máximo de conexiones en el pool
    idleTimeoutMillis: 30000, // cerrar conexiones inactivas después de 30 segundos
    connectionTimeoutMillis: 2000, // timeout de conexión de 2 segundos
});

// Función para probar la conexión
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Conexión a PostgreSQL establecida correctamente');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a PostgreSQL:', error.message);
        return false;
    }
}

// Función para ejecutar consultas
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('📊 Query ejecutada:', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('❌ Error en query:', error);
        throw error;
    }
}

// Función para obtener un cliente del pool
async function getClient() {
    return await pool.connect();
}

module.exports = {
    pool,
    query,
    getClient,
    testConnection
};
