const fetch = require('node-fetch');

async function testCartEndpoint() {
    try {
        console.log('🧪 Probando endpoint del carrito...');
        
        const testData = {
            product_id: 37,
            type: 'M',
            quantity: 2
        };
        
        console.log('📤 Enviando datos:', testData);
        
        const response = await fetch('http://localhost:3000/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token' // Token de prueba
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.json();
        
        console.log('📡 Respuesta del servidor:');
        console.log('   Status:', response.status);
        console.log('   Data:', result);
        
        if (response.ok) {
            console.log('✅ ¡Endpoint funcionando correctamente!');
        } else {
            console.log('❌ Error en el endpoint:', result.error || result.message);
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

testCartEndpoint();


