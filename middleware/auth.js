const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware para verificar JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Token de acceso requerido'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Token inválido o expirado'
            });
        }
        req.user = user;
        next();
    });
}

// Middleware para autenticación opcional (para desarrollo)
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            } else {
                // Si el token es inválido, usar usuario por defecto
                req.user = { userId: 11, email: 'danisuperk@gmail.com' };
            }
        });
    } else {
        // Para desarrollo, usar usuario temporal existente
        req.user = { userId: 11, email: 'danisuperk@gmail.com' };
    }
    
    console.log('🔍 [AUTH] req.user configurado:', req.user);
    next();
}

// Middleware para verificar que el usuario existe en la base de datos
async function verifyUser(req, res, next) {
    try {
        const userId = req.user.userId;
        
        const result = await query(
            'SELECT id, email FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        req.userData = result.rows[0];
        next();
    } catch (error) {
        console.error('Error verificando usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
}

module.exports = {
    authenticateToken,
    optionalAuth,
    verifyUser
};
