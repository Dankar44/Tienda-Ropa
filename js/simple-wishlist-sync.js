/**
 * Simple Wishlist Sync - Sincronización directa al login/registro
 * Función simple que obtiene wishlist local, lo muestra en consola y lo sube a BD
 */

class SimpleWishlistSync {
    constructor() {
        this.syncExecuted = false;
    }

    /**
     * Función principal que se ejecuta al login/registro
     */
    async syncOnLogin() {
        console.log('🎯 SimpleWishlistSync: syncOnLogin() ejecutándose...');
        
        // Verificar si ya se ejecutó en esta sesión
        const syncKey = 'cronox-simple-sync-executed';
        if (localStorage.getItem(syncKey)) {
            console.log('ℹ️ Sincronización ya ejecutada en esta sesión');
            return;
        }

        console.log('🔍 Se ha iniciado sesión, se va a revisar si hay algún elemento nuevo en la wishlist no registrado');
        
        // 1. Obtener wishlist del localStorage
        const wishlist = this.getLocalWishlist();
        
        // 2. Mostrar en consola cuántos elementos hay
        console.log(`📦 Elementos encontrados en wishlist local: ${wishlist.length}`);
        
        if (wishlist.length === 0) {
            console.log('✅ Wishlist vacía, no hay nada que sincronizar');
            localStorage.setItem(syncKey, 'true');
            return;
        }

        // 3. Mostrar los elementos en consola
        console.log('📋 Elementos en wishlist local:');
        wishlist.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} (ID: ${item.id})`);
        });

        // 4. Subir a la base de datos
        console.log('🚀 Iniciando subida a base de datos...');
        await this.uploadToDatabase(wishlist);
        console.log('✅ Subida a base de datos completada');
        
        // 5. Marcar como ejecutado
        localStorage.setItem(syncKey, 'true');
        console.log('🎉 Sincronización completada y marcada como ejecutada');
    }

    /**
     * Obtener wishlist del localStorage
     */
    getLocalWishlist() {
        const wishlist = localStorage.getItem('cronox-wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    }

    /**
     * Subir wishlist a la base de datos
     */
    async uploadToDatabase(wishlist) {
        const token = localStorage.getItem('cronox-token');
        if (!token) {
            console.log('❌ No hay token de autenticación');
            return;
        }

        try {
            // Obtener ID del usuario del token
            const userId = this.getUserIdFromToken(token);
            if (!userId) {
                console.log('❌ No se pudo obtener ID del usuario');
                return;
            }

            console.log(`🔄 Subiendo ${wishlist.length} elementos a la base de datos...`);
            console.log(`👤 Usuario ID: ${userId}`);
            console.log(`📤 Enviando IDs: [${wishlist.map(item => item.id).join(', ')}]`);

            const response = await fetch('/api/favourites/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    wishlist_items: wishlist
                })
            });

            console.log(`📡 Datos enviados al servidor:`, {
                user_id: userId,
                wishlist_items: wishlist.map(item => ({ id: item.id, name: item.name }))
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Wishlist subida exitosamente a la base de datos');
                console.log(`📊 Productos sincronizados: ${result.data.synced_count || 0}`);
            } else {
                console.error('❌ Error subiendo wishlist:', result.error);
            }

        } catch (error) {
            console.error('❌ Error de conexión:', error);
        }
    }

    /**
     * Obtener ID del usuario desde el token JWT
     */
    getUserIdFromToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch (error) {
            console.error('Error decodificando token:', error);
            return null;
        }
    }

    /**
     * Resetear para nueva sesión
     */
    reset() {
        this.syncExecuted = false;
        localStorage.removeItem('cronox-simple-sync-executed');
    }

    /**
     * Función para probar sincronización manualmente desde consola
     */
    async testSync() {
        console.log('🧪 Probando sincronización manual...');
        this.reset();
        await this.syncOnLogin();
    }
}

// Crear instancia global
window.simpleWishlistSync = new SimpleWishlistSync();

// Debug: Verificar que se está cargando
console.log('🚀 SimpleWishlistSync cargado y disponible:', !!window.simpleWishlistSync);

// Función global para probar sincronización manualmente
window.testWishlistSync = () => {
    if (window.simpleWishlistSync) {
        window.simpleWishlistSync.testSync();
    } else {
        console.error('❌ simpleWishlistSync no está disponible');
    }
};

console.log('💡 Para probar sincronización manualmente, ejecuta: testWishlistSync()');
