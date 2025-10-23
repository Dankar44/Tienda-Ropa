/**
 * Script de prueba para verificar la funcionalidad de wishlist
 * Este script verifica que los endpoints funcionen correctamente
 */

const testWishlistFunctionality = async () => {
    console.log('🧪 Iniciando pruebas de wishlist...');
    
    // Simular token de usuario (ID 10)
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEwLCJpYXQiOjE3MzQ5NzI5MjB9.test';
    localStorage.setItem('cronox-token', mockToken);
    
    try {
        // Probar endpoint de favourites
        console.log('📡 Probando endpoint /api/favourites/10...');
        const response = await fetch('/api/favourites/10', {
            headers: {
                'Authorization': `Bearer ${mockToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Endpoint funcionando correctamente:', data);
        } else {
            console.error('❌ Error en endpoint:', response.status, response.statusText);
        }
        
        // Probar agregar a favoritos
        console.log('📡 Probando agregar a favoritos...');
        const addResponse = await fetch('/api/favourites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mockToken}`
            },
            body: JSON.stringify({
                user_id: 10,
                product_id: 1
            })
        });
        
        if (addResponse.ok) {
            const addData = await addResponse.json();
            console.log('✅ Agregar a favoritos funcionando:', addData);
        } else {
            console.error('❌ Error agregando a favoritos:', addResponse.status);
        }
        
        // Probar eliminar de favoritos
        console.log('📡 Probando eliminar de favoritos...');
        const deleteResponse = await fetch('/api/favourites', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mockToken}`
            },
            body: JSON.stringify({
                user_id: 10,
                product_id: 1
            })
        });
        
        if (deleteResponse.ok) {
            const deleteData = await deleteResponse.json();
            console.log('✅ Eliminar de favoritos funcionando:', deleteData);
        } else {
            console.error('❌ Error eliminando de favoritos:', deleteResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
};

// Ejecutar pruebas si estamos en el navegador
if (typeof window !== 'undefined') {
    testWishlistFunctionality();
}

module.exports = testWishlistFunctionality;

