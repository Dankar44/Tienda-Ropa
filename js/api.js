// API Configuration
const API_BASE_URL = '/api';

// API Client
class APIClient {
    constructor() {
        this.auth = window.authManager;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...this.auth.getAuthHeaders(),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Products
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/products${queryString ? '?' + queryString : ''}`);
    }

    async getProduct(id) {
        return this.request(`/products/${id}`);
    }

    async getProductsByCategory(category, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/products/category/${category}${queryString ? '?' + queryString : ''}`);
    }

    // Categories
    async getCategories() {
        return this.request('/categories');
    }

    async getCategory(slug) {
        return this.request(`/categories/${slug}`);
    }

    // Search
    async search(query, params = {}) {
        return this.request(`/search?q=${encodeURIComponent(query)}&${new URLSearchParams(params).toString()}`);
    }

    // Users
    async register(userData) {
        const response = await this.request('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success) {
            this.auth.login({
                id: response.data.id,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                email: response.data.email
            }, response.data.token);
        }
        
        return response;
    }

    async login(credentials) {
        const response = await this.request('/users/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        
        if (response.success) {
            this.auth.login({
                id: response.data.id,
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                email: response.data.email
            }, response.data.token);
        }
        
        return response;
    }

    async logout() {
        this.auth.logout();
    }

    async getProfile() {
        return this.request('/users/profile');
    }

    async updateProfile(profileData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Wishlist
    async getWishlist() {
        return this.request('/wishlist');
    }

    async addToWishlist(productId) {
        return this.request('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ productId })
        });
    }

    async removeFromWishlist(productId) {
        return this.request(`/wishlist/${productId}`, {
            method: 'DELETE'
        });
    }

    async checkWishlist(productId) {
        return this.request(`/wishlist/check/${productId}`);
    }

    // Cart
    async getCart() {
        return this.request('/cart');
    }

    async addToCart(productId, quantity = 1) {
        return this.request('/cart', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity })
        });
    }

    async updateCartItem(productId, quantity) {
        return this.request(`/cart/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    async removeFromCart(productId) {
        return this.request(`/cart/${productId}`, {
            method: 'DELETE'
        });
    }

    async clearCart() {
        return this.request('/cart', {
            method: 'DELETE'
        });
    }
}

// Global API instance
window.api = new APIClient();
