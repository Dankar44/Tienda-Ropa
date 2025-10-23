const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// GET /api/search - Búsqueda avanzada de productos
router.get('/', async (req, res) => {
    try {
        const { 
            q, // query de búsqueda
            category, // filtro por categoría
            minPrice, // precio mínimo
            maxPrice, // precio máximo
            sort = 'newest', // ordenamiento: newest, oldest, price_asc, price_desc, name
            limit = 20,
            offset = 0
        } = req.query;

        let sql = `
            SELECT p.*
            FROM products p
            WHERE p.is_active = true
        `;
        const params = [];
        let paramCount = 0;

        // Búsqueda por texto
        if (q && q.trim()) {
            paramCount++;
            sql += ` AND (
                p.name ILIKE $${paramCount} OR 
                p.description ILIKE $${paramCount}
            )`;
            params.push(`%${q.trim()}%`);
        }

        // Filtro por categoría
        if (category) {
            paramCount++;
            sql += ` AND c.slug = $${paramCount}`;
            params.push(category);
        }

        // Filtro por precio mínimo
        if (minPrice) {
            paramCount++;
            sql += ` AND p.price >= $${paramCount}`;
            params.push(parseFloat(minPrice));
        }

        // Filtro por precio máximo
        if (maxPrice) {
            paramCount++;
            sql += ` AND p.price <= $${paramCount}`;
            params.push(parseFloat(maxPrice));
        }

        // Ordenamiento
        switch (sort) {
            case 'oldest':
                sql += ` ORDER BY p.created_at ASC`;
                break;
            case 'price_asc':
                sql += ` ORDER BY p.price ASC`;
                break;
            case 'price_desc':
                sql += ` ORDER BY p.price DESC`;
                break;
            case 'name':
                sql += ` ORDER BY p.name ASC`;
                break;
            case 'newest':
            default:
                sql += ` ORDER BY p.created_at DESC`;
                break;
        }

        // Paginación
        paramCount++;
        sql += ` LIMIT $${paramCount}`;
        params.push(parseInt(limit));

        paramCount++;
        sql += ` OFFSET $${paramCount}`;
        params.push(parseInt(offset));

        const result = await query(sql, params);

        // Obtener total de resultados para paginación
        let countSql = `
            SELECT COUNT(*) as total
            FROM products p
            WHERE p.is_active = true
        `;
        const countParams = [];
        let countParamCount = 0;

        if (q && q.trim()) {
            countParamCount++;
            countSql += ` AND (
                p.name ILIKE $${countParamCount} OR 
                p.description ILIKE $${countParamCount}
            )`;
            countParams.push(`%${q.trim()}%`);
        }

        if (category) {
            countParamCount++;
            countSql += ` AND c.slug = $${countParamCount}`;
            countParams.push(category);
        }

        if (minPrice) {
            countParamCount++;
            countSql += ` AND p.price >= $${countParamCount}`;
            countParams.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            countParamCount++;
            countSql += ` AND p.price <= $${countParamCount}`;
            countParams.push(parseFloat(maxPrice));
        }

        const countResult = await query(countSql, countParams);
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: result.rows,
            total: total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: (parseInt(offset) + parseInt(limit)) < total,
            filters: {
                query: q,
                category: category,
                minPrice: minPrice,
                maxPrice: maxPrice,
                sort: sort
            }
        });

    } catch (error) {
        console.error('Error en búsqueda:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/search/suggestions - Sugerencias de búsqueda
router.get('/suggestions', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.json({
                success: true,
                data: [],
                total: 0
            });
        }

        const result = await query(`
            SELECT DISTINCT p.name, p.garment_type
            FROM products p
            WHERE p.is_active = true 
            AND (p.name ILIKE $1 OR p.garment_type ILIKE $1)
            ORDER BY p.name
            LIMIT 10
        `, [`%${q.trim()}%`]);

        const suggestions = result.rows.map(row => ({
            text: row.name,
            category: row.garment_type,
            type: 'product'
        }));

        res.json({
            success: true,
            data: suggestions,
            total: suggestions.length
        });

    } catch (error) {
        console.error('Error obteniendo sugerencias:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
