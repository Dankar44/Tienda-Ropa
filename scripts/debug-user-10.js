const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function debugUser10() {
    try {
        console.log('🔄 Depurando usuario ID=10...');

        // 1. Verificar que el usuario existe
        console.log('📊 Verificando usuario ID=10...');
        const user = await query(`
            SELECT id, first_name, last_name, email, created_at
            FROM users 
            WHERE id = 10
        `);
        
        if (user.rows.length === 0) {
            console.log('❌ Usuario ID=10 no existe');
            return;
        }
        
        console.log('✅ Usuario encontrado:', user.rows[0]);

        // 2. Verificar wishlist del usuario
        console.log('📊 Verificando wishlist del usuario...');
        const wishlist = await query(`
            SELECT w.*, p.name as product_name
            FROM wishlist w
            LEFT JOIN products p ON w.product_id = p.id
            WHERE w.user_id = 10
            ORDER BY w.created_at DESC
        `);
        console.log(`📋 Wishlist del usuario: ${wishlist.rows.length} elementos`);
        wishlist.rows.forEach(item => {
            console.log(`  - Producto ${item.product_id}: ${item.product_name} (${item.created_at})`);
        });

        // 3. Verificar user_favourites del usuario
        console.log('📊 Verificando user_favourites del usuario...');
        const favourites = await query(`
            SELECT uf.*, p.name as product_name
            FROM user_favourites uf
            LEFT JOIN products p ON uf.product_id = p.id
            WHERE uf.user_id = 10
            ORDER BY uf.created_at DESC
        `);
        console.log(`📋 Favourites del usuario: ${favourites.rows.length} elementos`);
        favourites.rows.forEach(item => {
            console.log(`  - Producto ${item.product_id}: ${item.product_name} (${item.created_at})`);
        });

        // 4. Verificar diferencias entre wishlist y user_favourites
        console.log('📊 Analizando diferencias...');
        if (wishlist.rows.length > favourites.rows.length) {
            console.log('⚠️ Hay elementos en wishlist que no están en user_favourites');
            
            const wishlistProductIds = wishlist.rows.map(w => w.product_id);
            const favouritesProductIds = favourites.rows.map(f => f.product_id);
            const missingInFavourites = wishlistProductIds.filter(id => !favouritesProductIds.includes(id));
            
            console.log('📋 Productos faltantes en user_favourites:', missingInFavourites);
            
            // Intentar sincronizar manualmente
            console.log('📊 Sincronizando manualmente...');
            for (const productId of missingInFavourites) {
                try {
                    const result = await query(`
                        INSERT INTO user_favourites (user_id, product_id, created_at)
                        VALUES (10, $1, NOW())
                        ON CONFLICT (user_id, product_id) DO NOTHING
                        RETURNING *
                    `, [productId]);
                    
                    if (result.rows.length > 0) {
                        console.log(`✅ Sincronizado: Usuario 10 -> Producto ${productId}`);
                    } else {
                        console.log(`ℹ️ Ya existía: Usuario 10 -> Producto ${productId}`);
                    }
                } catch (error) {
                    console.error(`❌ Error sincronizando producto ${productId}:`, error.message);
                }
            }
        } else if (wishlist.rows.length === favourites.rows.length) {
            console.log('✅ Wishlist y user_favourites están sincronizados');
        } else {
            console.log('⚠️ Hay más elementos en user_favourites que en wishlist');
        }

        // 5. Actualizar contadores
        console.log('📊 Actualizando contadores...');
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

        // 6. Verificar estado final
        console.log('📊 Verificando estado final...');
        const finalFavourites = await query(`
            SELECT uf.*, p.name as product_name
            FROM user_favourites uf
            LEFT JOIN products p ON uf.product_id = p.id
            WHERE uf.user_id = 10
            ORDER BY uf.created_at DESC
        `);
        console.log(`📋 Estado final - Favourites del usuario: ${finalFavourites.rows.length} elementos`);
        finalFavourites.rows.forEach(item => {
            console.log(`  - Producto ${item.product_id}: ${item.product_name} (${item.created_at})`);
        });

        console.log('🎉 Depuración completada');

    } catch (error) {
        console.error('❌ Error en la depuración:', error);
        throw error;
    }
}

// Ejecutar depuración si se llama directamente
if (require.main === module) {
    debugUser10()
        .then(() => {
            console.log('🎉 Depuración completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en la depuración:', error);
            process.exit(1);
        });
}

module.exports = { debugUser10 };
