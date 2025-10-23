const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testAPI() {
    console.log('🧪 Probando API de CRONOX...\n');

    try {
        // 1. Probar productos
        console.log('1️⃣ Probando endpoint de productos...');
        const productsResponse = await axios.get(`${BASE_URL}/products`);
        console.log(`✅ Productos: ${productsResponse.data.data.length} encontrados`);
        console.log(`   Primer producto: ${productsResponse.data.data[0].name}\n`);

        // 2. Probar categorías
        console.log('2️⃣ Probando endpoint de categorías...');
        const categoriesResponse = await axios.get(`${BASE_URL}/categories`);
        console.log(`✅ Categorías: ${categoriesResponse.data.data.length} encontradas`);
        console.log(`   Categorías: ${categoriesResponse.data.data.map(c => c.name).join(', ')}\n`);

        // 3. Probar búsqueda
        console.log('3️⃣ Probando búsqueda...');
        const searchResponse = await axios.get(`${BASE_URL}/search?q=hoodie`);
        console.log(`✅ Búsqueda "hoodie": ${searchResponse.data.data.length} resultados\n`);

        // 4. Probar registro de usuario
        console.log('4️⃣ Probando registro de usuario...');
        const registerData = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@cronox.com',
            password: 'password123'
        };
        
        try {
            const registerResponse = await axios.post(`${BASE_URL}/users/register`, registerData);
            console.log(`✅ Usuario registrado: ID ${registerResponse.data.data.id}`);
            const token = registerResponse.data.data.token;
            console.log(`   Token: ${token.substring(0, 20)}...\n`);

            // 5. Probar login
            console.log('5️⃣ Probando login...');
            const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
                email: 'test@cronox.com',
                password: 'password123'
            });
            console.log(`✅ Login exitoso: ${loginResponse.data.data.firstName} ${loginResponse.data.data.lastName}\n`);

            // 6. Probar wishlist
            console.log('6️⃣ Probando wishlist...');
            const wishlistResponse = await axios.post(`${BASE_URL}/wishlist`, {
                productId: 1
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✅ Producto agregado al wishlist\n`);

            // 7. Probar carrito
            console.log('7️⃣ Probando carrito...');
            const cartResponse = await axios.post(`${BASE_URL}/cart`, {
                productId: 1,
                quantity: 2
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`✅ Producto agregado al carrito\n`);

            console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
            console.log('🚀 La API está funcionando correctamente');

        } catch (error) {
            if (error.response?.data?.error?.includes('ya está registrado')) {
                console.log('⚠️ Usuario ya existe, probando login...');
                const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
                    email: 'test@cronox.com',
                    password: 'password123'
                });
                console.log(`✅ Login exitoso: ${loginResponse.data.data.firstName} ${loginResponse.data.data.lastName}\n`);
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
        console.log('\n💡 Verifica que:');
        console.log('   1. El servidor esté ejecutándose en localhost:3000');
        console.log('   2. La base de datos esté configurada correctamente');
        console.log('   3. Las dependencias estén instaladas (npm install)');
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    testAPI();
}

module.exports = { testAPI };
