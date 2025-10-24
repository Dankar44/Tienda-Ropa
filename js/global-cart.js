// Global Cart Manager - Funciona en todas las páginas
class GlobalCartManager {
    constructor() {
        this.cart = [];
        this.isLoading = false;
    }

    // Cargar el carrito desde la API
    async loadCart() {
        console.log('🔄 Cargando carrito global...');
        
        const token = localStorage.getItem('cronox-token');
        if (!token) {
            console.log('❌ No hay token, carrito vacío');
            this.cart = [];
            this.updateCartUI();
            return this.cart;
        }

        try {
            this.isLoading = true;
            const response = await fetch('/api/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            console.log('📋 Carrito cargado:', result);

            if (result.success) {
                this.cart = result.cart;
                console.log('✅ Carrito cargado exitosamente:', this.cart.length, 'items');
            } else {
                this.cart = [];
            }

            this.updateCartUI();
            return this.cart;
        } catch (error) {
            console.error('💥 Error cargando carrito:', error);
            this.cart = [];
            this.updateCartUI();
            return this.cart;
        } finally {
            this.isLoading = false;
        }
    }

    // Actualizar la UI del carrito
    updateCartUI() {
        this.updateCartCounter();
        this.renderCartDropdown();
    }

    // Actualizar el contador del carrito
    updateCartCounter() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        const cartCounter = document.querySelector('.cart-counter');
        if (cartCounter) {
            cartCounter.textContent = totalItems;
            cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
        }

        const cartTitle = document.querySelector('#cart-dropdown h3');
        if (cartTitle) {
            cartTitle.textContent = `Ur Cart (${totalItems})`;
        }
    }

