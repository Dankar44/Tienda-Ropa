const express = require('express');
const { query } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configuración de multer para subir imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/products');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, GIF, WEBP)'));
        }
    },
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB
    }
});

// GET /api/admin/products - Obtener todos los productos para admin
router.get('/products', async (req, res) => {
    try {
        const result = await query(`
            SELECT p.*, 
                   COALESCE(SUM(CASE WHEN p.garment_type = 'hoodie' THEN 1 ELSE 0 END), 0) as hoodie_count,
                   COALESCE(SUM(CASE WHEN p.garment_type = 't-shirt' THEN 1 ELSE 0 END), 0) as tshirt_count,
                   COALESCE(SUM(CASE WHEN p.garment_type = 'pants' THEN 1 ELSE 0 END), 0) as pants_count,
                   (p.stock_s + p.stock_m + p.stock_l + p.stock_xl) as stock_total,
                   COALESCE(p.favourites, 0) as favourites
            FROM products p
            WHERE p.is_active = true
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `);

        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error obteniendo productos para admin:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/admin/products - Crear nuevo producto
router.post('/products', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model_image_1', maxCount: 1 },
    { name: 'model_image_2', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, price, garment_type, description, stock_s, stock_m, stock_l, stock_xl } = req.body;
        
        // Validar datos requeridos
        if (!name || !price || !garment_type) {
            return res.status(400).json({
                success: false,
                error: 'Nombre, precio y tipo de prenda son requeridos'
            });
        }

        // Procesar imágenes
        let image_url = null;
        let model_image_1_url = null;
        let model_image_2_url = null;
        
        if (req.files.image && req.files.image[0]) {
            image_url = `/uploads/products/${req.files.image[0].filename}`;
        }
        
        if (req.files.model_image_1 && req.files.model_image_1[0]) {
            model_image_1_url = `/uploads/products/${req.files.model_image_1[0].filename}`;
        }
        
        if (req.files.model_image_2 && req.files.model_image_2[0]) {
            model_image_2_url = `/uploads/products/${req.files.model_image_2[0].filename}`;
        }

        // Calcular stock total
        const stockTotal = (parseInt(stock_s) || 0) + (parseInt(stock_m) || 0) + (parseInt(stock_l) || 0) + (parseInt(stock_xl) || 0);

        // Insertar producto en la base de datos
        const result = await query(`
            INSERT INTO products (name, price, garment_type, description, image_url, model_image_1, model_image_2, stock_s, stock_m, stock_l, stock_xl, stock_total, is_active, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, NOW())
            RETURNING *
        `, [name, price, garment_type, description, image_url, model_image_1_url, model_image_2_url, stock_s || 0, stock_m || 0, stock_l || 0, stock_xl || 0, stockTotal]);

        res.status(201).json({
            success: true,
            data: result.rows[0],
            message: 'Producto creado exitosamente'
        });
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// DELETE /api/admin/products/:id - Eliminar producto
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Verificar que el producto existe
        const productResult = await query(`
            SELECT * FROM products WHERE id = $1
        `, [id]);

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        // Eliminar imágenes del servidor si existen
        const product = productResult.rows[0];
        if (product.image_url) {
            const imagePath = path.join(__dirname, '..', product.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        if (product.model_image_1) {
            const modelImage1Path = path.join(__dirname, '..', product.model_image_1);
            if (fs.existsSync(modelImage1Path)) {
                fs.unlinkSync(modelImage1Path);
            }
        }
        
        if (product.model_image_2) {
            const modelImage2Path = path.join(__dirname, '..', product.model_image_2);
            if (fs.existsSync(modelImage2Path)) {
                fs.unlinkSync(modelImage2Path);
            }
        }

        // Eliminar producto de la base de datos
        await query(`
            DELETE FROM products WHERE id = $1
        `, [id]);

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// PUT /api/admin/products/:id - Actualizar producto
router.put('/products/:id', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model_image_1', maxCount: 1 },
    { name: 'model_image_2', maxCount: 1 }
]), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, garment_type, description, stock_s, stock_m, stock_l, stock_xl } = req.body;
        
        // Verificar que el producto existe
        const existingProduct = await query(`
            SELECT * FROM products WHERE id = $1
        `, [id]);

        if (existingProduct.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        // Procesar nuevas imágenes si se subieron
        let image_url = existingProduct.rows[0].image_url;
        let model_image_1_url = existingProduct.rows[0].model_image_1;
        let model_image_2_url = existingProduct.rows[0].model_image_2;
        
        if (req.files.image && req.files.image[0]) {
            // Eliminar imagen anterior si existe
            if (image_url) {
                const oldImagePath = path.join(__dirname, '..', image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            image_url = `/uploads/products/${req.files.image[0].filename}`;
        }
        
        if (req.files.model_image_1 && req.files.model_image_1[0]) {
            // Eliminar imagen anterior si existe
            if (model_image_1_url) {
                const oldImagePath = path.join(__dirname, '..', model_image_1_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            model_image_1_url = `/uploads/products/${req.files.model_image_1[0].filename}`;
        }
        
        if (req.files.model_image_2 && req.files.model_image_2[0]) {
            // Eliminar imagen anterior si existe
            if (model_image_2_url) {
                const oldImagePath = path.join(__dirname, '..', model_image_2_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            model_image_2_url = `/uploads/products/${req.files.model_image_2[0].filename}`;
        }

        // Calcular stock total para actualización
        const stockTotal = (parseInt(stock_s) || 0) + (parseInt(stock_m) || 0) + (parseInt(stock_l) || 0) + (parseInt(stock_xl) || 0);

        // Actualizar producto
        const result = await query(`
            UPDATE products 
            SET name = $1, price = $2, garment_type = $3, description = $4, 
                image_url = $5, model_image_1 = $6, model_image_2 = $7, 
                stock_s = $8, stock_m = $9, stock_l = $10, stock_xl = $11, stock_total = $12,
                updated_at = NOW()
            WHERE id = $13
            RETURNING *
        `, [name, price, garment_type, description, image_url, model_image_1_url, model_image_2_url, stock_s || 0, stock_m || 0, stock_l || 0, stock_xl || 0, stockTotal, id]);

        res.json({
            success: true,
            data: result.rows[0],
            message: 'Producto actualizado exitosamente'
        });
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;