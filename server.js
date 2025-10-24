const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, CSS, JS, imágenes)
app.use(express.static(path.join(__dirname)));

// Importar rutas
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const wishlistRoutes = require('./routes/wishlist');
const cartRoutes = require('./routes/cart');
const categoryRoutes = require('./routes/categories');
const searchRoutes = require('./routes/search');
const adminRoutes = require('./routes/admin');
const favouritesRoutes = require('./routes/favourites');

// Usar rutas
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/favourites', favouritesRoutes);

// Ruta principal - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rutas para páginas HTML
app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'account.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/buscar', (req, res) => {
    res.sendFile(path.join(__dirname, 'buscar.html'));
});

app.get('/wishlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'wishlist.html'));
});

app.get('/latest-drops', (req, res) => {
    res.sendFile(path.join(__dirname, 'latest-drops.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/collections/hoodies', (req, res) => {
    res.sendFile(path.join(__dirname, 'collections', 'hoodies.html'));
});

app.get('/collections/t-shirts', (req, res) => {
    res.sendFile(path.join(__dirname, 'collections', 't-shirts.html'));
});

app.get('/collections/pants', (req, res) => {
    res.sendFile(path.join(__dirname, 'collections', 'pants.html'));
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Algo salió mal!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
});

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor CRONOX ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos estáticos desde: ${__dirname}`);
    console.log(`🌐 Entorno: ${process.env.NODE_ENV}`);
});

module.exports = app;
