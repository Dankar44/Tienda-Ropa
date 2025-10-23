const { query } = require('./config/database');

async function recreateCartTable() {
    try {
        console.log('🔄 Recreando tabla cart con estructura correcta...');
        
        // Eliminar tabla existente
        await query('DROP TABLE IF EXISTS cart CASCADE');
        console.log('✅ Tabla cart eliminada');
        
        // Crear tabla con estructura correcta
        const createTableQuery = `
            CREATE TABLE cart (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
                type VARCHAR(10) NOT NULL CHECK (type IN ('S', 'M', 'L', 'XL')),
                quantity INTEGER NOT NULL CHECK (quantity > 0),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(user_id, product_id, type)
            );
        `;
        
        await query(createTableQuery);
        console.log('✅ Tabla cart creada con estructura correcta');
        
        // Crear índices
        await query('CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);');
        await query('CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id);');
        console.log('✅ Índices creados');
        
        // Verificar estructura
        const result = await query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'cart' 
            ORDER BY ordinal_position
        `);
        
        console.log('\n📋 Nueva estructura de la tabla cart:');
        result.rows.forEach(row => {
            console.log(`   - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
    } catch (error) {
        console.error('❌ Error recreando tabla cart:', error);
    }
}

recreateCartTable();


