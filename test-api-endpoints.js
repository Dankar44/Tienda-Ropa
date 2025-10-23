/**
 * Script para probar los endpoints de la API
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testEndpoints() {
    console.log('🧪 Probando endpoints de la API...\n');

    const endpoints = [
        { method: 'GET', url: '/api/users/profile', description: 'Perfil de usuario' },
        { method: 'GET', url: '/api/favourites/1', description: 'Favoritos del usuario 1' },
        { method: 'POST', url: '/api/favourites/sync', description: 'Sincronizar wishlist' }
    ];

    for (const endpoint of endpoints) {
        try {
            console.log(`🔍 Probando ${endpoint.method} ${endpoint.url}...`);
            
            const options = {
                method: endpoint.method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (endpoint.method === 'POST') {
                options.body = JSON.stringify({
                    user_id: 1,
                    wishlist_items: [
                        {
                            id: "35",
                            name: "Sudaderon Cronox",
                            price: "€132.00",
                            image: "/uploads/products/product-1761172340710-690083973.png"
                        }
                    ]
                });
            }

            const response = await fetch(`${BASE_URL}${endpoint.url}`, options);
            const data = await response.json();
            
            console.log(`   ✅ Status: ${response.status}`);
            console.log(`   📄 Response:`, JSON.stringify(data, null, 2));
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        console.log('');
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testEndpoints()
        .then(() => {
            console.log('✅ Pruebas completadas');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Error en las pruebas:', error);
            process.exit(1);
        });
}

module.exports = { testEndpoints };
