const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function cleanupHoodieProducts() {
    try {
        console.log('🔄 Iniciando limpieza de productos hoodie...');

        // Primero, verificar cuántos productos hoodie existen
        const countResult = await query(`
            SELECT COUNT(*) as count 
            FROM products 
            WHERE garment_type = 'hoodie'
        `);
        
        const productCount = countResult.rows[0].count;
        console.log(`📊 Productos hoodie encontrados: ${productCount}`);

        if (productCount === 0) {
            console.log('✅ No hay productos hoodie para eliminar');
            return;
        }

        // Obtener información de los productos antes de eliminarlos
        const productsResult = await query(`
            SELECT id, name, image_url, model_image_1, model_image_2
            FROM products 
            WHERE garment_type = 'hoodie'
        `);

        console.log('📋 Productos que serán eliminados:');
        productsResult.rows.forEach(product => {
            console.log(`  - ID: ${product.id}, Nombre: ${product.name}`);
        });

        // Eliminar archivos de imágenes del servidor
        const fs = require('fs');
        const path = require('path');
        
        for (const product of productsResult.rows) {
            // Eliminar imagen principal
            if (product.image_url) {
                const imagePath = path.join(__dirname, '..', product.image_url);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`🗑️  Eliminada imagen: ${product.image_url}`);
                }
            }
            
            // Eliminar imagen modelo 1
            if (product.model_image_1) {
                const modelImage1Path = path.join(__dirname, '..', product.model_image_1);
                if (fs.existsSync(modelImage1Path)) {
                    fs.unlinkSync(modelImage1Path);
                    console.log(`🗑️  Eliminada imagen modelo 1: ${product.model_image_1}`);
                }
            }
            
            // Eliminar imagen modelo 2
            if (product.model_image_2) {
                const modelImage2Path = path.join(__dirname, '..', product.model_image_2);
                if (fs.existsSync(modelImage2Path)) {
                    fs.unlinkSync(modelImage2Path);
                    console.log(`🗑️  Eliminada imagen modelo 2: ${product.model_image_2}`);
                }
            }
        }

        // Eliminar productos de la base de datos
        const deleteResult = await query(`
            DELETE FROM products 
            WHERE garment_type = 'hoodie'
        `);

        console.log(`✅ Eliminados ${deleteResult.rowCount} productos hoodie de la base de datos`);

        // Verificar que se eliminaron correctamente
        const finalCountResult = await query(`
            SELECT COUNT(*) as count 
            FROM products 
            WHERE garment_type = 'hoodie'
        `);
        
        const finalCount = finalCountResult.rows[0].count;
        console.log(`📊 Productos hoodie restantes: ${finalCount}`);

        if (finalCount === 0) {
            console.log('🎉 Limpieza completada exitosamente');
        } else {
            console.log('⚠️  Aún quedan productos hoodie en la base de datos');
        }

    } catch (error) {
        console.error('❌ Error en la limpieza:', error);
        throw error;
    }
}

// Ejecutar limpieza si se llama directamente
if (require.main === module) {
    cleanupHoodieProducts()
        .then(() => {
            console.log('🎉 Proceso de limpieza completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en la limpieza:', error);
            process.exit(1);
        });
}

module.exports = { cleanupHoodieProducts };
