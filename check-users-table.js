const { query } = require('./config/database');

async function checkUsersTable() {
    try {
        console.log('🔍 Verificando estructura de la tabla users...');
        
        // Obtener información de las columnas de la tabla users
        const result = await query(`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            ORDER BY ordinal_position
        `);
        
        console.log('📋 Columnas de la tabla users:');
        result.rows.forEach(row => {
            console.log(`   - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Verificar si hay usuarios existentes
        const users = await query('SELECT id, email FROM users LIMIT 5');
        console.log('\n👥 Usuarios existentes:');
        users.rows.forEach(user => {
            console.log(`   - ID: ${user.id}, Email: ${user.email}`);
        });
        
    } catch (error) {
        console.error('❌ Error verificando tabla users:', error);
    }
}

checkUsersTable();