    // Renderizar el dropdown del carrito
    renderCartDropdown() {
        console.log('🎨 Renderizando carrito dropdown...');
        
        const cartContent = document.querySelector('#cart-dropdown .cart-content');
        if (!cartContent) {
            console.error('❌ No se encontró el elemento del carrito');
            return;
        }

        if (this.cart.length === 0) {
            cartContent.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center">
                    <p class="font-mono text-sm mb-4">empty :(</p>
                    <a href="/wishlist.html" class="bg-black text-white px-4 py-2 font-mono font-bold uppercase border-2 border-dashed border-white hover:bg-white hover:text-black transition-all duration-300 text-xs">
                        ADD SOME CHAOS
                    </a>
                </div>
            `;
            return;
        }

        let cartHTML = '';
        let total = 0;

        this.cart.forEach((item) => {
            const itemTotal = parseFloat(item.price) * item.quantity;
            total += itemTotal;

            cartHTML += `
                <div class="flex items-center space-x-4 p-4 border-b border-gray-200">
                    <div class="w-16 h-16 bg-gray-100 rounded">
                        <img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover rounded" onerror="this.src='/uploads/products/product-1761122999129-559609427.png'">
                    </div>
                    <div class="flex-1">
                        <h4 class="font-mono font-bold text-sm">${item.name}</h4>
                        <p class="text-xs text-gray-600">Size: ${item.type}</p>
                        <p class="text-sm font-bold">€${item.price}</p>
                        <button class="text-xs underline text-gray-600 hover:text-black remove-item" data-id="${item.id}">Remove</button>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="w-6 h-6 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm quantity-decrease" data-id="${item.id}">-</button>
                        <span class="w-8 text-center text-sm">${item.quantity}</span>
                        <button class="w-6 h-6 bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm quantity-increase" data-id="${item.id}">+</button>
                    </div>
                </div>
            `;
        });

        cartHTML += `
            <div class="p-4 border-t border-gray-200">
                <div class="flex justify-between items-center mb-4">
                    <span class="font-mono font-bold">Subtotal: €${total.toFixed(2).replace('.', ',')}</span>
                </div>
                <p class="text-xs text-gray-600 mb-4">Shipping & taxes calculated at checkout</p>
                <div class="space-y-2">
                    <a href="/wishlist.html" class="block w-full bg-white border-2 border-dashed border-black text-black py-2 px-4 font-mono text-sm hover:bg-gray-50 transition-colors text-center">
                        FIND YOUR FAVES
                    </a>
                    <button class="w-full bg-black text-white py-3 px-4 font-mono font-bold hover:bg-gray-800 transition-colors">
                        CHECKOUT
                    </button>
                </div>
                
                <!-- Payment Methods -->
                <div class="mt-4 flex flex-wrap gap-2">
                    <div class="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center">
                        <span class="text-[8px] leading-tight">AM<br>EX</span>
                    </div>
                    <div class="bg-black text-white px-2 py-1 rounded text-xs font-bold flex items-center">
                        <span class="text-[8px]">🍎 Pay</span>
                    </div>
                    <div class="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                        <span class="text-[8px]">Bancontact</span>
                    </div>
                    <div class="bg-blue-800 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center justify-center w-8 h-6">
                        <span class="text-[8px]">D</span>
                    </div>
                    <div class="bg-white border border-gray-300 text-black px-2 py-1 rounded text-xs font-bold">
                        <span class="text-[8px]">DISCOVER</span>
                    </div>
                    <div class="bg-white border border-gray-300 text-black px-2 py-1 rounded text-xs font-bold">
                        <span class="text-[8px]">G Pay</span>
                    </div>
                    <div class="bg-pink-500 text-white px-2 py-1 rounded text-xs font-bold">
                        <span class="text-[8px]">iDEAL</span>
                    </div>
                    <div class="bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold">
                        <span class="text-[8px]">Klarna</span>
                    </div>
                    <div class="bg-white border border-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <div class="w-4 h-3 flex">
                            <div class="w-2 h-3 bg-red-500 rounded-l-full"></div>
                            <div class="w-2 h-3 bg-blue-500 rounded-r-full -ml-1"></div>
                        </div>
                    </div>
                    <div class="bg-white border border-gray-300 px-2 py-1 rounded text-xs flex items-center">
                        <div class="w-4 h-3 flex">
                            <div class="w-2 h-3 bg-red-500 rounded-l-full"></div>
                            <div class="w-2 h-3 bg-orange-500 rounded-r-full -ml-1"></div>
                        </div>
                    </div>
                    <div class="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                        <span class="text-[8px]">PayPal</span>
                    </div>
                    <div class="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">
                        <span class="text-[8px]">shop</span>
                    </div>
                    <div class="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                        <span class="text-[8px]">UnionPay</span>
                    </div>
                    <div class="bg-white border border-gray-300 text-blue-600 px-2 py-1 rounded text-xs font-bold">
                        <span class="text-[8px] font-bold">VISA</span>
                    </div>
                </div>
            </div>
        `;

        cartContent.innerHTML = cartHTML;
        this.setupCartEventListeners();
    }

    // Configurar event listeners del carrito
    setupCartEventListeners() {
        // Botones de eliminar
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.dataset.id;
                await this.removeFromCart(id);
            });
        });

        // Botones de cantidad
        document.querySelectorAll('.quantity-decrease').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.dataset.id;
                await this.updateQuantity(id, -1);
            });
        });

        document.querySelectorAll('.quantity-increase').forEach(button => {
            button.addEventListener('click', async () => {
                const id = button.dataset.id;
                await this.updateQuantity(id, 1);
            });
        });
    }

    // Eliminar item del carrito
    async removeFromCart(id) {
        try {
            const token = localStorage.getItem('cronox-token');
            if (!token) return;

            const response = await fetch(`/api/cart/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await response.json();
            if (result.success) {
                await this.loadCart();
                this.showNotification('Producto eliminado del carrito');
            }
        } catch (error) {
            console.error('Error eliminando del carrito:', error);
        }
    }

    // Actualizar cantidad
    async updateQuantity(id, change) {
        try {
            const token = localStorage.getItem('cronox-token');
            if (!token) return;

            const currentItem = this.cart.find(item => item.id == id);
            if (!currentItem) return;

            const newQuantity = Math.max(0, currentItem.quantity + change);
            
            if (newQuantity === 0) {
                await this.removeFromCart(id);
                return;
            }

            const response = await fetch(`/api/cart/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ quantity: newQuantity })
            });

            const result = await response.json();
            if (result.success) {
                await this.loadCart();
            }
        } catch (error) {
            console.error('Error actualizando cantidad:', error);
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-red-600' : 'bg-black';
        
        notification.className = `fixed top-20 right-4 ${bgColor} text-white px-4 py-2 rounded font-mono text-sm z-50`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Limpiar carrito (al cerrar sesión)
    clearCart() {
        console.log('🗑️ Limpiando carrito...');
        this.cart = [];
        this.updateCartUI();
    }
}

// Crear instancia global
window.globalCartManager = new GlobalCartManager();

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando carrito global...');
    
    // Cargar el carrito
    window.globalCartManager.loadCart();

    // Setup del toggle del carrito
    const cartToggle = document.getElementById('cart-toggle');
    const cartDropdown = document.getElementById('cart-dropdown');
    const closeCart = document.getElementById('close-cart');

    if (cartToggle && cartDropdown) {
        cartToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            window.globalCartManager.loadCart();
            cartDropdown.classList.remove('hidden');
            setTimeout(() => {
                cartDropdown.classList.remove('translate-x-full');
            }, 10);
        });
    }

    if (closeCart && cartDropdown) {
        closeCart.addEventListener('click', (e) => {
            e.stopPropagation();
            cartDropdown.classList.add('translate-x-full');
            setTimeout(() => {
                cartDropdown.classList.add('hidden');
            }, 500);
        });
    }

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (cartDropdown && cartToggle && !cartDropdown.contains(e.target) && !cartToggle.contains(e.target)) {
            if (!cartDropdown.classList.contains('hidden')) {
                cartDropdown.classList.add('translate-x-full');
                setTimeout(() => {
                    cartDropdown.classList.add('hidden');
                }, 500);
            }
        }
    });

    // Prevenir que el click en el dropdown cierre el carrito
    if (cartDropdown) {
        cartDropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
});

