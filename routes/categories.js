const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// GET /api/categories - Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const result = await query(`
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
            GROUP BY c.id, c.name, c.slug, c.description, c.created_at
            ORDER BY c.name
        `);

        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error obteniendo categorías:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/categories/:slug - Obtener categoría específica
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const result = await query(`
            SELECT c.*, COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
            WHERE c.slug = $1
            GROUP BY c.id, c.name, c.slug, c.description, c.created_at
        `, [slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Categoría no encontrada'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error obteniendo categoría:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/categories/:slug/products - Obtener productos de una categoría
router.get('/:slug/products', async (req, res) => {
    try {
        const { slug } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        const result = await query(`
            SELECT p.*, c.name as category_name, c.slug as category_slug
            FROM products p
            JOIN categories c ON p.category_id = c.id
            WHERE c.slug = $1 AND p.is_active = true
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
        `, [slug, parseInt(limit), parseInt(offset)]);

        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length,
            category: slug,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Error obteniendo productos de categoría:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
