const { Client } = require('pg');
require('dotenv').config({ path: './config.env' });

async function createDatabase() {
    console.log('🔧 Creando base de datos cronox_db...');
    
    try {
        // Conectar a PostgreSQL (sin especificar base de datos)
        const client = new Client({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: 'postgres' // Conectamos a la DB por defecto
        });
        
        await client.connect();
        console.log('✅ Conectado a PostgreSQL');
        
        // Crear base de datos
        await client.query('CREATE DATABASE cronox_db');
        console.log('📊 Base de datos cronox_db creada exitosamente');
        
        await client.end();
        console.log('🎉 ¡Base de datos lista para usar!');
        
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('📊 Base de datos cronox_db ya existe');
            console.log('🎉 ¡Todo listo para continuar!');
        } else {
            console.error('❌ Error:', error.message);
            throw error;
        }
    }
}

createDatabase();
