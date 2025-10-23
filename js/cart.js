// Cart Manager
class CartManager {
    constructor() {
        this.cart = [];
        this.isLoading = false;
    }

    async loadCart() {
        if (!window.api.auth.isAuthenticated()) {
            this.cart = [];
            return this.cart;
        }

        try {
            this.isLoading = true;
            const response = await window.api.getCart();
            this.cart = response.data;
            return this.cart;
        } catch (error) {
            console.error('Error cargando carrito:', error);
            this.cart = [];
            return this.cart;
        } finally {
            this.isLoading = false;
        }
    }

    async addToCart(productId, quantity = 1) {
        if (!window.api.auth.isAuthenticated()) {
            this.showLoginPrompt();
            return false;
        }

        try {
            await window.api.addToCart(productId, quantity);
            await this.loadCart(); // Recargar carrito
            this.updateCartUI();
            this.showNotification('Producto agregado al carrito');
            return true;
        } catch (error) {
            console.error('Error agregando al carrito:', error);
            this.showNotification('Error al agregar al carrito', 'error');
            return false;
        }
    }

    async updateCartItem(productId, quantity) {
        if (!window.api.auth.isAuthenticated()) {
            return false;
        }

        try {
            if (quantity === 0) {
                await window.api.removeFromCart(productId);
            } else {
                await window.api.updateCartItem(productId, quantity);
            }
            
            await this.loadCart(); // Recargar carrito
            this.updateCartUI();
            return true;
        } catch (error) {
            console.error('Error actualizando carrito:', error);
            this.showNotification('Error al actualizar carrito', 'error');
            return false;
        }
    }

    async removeFromCart(productId) {
        if (!window.api.auth.isAuthenticated()) {
            return false;
        }

        try {
            await window.api.removeFromCart(productId);
            await this.loadCart(); // Recargar carrito
            this.updateCartUI();
            this.showNotification('Producto removido del carrito');
            return true;
        } catch (error) {
            console.error('Error removiendo del carrito:', error);
            this.showNotification('Error al remover del carrito', 'error');
            return false;
        }
    }

    async clearCart() {
        if (!window.api.auth.isAuthenticated()) {
            return false;
        }

        try {
            await window.api.clearCart();
            await this.loadCart(); // Recargar carrito
            this.updateCartUI();
            this.showNotification('Carrito limpiado');
            return true;
        } catch (error) {
            console.error('Error limpiando carrito:', error);
            this.showNotification('Error al limpiar carrito', 'error');
            return false;
        }
    }

    updateCartUI() {
        this.updateCartCounter();
        this.updateCartDropdown();
    }

    updateCartCounter() {
        const cartCounter = document.getElementById('cart-counter');
        if (cartCounter) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    updateCartDropdown() {
        const cartDropdown = document.getElementById('cart-dropdown');
        if (!cartDropdown) return;

        if (this.cart.length === 0) {
            cartDropdown.innerHTML = `
                <div class="p-6 text-center">
                    <p class="text-gray-500">Tu carrito está vacío</p>
                    <a href="/" class="mt-4 inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
                        Explorar productos
                    </a>
                </div>
            `;
            return;
        }

        const total = this.cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        
        const cartHTML = `
            <div class="p-6">
                <div class="space-y-4">
                    ${this.cart.map(item => `
                        <div class="flex items-center space-x-4">
                            <img src="${item.image_url}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
                            <div class="flex-1">
                                <h3 class="font-medium text-sm text-gray-900">${item.name}</h3>
                                <p class="text-gray-500 text-sm">$${item.price} x ${item.quantity}</p>
                            </div>
                            <div class="flex items-center space-x-2">
                                <button class="update-quantity text-gray-400 hover:text-gray-600" 
                                        data-product-id="${item.id}" data-action="decrease">-</button>
                                <span class="text-sm">${item.quantity}</span>
                                <button class="update-quantity text-gray-400 hover:text-gray-600" 
                                        data-product-id="${item.id}" data-action="increase">+</button>
                                <button class="remove-from-cart text-red-500 hover:text-red-700 ml-2" 
                                        data-product-id="${item.id}">
                                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-6 border-t border-gray-200 pt-4">
                    <div class="flex justify-between text-lg font-medium">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                    <div class="mt-4 space-y-2">
                        <button class="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors">
                            Proceder al pago
                        </button>
                        <button class="clear-cart w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors">
                            Limpiar carrito
                        </button>
                    </div>
                </div>
            </div>
        `;

        cartDropdown.innerHTML = cartHTML;

        // Agregar event listeners
        this.setupCartEventListeners();
    }

    setupCartEventListeners() {
        const cartDropdown = document.getElementById('cart-dropdown');
        if (!cartDropdown) return;

        // Actualizar cantidades
        cartDropdown.querySelectorAll('.update-quantity').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.getAttribute('data-product-id');
                const action = e.target.getAttribute('data-action');
                const currentItem = this.cart.find(item => item.id == productId);
                
                if (currentItem) {
                    let newQuantity = currentItem.quantity;
                    if (action === 'increase') {
                        newQuantity += 1;
                    } else if (action === 'decrease') {
                        newQuantity = Math.max(0, newQuantity - 1);
                    }
                    
                    await this.updateCartItem(productId, newQuantity);
                }
            });
        });

        // Remover productos
        cartDropdown.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = e.target.closest('button').getAttribute('data-product-id');
                await this.removeFromCart(productId);
            });
        });

        // Limpiar carrito
        const clearCartBtn = cartDropdown.querySelector('.clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
                    await this.clearCart();
                }
            });
        }
    }

    showLoginPrompt() {
        this.showNotification('Inicia sesión para agregar productos al carrito', 'warning');
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
}

// Global Cart Manager instance
window.cartManager = new CartManager();
