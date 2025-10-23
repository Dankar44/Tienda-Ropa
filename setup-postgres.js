const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupPostgreSQL() {
    console.log('🔧 Configurando PostgreSQL para CRONOX...');
    console.log('');
    
    // Intentar conectar con diferentes configuraciones comunes
    const configs = [
        { password: '' }, // Sin contraseña
        { password: 'postgres' }, // Contraseña por defecto
        { password: 'admin' },
        { password: '123456' },
        { password: 'password' }
    ];
    
    let connected = false;
    let workingConfig = null;
    
    for (const config of configs) {
        try {
            console.log(`🔍 Probando contraseña: "${config.password || '(vacía)'}"`);
            
            const client = new Client({
                host: 'localhost',
                port: 5432,
                user: 'postgres',
                password: config.password,
                database: 'postgres' // Conectamos a la DB por defecto primero
            });
            
            await client.connect();
            console.log('✅ ¡Conexión exitosa!');
            
            // Crear base de datos cronox_db si no existe
            try {
                await client.query('CREATE DATABASE cronox_db');
                console.log('📊 Base de datos cronox_db creada');
            } catch (err) {
                if (err.message.includes('already exists')) {
                    console.log('📊 Base de datos cronox_db ya existe');
                } else {
                    throw err;
                }
            }
            
            await client.end();
            connected = true;
            workingConfig = config;
            break;
            
        } catch (error) {
            console.log(`❌ Falló con contraseña: "${config.password || '(vacía)'}"`);
        }
    }
    
    if (!connected) {
        console.log('');
        console.log('❌ No se pudo conectar automáticamente');
        console.log('💡 Por favor, configura manualmente:');
        console.log('   1. Abre pgAdmin');
        console.log('   2. Conecta a tu servidor PostgreSQL');
        console.log('   3. Crea una base de datos llamada "cronox_db"');
        console.log('   4. Anota tu contraseña de postgres');
        console.log('   5. Edita config.env con tu contraseña real');
        return false;
    }
    
    // Actualizar config.env con la configuración que funciona
    const configPath = path.join(__dirname, 'config.env');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    configContent = configContent.replace(
        'DB_PASSWORD=tu_password_aqui',
        `DB_PASSWORD=${workingConfig.password}`
    );
    
    fs.writeFileSync(configPath, configContent);
    console.log('');
    console.log('✅ config.env actualizado con la contraseña correcta');
    console.log('🚀 Ahora puedes ejecutar: npm run init-db');
    
    return true;
}

setupPostgreSQL().catch(console.error);
