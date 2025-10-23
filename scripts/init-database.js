const { query, testConnection } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function createTables() {
    try {
        console.log('🔄 Iniciando creación de tablas...');

        // Tabla de usuarios
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de categorías
        await query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de productos
        await query(`
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                garment_type VARCHAR(50),
                image_url VARCHAR(500),
                model_image_1 VARCHAR(500),
                model_image_2 VARCHAR(500),
                category_id INTEGER REFERENCES categories(id),
                stock INTEGER DEFAULT 0,
                stock_s INTEGER DEFAULT 0,
                stock_m INTEGER DEFAULT 0,
                stock_l INTEGER DEFAULT 0,
                stock_xl INTEGER DEFAULT 0,
                stock_total INTEGER DEFAULT 0,
                favourites INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de wishlist
        await query(`
            CREATE TABLE IF NOT EXISTS wishlist (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, product_id)
            )
        `);

        // Tabla de carrito
        await query(`
            CREATE TABLE IF NOT EXISTS cart (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                quantity INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, product_id)
            )
        `);

        // Tabla de favoritos de usuarios
        await query(`
            CREATE TABLE IF NOT EXISTS user_favourites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, product_id)
            )
        `);

        // Crear índices para optimizar consultas de favoritos
        await query(`
            CREATE INDEX IF NOT EXISTS idx_user_favourites_user_id 
            ON user_favourites(user_id)
        `);
        await query(`
            CREATE INDEX IF NOT EXISTS idx_user_favourites_product_id 
            ON user_favourites(product_id)
        `);
        await query(`
            CREATE INDEX IF NOT EXISTS idx_products_favourites 
            ON products(favourites)
        `);

        console.log('✅ Tablas creadas exitosamente');
    } catch (error) {
        console.error('❌ Error creando tablas:', error);
        throw error;
    }
}

async function insertInitialData() {
    try {
        console.log('🔄 Insertando datos iniciales...');

        // Insertar categorías
        await query(`
            INSERT INTO categories (name, slug, description) VALUES
            ('Hoodies', 'hoodies', 'Hoodies dark y góticos'),
            ('T-Shirts', 't-shirts', 'Camisetas con estilo dark'),
            ('Pants', 'pants', 'Pantalones y sweatpants'),
            ('Bombers', 'bombers', 'Bombers reversibles y exclusivos')
            ON CONFLICT (slug) DO NOTHING
        `);

        // Insertar productos basados en los datos del HTML
        const products = [
            {
                name: 'THORN RHINESTONE ZIP HOODIE BLACK',
                description: 'Hoodie negro con rhinestones y cremallera',
                price: 145.00,
                image_url: 'LOVED BY THE COMMUNITY/prenda1.png',
                category: 'Hoodies'
            },
            {
                name: 'FERAL FAUX FUR REVERSIBLE BOMBER JACKET CAMO AND NATURAL',
                description: 'Bomber reversible con piel sintética en camuflaje y natural',
                price: 315.00,
                image_url: 'LOVED BY THE COMMUNITY/prenda2.png',
                category: 'Bombers'
            },
            {
                name: 'FERAL FAUX FUR STUDDED ZIP HOODIE WASHED GREY (DETACHABLE FUR)',
                description: 'Hoodie gris con piel sintética desmontable y tachones',
                price: 150.00,
                image_url: 'LOVED BY THE COMMUNITY/prenda3.png',
                category: 'Hoodies'
            },
            {
                name: 'MIDNIGHT STUDDED FITTED WAIST ZIP CROP HOODIE BLACK',
                description: 'Crop hoodie negro con tachones y cintura ajustada',
                price: 135.00,
                image_url: 'LOVED BY THE COMMUNITY/prenda4.png',
                category: 'Hoodies'
            },
            {
                name: 'ENEMY RHINESTONE CROP ZIP HOODIE BLACK',
                description: 'Crop hoodie negro con rhinestones y cremallera',
                price: 125.00,
                image_url: 'LOVED BY THE COMMUNITY/prenda5.png',
                category: 'Hoodies'
            },
            {
                name: 'FALLEN FAUX FUR STUDDED CROP ZIP HOODIE BONE (DETACHABLE FUR)',
                description: 'Crop hoodie bone con piel sintética desmontable y tachones',
                price: 150.00,
                image_url: 'LOVED BY THE COMMUNITY/prenda6.png',
                category: 'Hoodies'
            },
            {
                name: 'DARKWEAR EXCLUSIVE HOODIE',
                description: 'Hoodie exclusivo de la colección Darkwear',
                price: 165.00,
                image_url: 'LOVED BY THE COMMUNITY/prenda7.png',
                category: 'Hoodies'
            }
        ];

        for (const product of products) {
            // Obtener category_id
            const categoryResult = await query(
                'SELECT id FROM categories WHERE name = $1',
                [product.category]
            );
            
            if (categoryResult.rows.length > 0) {
                await query(`
                    INSERT INTO products (name, description, price, image_url, category_id, stock)
                    VALUES ($1, $2, $3, $4, $5, 10)
                    ON CONFLICT DO NOTHING
                `, [
                    product.name,
                    product.description,
                    product.price,
                    product.image_url,
                    categoryResult.rows[0].id
                ]);
            }
        }

        console.log('✅ Datos iniciales insertados exitosamente');
    } catch (error) {
        console.error('❌ Error insertando datos iniciales:', error);
        throw error;
    }
}

async function initDatabase() {
    try {
        console.log('🚀 Iniciando configuración de base de datos CRONOX...');
        
        // Probar conexión
        const connected = await testConnection();
        if (!connected) {
            throw new Error('No se pudo conectar a la base de datos');
        }

        // Crear tablas
        await createTables();

        // Insertar datos iniciales
        await insertInitialData();

        console.log('🎉 Base de datos CRONOX configurada exitosamente!');
        console.log('📊 Tablas creadas: users, categories, products, wishlist, cart');
        console.log('🛍️ Productos insertados: 7 productos de la colección');
        console.log('🏷️ Categorías creadas: Hoodies, T-Shirts, Pants, Bombers');

    } catch (error) {
        console.error('💥 Error configurando base de datos:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    initDatabase();
}

module.exports = { initDatabase, createTables, insertInitialData };
