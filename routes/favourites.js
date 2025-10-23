const express = require('express');
const { query } = require('../config/database');
const router = express.Router();

// Función para actualizar el contador de favourites de un producto
async function updateProductFavouritesCount(productId) {
    try {
        const countResult = await query(`
            SELECT COUNT(*) as count 
            FROM user_favourites 
            WHERE product_id = $1
        `, [productId]);
        
        const count = parseInt(countResult.rows[0].count);
        
        await query(`
            UPDATE products 
            SET favourites = $1, updated_at = NOW()
            WHERE id = $2
        `, [count, productId]);
        
        return count;
    } catch (error) {
        console.error('Error actualizando contador de favourites:', error);
        throw error;
    }
}

// POST /api/favourites - Agregar producto a favoritos
router.post('/', async (req, res) => {
    try {
        const { user_id, product_id } = req.body;
        
        if (!user_id || !product_id) {
            return res.status(400).json({
                success: false,
                error: 'user_id y product_id son requeridos'
            });
        }
        
        // Verificar que el producto existe
        const productExists = await query(`
            SELECT id FROM products WHERE id = $1 AND is_active = true
        `, [product_id]);
        
        if (productExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        // Agregar a favoritos (ignorar si ya existe)
        await query(`
            INSERT INTO user_favourites (user_id, product_id)
            VALUES ($1, $2)
            ON CONFLICT (user_id, product_id) DO NOTHING
        `, [user_id, product_id]);
        
        // Actualizar contador
        const newCount = await updateProductFavouritesCount(product_id);
        
        res.json({
            success: true,
            message: 'Producto agregado a favoritos',
            favourites_count: newCount
        });
        
    } catch (error) {
        console.error('Error agregando a favoritos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// DELETE /api/favourites - Quitar producto de favoritos
router.delete('/', async (req, res) => {
    try {
        const { user_id, product_id } = req.body;
        
        if (!user_id || !product_id) {
            return res.status(400).json({
                success: false,
                error: 'user_id y product_id son requeridos'
            });
        }
        
        // Quitar de favoritos
        const deleteResult = await query(`
            DELETE FROM user_favourites 
            WHERE user_id = $1 AND product_id = $2
        `, [user_id, product_id]);
        
        if (deleteResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'El producto no estaba en favoritos'
            });
        }
        
        // Actualizar contador
        const newCount = await updateProductFavouritesCount(product_id);
        
        res.json({
            success: true,
            message: 'Producto removido de favoritos',
            favourites_count: newCount
        });
        
    } catch (error) {
        console.error('Error removiendo de favoritos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/favourites/:user_id - Obtener favoritos de un usuario
router.get('/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        
        const result = await query(`
            SELECT p.*, uf.created_at as favourited_at
            FROM products p
            INNER JOIN user_favourites uf ON p.id = uf.product_id
            WHERE uf.user_id = $1 AND p.is_active = true
            ORDER BY uf.created_at DESC
        `, [user_id]);
        
        res.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        });
        
    } catch (error) {
        console.error('Error obteniendo favoritos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/favourites/check/:user_id/:product_id - Verificar si un producto está en favoritos
router.get('/check/:user_id/:product_id', async (req, res) => {
    try {
        const { user_id, product_id } = req.params;
        
        const result = await query(`
            SELECT COUNT(*) as count 
            FROM user_favourites 
            WHERE user_id = $1 AND product_id = $2
        `, [user_id, product_id]);
        
        const isFavourite = parseInt(result.rows[0].count) > 0;
        
        res.json({
            success: true,
            is_favourite: isFavourite
        });
        
    } catch (error) {
        console.error('Error verificando favorito:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/favourites/stats/:product_id - Obtener estadísticas de favoritos de un producto
router.get('/stats/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;
        
        const result = await query(`
            SELECT 
                p.favourites,
                COUNT(uf.id) as actual_count,
                p.name
            FROM products p
            LEFT JOIN user_favourites uf ON p.id = uf.product_id
            WHERE p.id = $1
            GROUP BY p.id, p.favourites, p.name
        `, [product_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Producto no encontrado'
            });
        }
        
        const stats = result.rows[0];
        
        res.json({
            success: true,
            data: {
                product_id: parseInt(product_id),
                product_name: stats.name,
                favourites_count: parseInt(stats.favourites),
                actual_count: parseInt(stats.actual_count),
                is_synced: stats.favourites == stats.actual_count
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/favourites/sync - Sincronizar wishlist del localStorage con la base de datos
router.post('/sync', async (req, res) => {
    try {
        const { user_id, wishlist_items } = req.body;
        
        if (!user_id || !Array.isArray(wishlist_items)) {
            return res.status(400).json({
                success: false,
                error: 'user_id y wishlist_items son requeridos'
            });
        }
        
        // Verificar que el usuario existe
        const userExists = await query('SELECT id FROM users WHERE id = $1', [user_id]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }
        
        // Limpiar favoritos existentes del usuario
        await query('DELETE FROM user_favourites WHERE user_id = $1', [user_id]);
        
        let syncedCount = 0;
        const errors = [];
        
        // Agregar cada producto de la wishlist
        for (const item of wishlist_items) {
            try {
                const productId = parseInt(item.id);
                
                // Verificar que el producto existe y está activo
                const productExists = await query(`
                    SELECT id FROM products WHERE id = $1 AND is_active = true
                `, [productId]);
                
                if (productExists.rows.length > 0) {
                    // Agregar a favoritos
                    await query(`
                        INSERT INTO user_favourites (user_id, product_id)
                        VALUES ($1, $2)
                        ON CONFLICT (user_id, product_id) DO NOTHING
                    `, [user_id, productId]);
                    
                    // Actualizar contador del producto
                    await updateProductFavouritesCount(productId);
                    syncedCount++;
                } else {
                    errors.push(`Producto ID ${productId} no encontrado o inactivo`);
                }
            } catch (itemError) {
                console.error(`Error sincronizando producto ${item.id}:`, itemError);
                errors.push(`Error con producto ID ${item.id}: ${itemError.message}`);
            }
        }
        
        res.json({
            success: true,
            message: `Sincronización completada. ${syncedCount} productos sincronizados.`,
            data: {
                user_id: parseInt(user_id),
                synced_count: syncedCount,
                total_items: wishlist_items.length,
                errors: errors
            }
        });
        
    } catch (error) {
        console.error('Error sincronizando wishlist:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
