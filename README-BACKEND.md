# 🖤 CRONOX Backend - Tienda Dark/Gótica

Backend para la tienda de ropa CRONOX con Node.js, Express y PostgreSQL.

## 🚀 Configuración Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar PostgreSQL
1. Instalar PostgreSQL en tu sistema
2. Crear base de datos:
```sql
CREATE DATABASE cronox_db;
```

### 3. Configurar variables de entorno
Edita el archivo `config.env` con tus datos:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cronox_db
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
```

### 4. Inicializar base de datos
```bash
npm run init-db
```

### 5. Iniciar servidor
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

## 📊 Estructura de Base de Datos

### Tablas creadas:
- **users**: Usuarios del sistema
- **categories**: Categorías de productos
- **products**: Productos de la tienda
- **wishlist**: Lista de deseos de usuarios
- **cart**: Carrito de compras

### Datos iniciales:
- 4 categorías: Hoodies, T-Shirts, Pants, Bombers
- 7 productos de la colección CRONOX
- Stock inicial de 10 unidades por producto

## 🔗 Endpoints de la API

### Productos
- `GET /api/products` - Listar todos los productos
- `GET /api/products/:id` - Obtener producto específico
- `GET /api/products/category/:slug` - Productos por categoría

### Usuarios
- `POST /api/users/register` - Registro de usuario
- `POST /api/users/login` - Login de usuario
- `GET /api/users/profile` - Perfil del usuario (requiere auth)

### Wishlist
- `GET /api/wishlist` - Obtener wishlist del usuario
- `POST /api/wishlist` - Agregar producto al wishlist
- `DELETE /api/wishlist/:productId` - Remover producto del wishlist
- `GET /api/wishlist/check/:productId` - Verificar si está en wishlist

### Carrito
- `GET /api/cart` - Obtener carrito del usuario
- `POST /api/cart` - Agregar producto al carrito
- `PUT /api/cart/:productId` - Actualizar cantidad
- `DELETE /api/cart/:productId` - Remover producto del carrito
- `DELETE /api/cart` - Limpiar carrito completo

## 🌐 Servidor

El servidor se ejecuta en `http://localhost:3000` y sirve:
- Archivos estáticos (HTML, CSS, JS, imágenes)
- API REST en `/api/*`
- Páginas HTML en rutas como `/account`, `/wishlist`, etc.

## 🛠️ Desarrollo

### Estructura del proyecto:
```
├── server.js              # Servidor principal
├── config/
│   └── database.js        # Configuración de PostgreSQL
├── routes/
│   ├── products.js        # Rutas de productos
│   ├── users.js          # Rutas de usuarios
│   ├── wishlist.js       # Rutas de wishlist
│   └── cart.js           # Rutas de carrito
├── scripts/
│   └── init-database.js  # Script de inicialización
└── config.env            # Variables de entorno
```

### Scripts disponibles:
- `npm start` - Iniciar servidor
- `npm run dev` - Desarrollo con nodemon
- `npm run init-db` - Inicializar base de datos

## 🔐 Autenticación

Para desarrollo, el sistema usa autenticación simplificada. En producción, implementar JWT completo.

## 📝 Notas

- El servidor sirve archivos estáticos desde la raíz del proyecto
- Todas las rutas HTML mantienen la funcionalidad existente
- Los datos se migran automáticamente desde el HTML estático
- Compatible con el frontend existente sin modificaciones
