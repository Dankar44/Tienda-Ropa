const { query } = require('../config/database');
require('dotenv').config({ path: '../config.env' });

async function deleteProduct36() {
    try {
        console.log('🔄 Iniciando eliminación del producto ID 36...');

        // Primero, verificar que el producto existe
        const checkResult = await query(`
            SELECT id, name, price, description, image_url, model_image_1, model_image_2
            FROM products 
            WHERE id = 36
        `);
        
        if (checkResult.rows.length === 0) {
            console.log('❌ No se encontró el producto con ID 36');
            return;
        }

        const product = checkResult.rows[0];
        console.log('📋 Producto encontrado:');
        console.log(`  - ID: ${product.id}`);
        console.log(`  - Nombre: ${product.name}`);
        console.log(`  - Precio: €${product.price}`);
        console.log(`  - Descripción: ${product.description}`);
        console.log(`  - Imagen principal: ${product.image_url}`);
        console.log(`  - Imagen modelo 1: ${product.model_image_1}`);
        console.log(`  - Imagen modelo 2: ${product.model_image_2}`);

        // Eliminar archivos de imágenes del servidor si existen
        const fs = require('fs');
        const path = require('path');
        
        const imageUrls = [product.image_url, product.model_image_1, product.model_image_2];
        let deletedFiles = 0;
        
        for (const imageUrl of imageUrls) {
            if (imageUrl) {
                const imagePath = path.join(__dirname, '..', imageUrl);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log(`🗑️  Eliminada imagen: ${imageUrl}`);
                    deletedFiles++;
                }
            }
        }
        
        console.log(`📁 Archivos de imagen eliminados: ${deletedFiles}`);

        // Eliminar el producto de la base de datos
        const deleteResult = await query(`
            DELETE FROM products 
            WHERE id = 36
        `);

        if (deleteResult.rowCount > 0) {
            console.log('✅ Producto ID 36 eliminado exitosamente de la base de datos');
        } else {
            console.log('❌ No se pudo eliminar el producto');
        }

        // Verificar que se eliminó correctamente
        const verifyResult = await query(`
            SELECT id FROM products WHERE id = 36
        `);
        
        if (verifyResult.rows.length === 0) {
            console.log('🎉 Verificación exitosa: El producto ya no existe en la base de datos');
        } else {
            console.log('⚠️  El producto aún existe en la base de datos');
        }

    } catch (error) {
        console.error('❌ Error eliminando el producto:', error);
        throw error;
    }
}

// Ejecutar eliminación si se llama directamente
if (require.main === module) {
    deleteProduct36()
        .then(() => {
            console.log('🎉 Proceso de eliminación completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Error en la eliminación:', error);
            process.exit(1);
        });
}

module.exports = { deleteProduct36 };
