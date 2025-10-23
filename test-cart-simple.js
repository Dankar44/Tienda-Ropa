const http = require('http');

function testCartEndpoint() {
    console.log('🧪 Probando endpoint del carrito...');
    
    const testData = JSON.stringify({
        product_id: 37,
        type: 'M',
        quantity: 2
    });
    
    console.log('📤 Enviando datos:', testData);
    
    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/cart',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(testData),
            'Authorization': 'Bearer test-token'
        }
    };
    
    const req = http.request(options, (res) => {
        console.log('📡 Status del servidor:', res.statusCode);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('📋 Respuesta del servidor:', data);
            
            if (res.statusCode === 200) {
                console.log('✅ ¡Endpoint funcionando correctamente!');
            } else {
                console.log('❌ Error en el endpoint');
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Error en la petición:', error.message);
    });
    
    req.write(testData);
    req.end();
}

testCartEndpoint();


