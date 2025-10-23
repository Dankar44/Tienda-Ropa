/**
 * Wishlist Manager - Sistema simplificado de gestión de wishlist
 * Maneja la sincronización entre localStorage y base de datos
 */

class WishlistManager {
    constructor() {
        this.apiBaseUrl = '';
        this.isAuthenticated = false;
        this.userId = null;
        this.syncQueue = [];
        this.init();
    }

    /**
     * Inicializar el manager
     */
    init() {
        console.log('🚀 Inicializando WishlistManager...');
        
        // Verificar autenticación
        this.checkAuthentication();
        
        // Configurar listeners
        this.setupEventListeners();
        
        // Sincronizar si está autenticado
        if (this.isAuthenticated) {
            this.syncOnLogin();
        }
    }

    /**
     * Verificar si el usuario está autenticado
     */
    checkAuthentication() {
        const token = localStorage.getItem('cronox-token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                this.userId = payload.userId;
                this.isAuthenticated = true;
                console.log('✅ Usuario autenticado:', this.userId);
            } catch (error) {
                console.log('❌ Token inválido');
                this.isAuthenticated = false;
                this.userId = null;
            }
        } else {
            console.log('ℹ️ Usuario no autenticado');
            this.isAuthenticated = false;
            this.userId = null;
        }
    }

    /**
     * Configurar event listeners para botones de corazón
     */
    setupEventListeners() {
        // Listener para botones de corazón existentes
        document.addEventListener('click', (e) => {
            if (e.target.closest('.heart-link')) {
                // 🎯 NO EJECUTAR EN WISHLIST.HTML - Solo eliminar, no agregar
                if (window.location.pathname.includes('wishlist.html')) {
                    console.log('🚫 WishlistManager: Ignorando clic en wishlist.html (solo eliminación)');
                    return;
                }
                this.handleHeartClick(e);
            }
        });

        // Listener para cambios en localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'cronox-wishlist') {
                this.handleWishlistChange();
            }
        });
    }

    /**
     * Manejar clic en botón de corazón
     */
    async handleHeartClick(event) {
        const heartButton = event.target.closest('.heart-link');
        if (!heartButton) return;

        const productId = heartButton.getAttribute('data-product-id');
        const productName = heartButton.getAttribute('data-product-name');
        const productPrice = heartButton.getAttribute('data-product-price');
        const productImage = heartButton.getAttribute('data-product-image');

        if (!productId) return;

        // 🎯 MENSAJE DE CONSOLA SOLICITADO
        console.log('💖 Se ha pulsado el botón de favoritos!', {
            productId: productId,
            productName: productName,
            productPrice: productPrice,
            timestamp: new Date().toISOString(),
            page: window.location.pathname
        });

        // 🎯 ENVIAR DATOS A LA BASE DE DATOS (solo si está autenticado)
        if (this.isAuthenticated) {
            await this.sendToDatabase(productId, productName, productPrice);
        }

        // Agregar/remover del localStorage
        const isInWishlist = this.toggleWishlistItem(productId, productName, productPrice, productImage);
        
        // Actualizar UI
        this.updateHeartIcon(heartButton, isInWishlist);

        // Sincronizar con base de datos si está autenticado
        if (this.isAuthenticated) {
            await this.syncToDatabase(productId, isInWishlist);
        } else {
            // Agregar a la cola para sincronizar después
            this.addToSyncQueue(productId, isInWishlist);
        }
    }

    /**
     * Alternar item en wishlist
     */
    toggleWishlistItem(productId, productName, productPrice, productImage) {
        const wishlist = this.getWishlist();
        const existingItem = wishlist.find(item => item.id === productId);
        
        if (existingItem) {
            // Remover
            const filteredWishlist = wishlist.filter(item => item.id !== productId);
            this.saveWishlist(filteredWishlist);
            console.log('❌ Producto removido de wishlist');
            return false;
        } else {
            // Agregar
            wishlist.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                addedAt: new Date().toISOString()
            });
            this.saveWishlist(wishlist);
            console.log('✅ Producto agregado a wishlist');
            return true;
        }
    }

    /**
     * Obtener wishlist del localStorage
     */
    getWishlist() {
        const wishlist = localStorage.getItem('cronox-wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    }

    /**
     * Guardar wishlist en localStorage
     */
    saveWishlist(wishlist) {
        localStorage.setItem('cronox-wishlist', JSON.stringify(wishlist));
    }

    /**
     * Verificar si un producto está en wishlist
     */
    isInWishlist(productId) {
        const wishlist = this.getWishlist();
        return wishlist.find(item => item.id === productId) !== undefined;
    }

    /**
     * Actualizar icono de corazón
     */
    updateHeartIcon(heartButton, isInWishlist) {
        const svg = heartButton.querySelector('svg');
        if (svg) {
            if (isInWishlist) {
                svg.setAttribute('fill', 'currentColor');
                svg.style.color = '#000000';
            } else {
                svg.setAttribute('fill', 'none');
                svg.style.color = '';
            }
        }
    }

    /**
     * Sincronizar con base de datos
     */
    async syncToDatabase(productId, isInWishlist) {
        if (!this.isAuthenticated) {
            console.log('❌ Usuario no autenticado, agregando a cola');
            this.addToSyncQueue(productId, isInWishlist);
            return;
        }

        try {
            const endpoint = isInWishlist ? '/api/favourites' : '/api/favourites';
            const method = isInWishlist ? 'POST' : 'DELETE';

            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cronox-token')}`
                },
                body: JSON.stringify({
                    user_id: this.userId,
                    product_id: productId
                })
            });

            if (response.ok) {
                console.log(`✅ Sincronizado con BD: ${isInWishlist ? 'Agregado' : 'Removido'}`);
                if (window.notifications) {
                    window.notifications.success(`Producto ${isInWishlist ? 'agregado' : 'removido'} de favoritos`);
                }
            } else {
                console.error('❌ Error sincronizando con BD:', response.status);
                // Agregar a cola para reintentar
                this.addToSyncQueue(productId, isInWishlist);
                if (window.notifications) {
                    window.notifications.error('Error sincronizando, se reintentará más tarde');
                }
            }
        } catch (error) {
            console.error('❌ Error de red:', error);
            // Agregar a cola para reintentar
            this.addToSyncQueue(productId, isInWishlist);
            if (window.notifications) {
                window.notifications.error('Error de conexión, se reintentará más tarde');
            }
        }
    }

    /**
     * Agregar a cola de sincronización
     */
    addToSyncQueue(productId, isInWishlist) {
        this.syncQueue.push({ productId, isInWishlist, timestamp: Date.now() });
        console.log('📝 Agregado a cola de sincronización:', { productId, isInWishlist });
    }

    /**
     * Sincronizar cola pendiente
     */
    async syncQueueToDatabase() {
        if (!this.isAuthenticated || this.syncQueue.length === 0) return;

        console.log('🔄 Sincronizando cola pendiente...', this.syncQueue.length, 'elementos');

        for (const item of this.syncQueue) {
            await this.syncToDatabase(item.productId, item.isInWishlist);
        }

        this.syncQueue = [];
        console.log('✅ Cola sincronizada');
    }

    /**
     * Sincronizar al iniciar sesión
     */
    async syncOnLogin() {
        console.log('🔄 Usuario autenticado, sincronizando...');
        
        // Obtener wishlist local actual
        const localWishlist = this.getWishlist();
        console.log('📝 Wishlist local encontrada:', localWishlist.length, 'elementos');
        
        // Cargar wishlist desde BD
        await this.loadWishlistFromDatabase();
        
        // Sincronizar cola pendiente
        await this.syncQueueToDatabase();
        
        // Si hay elementos locales que no están en BD, sincronizarlos
        if (localWishlist.length > 0) {
            console.log('🔄 Sincronizando wishlist local con base de datos...');
            await this.syncLocalWishlistToDatabase(localWishlist);
        }
    }

    /**
     * Sincronizar wishlist local con base de datos
     */
    async syncLocalWishlistToDatabase(localWishlist) {
        if (!this.isAuthenticated) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/favourites/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cronox-token')}`
                },
                body: JSON.stringify({
                    user_id: this.userId,
                    wishlist_items: localWishlist
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Wishlist local sincronizada con BD:', result.message);
                console.log('📊 Productos sincronizados:', result.data.synced_count);
            } else {
                console.error('❌ Error sincronizando wishlist local:', response.status);
            }
        } catch (error) {
            console.error('❌ Error de red sincronizando wishlist local:', error);
        }
    }

    /**
     * Cargar wishlist desde base de datos
     */
    async loadWishlistFromDatabase() {
        if (!this.isAuthenticated) return;

        try {
            const response = await fetch(`${this.apiBaseUrl}/api/favourites/${this.userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('cronox-token')}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    const wishlistItems = result.data.map(product => ({
                        id: product.id.toString(),
                        name: product.name,
                        price: `€${parseFloat(product.price || 0).toFixed(2).replace('.', ',')}`,
                        image: product.image_url || product.image,
                        addedAt: product.favourited_at
                    }));

                    // Obtener wishlist local actual
                    const localWishlist = this.getWishlist();
                    
                    // Combinar wishlist local con la de BD (evitar duplicados)
                    const combinedWishlist = [...localWishlist];
                    
                    for (const bdItem of wishlistItems) {
                        const existsLocally = localWishlist.find(item => item.id === bdItem.id);
                        if (!existsLocally) {
                            combinedWishlist.push(bdItem);
                        }
                    }
                    
                    // Guardar wishlist combinada
                    this.saveWishlist(combinedWishlist);
                    console.log('✅ Wishlist combinada:', combinedWishlist.length, 'productos totales');
                    console.log('📊 - Locales:', localWishlist.length, '| BD:', wishlistItems.length);
                }
            }
        } catch (error) {
            console.error('❌ Error cargando wishlist desde BD:', error);
        }
    }

    /**
     * Manejar cambios en wishlist
     */
    handleWishlistChange() {
        console.log('💝 Wishlist cambiada');
        // Aquí se puede agregar lógica adicional si es necesario
    }

    /**
     * 🎯 NUEVA FUNCIÓN: Forzar actualización de la UI
     */
    forceUIUpdate() {
        // Disparar evento personalizado para que las páginas se actualicen
        window.dispatchEvent(new CustomEvent('wishlistCleared'));
        
        // Si estamos en wishlist.html, recargar la página
        if (window.location.pathname.includes('wishlist.html')) {
            setTimeout(() => {
                location.reload();
            }, 500);
        }
    }

    /**
     * 🎯 NUEVA FUNCIÓN: Limpieza automática completa
     */
    async performFullCleanup() {
        try {
            console.log('🧹 Iniciando limpieza automática completa...');
            
            // Limpiar localStorage
            localStorage.removeItem('cronox-wishlist');
            localStorage.removeItem('cronox-wishlist-sync-queue');
            
            // Limpiar cola de sincronización
            this.syncQueue = [];
            
            // Forzar actualización de UI
            this.forceUIUpdate();
            
            console.log('✅ Limpieza automática completada');
        } catch (error) {
            console.error('❌ Error en limpieza automática:', error);
        }
    }

    /**
     * Método público para sincronización manual
     */
    async manualSync() {
        if (!this.isAuthenticated) {
            console.log('❌ Usuario no autenticado');
            return;
        }

        const wishlist = this.getWishlist();
        if (wishlist.length === 0) {
            console.log('ℹ️ Wishlist vacía');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/favourites/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cronox-token')}`
                },
                body: JSON.stringify({
                    user_id: this.userId,
                    wishlist_items: wishlist
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Sincronización manual completada:', result.message);
            } else {
                console.error('❌ Error en sincronización manual:', response.status);
            }
        } catch (error) {
            console.error('❌ Error de red en sincronización manual:', error);
        }
    }

    /**
     * 🎯 NUEVA FUNCIÓN: Enviar datos a la base de datos cuando se pulse el botón de favoritos
     */
    async sendToDatabase(productId, productName, productPrice) {
        try {
            // Verificar si el usuario está autenticado
            if (!this.isAuthenticated || !this.userId) {
                console.log('⚠️ Usuario no autenticado, no se puede enviar a la base de datos');
                return;
            }

            // Determinar si el producto ya está en favoritos
            const isInWishlist = this.isInWishlist(productId);
            const endpoint = isInWishlist ? '/api/favourites' : '/api/favourites';
            const method = isInWishlist ? 'DELETE' : 'POST';

            console.log(`🔄 Enviando a base de datos: ${isInWishlist ? 'Removiendo' : 'Agregando'} favorito...`);

            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('cronox-token')}`
                },
                body: JSON.stringify({
                    user_id: this.userId,
                    product_id: productId
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Datos enviados exitosamente a la base de datos:', {
                    action: isInWishlist ? 'removido' : 'agregado',
                    productId: productId,
                    productName: productName,
                    favourites_count: result.favourites_count || 'N/A',
                    message: result.message
                });
            } else {
                const errorData = await response.json();
                console.error('❌ Error enviando a base de datos:', {
                    status: response.status,
                    error: errorData.error || 'Error desconocido'
                });
            }
        } catch (error) {
            console.error('❌ Error de red enviando a base de datos:', error);
        }
    }
}

// Crear instancia global
window.wishlistManager = new WishlistManager();

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WishlistManager;
}
