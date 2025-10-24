// Global Authentication Management
class AuthManager {
    constructor() {
        this.token = localStorage.getItem('cronox-token');
        this.user = JSON.parse(localStorage.getItem('cronox-user') || 'null');
        this.isAuthenticated = false;
        this.checkAuthStatus();
    }

    // Check if user is authenticated
    async checkAuthStatus() {
        if (!this.token) {
            this.isAuthenticated = false;
            return false;
        }

        // Check if token is expired locally first
        if (this.isTokenExpired()) {
            console.log('Token expired locally');
            this.logout();
            return false;
        }

        try {
            // Verify token with server
            const response = await fetch('/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.isAuthenticated = true;
                    this.user = data.data;
                    localStorage.setItem('cronox-user', JSON.stringify(this.user));
                    return true;
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }

        // If we get here, authentication failed
        this.logout();
        return false;
    }

    // Check if JWT token is expired
    isTokenExpired() {
        if (!this.token) return true;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error parsing token:', error);
            return true;
        }
    }

    // Get current user data
    getUser() {
        return this.user;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.isAuthenticated;
    }

    // Login user
    login(userData, token) {
        this.user = userData;
        this.token = token;
        this.isAuthenticated = true;
        localStorage.setItem('cronox-user', JSON.stringify(userData));
        localStorage.setItem('cronox-token', token);
        
        // Ejecutar sincronización simple inmediatamente
        this.triggerSimpleSync();
    }

    // Logout user
    logout() {
        this.user = null;
        this.token = null;
        this.isAuthenticated = false;
        localStorage.removeItem('cronox-user');
        localStorage.removeItem('cronox-token');
        
        // Limpiar wishlist al cerrar sesión
        localStorage.removeItem('cronox-wishlist');
        
        // Limpiar carrito al cerrar sesión
        if (window.globalCartManager) {
            window.globalCartManager.clearCart();
        }
        
        // Redirect to index after logout
        window.location.href = '/';
    }

    // Redirect based on auth status
    redirectToAccount() {
        if (this.isAuthenticated) {
            window.location.href = '/account';
        } else {
            window.location.href = '/login';
        }
    }

    // Get authentication headers for API requests
    getAuthHeaders() {
        if (this.isAuthenticated && this.token) {
            return {
                'Authorization': `Bearer ${this.token}`
            };
        }
        return {};
    }

    // Update header based on auth status
    updateHeader() {
        const userIcon = document.querySelector('a[href="login.html"], a[href="account.html"]');
        if (userIcon) {
            if (this.isAuthenticated) {
                userIcon.href = '/account';
                userIcon.title = 'Mi Cuenta';
            } else {
                userIcon.href = '/login';
                userIcon.title = 'Iniciar Sesión';
            }
        }
    }

    // Start periodic session check
    startSessionCheck() {
        // Check session every 5 minutes
        setInterval(() => {
            if (this.isAuthenticated && this.isTokenExpired()) {
                console.log('Session expired, logging out');
                this.logout();
                // Redirect to login if on protected page
                if (window.location.pathname === '/account') {
                    window.location.href = '/login';
                }
            }
        }, 5 * 60 * 1000); // 5 minutes
    }

    // Trigger simple sync for wishlist
    triggerSimpleSync() {
        console.log('🎯 Ejecutando sincronización simple de wishlist...');
        
        // Llamar directamente a la función simple
        setTimeout(() => {
            if (window.simpleWishlistSync) {
                window.simpleWishlistSync.syncOnLogin();
            }
        }, 100);
    }
}

// Global auth instance
window.authManager = new AuthManager();

// Auto-update header on page load
document.addEventListener('DOMContentLoaded', function() {
    window.authManager.updateHeader();
    window.authManager.startSessionCheck();
});
