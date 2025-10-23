// Wishlist Manager
class WishlistManager {
    constructor() {
        this.wishlist = [];
        this.isLoading = false;
    }

    async loadWishlist() {
        if (!window.api.auth.isAuthenticated()) {
            this.wishlist = [];
            return this.wishlist;
        }

        try {
            this.isLoading = true;
            const response = await window.api.getWishlist();
            this.wishlist = response.data;
            return this.wishlist;
        } catch (error) {
            console.error('Error cargando wishlist:', error);
            this.wishlist = [];
            return this.wishlist;
        } finally {
            this.isLoading = false;
        }
    }

    async addToWishlist(productId, productName, productPrice, productImage) {
        if (!window.api.auth.isAuthenticated()) {
            this.showLoginPrompt();
            return false;
        }

        try {
            await window.api.addToWishlist(productId);
            
            // Agregar al wishlist local
            const wishlistItem = {
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                addedAt: new Date().toISOString()
            };
            
            this.wishlist.push(wishlistItem);
            this.updateHeartIcon(productId, true);
            this.showNotification('Producto agregado al wishlist');
            return true;
        } catch (error) {
            console.error('Error agregando a wishlist:', error);
            this.showNotification('Error al agregar al wishlist', 'error');
            return false;
        }
    }

    async removeFromWishlist(productId) {
        if (!window.api.auth.isAuthenticated()) {
            return false;
        }

        try {
            await window.api.removeFromWishlist(productId);
            
            // Remover del wishlist local
            this.wishlist = this.wishlist.filter(item => item.id !== productId);
            this.updateHeartIcon(productId, false);
            this.showNotification('Producto removido del wishlist');
            return true;
        } catch (error) {
            console.error('Error removiendo de wishlist:', error);
            this.showNotification('Error al remover del wishlist', 'error');
            return false;
        }
    }

    async toggleWishlist(productId, productName, productPrice, productImage) {
        const isInWishlist = this.wishlist.find(item => item.id === productId);
        
        if (isInWishlist) {
            return await this.removeFromWishlist(productId);
        } else {
            return await this.addToWishlist(productId, productName, productPrice, productImage);
        }
    }

    async checkWishlistStatus(productId) {
        if (!window.api.auth.isAuthenticated()) {
            return false;
        }

        try {
            const response = await window.api.checkWishlist(productId);
            return response.inWishlist;
        } catch (error) {
            console.error('Error verificando wishlist:', error);
            return false;
        }
    }

    updateHeartIcon(productId, isInWishlist) {
        const heartIcon = document.querySelector(`[data-product-id="${productId}"] svg`);
        if (heartIcon) {
            if (isInWishlist) {
                heartIcon.setAttribute('fill', 'currentColor');
                heartIcon.style.color = '#000000'; // Negro para indicar que está en wishlist
            } else {
                heartIcon.setAttribute('fill', 'none');
                heartIcon.style.color = '';
            }
        }
    }

    async initializeHeartIcons() {
        const heartLinks = document.querySelectorAll('.heart-link');
        
        for (const link of heartLinks) {
            const productId = link.getAttribute('data-product-id');
            if (productId) {
                const isInWishlist = await this.checkWishlistStatus(productId);
                this.updateHeartIcon(productId, isInWishlist);
            }
        }
    }

    setupWishlistListeners() {
        const heartLinks = document.querySelectorAll('.heart-link');
        
        heartLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const productId = link.getAttribute('data-product-id');
                const productName = link.getAttribute('data-product-name');
                const productPrice = link.getAttribute('data-product-price');
                const productImage = link.getAttribute('data-product-image');
                
                if (productId && productName && productPrice && productImage) {
                    await this.toggleWishlist(productId, productName, productPrice, productImage);
                }
            });
        });
    }

    showLoginPrompt() {
        this.showNotification('Inicia sesión para agregar productos a tu wishlist', 'warning');
        // Opcional: redirigir a login
        setTimeout(() => {
            window.location.href = '/account';
        }, 2000);
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

    renderWishlist(container) {
        if (!container) return;

        if (this.wishlist.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-400 text-lg">Tu wishlist está vacía</p>
                    <a href="/" class="mt-4 inline-block bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
                        Explorar productos
                    </a>
                </div>
            `;
            return;
        }

        const wishlistHTML = this.wishlist.map(item => `
            <div class="flex items-center space-x-4 p-4 border-b border-gray-200">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                <div class="flex-1">
                    <h3 class="font-medium text-gray-900">${item.name}</h3>
                    <p class="text-gray-500">$${item.price}</p>
                </div>
                <button class="remove-from-wishlist text-red-500 hover:text-red-700" data-product-id="${item.id}">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `).join('');

        container.innerHTML = wishlistHTML;

        // Agregar event listeners para remover
        container.querySelectorAll('.remove-from-wishlist').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.closest('button').getAttribute('data-product-id');
                await this.removeFromWishlist(productId);
                this.renderWishlist(container); // Re-renderizar
            });
        });
    }
}

// Global Wishlist Manager instance
window.wishlistManager = new WishlistManager();
