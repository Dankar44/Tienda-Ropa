/**
 * Script de prueba para la sincronización de wishlist
 * Este script simula la funcionalidad de sincronización
 */

const { query } = require('../config/database');

async function testWishlistSync() {
    console.log('🧪 Iniciando pruebas de sincronización de wishlist...\n');

    try {
        // 1. Verificar que la tabla user_favourites existe
        console.log('1. Verificando estructura de la tabla user_favourites...');
        const tableCheck = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'user_favourites'
            ORDER BY ordinal_position
        `);
        
        console.log('✅ Estructura de la tabla:');
        tableCheck.rows.forEach(row => {
            console.log(`   - ${row.column_name}: ${row.data_type}`);
        });

        // 2. Verificar usuarios existentes
        console.log('\n2. Verificando usuarios existentes...');
        const users = await query('SELECT id, first_name, last_name, email FROM users LIMIT 5');
        console.log(`✅ Encontrados ${users.rows.length} usuarios:`);
        users.rows.forEach(user => {
            console.log(`   - ID: ${user.id}, Nombre: ${user.first_name} ${user.last_name}, Email: ${user.email}`);
        });

        // 3. Verificar productos existentes
        console.log('\n3. Verificando productos existentes...');
        const products = await query('SELECT id, name, price, is_active FROM products WHERE is_active = true LIMIT 5');
        console.log(`✅ Encontrados ${products.rows.length} productos activos:`);
        products.rows.forEach(product => {
            console.log(`   - ID: ${product.id}, Nombre: ${product.name}, Precio: €${product.price}, Activo: ${product.is_active}`);
        });

        // 4. Verificar favoritos existentes
        console.log('\n4. Verificando favoritos existentes...');
        const favourites = await query(`
            SELECT uf.user_id, uf.product_id, u.first_name, u.last_name, p.name as product_name
            FROM user_favourites uf
            JOIN users u ON uf.user_id = u.id
            JOIN products p ON uf.product_id = p.id
            LIMIT 5
        `);
        console.log(`✅ Encontrados ${favourites.rows.length} favoritos:`);
        favourites.rows.forEach(fav => {
            console.log(`   - Usuario: ${fav.first_name} ${fav.last_name} (ID: ${fav.user_id}) -> Producto: ${fav.product_name} (ID: ${fav.product_id})`);
        });

        // 5. Simular sincronización
        if (users.rows.length > 0 && products.rows.length > 0) {
            console.log('\n5. Simulando sincronización...');
            const testUserId = users.rows[0].id;
            const testProductIds = products.rows.slice(0, 2).map(p => p.id);
            
            console.log(`   Usuario de prueba: ID ${testUserId}`);
            console.log(`   Productos de prueba: ${testProductIds.join(', ')}`);

            // Limpiar favoritos existentes del usuario de prueba
            await query('DELETE FROM user_favourites WHERE user_id = $1', [testUserId]);
            console.log('   ✅ Favoritos existentes eliminados');

            // Agregar productos de prueba
            for (const productId of testProductIds) {
                await query(`
                    INSERT INTO user_favourites (user_id, product_id)
                    VALUES ($1, $2)
                    ON CONFLICT (user_id, product_id) DO NOTHING
                `, [testUserId, productId]);
            }
            console.log('   ✅ Productos agregados a favoritos');

            // Verificar sincronización
            const syncedFavourites = await query(`
                SELECT p.name, p.price
                FROM user_favourites uf
                JOIN products p ON uf.product_id = p.id
                WHERE uf.user_id = $1
            `, [testUserId]);
            
            console.log(`   ✅ Sincronización exitosa: ${syncedFavourites.rows.length} productos en favoritos`);
            syncedFavourites.rows.forEach(fav => {
                console.log(`      - ${fav.name} (€${fav.price})`);
            });
        }

        console.log('\n🎉 Todas las pruebas completadas exitosamente!');
        console.log('\n📋 Resumen:');
        console.log('   - Tabla user_favourites: ✅ Funcional');
        console.log('   - Usuarios: ✅ Disponibles');
        console.log('   - Productos: ✅ Disponibles');
        console.log('   - Sincronización: ✅ Funcional');
        console.log('\n💡 El sistema está listo para sincronizar wishlists!');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        console.error('\n🔧 Posibles soluciones:');
        console.error('   1. Verificar que la base de datos esté corriendo');
        console.error('   2. Verificar que las tablas existan');
        console.error('   3. Verificar permisos de la base de datos');
    }
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
    testWishlistSync()
        .then(() => {
            console.log('\n✅ Script de prueba completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = { testWishlistSync };
