const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function insertTestFavourites() {
    try {
        console.log('🔄 Insertando datos de prueba de favoritos...');

        // 1. Insertar favoritos para el usuario ID 7 (Daniel Karimi Álvarez)
        console.log('📊 Insertando favoritos para usuario ID 7...');
        
        // Agregar producto ID 29 (Sudadera Cronixx) a favoritos
        await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (7, 29, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
        `);
        console.log('✅ Usuario 7 -> Producto 29 (Sudadera Cronixx)');

        // Agregar producto ID 31 (Camiseta Básica) a favoritos
        await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (7, 31, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
        `);
        console.log('✅ Usuario 7 -> Producto 31 (Camiseta Básica)');

        // Agregar producto ID 35 (Sudaderon Cronox) a favoritos
        await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (7, 35, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
        `);
        console.log('✅ Usuario 7 -> Producto 35 (Sudaderon Cronox)');

        // 2. Insertar favoritos para otros usuarios
        console.log('📊 Insertando favoritos para otros usuarios...');
        
        // Usuario ID 4 -> Producto 29
        await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (4, 29, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
        `);
        console.log('✅ Usuario 4 -> Producto 29');

        // Usuario ID 4 -> Producto 31
        await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (4, 31, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
        `);
        console.log('✅ Usuario 4 -> Producto 31');

        // Usuario ID 5 -> Producto 35
        await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (5, 35, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
        `);
        console.log('✅ Usuario 5 -> Producto 35');

        // Usuario ID 5 -> Producto 37
        await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (5, 37, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
        `);
        console.log('✅ Usuario 5 -> Producto 37');

        // Usuario ID 6 -> Producto 29
        await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (6, 29, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
        `);
        console.log('✅ Usuario 6 -> Producto 29');

        // 3. Actualizar contadores de favourites en products
        console.log('📊 Actualizando contadores de favourites...');
        await query(`
            UPDATE products 
            SET favourites = (
                SELECT COUNT(*) 
                FROM user_favourites 
                WHERE user_favourites.product_id = products.id
            ),
            updated_at = NOW()
        `);
        console.log('✅ Contadores actualizados');

        // 4. Verificar resultados
        console.log('📊 Verificando resultados...');
        
        // Verificar favoritos por usuario
        const userFavourites = await query(`
            SELECT uf.user_id, u.first_name, u.last_name, COUNT(*) as favourites_count
            FROM user_favourites uf
            LEFT JOIN users u ON uf.user_id = u.id
            GROUP BY uf.user_id, u.first_name, u.last_name
            ORDER BY uf.user_id
        `);
        console.log('📋 Favoritos por usuario:');
        userFavourites.rows.forEach(user => {
            console.log(`  - Usuario ${user.user_id} (${user.first_name} ${user.last_name}): ${user.favourites_count} favoritos`);
        });

        // Verificar contadores en productos
        const productCounts = await query(`
            SELECT p.id, p.name, p.favourites, COUNT(uf.id) as actual_count
            FROM products p
            LEFT JOIN user_favourites uf ON p.id = uf.product_id
            WHERE p.is_active = true
            GROUP BY p.id, p.name, p.favourites
            ORDER BY p.favourites DESC
        `);
        console.log('📋 Contadores de productos:');
        productCounts.rows.forEach(product => {
            console.log(`  - Producto ${product.id} (${product.name}): ${product.favourites} en DB, ${product.actual_count} reales`);
        });

        console.log('🎉 Datos de prueba insertados exitosamente');

    } catch (error) {
        console.error('❌ Error insertando datos de prueba:', error);
        throw error;
    }
}

// Ejecutar inserción si se llama directamente
if (require.main === module) {
    insertTestFavourites()
        .then(() => {
            console.log('🎉 Inserción completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en la inserción:', error);
            process.exit(1);
        });
}

module.exports = { insertTestFavourites };
