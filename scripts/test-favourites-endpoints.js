const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function testFavouritesEndpoints() {
    try {
        console.log('🔄 Probando endpoints de favoritos...');

        // 1. Probar agregar favorito
        console.log('📊 Probando agregar favorito...');
        const addFavourite = await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (7, 38, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
            RETURNING *
        `);
        
        if (addFavourite.rows.length > 0) {
            console.log('✅ Favorito agregado exitosamente:', addFavourite.rows[0]);
        } else {
            console.log('ℹ️ Favorito ya existía o no se pudo agregar');
        }

        // 2. Verificar que se agregó
        console.log('📊 Verificando que se agregó...');
        const checkFavourite = await query(`
            SELECT uf.*, u.first_name, u.last_name, p.name as product_name
            FROM user_favourites uf
            LEFT JOIN users u ON uf.user_id = u.id
            LEFT JOIN products p ON uf.product_id = p.id
            WHERE uf.user_id = 7 AND uf.product_id = 38
        `);
        
        if (checkFavourite.rows.length > 0) {
            console.log('✅ Favorito encontrado:', checkFavourite.rows[0]);
        } else {
            console.log('❌ Favorito no encontrado');
        }

        // 3. Actualizar contador
        console.log('📊 Actualizando contador...');
        await query(`
            UPDATE products 
            SET favourites = (
                SELECT COUNT(*) 
                FROM user_favourites 
                WHERE user_favourites.product_id = products.id
            ),
            updated_at = NOW()
            WHERE id = 38
        `);
        console.log('✅ Contador actualizado');

        // 4. Verificar contador
        console.log('📊 Verificando contador...');
        const productCount = await query(`
            SELECT p.id, p.name, p.favourites, COUNT(uf.id) as actual_count
            FROM products p
            LEFT JOIN user_favourites uf ON p.id = uf.product_id
            WHERE p.id = 38
            GROUP BY p.id, p.name, p.favourites
        `);
        console.log('📋 Contador del producto 38:', productCount.rows[0]);

        // 5. Probar quitar favorito
        console.log('📊 Probando quitar favorito...');
        const removeFavourite = await query(`
            DELETE FROM user_favourites 
            WHERE user_id = 7 AND product_id = 38
            RETURNING *
        `);
        
        if (removeFavourite.rows.length > 0) {
            console.log('✅ Favorito removido exitosamente:', removeFavourite.rows[0]);
        } else {
            console.log('ℹ️ Favorito no existía para remover');
        }

        // 6. Actualizar contador después de remover
        console.log('📊 Actualizando contador después de remover...');
        await query(`
            UPDATE products 
            SET favourites = (
                SELECT COUNT(*) 
                FROM user_favourites 
                WHERE user_favourites.product_id = products.id
            ),
            updated_at = NOW()
            WHERE id = 38
        `);
        console.log('✅ Contador actualizado');

        // 7. Verificar contador final
        console.log('📊 Verificando contador final...');
        const finalCount = await query(`
            SELECT p.id, p.name, p.favourites, COUNT(uf.id) as actual_count
            FROM products p
            LEFT JOIN user_favourites uf ON p.id = uf.product_id
            WHERE p.id = 38
            GROUP BY p.id, p.name, p.favourites
        `);
        console.log('📋 Contador final del producto 38:', finalCount.rows[0]);

        // 8. Verificar favoritos del usuario 7
        console.log('📊 Verificando favoritos del usuario 7...');
        const userFavourites = await query(`
            SELECT uf.*, p.name as product_name
            FROM user_favourites uf
            LEFT JOIN products p ON uf.product_id = p.id
            WHERE uf.user_id = 7
            ORDER BY uf.created_at DESC
        `);
        console.log(`📋 Usuario 7 tiene ${userFavourites.rows.length} favoritos:`);
        userFavourites.rows.forEach(fav => {
            console.log(`  - Producto ${fav.product_id}: ${fav.product_name}`);
        });

        console.log('🎉 Pruebas de endpoints completadas');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        throw error;
    }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
    testFavouritesEndpoints()
        .then(() => {
            console.log('🎉 Pruebas completadas');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en las pruebas:', error);
            process.exit(1);
        });
}

module.exports = { testFavouritesEndpoints };
