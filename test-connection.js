const { testConnection } = require('./config/database');
require('dotenv').config({ path: './config.env' });

async function testDatabaseConnection() {
    console.log('🔍 Probando conexión a PostgreSQL...');
    console.log('📊 Configuración:');
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   Puerto: ${process.env.DB_PORT || 5432}`);
    console.log(`   Base de datos: ${process.env.DB_NAME || 'cronox_db'}`);
    console.log(`   Usuario: ${process.env.DB_USER || 'postgres'}`);
    console.log('');

    try {
        const connected = await testConnection();
        if (connected) {
            console.log('✅ ¡Conexión exitosa a PostgreSQL!');
            console.log('🚀 Puedes continuar con la inicialización de la base de datos.');
        } else {
            console.log('❌ No se pudo conectar a PostgreSQL');
            console.log('💡 Verifica que:');
            console.log('   1. PostgreSQL esté instalado y ejecutándose');
            console.log('   2. La base de datos "cronox_db" exista');
            console.log('   3. Las credenciales en config.env sean correctas');
        }
    } catch (error) {
        console.error('💥 Error:', error.message);
        console.log('');
        console.log('🔧 Soluciones posibles:');
        console.log('   1. Instalar PostgreSQL: https://www.postgresql.org/download/');
        console.log('   2. Crear base de datos: CREATE DATABASE cronox_db;');
        console.log('   3. Verificar usuario y contraseña en config.env');
    }
}

testDatabaseConnection();
