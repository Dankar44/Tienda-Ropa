const { query } = require('./config/database');

async function createCartTable() {
    try {
        console.log('🔄 Creando tabla cart...');
        
        const queryText = `
            CREATE TABLE IF NOT EXISTS cart (
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
        
        await query(queryText);
        console.log('✅ Tabla cart creada exitosamente');
        
        // Crear índices para mejorar el rendimiento
        await query('CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);');
        await query('CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id);');
        console.log('✅ Índices creados');
        
    } catch (error) {
        console.error('❌ Error creando tabla cart:', error);
    }
}

createCartTable();
