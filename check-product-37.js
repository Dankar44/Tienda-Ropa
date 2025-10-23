const { query } = require('./config/database');

async function checkProduct37() {
    try {
        console.log('🔍 Verificando producto con ID 37...');
        
        const result = await query(
            'SELECT id, name, price, is_active FROM products WHERE id = 37',
            []
        );
        
        if (result.rows.length > 0) {
            console.log('✅ Producto encontrado:');
            console.log('   - ID:', result.rows[0].id);
            console.log('   - Nombre:', result.rows[0].name);
            console.log('   - Precio:', result.rows[0].price);
            console.log('   - Activo:', result.rows[0].is_active);
        } else {
            console.log('❌ Producto con ID 37 no encontrado');
        }
        
        // Verificar productos disponibles
        const allProducts = await query(
            'SELECT id, name, is_active FROM products ORDER BY id DESC LIMIT 10',
            []
        );
        
        console.log('\n📋 Últimos 10 productos:');
        allProducts.rows.forEach(product => {
            console.log(`   - ID: ${product.id}, Nombre: ${product.name}, Activo: ${product.is_active}`);
        });
        
    } catch (error) {
        console.error('❌ Error verificando producto:', error);
    }
}

checkProduct37();


