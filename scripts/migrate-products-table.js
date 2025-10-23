const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function migrateProductsTable() {
    try {
        console.log('🔄 Iniciando migración de la tabla products...');

        // Verificar si las columnas ya existen
        const checkColumns = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' 
            AND column_name IN ('garment_type', 'stock_s', 'stock_m', 'stock_l', 'stock_xl', 'stock_total', 'model_image_1', 'model_image_2')
        `);

        const existingColumns = checkColumns.rows.map(row => row.column_name);
        console.log('📋 Columnas existentes:', existingColumns);

        // Agregar columnas que no existen
        const columnsToAdd = [
            { name: 'garment_type', type: 'VARCHAR(50)' },
            { name: 'model_image_1', type: 'VARCHAR(500)' },
            { name: 'model_image_2', type: 'VARCHAR(500)' },
            { name: 'stock_s', type: 'INTEGER DEFAULT 0' },
            { name: 'stock_m', type: 'INTEGER DEFAULT 0' },
            { name: 'stock_l', type: 'INTEGER DEFAULT 0' },
            { name: 'stock_xl', type: 'INTEGER DEFAULT 0' },
            { name: 'stock_total', type: 'INTEGER DEFAULT 0' }
        ];

        for (const column of columnsToAdd) {
            if (!existingColumns.includes(column.name)) {
                console.log(`➕ Agregando columna: ${column.name}`);
                await query(`ALTER TABLE products ADD COLUMN ${column.name} ${column.type}`);
            } else {
                console.log(`✅ Columna ${column.name} ya existe`);
            }
        }

        // Actualizar stock_total para productos existentes
        console.log('🔄 Actualizando stock_total para productos existentes...');
        await query(`
            UPDATE products 
            SET stock_total = COALESCE(stock_s, 0) + COALESCE(stock_m, 0) + COALESCE(stock_l, 0) + COALESCE(stock_xl, 0)
            WHERE stock_total IS NULL OR stock_total = 0
        `);

        console.log('✅ Migración completada exitosamente');
    } catch (error) {
        console.error('❌ Error en la migración:', error);
        throw error;
    }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
    migrateProductsTable()
        .then(() => {
            console.log('🎉 Migración completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en la migración:', error);
            process.exit(1);
        });
}

module.exports = { migrateProductsTable };
