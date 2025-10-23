// Product Manager
class ProductManager {
    constructor() {
        this.products = [];
        this.categories = [];
        this.currentCategory = null;
    }

    async loadProducts(params = {}) {
        try {
            const response = await window.api.getProducts(params);
            this.products = response.data;
            return this.products;
        } catch (error) {
            console.error('Error cargando productos:', error);
            return [];
        }
    }

    async loadCategories() {
        try {
            const response = await window.api.getCategories();
            this.categories = response.data;
            return this.categories;
        } catch (error) {
            console.error('Error cargando categorías:', error);
            return [];
        }
    }

    async loadProductsByCategory(category, params = {}) {
        try {
            const response = await window.api.getProductsByCategory(category, params);
            this.products = response.data;
            this.currentCategory = category;
            return this.products;
        } catch (error) {
            console.error('Error cargando productos por categoría:', error);
            return [];
        }
    }

    async searchProducts(query, params = {}) {
        try {
            const response = await window.api.search(query, params);
            this.products = response.data;
            return this.products;
        } catch (error) {
            console.error('Error buscando productos:', error);
            return [];
        }
    }

    renderProducts(container, products = this.products) {
        if (!container) return;

        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-400 text-lg">No se encontraron productos</p>
                </div>
            `;
            return;
        }

        products.forEach(product => {
            const productElement = this.createProductCard(product);
            container.appendChild(productElement);
        });
    }

    createProductCard(product) {
        const div = document.createElement('div');
        div.className = 'group relative';
        div.innerHTML = `
            <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img src="${product.image_url}" alt="${product.name}" 
                     class="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300">
            </div>
            <div class="mt-4 flex justify-between">
                <div>
                    <h3 class="text-sm text-gray-700 font-medium">
                        <a href="#" class="text-gray-900 hover:text-gray-500">
                            ${product.name}
                        </a>
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">${product.category_name}</p>
                </div>
                <p class="text-sm font-medium text-gray-900">$${product.price}</p>
            </div>
            <div class="absolute top-2 right-2">
                <button class="heart-link bg-white/80 hover:bg-white rounded-full p-2 transition-colors duration-200" 
                        data-product-id="${product.id}" 
                        data-product-name="${product.name}" 
                        data-product-price="${product.price}" 
                        data-product-image="${product.image_url}">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                </button>
            </div>
        `;
        return div;
    }

    async renderProductCarousel(container, products = this.products) {
        if (!container) return;

        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <p class="text-gray-400 text-lg">No hay productos disponibles</p>
                </div>
            `;
            return;
        }

        // Crear el carrusel con los productos
        const carouselHTML = products.map(product => `
            <div class="flex-shrink-0 w-64">
                <div class="group relative">
                    <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
                        <img src="${product.image_url}" alt="${product.name}" 
                             class="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300">
                    </div>
                    <div class="mt-4 flex justify-between">
                        <div>
                            <h3 class="text-sm text-gray-700 font-medium">
                                <a href="#" class="text-gray-900 hover:text-gray-500">
                                    ${product.name}
                                </a>
                            </h3>
                            <p class="mt-1 text-sm text-gray-500">${product.category_name}</p>
                        </div>
                        <p class="text-sm font-medium text-gray-900">$${product.price}</p>
                    </div>
                    <div class="absolute top-2 right-2">
                        <button class="heart-link bg-white/80 hover:bg-white rounded-full p-2 transition-colors duration-200" 
                                data-product-id="${product.id}" 
                                data-product-name="${product.name}" 
                                data-product-price="${product.price}" 
                                data-product-image="${product.image_url}">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = carouselHTML;
    }
}

// Global Product Manager instance
window.productManager = new ProductManager();
