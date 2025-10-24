const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// GET /api/products/top-favourites - Obtener productos con más favourites
router.get('/top-favourites', async (req, res) => {
    try {
        const { limit = 7 } = req.query;
        
        const sql = `
            SELECT p.*, COALESCE(p.favourites, 0) as favourites
            FROM products p
            WHERE p.is_active = true
            ORDER BY p.favourites DESC, p.created_at DESC
            LIMIT $1
        `;
        
        const result = await query(sql, [parseInt(limit)]);
        
        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error obteniendo productos con más favourites:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/products/latest-drops - Obtener los últimos 5 productos añadidos
router.get('/latest-drops', async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        
        const sql = `
            SELECT p.*, COALESCE(p.favourites, 0) as favourites
            FROM products p
            WHERE p.is_active = true
            ORDER BY p.id DESC, p.created_at DESC
            LIMIT $1
        `;
        
        const result = await query(sql, [parseInt(limit)]);
        
        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });
    } catch (error) {
        console.error('Error obteniendo latest drops:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const { category, search, limit = 50, offset = 0 } = req.query;
        
        let sql = `
            SELECT p.*, COALESCE(p.favourites, 0) as favourites
            FROM products p
            WHERE p.is_active = true
        `;
        const params = [];
        let paramCount = 0;

        // Filtro por garment_type (reemplaza el filtro de categoría)
        if (category) {
            paramCount++;
            sql += ` AND p.garment_type = $${paramCount}`;
            params.push(category);
        }

        // Búsqueda por nombre
        if (search) {
            paramCount++;
            sql += ` AND p.name ILIKE $${paramCount}`;
            params.push(`%${search}%`);
        }

        sql += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await query(sql, params);
        
        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/products/:id - Obtener producto específico
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await query(`
            SELECT p.*, COALESCE(p.favourites, 0) as favourites
            FROM products p
            WHERE p.id = $1 AND p.is_active = true
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/products/category/:slug - Obtener productos por categoría
router.get('/category/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const { limit = 50, offset = 0 } = req.query;
        
        const result = await query(`
            SELECT p.*, COALESCE(p.favourites, 0) as favourites
            FROM products p
            WHERE p.garment_type = $1 AND p.is_active = true
            ORDER BY p.created_at DESC
            LIMIT $2 OFFSET $3
        `, [slug, parseInt(limit), parseInt(offset)]);

        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length,
            category: slug
        });
    } catch (error) {
        console.error('Error obteniendo productos por categoría:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/products/count/:garment_type - Contar productos por tipo de prenda
router.get('/count/:garment_type', async (req, res) => {
    try {
        const { garment_type } = req.params;
        
        const result = await query(`
            SELECT COUNT(*) as count
            FROM products p
            WHERE p.garment_type = $1 AND p.is_active = true
        `, [garment_type]);

        const count = parseInt(result.rows[0].count);

        res.json({
            success: true,
            count: count,
            garment_type: garment_type
        });
    } catch (error) {
        console.error('Error contando productos por tipo:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
