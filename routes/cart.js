const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

// GET /api/cart - Obtener carrito del usuario
router.get('/', optionalAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const cartQuery = `
            SELECT 
                c.id,
                c.product_id,
                c.type,
                c.quantity,
                c.created_at,
                c.updated_at,
                p.name,
                p.price,
                p.image_url
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = $1 AND p.is_active = true
            ORDER BY c.created_at DESC
        `;
        
        const result = await query(cartQuery, [userId]);
        
        res.json({
            success: true,
            cart: result.rows
        });
        
    } catch (error) {
        console.error('Error obteniendo carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo carrito'
        });
    }
});

// POST /api/cart - Añadir producto al carrito
router.post('/', optionalAuth, async (req, res) => {
    try {
        const { product_id, type, quantity } = req.body;
        const userId = req.user.userId;
        
        // 🔍 LOGS DE DEPURACIÓN
        console.log('🛒 [CART] Datos recibidos:', { product_id, type, quantity, userId });
        console.log('🛒 [CART] Tipo de product_id:', typeof product_id);
        console.log('🛒 [CART] req.user completo:', req.user);
        
        // Validar datos
        if (!product_id || isNaN(product_id)) {
            console.log('❌ [CART] Error: product_id es requerido o no es un número válido');
            return res.status(400).json({
                success: false,
                error: 'ID del producto es requerido'
            });
        }
        
        if (!type) {
            console.log('❌ [CART] Error: type es requerido');
            return res.status(400).json({
                success: false,
                error: 'Talla es requerida'
            });
        }
        
        if (!quantity) {
            console.log('❌ [CART] Error: quantity es requerido');
            return res.status(400).json({
                success: false,
                error: 'Cantidad es requerida'
            });
        }
        
        if (!['S', 'M', 'L', 'XL'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: 'Talla inválida'
            });
        }
        
        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Cantidad debe ser mayor a 0'
            });
        }
        
        // Verificar que el producto existe
        const productCheck = await query(
            'SELECT id FROM products WHERE id = $1 AND is_active = true',
            [product_id]
        );
        
        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        
        // Verificar si ya existe el mismo producto con la misma talla
        const existingItem = await query(
            'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2 AND type = $3',
            [userId, product_id, type]
        );
        
        if (existingItem.rows.length > 0) {
            // Actualizar cantidad existente
            const newQuantity = existingItem.rows[0].quantity + quantity;
            await query(
                'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE id = $2',
                [newQuantity, existingItem.rows[0].id]
            );
            console.log('✅ [CART] Cantidad actualizada en carrito existente');
        } else {
            // Crear nuevo item
            await query(
                'INSERT INTO cart (user_id, product_id, type, quantity) VALUES ($1, $2, $3, $4)',
                [userId, product_id, type, quantity]
            );
            console.log('✅ [CART] Nuevo item añadido al carrito');
        }
        
        res.json({
            success: true,
            message: 'Producto añadido al carrito'
        });
        
    } catch (error) {
        console.error('❌ [CART] Error detallado:', error);
        console.error('❌ [CART] Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error añadiendo al carrito',
            error: error.message
        });
    }
});

// PUT /api/cart/:id - Actualizar cantidad de un item
router.put('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;
        const userId = req.user.userId;
        
        if (quantity <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Cantidad debe ser mayor a 0'
            });
        }
        
        // Verificar que el item pertenece al usuario
        const itemCheck = await query(
            'SELECT id FROM cart WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        
        if (itemCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado'
            });
        }
        
        // Actualizar cantidad
        await query(
            'UPDATE cart SET quantity = $1, updated_at = NOW() WHERE id = $2',
            [quantity, id]
        );
        
        res.json({
            success: true,
            message: 'Cantidad actualizada'
        });
        
    } catch (error) {
        console.error('Error actualizando carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error actualizando carrito'
        });
    }
});

// DELETE /api/cart/:id - Eliminar item del carrito
router.delete('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        
        // Verificar que el item pertenece al usuario
        const itemCheck = await query(
            'SELECT id FROM cart WHERE id = $1 AND user_id = $2',
            [id, userId]
        );
        
        if (itemCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item no encontrado'
            });
        }
        
        // Eliminar item
        await query('DELETE FROM cart WHERE id = $1', [id]);
        
        res.json({
            success: true,
            message: 'Item eliminado del carrito'
        });
        
    } catch (error) {
        console.error('Error eliminando del carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error eliminando del carrito'
        });
    }
});

// DELETE /api/cart - Limpiar todo el carrito
router.delete('/', optionalAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        await query('DELETE FROM cart WHERE user_id = $1', [userId]);
        
        res.json({
            success: true,
            message: 'Carrito limpiado'
        });
        
    } catch (error) {
        console.error('Error limpiando carrito:', error);
        res.status(500).json({
            success: false,
            message: 'Error limpiando carrito'
        });
    }
});

module.exports = router;