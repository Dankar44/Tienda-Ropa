const { query, testConnection } = require('../config/database');

async function clearUserData() {
    try {
        console.log('🔄 Iniciando limpieza de datos de usuarios...');
        
        // Probar conexión
        const connected = await testConnection();
        if (!connected) {
            console.error('❌ No se pudo conectar a la base de datos');
            return;
        }

        // Verificar qué tablas existen
        console.log('🔍 Verificando tablas existentes...');
        const tablesResult = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('users', 'user_favourites', 'user-favourites')
        `);
        
        console.log('📋 Tablas encontradas:', tablesResult.rows.map(row => row.table_name));

        // Borrar datos de user_favourites o user-favourites primero (por las foreign keys)
        const favouritesTableName = tablesResult.rows.find(row => 
            row.table_name === 'user_favourites' || row.table_name === 'user-favourites'
        )?.table_name;

        if (favouritesTableName) {
            console.log(`🗑️  Borrando datos de la tabla ${favouritesTableName}...`);
            const favouritesResult = await query(`DELETE FROM ${favouritesTableName}`);
            console.log(`✅ Se borraron ${favouritesResult.rowCount} registros de ${favouritesTableName}`);
        } else {
            console.log('⚠️  No se encontró la tabla de favoritos');
        }

        // Borrar datos de users
        const usersTableExists = tablesResult.rows.find(row => row.table_name === 'users');
        if (usersTableExists) {
            console.log('🗑️  Borrando datos de la tabla users...');
            const usersResult = await query('DELETE FROM users');
            console.log(`✅ Se borraron ${usersResult.rowCount} registros de users`);
        } else {
            console.log('⚠️  No se encontró la tabla users');
        }

        // Verificar que las tablas estén vacías
        console.log('🔍 Verificando que las tablas estén vacías...');
        
        if (usersTableExists) {
            const usersCount = await query('SELECT COUNT(*) FROM users');
            console.log(`📊 Registros restantes en users: ${usersCount.rows[0].count}`);
        }
        
        if (favouritesTableName) {
            const favouritesCount = await query(`SELECT COUNT(*) FROM ${favouritesTableName}`);
            console.log(`📊 Registros restantes en ${favouritesTableName}: ${favouritesCount.rows[0].count}`);
        }

        console.log('🎉 ¡Limpieza completada! Las tablas están listas para nuevos datos.');
        
    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la función
clearUserData();
