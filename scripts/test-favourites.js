const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function testFavouritesSystem() {
    try {
        console.log('🔄 Verificando sistema de favoritos...');

        // 1. Verificar que la tabla user_favourites existe
        console.log('📊 Verificando tabla user_favourites...');
        const tableExists = await query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'user_favourites'
            );
        `);
        console.log('✅ Tabla user_favourites existe:', tableExists.rows[0].exists);

        // 2. Verificar estructura de la tabla
        console.log('📊 Verificando estructura de user_favourites...');
        const tableStructure = await query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'user_favourites'
            ORDER BY ordinal_position;
        `);
        console.log('📋 Estructura de user_favourites:');
        tableStructure.rows.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        // 3. Verificar que el campo favourites existe en products
        console.log('📊 Verificando campo favourites en products...');
        const favouritesField = await query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'favourites';
        `);
        if (favouritesField.rows.length > 0) {
            console.log('✅ Campo favourites existe:', favouritesField.rows[0]);
        } else {
            console.log('❌ Campo favourites NO existe en products');
        }

        // 4. Verificar usuarios existentes
        console.log('📊 Verificando usuarios existentes...');
        const users = await query(`
            SELECT id, first_name, last_name, email 
            FROM users 
            ORDER BY id
        `);
        console.log(`📋 Usuarios encontrados: ${users.rows.length}`);
        users.rows.forEach(user => {
            console.log(`  - ID: ${user.id}, Nombre: ${user.first_name} ${user.last_name}, Email: ${user.email}`);
        });

        // 5. Verificar productos existentes
        console.log('📊 Verificando productos existentes...');
        const products = await query(`
            SELECT id, name, favourites 
            FROM products 
            WHERE is_active = true
            ORDER BY id
        `);
        console.log(`📋 Productos encontrados: ${products.rows.length}`);
        products.rows.forEach(product => {
            console.log(`  - ID: ${product.id}, Nombre: ${product.name}, Favoritos: ${product.favourites}`);
        });

        // 6. Verificar favoritos existentes
        console.log('📊 Verificando favoritos existentes...');
        const existingFavourites = await query(`
            SELECT uf.*, u.first_name, u.last_name, p.name as product_name
            FROM user_favourites uf
            LEFT JOIN users u ON uf.user_id = u.id
            LEFT JOIN products p ON uf.product_id = p.id
            ORDER BY uf.created_at DESC
        `);
        console.log(`📋 Favoritos existentes: ${existingFavourites.rows.length}`);
        existingFavourites.rows.forEach(fav => {
            console.log(`  - Usuario: ${fav.first_name} ${fav.last_name} (ID: ${fav.user_id}) -> Producto: ${fav.product_name} (ID: ${fav.product_id})`);
        });

        console.log('🎉 Verificación completada');

    } catch (error) {
        console.error('❌ Error en la verificación:', error);
        throw error;
    }
}

// Ejecutar verificación si se llama directamente
if (require.main === module) {
    testFavouritesSystem()
        .then(() => {
            console.log('🎉 Verificación completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en la verificación:', error);
            process.exit(1);
        });
}

module.exports = { testFavouritesSystem };
