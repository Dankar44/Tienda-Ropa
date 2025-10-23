const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function migrateFavourites() {
    try {
        console.log('🔄 Iniciando migración de sistema de favoritos...');

        // 1. Agregar campo favourites a la tabla products
        console.log('📊 Agregando campo favourites a la tabla products...');
        await query(`
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS favourites INTEGER DEFAULT 0
        `);
        console.log('✅ Campo favourites agregado a products');

        // 2. Crear tabla user_favourites para relación N:M
        console.log('📊 Creando tabla user_favourites...');
        await query(`
            CREATE TABLE IF NOT EXISTS user_favourites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, product_id)
            )
        `);
        console.log('✅ Tabla user_favourites creada');

        // 3. Crear índices para optimizar consultas
        console.log('📊 Creando índices para optimización...');
        await query(`
            CREATE INDEX IF NOT EXISTS idx_user_favourites_user_id 
            ON user_favourites(user_id)
        `);
        await query(`
            CREATE INDEX IF NOT EXISTS idx_user_favourites_product_id 
            ON user_favourites(product_id)
        `);
        await query(`
            CREATE INDEX IF NOT EXISTS idx_products_favourites 
            ON products(favourites)
        `);
        console.log('✅ Índices creados');

        // 4. Migrar datos existentes de wishlist a user_favourites (solo productos que existen)
        console.log('📊 Migrando datos existentes de wishlist...');
        const existingWishlist = await query(`
            SELECT w.user_id, w.product_id, w.created_at 
            FROM wishlist w
            INNER JOIN products p ON w.product_id = p.id
            WHERE p.is_active = true
        `);
        
        if (existingWishlist.rows.length > 0) {
            for (const item of existingWishlist.rows) {
                await query(`
                    INSERT INTO user_favourites (user_id, product_id, created_at)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, product_id) DO NOTHING
                `, [item.user_id, item.product_id, item.created_at]);
            }
            console.log(`✅ Migrados ${existingWishlist.rows.length} elementos de wishlist`);
        } else {
            console.log('ℹ️ No hay datos de wishlist válidos para migrar');
        }

        // 5. Actualizar contador de favourites en products
        console.log('📊 Actualizando contador de favourites...');
        await query(`
            UPDATE products 
            SET favourites = (
                SELECT COUNT(*) 
                FROM user_favourites 
                WHERE user_favourites.product_id = products.id
            )
        `);
        console.log('✅ Contador de favourites actualizado');

        // 6. Verificar migración
        console.log('📊 Verificando migración...');
        const productsWithFavourites = await query(`
            SELECT COUNT(*) as count 
            FROM products 
            WHERE favourites > 0
        `);
        console.log(`✅ Productos con favoritos: ${productsWithFavourites.rows[0].count}`);

        const totalFavourites = await query(`
            SELECT COUNT(*) as count 
            FROM user_favourites
        `);
        console.log(`✅ Total de favoritos: ${totalFavourites.rows[0].count}`);

        console.log('🎉 Migración de favoritos completada exitosamente');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
    migrateFavourites()
        .then(() => {
            console.log('🎉 Proceso de migración completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en la migración:', error);
            process.exit(1);
        });
}

module.exports = { migrateFavourites };
