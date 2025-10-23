/**
 * Auth Sync - Detecta cambios de autenticación y sincroniza wishlist
 * Mejorado para sincronización automática única al iniciar sesión/registrarse
 */

class AuthSync {
    constructor() {
        this.lastAuthState = false;
        this.syncCompleted = false; // Flag para evitar múltiples sincronizaciones
        this.init();
    }

    init() {
        console.log('🔐 Inicializando AuthSync...');
        
        // Verificar estado inicial
        this.checkAuthState();
        
        // Configurar polling para detectar cambios
        setInterval(() => {
            this.checkAuthState();
        }, 1000);
    }

    checkAuthState() {
        const token = localStorage.getItem('cronox-token');
        const isAuthenticated = !!token;
        
        // Si el estado cambió
        if (isAuthenticated !== this.lastAuthState) {
            console.log(`🔄 Estado de autenticación cambió: ${this.lastAuthState} → ${isAuthenticated}`);
            
            if (isAuthenticated) {
                this.onUserLogin();
            } else {
                this.onUserLogout();
            }
            
            this.lastAuthState = isAuthenticated;
        }
    }

    async onUserLogin() {
        // Solo sincronizar si no se ha completado ya
        if (this.syncCompleted) {
            console.log('ℹ️ Sincronización ya completada anteriormente, saltando...');
            return;
        }

        console.log('✅ Usuario inició sesión, iniciando sincronización automática...');
        console.log('🔍 Se ha iniciado sesión, se va a revisar si hay algún elemento nuevo en la wishlist no registrado');
        
        // Marcar como completada para evitar múltiples ejecuciones
        this.syncCompleted = true;
        
        // Esperar un poco para que los managers se inicialicen
        setTimeout(async () => {
            // Priorizar wishlistManager sobre otros managers
            if (window.wishlistManager) {
                console.log('🎯 Usando wishlistManager para sincronización...');
                await window.wishlistManager.syncOnLogin();
            } else if (window.simpleWishlistSync) {
                console.log('🔄 Usando simpleWishlistSync como fallback...');
                await window.simpleWishlistSync.syncOnLogin();
            } else if (window.wishlistSyncManager) {
                console.log('🔄 Usando wishlistSyncManager como fallback...');
                await window.wishlistSyncManager.onUserLogin();
            } else {
                console.error('❌ No hay ningún manager de sincronización disponible');
            }
        }, 500);
    }

    onUserLogout() {
        console.log('❌ Usuario cerró sesión');
        // Resetear flag de sincronización para la próxima sesión
        this.syncCompleted = false;
    }

    /**
     * Método para forzar sincronización manual (útil para testing)
     */
    async forceSync() {
        console.log('🔄 Forzando sincronización manual...');
        this.syncCompleted = false;
        await this.onUserLogin();
    }
}

// Crear instancia global
window.authSync = new AuthSync();
