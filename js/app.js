// Main App Initialization
class CronoxApp {
    constructor() {
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) return;
        
        // Skip initialization on admin pages
        if (window.location.pathname.includes('admin.html')) {
            console.log('⏭️ Skipping CRONOX App initialization on admin page');
            return;
        }

        console.log('🚀 Inicializando CRONOX App...');

        try {
            // Cargar productos y categorías
            await this.loadInitialData();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Inicializar wishlist y carrito
            await this.initializeUserData();
            
            // Renderizar productos dinámicos
            await this.renderDynamicContent();

            this.isInitialized = true;
            console.log('✅ CRONOX App inicializada correctamente');
        } catch (error) {
            console.error('❌ Error inicializando CRONOX App:', error);
        }
    }

    async loadInitialData() {
        try {
            // Cargar productos
            await window.productManager.loadProducts();
            
            // Cargar categorías
            await window.productManager.loadCategories();
            
            console.log('📦 Datos iniciales cargados');
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }

    async initializeUserData() {
        if (window.authManager && window.authManager.isAuthenticated()) {
            try {
                // Cargar wishlist del usuario
                await window.wishlistManager.loadWishlist();
                
                // Cargar carrito del usuario
                await window.cartManager.loadCart();
                
                // Actualizar UI
                window.cartManager.updateCartUI();
                
                console.log('👤 Datos de usuario cargados');
            } catch (error) {
                console.error('Error cargando datos de usuario:', error);
            }
        }
    }

    async renderDynamicContent() {
        // Renderizar productos en el carrusel principal
        const carouselContainer = document.getElementById('product-carousel');
        if (carouselContainer) {
            await window.productManager.renderProductCarousel(carouselContainer);
        }

        // Renderizar productos en la sección "LOVED BY THE COMMUNITY"
        const communityContainer = document.getElementById('community-products');
        if (communityContainer) {
            await window.productManager.renderProductCarousel(communityContainer);
        }

        // Configurar wishlist listeners
        window.wishlistManager.setupWishlistListeners();
        
        // Inicializar iconos de corazón
        await window.wishlistManager.initializeHeartIcons();
    }

    setupEventListeners() {
        // Event listeners para el carrito
        this.setupCartEventListeners();
        
        // Event listeners para el menú
        this.setupMenuEventListeners();
        
        // Event listeners para búsqueda
        this.setupSearchEventListeners();
        
        // Event listeners para autenticación
        this.setupAuthEventListeners();
    }

    setupCartEventListeners() {
        const cartToggle = document.getElementById('cart-toggle');
        const cartDropdown = document.getElementById('cart-dropdown');
        const closeCart = document.getElementById('close-cart');
        
        if (cartToggle && cartDropdown) {
            cartToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (cartDropdown.classList.contains('hidden')) {
                    cartDropdown.classList.remove('hidden');
                    setTimeout(() => {
                        cartDropdown.classList.remove('translate-x-full');
                    }, 10);
                } else {
                    cartDropdown.classList.add('translate-x-full');
                    setTimeout(() => {
                        cartDropdown.classList.add('hidden');
                    }, 500);
                }
            });
        }

        if (closeCart && cartDropdown) {
            closeCart.addEventListener('click', () => {
                cartDropdown.classList.add('translate-x-full');
                setTimeout(() => {
                    cartDropdown.classList.add('hidden');
                }, 500);
            });
        }

        // Cerrar carrito al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (cartToggle && cartDropdown && 
                !cartToggle.contains(e.target) && 
                !cartDropdown.contains(e.target)) {
                if (!cartDropdown.classList.contains('hidden')) {
                    cartDropdown.classList.add('translate-x-full');
                    setTimeout(() => {
                        cartDropdown.classList.add('hidden');
                    }, 500);
                }
            }
        });
    }

    setupMenuEventListeners() {
        const menuToggle = document.getElementById('menu-toggle');
        const menuDropdown = document.getElementById('menu-dropdown');
        const closeMenu = document.getElementById('close-menu');
        
        if (menuToggle && menuDropdown) {
            menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (menuDropdown.classList.contains('hidden')) {
                    menuDropdown.classList.remove('hidden');
                    setTimeout(() => {
                        menuDropdown.classList.remove('-translate-x-full');
                    }, 10);
                } else {
                    menuDropdown.classList.add('-translate-x-full');
                    setTimeout(() => {
                        menuDropdown.classList.add('hidden');
                    }, 500);
                }
            });
        }

        if (closeMenu && menuDropdown) {
            closeMenu.addEventListener('click', () => {
                menuDropdown.classList.add('-translate-x-full');
                setTimeout(() => {
                    menuDropdown.classList.add('hidden');
                }, 500);
            });
        }

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (menuToggle && menuDropdown && 
                !menuToggle.contains(e.target) && 
                !menuDropdown.contains(e.target)) {
                if (!menuDropdown.classList.contains('hidden')) {
                    menuDropdown.classList.add('-translate-x-full');
                    setTimeout(() => {
                        menuDropdown.classList.add('hidden');
                    }, 500);
                }
            }
        });
    }

    setupSearchEventListeners() {
        const searchInput = document.getElementById('search-input');
        const searchButton = document.getElementById('search-button');
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(searchInput.value);
                }
            });
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                if (searchInput) {
                    this.performSearch(searchInput.value);
                }
            });
        }
    }

    setupAuthEventListeners() {
        // Verificar estado de autenticación al cargar
        this.updateAuthUI();
        
        // Escuchar cambios en la autenticación
        window.addEventListener('storage', (e) => {
            if (e.key === 'cronox-token') {
                this.updateAuthUI();
            }
        });
    }

    async performSearch(query) {
        if (!query.trim()) return;
        
        try {
            const products = await window.productManager.searchProducts(query);
            
            // Redirigir a la página de búsqueda con resultados
            window.location.href = `/buscar?q=${encodeURIComponent(query)}`;
        } catch (error) {
            console.error('Error en búsqueda:', error);
        }
    }

    updateAuthUI() {
        const isAuthenticated = window.api.auth.isLoggedIn();
        const user = window.api.auth.getUser();
        
        // Actualizar enlaces de autenticación
        const loginLink = document.getElementById('login-link');
        const registerLink = document.getElementById('register-link');
        const accountLink = document.getElementById('account-link');
        const logoutLink = document.getElementById('logout-link');
        
        if (isAuthenticated) {
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (accountLink) accountLink.style.display = 'block';
            if (logoutLink) logoutLink.style.display = 'block';
            
            // Actualizar nombre de usuario si está disponible
            if (user && accountLink) {
                accountLink.textContent = `${user.firstName} ${user.lastName}`;
            }
        } else {
            if (loginLink) loginLink.style.display = 'block';
            if (registerLink) registerLink.style.display = 'block';
            if (accountLink) accountLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'none';
        }
    }

    // Método para logout
    async logout() {
        try {
            await window.api.logout();
            await window.wishlistManager.loadWishlist();
            await window.cartManager.loadCart();
            window.cartManager.updateCartUI();
            this.updateAuthUI();
            this.showNotification('Sesión cerrada correctamente');
        } catch (error) {
            console.error('Error en logout:', error);
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-600' : type === 'warning' ? 'bg-yellow-600' : 'bg-black';
        
        notification.className = `fixed top-20 right-4 ${bgColor} text-white px-4 py-2 rounded font-mono text-sm z-50`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar la app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    window.cronoxApp = new CronoxApp();
    await window.cronoxApp.init();
});

// Hacer logout disponible globalmente
window.logout = () => window.cronoxApp.logout();
