const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function testWishlistEndpoints() {
    try {
        console.log('🔄 Probando endpoints de wishlist para usuario ID=10...');

        // 1. Verificar que el usuario existe y está activo
        console.log('📊 Verificando usuario ID=10...');
        const user = await query(`
            SELECT id, first_name, last_name, email
            FROM users 
            WHERE id = 10
        `);
        
        if (user.rows.length === 0) {
            console.log('❌ Usuario ID=10 no existe');
            return;
        }
        console.log('✅ Usuario encontrado:', user.rows[0]);

        // 2. Probar agregar producto al wishlist manualmente
        console.log('📊 Probando agregar producto al wishlist...');
        const testProductId = 29; // Sudadera Cronixx
        
        // Verificar que el producto existe
        const product = await query(`
            SELECT id, name, is_active
            FROM products 
            WHERE id = $1
        `, [testProductId]);
        
        if (product.rows.length === 0) {
            console.log('❌ Producto no encontrado');
            return;
        }
        console.log('✅ Producto encontrado:', product.rows[0]);

        // 3. Simular la operación de agregar a wishlist
        console.log('📊 Simulando POST /api/wishlist...');
        
        // Agregar a wishlist
        const wishlistResult = await query(`
            INSERT INTO wishlist (user_id, product_id, created_at)
            VALUES (10, $1, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
            RETURNING *
        `, [testProductId]);
        
        if (wishlistResult.rows.length > 0) {
            console.log('✅ Agregado a wishlist:', wishlistResult.rows[0]);
        } else {
            console.log('ℹ️ Ya existía en wishlist');
        }

        // Agregar a user_favourites
        const favouritesResult = await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (10, $1, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
            RETURNING *
        `, [testProductId]);
        
        if (favouritesResult.rows.length > 0) {
            console.log('✅ Agregado a user_favourites:', favouritesResult.rows[0]);
        } else {
            console.log('ℹ️ Ya existía en user_favourites');
        }

        // Actualizar contador
        await query(`
            UPDATE products 
            SET favourites = (
                SELECT COUNT(*) 
                FROM user_favourites 
                WHERE user_favourites.product_id = products.id
            ),
            updated_at = NOW()
            WHERE id = $1
        `, [testProductId]);
        console.log('✅ Contador actualizado');

        // 4. Verificar que se agregó correctamente
        console.log('📊 Verificando que se agregó correctamente...');
        
        const wishlistCheck = await query(`
            SELECT w.*, p.name as product_name
            FROM wishlist w
            LEFT JOIN products p ON w.product_id = p.id
            WHERE w.user_id = 10 AND w.product_id = $1
        `, [testProductId]);
        
        const favouritesCheck = await query(`
            SELECT uf.*, p.name as product_name
            FROM user_favourites uf
            LEFT JOIN products p ON uf.product_id = p.id
            WHERE uf.user_id = 10 AND uf.product_id = $1
        `, [testProductId]);
        
        console.log(`📋 Wishlist: ${wishlistCheck.rows.length} elementos`);
        console.log(`📋 User_favourites: ${favouritesCheck.rows.length} elementos`);

        // 5. Verificar contador del producto
        const productCount = await query(`
            SELECT id, name, favourites
            FROM products 
            WHERE id = $1
        `, [testProductId]);
        console.log('📋 Contador del producto:', productCount.rows[0]);

        // 6. Probar eliminar del wishlist
        console.log('📊 Probando eliminar del wishlist...');
        
        const deleteWishlist = await query(`
            DELETE FROM wishlist 
            WHERE user_id = 10 AND product_id = $1
            RETURNING *
        `, [testProductId]);
        
        const deleteFavourites = await query(`
            DELETE FROM user_favourites 
            WHERE user_id = 10 AND product_id = $1
            RETURNING *
        `, [testProductId]);
        
        console.log(`📋 Eliminado de wishlist: ${deleteWishlist.rows.length} elementos`);
        console.log(`📋 Eliminado de user_favourites: ${deleteFavourites.rows.length} elementos`);

        // Actualizar contador después de eliminar
        await query(`
            UPDATE products 
            SET favourites = (
                SELECT COUNT(*) 
                FROM user_favourites 
                WHERE user_favourites.product_id = products.id
            ),
            updated_at = NOW()
            WHERE id = $1
        `, [testProductId]);
        console.log('✅ Contador actualizado después de eliminar');

        console.log('🎉 Pruebas de endpoints completadas');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        throw error;
    }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
    testWishlistEndpoints()
        .then(() => {
            console.log('🎉 Pruebas completadas');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en las pruebas:', error);
            process.exit(1);
        });
}

module.exports = { testWishlistEndpoints };
