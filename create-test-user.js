const { query } = require('./config/database');

async function createTestUser() {
    try {
        console.log('🔄 Creando usuario de prueba...');
        
        // Verificar si el usuario ya existe
        const existingUser = await query(
            'SELECT id FROM users WHERE id = 1',
            []
        );
        
        if (existingUser.rows.length > 0) {
            console.log('✅ Usuario con ID 1 ya existe');
            return;
        }
        
        // Crear usuario de prueba
        await query(
            `INSERT INTO users (id, email, password, name, created_at) 
             VALUES (1, 'test@cronox.com', 'hashedpassword', 'Usuario Prueba', NOW())`,
            []
        );
        
        console.log('✅ Usuario de prueba creado exitosamente');
        
    } catch (error) {
        console.error('❌ Error creando usuario de prueba:', error);
    }
}

createTestUser();


