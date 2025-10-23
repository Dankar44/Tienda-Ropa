const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function simulateFrontendWishlist() {
    try {
        console.log('🔄 Simulando comportamiento del frontend para usuario ID=10...');

        // 1. Verificar estado inicial
        console.log('📊 Estado inicial del usuario ID=10...');
        const initialWishlist = await query(`
            SELECT COUNT(*) as count FROM wishlist WHERE user_id = 10
        `);
        const initialFavourites = await query(`
            SELECT COUNT(*) as count FROM user_favourites WHERE user_id = 10
        `);
        console.log(`📋 Wishlist inicial: ${initialWishlist.rows[0].count}`);
        console.log(`📋 Favourites inicial: ${initialFavourites.rows[0].count}`);

        // 2. Simular lo que debería pasar cuando el usuario hace clic en el corazón
        console.log('📊 Simulando clic en corazón para producto ID=31...');
        const productId = 31; // Camiseta Básica
        
        // Verificar que el producto existe
        const product = await query(`
            SELECT id, name, is_active
            FROM products 
            WHERE id = $1 AND is_active = true
        `, [productId]);
        
        if (product.rows.length === 0) {
            console.log('❌ Producto no encontrado o inactivo');
            return;
        }
        console.log('✅ Producto encontrado:', product.rows[0]);

        // 3. Simular la llamada POST /api/wishlist
        console.log('📊 Simulando POST /api/wishlist...');
        
        // Esto es lo que debería hacer el endpoint
        const wishlistResult = await query(`
            INSERT INTO wishlist (user_id, product_id, created_at)
            VALUES (10, $1, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
            RETURNING *
        `, [productId]);
        
        if (wishlistResult.rows.length > 0) {
            console.log('✅ Agregado a wishlist:', wishlistResult.rows[0]);
        } else {
            console.log('ℹ️ Ya existía en wishlist');
        }

        // También agregar a user_favourites (esto es lo que agregamos)
        const favouritesResult = await query(`
            INSERT INTO user_favourites (user_id, product_id, created_at)
            VALUES (10, $1, NOW())
            ON CONFLICT (user_id, product_id) DO NOTHING
            RETURNING *
        `, [productId]);
        
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
        `, [productId]);
        console.log('✅ Contador actualizado');

        // 4. Verificar estado después de agregar
        console.log('📊 Estado después de agregar...');
        const afterWishlist = await query(`
            SELECT w.*, p.name as product_name
            FROM wishlist w
            LEFT JOIN products p ON w.product_id = p.id
            WHERE w.user_id = 10
            ORDER BY w.created_at DESC
        `);
        console.log(`📋 Wishlist después: ${afterWishlist.rows.length} elementos`);
        afterWishlist.rows.forEach(item => {
            console.log(`  - Producto ${item.product_id}: ${item.product_name}`);
        });

        const afterFavourites = await query(`
            SELECT uf.*, p.name as product_name
            FROM user_favourites uf
            LEFT JOIN products p ON uf.product_id = p.id
            WHERE uf.user_id = 10
            ORDER BY uf.created_at DESC
        `);
        console.log(`📋 Favourites después: ${afterFavourites.rows.length} elementos`);
        afterFavourites.rows.forEach(item => {
            console.log(`  - Producto ${item.product_id}: ${item.product_name}`);
        });

        // 5. Verificar contador del producto
        const productCount = await query(`
            SELECT id, name, favourites
            FROM products 
            WHERE id = $1
        `, [productId]);
        console.log('📋 Contador del producto:', productCount.rows[0]);

        // 6. Simular GET /api/wishlist (lo que debería devolver el frontend)
        console.log('📊 Simulando GET /api/wishlist...');
        const wishlistResponse = await query(`
            SELECT p.*, w.created_at as added_at
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = 10 AND p.is_active = true
            ORDER BY w.created_at DESC
        `);
        console.log(`📋 Respuesta GET /api/wishlist: ${wishlistResponse.rows.length} elementos`);
        wishlistResponse.rows.forEach(item => {
            console.log(`  - Producto ${item.id}: ${item.name} (${item.added_at})`);
        });

        console.log('🎉 Simulación completada');

    } catch (error) {
        console.error('❌ Error en la simulación:', error);
        throw error;
    }
}

// Ejecutar simulación si se llama directamente
if (require.main === module) {
    simulateFrontendWishlist()
        .then(() => {
            console.log('🎉 Simulación completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en la simulación:', error);
            process.exit(1);
        });
}

module.exports = { simulateFrontendWishlist };
