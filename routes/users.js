const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { authenticateToken, verifyUser } = require('../middleware/auth');
const router = express.Router();

// POST /api/users/register - Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Validaciones básicas
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Todos los campos son obligatorios'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La contraseña debe tener al menos 6 caracteres'
            });
        }

        // Verificar si el email ya existe
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }

        // Hash de la contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insertar usuario
        const result = await query(`
            INSERT INTO users (first_name, last_name, email, password_hash)
            VALUES ($1, $2, $3, $4)
            RETURNING id, first_name, last_name, email, created_at
        `, [firstName, lastName, email, passwordHash]);

        const user = result.rows[0];

        // Generar JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                token: token
            }
        });

    } catch (error) {
        console.error('Error registrando usuario:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/users/login - Login de usuario
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña son obligatorios'
            });
        }

        // Buscar usuario
        const result = await query(
            'SELECT id, first_name, last_name, email, password_hash FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        const user = result.rows[0];

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Generar JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                token: token
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// GET /api/users/profile - Obtener perfil del usuario (requiere autenticación)
router.get('/profile', authenticateToken, verifyUser, async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await query(`
            SELECT id, first_name, last_name, email, created_at
            FROM users WHERE id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        const user = result.rows[0];
        res.json({
            success: true,
            data: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                createdAt: user.created_at
            }
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// PUT /api/users/profile - Actualizar perfil del usuario
router.put('/profile', authenticateToken, verifyUser, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { firstName, lastName, email } = req.body;

        // Verificar si el email ya existe en otro usuario
        if (email) {
            const existingUser = await query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, userId]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: 'El email ya está en uso por otro usuario'
                });
            }
        }

        // Actualizar usuario
        const result = await query(`
            UPDATE users 
            SET first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                email = COALESCE($3, email),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, first_name, last_name, email, updated_at
        `, [firstName, lastName, email, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        const user = result.rows[0];
        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                updatedAt: user.updated_at
            }
        });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// POST /api/users/change-password - Cambiar contraseña
router.post('/change-password', authenticateToken, verifyUser, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'Contraseña actual y nueva contraseña son requeridas'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        // Obtener contraseña actual
        const userResult = await query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
        
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                error: 'Contraseña actual incorrecta'
            });
        }

        // Hash de la nueva contraseña
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        await query(
            'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newPasswordHash, userId]
        );

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;
