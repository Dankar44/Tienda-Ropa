const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, verifyUser, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// GET /api/wishlist - Obtener wishlist del usuario
router.get('/', authenticateToken, verifyUser, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await query(`
            SELECT p.*, w.created_at as added_at
            FROM wishlist w
            JOIN products p ON w.product_id = p.id
            WHERE w.user_id = $1 AND p.is_active = true
            ORDER BY w.created_at DESC
        `, [userId]);

        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Error obteniendo wishlist:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/wishlist - Agregar producto al wishlist
router.post('/', authenticateToken, verifyUser, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'ID del producto es requerido'
            });
        }

        // Verificar que el producto existe
        const productResult = await query(
            'SELECT id FROM products WHERE id = $1 AND is_active = true',
            [productId]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        // Agregar a wishlist (ignorar si ya existe)
        await query(`
            INSERT INTO wishlist (user_id, product_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, product_id) DO NOTHING
        `, [userId, productId]);

        // También agregar a user_favourites para sincronización
        await query(`
            INSERT INTO user_favourites (user_id, product_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, product_id) DO NOTHING
        `, [userId, productId]);

        // Actualizar contador de favourites
        await query(`
            UPDATE products 
            SET favourites = (
                SELECT COUNT(*) 
                FROM user_favourites 
                WHERE user_favourites.product_id = products.id
            ),
            updated_at = NOW()
            WHERE id = $1
        `, [productId]);

        res.json({
            success: true,
            message: 'Producto agregado al wishlist'
        });

    } catch (error) {
        console.error('Error agregando a wishlist:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// DELETE /api/wishlist/:productId - Remover producto del wishlist
router.delete('/:productId', authenticateToken, verifyUser, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        const result = await query(`
            DELETE FROM wishlist 
            WHERE user_id = $1 AND product_id = $2
        `, [userId, productId]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado en wishlist'
            });
        }

        // También eliminar de user_favourites para sincronización
        await query(`
            DELETE FROM user_favourites 
            WHERE user_id = $1 AND product_id = $2
        `, [userId, productId]);

        // Actualizar contador de favourites
        await query(`
            UPDATE products 
            SET favourites = (
                SELECT COUNT(*) 
                FROM user_favourites 
                WHERE user_favourites.product_id = products.id
            ),
            updated_at = NOW()
            WHERE id = $1
        `, [productId]);

        res.json({
            success: true,
            message: 'Producto removido del wishlist'
        });

    } catch (error) {
        console.error('Error removiendo de wishlist:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/wishlist/check/:productId - Verificar si producto está en wishlist
router.get('/check/:productId', authenticateToken, verifyUser, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.params;

        const result = await query(`
            SELECT EXISTS(
                SELECT 1 FROM wishlist 
                WHERE user_id = $1 AND product_id = $2
            ) as in_wishlist
        `, [userId, productId]);

        res.json({
            success: true,
            inWishlist: result.rows[0].in_wishlist
        });

    } catch (error) {
        console.error('Error verificando wishlist:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
