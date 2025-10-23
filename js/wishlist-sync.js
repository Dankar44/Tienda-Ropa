/**
 * Wishlist Sync Manager
 * Maneja la sincronización entre el localStorage y la base de datos
 */
class WishlistSyncManager {
    constructor() {
        this.apiBaseUrl = '/api';
        this.syncInProgress = false;
    }

    /**
     * Obtiene el token de autenticación del localStorage
     */
    getAuthToken() {
        return localStorage.getItem('cronox-token');
    }

    /**
     * Obtiene el ID del usuario desde el token JWT
     */
    getUserIdFromToken() {
        const token = this.getAuthToken();
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.userId;
        } catch (error) {
            console.error('Error decodificando token:', error);
            return null;
        }
    }

    /**
     * Obtiene la wishlist del localStorage
     */
    getWishlistFromStorage() {
        const wishlist = localStorage.getItem('cronox-wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    }

    /**
     * Guarda la wishlist en el localStorage
     */
    saveWishlistToStorage(wishlist) {
        localStorage.setItem('cronox-wishlist', JSON.stringify(wishlist));
    }

    /**
     * Sincroniza la wishlist del localStorage con la base de datos
     * Solo se ejecuta una vez al iniciar sesión/registrarse
     * Solo sincroniza elementos que no estén ya en la base de datos
     */
    async syncWishlistToDatabase() {
        if (this.syncInProgress) {
            console.log('Sincronización ya en progreso...');
            return;
        }

        const userId = this.getUserIdFromToken();
        if (!userId) {
            console.log('Usuario no autenticado, saltando sincronización');
            return;
        }

        const wishlist = this.getWishlistFromStorage();
        if (wishlist.length === 0) {
            console.log('Wishlist vacía, saltando sincronización');
            return;
        }

        console.log(`🔄 Sincronizando ${wishlist.length} elementos del wishlist local con la base de datos...`);
        console.log('🔍 Verificando qué elementos necesitan ser sincronizados...');
        this.syncInProgress = true;

        try {
            // Primero obtener la wishlist actual de la base de datos
            const currentResponse = await fetch(`${this.apiBaseUrl}/favourites/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            let existingProductIds = [];
            if (currentResponse.ok) {
                const currentResult = await currentResponse.json();
                if (currentResult.success) {
                    existingProductIds = currentResult.data.map(product => product.id.toString());
                    console.log('📋 Productos ya existentes en BD:', existingProductIds.length);
                }
            }

            // Filtrar solo los productos que no están en la base de datos
            const newProducts = wishlist.filter(item => !existingProductIds.includes(item.id));
            
            if (newProducts.length === 0) {
                console.log('✅ Todos los productos del wishlist local ya están en la base de datos');
                this.showNotification('Wishlist ya está sincronizada', 'success');
                return;
            }

            console.log(`📦 Productos nuevos a sincronizar: ${newProducts.length}`);
            console.log('📋 Productos nuevos:', newProducts.map(item => item.name).join(', '));

            const response = await fetch(`${this.apiBaseUrl}/favourites/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAuthToken()}`
                },
                body: JSON.stringify({
                    user_id: userId,
                    wishlist_items: newProducts
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Wishlist sincronizada exitosamente:', result.message);
                console.log(`📊 Productos nuevos sincronizados: ${result.data.synced_count || 0}`);
                console.log('🎉 Sincronización automática completada - Los elementos nuevos del wishlist local han sido subidos a la base de datos');
                this.showNotification(`${result.data.synced_count || 0} productos sincronizados con tu cuenta`, 'success');
                
                // Mostrar estadísticas de sincronización
                if (result.data.errors && result.data.errors.length > 0) {
                    console.warn('⚠️ Algunos productos no se pudieron sincronizar:', result.data.errors);
                }
            } else {
                console.error('❌ Error sincronizando wishlist:', result.error);
                this.showNotification('Error sincronizando wishlist', 'error');
            }
        } catch (error) {
            console.error('❌ Error de red sincronizando wishlist:', error);
            this.showNotification('Error de conexión', 'error');
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Carga la wishlist desde la base de datos y la sincroniza con localStorage
     */
    async loadWishlistFromDatabase() {
        const userId = this.getUserIdFromToken();
        if (!userId) {
            console.log('Usuario no autenticado, usando wishlist local');
            return;
        }

        console.log('📥 Cargando wishlist desde la base de datos...');

        try {
            const response = await fetch(`${this.apiBaseUrl}/favourites/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.getAuthToken()}`
                }
            });

            const result = await response.json();

            if (result.success) {
                // Convertir productos de la base de datos al formato del localStorage
                const wishlistItems = result.data.map(product => ({
                    id: product.id.toString(),
                    name: product.name,
                    price: `€${product.price.toFixed(2).replace('.', ',')}`,
                    image: product.image_url || product.image,
                    addedAt: product.favourited_at
                }));

                // Actualizar localStorage
                this.saveWishlistToStorage(wishlistItems);
                
                console.log('✅ Wishlist cargada desde la base de datos:', wishlistItems.length, 'productos');
                console.log('📋 Productos encontrados en la base de datos:', wishlistItems.map(item => item.name).join(', '));
                this.showNotification('Wishlist cargada desde tu cuenta', 'success');
                
                // Recargar la página de wishlist si estamos en ella
                if (window.location.pathname.includes('wishlist.html')) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } else {
                console.error('❌ Error cargando wishlist:', result.error);
            }
        } catch (error) {
            console.error('❌ Error de red cargando wishlist:', error);
        }
    }

    /**
     * Sincronización automática cuando el usuario se autentica
     * Solo se ejecuta una vez por sesión
     */
    async onUserLogin() {
        console.log('🚫 WishlistSyncManager: Deshabilitado temporalmente para evitar conflictos');
        return;
        
        // Verificar si ya se sincronizó en esta sesión
        const syncKey = 'cronox-wishlist-sync-completed';
        if (localStorage.getItem(syncKey)) {
            console.log('ℹ️ Sincronización ya completada en esta sesión, saltando...');
            return;
        }

        console.log('🔄 Usuario autenticado, iniciando sincronización automática...');
        console.log('🔍 Se ha iniciado sesión, se va a revisar si hay algún elemento nuevo en la wishlist no registrado');
        console.log('📋 Proceso de sincronización iniciado - Verificando elementos del wishlist local...');
        
        // Verificar wishlist local antes de cargar desde BD
        const localWishlist = this.getWishlistFromStorage();
        console.log('📦 Wishlist local encontrada:', localWishlist.length, 'elementos');
        if (localWishlist.length > 0) {
            console.log('📋 Elementos en wishlist local:', localWishlist.map(item => item.name).join(', '));
        }
        
        // Primero cargar desde la base de datos
        await this.loadWishlistFromDatabase();
        
        // Luego sincronizar cualquier cambio local (solo una vez al iniciar sesión)
        setTimeout(async () => {
            console.log('⏰ Iniciando sincronización automática en 1 segundo...');
            await this.syncWishlistToDatabase();
            
            // Marcar como completada para esta sesión
            localStorage.setItem(syncKey, 'true');
            console.log('✅ Sincronización automática completada y marcada como finalizada');
            console.log('🎉 Proceso de sincronización de wishlist finalizado - Los elementos nuevos han sido subidos a la base de datos');
        }, 1000);
    }

    /**
     * Sincronización automática cuando se agrega/quita un producto
     */
    async onWishlistChange() {
        if (this.getUserIdFromToken()) {
            // Pequeño delay para evitar múltiples llamadas
            setTimeout(() => {
                this.syncWishlistToDatabase();
            }, 500);
        }
    }

    /**
     * Muestra notificaciones al usuario
     */
    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `fixed top-20 right-4 px-4 py-2 rounded font-mono text-sm z-50 transition-all duration-300`;
        
        // Estilos según el tipo
        switch (type) {
            case 'success':
                notification.className += ' bg-green-600 text-white';
                break;
            case 'error':
                notification.className += ' bg-red-600 text-white';
                break;
            default:
                notification.className += ' bg-black text-white';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Inicializa el manager de sincronización
     */
    init() {
        console.log('🚀 Inicializando WishlistSyncManager...');
        
        // Verificar si el usuario está autenticado
        if (this.getUserIdFromToken()) {
            this.onUserLogin();
        }
        
        // Escuchar cambios en el localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'cronox-wishlist') {
                this.onWishlistChange();
            }
        });
        
        // Interceptar cambios en la wishlist (override de funciones existentes)
        this.overrideWishlistFunctions();
    }

    /**
     * Override de las funciones de wishlist para sincronización automática
     */
    overrideWishlistFunctions() {
        // Guardar referencias originales
        const originalAddToWishlist = window.addToWishlist;
        const originalRemoveFromWishlist = window.removeFromWishlist;
        
        // Override de addToWishlist
        if (typeof window.addToWishlist === 'function') {
            window.addToWishlist = (...args) => {
                const result = originalAddToWishlist.apply(this, args);
                this.onWishlistChange();
                return result;
            };
        }
        
        // Override de removeFromWishlist
        if (typeof window.removeFromWishlist === 'function') {
            window.removeFromWishlist = (...args) => {
                const result = originalRemoveFromWishlist.apply(this, args);
                this.onWishlistChange();
                return result;
            };
        }
    }
}

// Crear instancia global
window.wishlistSyncManager = new WishlistSyncManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.wishlistSyncManager.init();
});

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WishlistSyncManager;
}
