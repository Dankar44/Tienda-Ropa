const { query, testConnection } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function addModelImageColumns() {
    try {
        console.log('🔄 Agregando columnas de imagen de modelo...');

        // Verificar si las columnas ya existen
        const checkColumns = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            AND column_name IN ('model_image_1', 'model_image_2')
        `);

        const existingColumns = checkColumns.rows.map(row => row.column_name);

        // Agregar model_image_1 si no existe
        if (!existingColumns.includes('model_image_1')) {
            await query(`
                ALTER TABLE products 
                ADD COLUMN model_image_1 VARCHAR(500)
            `);
            console.log('✅ Columna model_image_1 agregada');
        } else {
            console.log('📊 Columna model_image_1 ya existe');
        }

        // Agregar model_image_2 si no existe
        if (!existingColumns.includes('model_image_2')) {
            await query(`
                ALTER TABLE products 
                ADD COLUMN model_image_2 VARCHAR(500)
            `);
            console.log('✅ Columna model_image_2 agregada');
        } else {
            console.log('📊 Columna model_image_2 ya existe');
        }

        console.log('🎉 Columnas de imagen de modelo agregadas exitosamente!');

    } catch (error) {
        console.error('❌ Error agregando columnas:', error);
        throw error;
    }
}

async function migrateDatabase() {
    try {
        console.log('🚀 Iniciando migración de base de datos...');
        
        // Probar conexión
        const connected = await testConnection();
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }

        // Agregar columnas de imagen de modelo
        await addModelImageColumns();

        console.log('🎉 Migración completada exitosamente!');

    } catch (error) {
        console.error('💥 Error en migración:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    migrateDatabase();
}

module.exports = { addModelImageColumns, migrateDatabase };

