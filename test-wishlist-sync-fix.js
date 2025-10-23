/**
 * Script de prueba para verificar la sincronización de wishlist
 * Prueba el flujo completo: favoritos anónimos -> login -> sincronización
 */

const testWishlistSync = async () => {
    console.log('🧪 Iniciando pruebas de sincronización de wishlist...');
    
    // 1. Simular usuario no autenticado
    console.log('\n1️⃣ Simulando usuario no autenticado...');
    localStorage.removeItem('cronox-token');
    localStorage.removeItem('cronox-wishlist');
    
    // Agregar algunos productos a favoritos (simulando clics)
    const testProducts = [
        { id: '35', name: 'Sudaderon Cronox', price: '€132.00', image: 'test1.jpg' },
        { id: '37', name: 'Sudaderon Cronox', price: '€120.00', image: 'test2.jpg' }
    ];
    
    // Simular wishlist local
    localStorage.setItem('cronox-wishlist', JSON.stringify(testProducts));
    console.log('✅ Productos agregados a wishlist local:', testProducts.length);
    
    // 2. Simular login
    console.log('\n2️⃣ Simulando login de usuario...');
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE2LCJpYXQiOjE2MzQ1Njc4OTB9.test';
    localStorage.setItem('cronox-token', mockToken);
    
    // 3. Verificar que los managers se inicialicen
    console.log('\n3️⃣ Verificando managers...');
    console.log('wishlistManager disponible:', !!window.wishlistManager);
    console.log('authSync disponible:', !!window.authSync);
    
    // 4. Simular sincronización
    console.log('\n4️⃣ Simulando sincronización...');
    if (window.wishlistManager) {
        try {
            await window.wishlistManager.syncOnLogin();
            console.log('✅ Sincronización completada');
        } catch (error) {
            console.error('❌ Error en sincronización:', error);
        }
    }
    
    // 5. Verificar estado final
    console.log('\n5️⃣ Verificando estado final...');
    const finalWishlist = JSON.parse(localStorage.getItem('cronox-wishlist') || '[]');
    console.log('Wishlist final:', finalWishlist.length, 'elementos');
    console.log('Elementos:', finalWishlist);
    
    console.log('\n🎉 Pruebas completadas');
};

// Ejecutar pruebas si estamos en el navegador
if (typeof window !== 'undefined') {
    testWishlistSync();
} else {
    console.log('Este script debe ejecutarse en el navegador');
}
