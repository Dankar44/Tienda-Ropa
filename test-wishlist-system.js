/**
 * Script de prueba para el sistema de wishlist
 */

console.log('🧪 Iniciando pruebas del sistema de wishlist...\n');

// Función para simular clic en botón de corazón
function simulateHeartClick(productId, productName, productPrice, productImage) {
    console.log(`💝 Simulando clic en corazón para producto ${productId}...`);
    
    // Crear elemento de botón simulado
    const heartButton = document.createElement('button');
    heartButton.className = 'heart-link';
    heartButton.setAttribute('data-product-id', productId);
    heartButton.setAttribute('data-product-name', productName);
    heartButton.setAttribute('data-product-price', productPrice);
    heartButton.setAttribute('data-product-image', productImage);
    
    // Simular clic
    const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true
    });
    
    heartButton.dispatchEvent(event);
}

// Función para verificar estado de wishlist
function checkWishlistState() {
    const wishlist = JSON.parse(localStorage.getItem('cronox-wishlist') || '[]');
    console.log(`📋 Wishlist actual: ${wishlist.length} productos`);
    wishlist.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} (ID: ${item.id})`);
    });
    return wishlist;
}

// Función para verificar autenticación
function checkAuthState() {
    const token = localStorage.getItem('cronox-token');
    const isAuthenticated = !!token;
    console.log(`🔐 Estado de autenticación: ${isAuthenticated ? 'Autenticado' : 'No autenticado'}`);
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log(`   Usuario ID: ${payload.userId}`);
        } catch (error) {
            console.log('   Token inválido');
        }
    }
    return isAuthenticated;
}

// Función para limpiar wishlist
function clearWishlist() {
    localStorage.removeItem('cronox-wishlist');
    console.log('🧹 Wishlist limpiada');
}

// Función para simular autenticación
function simulateAuth(userId = 1) {
    const token = btoa(JSON.stringify({ userId, email: 'test@example.com' }));
    localStorage.setItem('cronox-token', token);
    console.log(`🔑 Simulando autenticación para usuario ${userId}`);
}

// Función para simular logout
function simulateLogout() {
    localStorage.removeItem('cronox-token');
    console.log('🚪 Simulando logout');
}

// Función principal de pruebas
async function runTests() {
    console.log('=== PRUEBA 1: Estado inicial ===');
    checkAuthState();
    checkWishlistState();
    
    console.log('\n=== PRUEBA 2: Agregar productos sin autenticación ===');
    clearWishlist();
    simulateHeartClick('35', 'Sudaderon Cronox', '€132.00', '/uploads/products/test1.png');
    simulateHeartClick('36', 'Camiseta Test', '€45.00', '/uploads/products/test2.png');
    checkWishlistState();
    
    console.log('\n=== PRUEBA 3: Autenticación y sincronización ===');
    simulateAuth(1);
    checkAuthState();
    
    // Esperar un poco para que se ejecute la sincronización
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n=== PRUEBA 4: Agregar más productos autenticado ===');
    simulateHeartClick('37', 'Hoodie Test', '€89.00', '/uploads/products/test3.png');
    checkWishlistState();
    
    console.log('\n=== PRUEBA 5: Logout ===');
    simulateLogout();
    checkAuthState();
    
    console.log('\n=== PRUEBA 6: Agregar productos después de logout ===');
    simulateHeartClick('38', 'Pantalón Test', '€65.00', '/uploads/products/test4.png');
    checkWishlistState();
    
    console.log('\n=== PRUEBA 7: Re-autenticación ===');
    simulateAuth(1);
    checkAuthState();
    
    // Esperar sincronización
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n✅ Pruebas completadas');
}

// Ejecutar pruebas si se llama directamente
if (typeof window !== 'undefined') {
    // En el navegador
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🌐 Ejecutando en navegador...');
        runTests();
    });
} else {
    // En Node.js
    runTests();
}

// Exportar funciones para uso manual
if (typeof window !== 'undefined') {
    window.testWishlist = {
        simulateHeartClick,
        checkWishlistState,
        checkAuthState,
        clearWishlist,
        simulateAuth,
        simulateLogout,
        runTests
    };
}
