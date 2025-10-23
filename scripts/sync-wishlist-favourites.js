const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function syncWishlistFavourites() {
    try {
        console.log('🔄 Sincronizando wishlist con user_favourites...');

        // 1. Obtener todos los datos de wishlist
        console.log('📊 Obteniendo datos de wishlist...');
        const wishlistData = await query(`
            SELECT user_id, product_id, created_at
            FROM wishlist
            ORDER BY user_id, product_id
        `);
        console.log(`📋 Encontrados ${wishlistData.rows.length} elementos en wishlist`);

        // 2. Sincronizar con user_favourites
        console.log('📊 Sincronizando con user_favourites...');
        let syncedCount = 0;
        let skippedCount = 0;

        for (const item of wishlistData.rows) {
            try {
                // Insertar en user_favourites si no existe
                const result = await query(`
                    INSERT INTO user_favourites (user_id, product_id, created_at)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, product_id) DO NOTHING
                    RETURNING id
                `, [item.user_id, item.product_id, item.created_at]);

                if (result.rows.length > 0) {
                    syncedCount++;
                    console.log(`✅ Sincronizado: Usuario ${item.user_id} -> Producto ${item.product_id}`);
                } else {
                    skippedCount++;
                    console.log(`ℹ️ Ya existía: Usuario ${item.user_id} -> Producto ${item.product_id}`);
                }
            } catch (error) {
                console.error(`❌ Error sincronizando Usuario ${item.user_id} -> Producto ${item.product_id}:`, error.message);
            }
        }

        console.log(`📊 Sincronización completada: ${syncedCount} nuevos, ${skippedCount} ya existían`);

        // 3. Actualizar contadores de favourites
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

        // 4. Verificar sincronización
        console.log('📊 Verificando sincronización...');
        
        const wishlistCount = await query(`SELECT COUNT(*) as count FROM wishlist`);
        const favouritesCount = await query(`SELECT COUNT(*) as count FROM user_favourites`);
        
        console.log(`📋 Wishlist: ${wishlistCount.rows[0].count} elementos`);
        console.log(`📋 User_favourites: ${favouritesCount.rows[0].count} elementos`);

        // 5. Mostrar estadísticas por usuario
        console.log('📊 Estadísticas por usuario:');
        const userStats = await query(`
            SELECT 
                u.id, 
                u.first_name, 
                u.last_name,
                COUNT(w.id) as wishlist_count,
                COUNT(uf.id) as favourites_count
            FROM users u
            LEFT JOIN wishlist w ON u.id = w.user_id
            LEFT JOIN user_favourites uf ON u.id = uf.user_id
            GROUP BY u.id, u.first_name, u.last_name
            ORDER BY u.id
        `);

        userStats.rows.forEach(user => {
            console.log(`  - Usuario ${user.id} (${user.first_name} ${user.last_name}): Wishlist=${user.wishlist_count}, Favourites=${user.favourites_count}`);
        });

        console.log('🎉 Sincronización completada exitosamente');

    } catch (error) {
        console.error('❌ Error en la sincronización:', error);
        throw error;
    }
}

// Ejecutar sincronización si se llama directamente
if (require.main === module) {
    syncWishlistFavourites()
        .then(() => {
            console.log('🎉 Sincronización completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en la sincronización:', error);
            process.exit(1);
        });
}

module.exports = { syncWishlistFavourites };
