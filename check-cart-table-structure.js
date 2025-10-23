const { query } = require('./config/database');

async function checkCartTableStructure() {
    try {
        console.log('🔍 Verificando estructura de la tabla cart...');
        
        // Obtener información de las columnas de la tabla cart
        const result = await query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'cart' 
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Columnas de la tabla cart:');
        result.rows.forEach(row => {
            console.log(`   - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Verificar si hay datos en la tabla cart
        const cartData = await query('SELECT * FROM cart LIMIT 5');
        console.log('\n🛒 Datos en la tabla cart:');
        if (cartData.rows.length > 0) {
            cartData.rows.forEach(item => {
                console.log(`   - ID: ${item.id}, User: ${item.user_id}, Product: ${item.product_id}, Type: ${item.type}, Quantity: ${item.quantity}`);
            });
        } else {
            console.log('   - No hay datos en la tabla cart');
        }
        
    } catch (error) {
        console.error('❌ Error verificando tabla cart:', error);
    }
}

checkCartTableStructure();


