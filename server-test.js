const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Datos simulados de productos (basados en tu HTML)
const mockProducts = [
    {
        id: 1,
        name: 'THORN RHINESTONE ZIP HOODIE BLACK',
        description: 'Hoodie negro con rhinestones y cremallera',
        price: 145.00,
        image_url: 'LOVED BY THE COMMUNITY/prenda1.png',
        category_name: 'Hoodies',
        category_slug: 'hoodies',
        stock: 10
    },
    {
        id: 2,
        name: 'FERAL FAUX FUR REVERSIBLE BOMBER JACKET CAMO AND NATURAL',
        description: 'Bomber reversible con piel sintética en camuflaje y natural',
        price: 315.00,
        image_url: 'LOVED BY THE COMMUNITY/prenda2.png',
        category_name: 'Bombers',
        category_slug: 'bombers',
        stock: 5
    },
    {
        id: 3,
        name: 'FERAL FAUX FUR STUDDED ZIP HOODIE WASHED GREY (DETACHABLE FUR)',
        description: 'Hoodie gris con piel sintética desmontable y tachones',
        price: 150.00,
        image_url: 'LOVED BY THE COMMUNITY/prenda3.png',
        category_name: 'Hoodies',
        category_slug: 'hoodies',
        stock: 8
    },
    {
        id: 4,
        name: 'MIDNIGHT STUDDED FITTED WAIST ZIP CROP HOODIE BLACK',
        description: 'Crop hoodie negro con tachones y cintura ajustada',
        price: 135.00,
        image_url: 'LOVED BY THE COMMUNITY/prenda4.png',
        category_name: 'Hoodies',
        category_slug: 'hoodies',
        stock: 12
    },
    {
        id: 5,
        name: 'ENEMY RHINESTONE CROP ZIP HOODIE BLACK',
        description: 'Crop hoodie negro con rhinestones y cremallera',
        price: 125.00,
        image_url: 'LOVED BY THE COMMUNITY/prenda5.png',
        category_name: 'Hoodies',
        category_slug: 'hoodies',
        stock: 15
    },
    {
        id: 6,
        name: 'FALLEN FAUX FUR STUDDED CROP ZIP HOODIE BONE (DETACHABLE FUR)',
        description: 'Crop hoodie bone con piel sintética desmontable y tachones',
        price: 150.00,
        image_url: 'LOVED BY THE COMMUNITY/prenda6.png',
        category_name: 'Hoodies',
        category_slug: 'hoodies',
        stock: 7
    },
    {
        id: 7,
        name: 'DARKWEAR EXCLUSIVE HOODIE',
        description: 'Hoodie exclusivo de la colección Darkwear',
        price: 165.00,
        image_url: 'LOVED BY THE COMMUNITY/prenda7.png',
        category_name: 'Hoodies',
        category_slug: 'hoodies',
        stock: 3
    }
];

// API Routes
app.get('/api/products', (req, res) => {
    const { category, search, limit = 50, offset = 0 } = req.query;
    
    let filteredProducts = [...mockProducts];
    
    // Filtro por categoría
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category_slug === category);
    }
    
    // Búsqueda por nombre
    if (search) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    // Paginación
    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(start, end);
    
    res.json({
        success: true,
        data: paginatedProducts,
        total: filteredProducts.length,
        limit: parseInt(limit),
        offset: parseInt(offset)
    });
});

app.get('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const product = mockProducts.find(p => p.id === parseInt(id));
    
    if (!product) {
        return res.status(404).json({
            success: false,
            error: 'Producto no encontrado'
        });
    }
    
    res.json({
        success: true,
        data: product
    });
});

app.get('/api/products/category/:slug', (req, res) => {
    const { slug } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const filteredProducts = mockProducts.filter(p => p.category_slug === slug);
    const start = parseInt(offset);
    const end = start + parseInt(limit);
    const paginatedProducts = filteredProducts.slice(start, end);
    
    res.json({
        success: true,
        data: paginatedProducts,
        total: filteredProducts.length,
        category: slug
    });
});

// Rutas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, 'account.html'));
});

app.get('/buscar', (req, res) => {
    res.sendFile(path.join(__dirname, 'buscar.html'));
});

app.get('/wishlist', (req, res) => {
    res.sendFile(path.join(__dirname, 'wishlist.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/collections/hoodies', (req, res) => {
    res.sendFile(path.join(__dirname, 'collections', 'hoodies.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor CRONOX ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos estáticos desde: ${__dirname}`);
    console.log(`🛍️ Productos disponibles: ${mockProducts.length}`);
    console.log(`🌐 Prueba: http://localhost:${PORT}/api/products`);
});
