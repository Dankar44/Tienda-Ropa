# Sistema de Sincronización de Wishlist

## 📋 Descripción

Este sistema permite sincronizar automáticamente los productos guardados en la wishlist del localStorage con la base de datos PostgreSQL, manteniendo los favoritos del usuario persistentes entre sesiones.

## 🏗️ Arquitectura

### Componentes Principales

1. **Backend (Node.js + Express)**
   - `routes/favourites.js` - Endpoints para gestión de favoritos
   - `config/database.js` - Configuración de PostgreSQL

2. **Frontend (JavaScript)**
   - `js/wishlist-sync.js` - Manager de sincronización
   - `wishlist.html` - Página de wishlist con botón de sincronización
   - `account.html` - Página de cuenta del usuario

3. **Base de Datos**
   - Tabla `user_favourites` - Relación usuario-producto
   - Tabla `products` - Productos con contador de favoritos
   - Tabla `users` - Usuarios autenticados

## 🔄 Flujo de Sincronización

### 1. Usuario No Autenticado
```
localStorage (wishlist) → Solo almacenamiento local
```

### 2. Usuario Autenticado
```
localStorage (wishlist) ↔ Base de Datos (user_favourites)
```

## 📡 Endpoints API

### POST `/api/favourites/sync`
Sincroniza la wishlist del localStorage con la base de datos.

**Request:**
```json
{
  "user_id": 123,
  "wishlist_items": [
    {
      "id": "37",
      "name": "Sudaderon Cronox",
      "price": "€120.00",
      "image": "/uploads/products/product-1761173021413-648288837.png"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sincronización completada. 1 productos sincronizados.",
  "data": {
    "user_id": 123,
    "synced_count": 1,
    "total_items": 1,
    "errors": []
  }
}
```

### GET `/api/favourites/:user_id`
Obtiene los favoritos de un usuario desde la base de datos.

### GET `/api/users/profile`
Obtiene el perfil del usuario autenticado (incluye ID).

## 🚀 Implementación

### Fase 1: Análisis ✅
- Estructura de base de datos verificada
- Tabla `user_favourites` funcional
- Relaciones usuario-producto establecidas

### Fase 2: Backend ✅
- Endpoint `/api/favourites/sync` implementado
- Endpoint `/api/users/profile` existente
- Validaciones y manejo de errores

### Fase 3: Frontend ✅
- `WishlistSyncManager` clase JavaScript
- Extracción automática de productos de wishlist
- Sincronización bidireccional

### Fase 4: Integración ✅
- Botón de sincronización manual en wishlist.html
- Sincronización automática en account.html
- Script incluido en index.html

### Fase 5: Automatización ✅
- Sincronización automática al autenticarse
- Sincronización automática al cambiar wishlist
- Notificaciones de estado al usuario

## 🎯 Funcionalidades

### Sincronización Automática
- **Al iniciar sesión**: Carga wishlist desde la base de datos
- **Al agregar/quitar productos**: Sincroniza cambios automáticamente
- **Al cambiar de dispositivo**: Mantiene favoritos persistentes

### Sincronización Manual
- **Botón "Sync with Account"**: Sincronización manual en wishlist.html
- **Verificación de autenticación**: Solo funciona si el usuario está logueado
- **Feedback visual**: Notificaciones de éxito/error

### Gestión de Errores
- **Productos no encontrados**: Se reportan pero no interrumpen la sincronización
- **Errores de red**: Manejo graceful con notificaciones
- **Validaciones**: Verificación de datos antes de sincronizar

## 🔧 Configuración

### Variables de Entorno
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cronox_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_jwt_secret
```

### Dependencias
```json
{
  "pg": "^8.11.3",
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3"
}
```

## 🧪 Pruebas

### Script de Prueba
```bash
node scripts/test-wishlist-sync.js
```

Este script verifica:
- ✅ Estructura de la base de datos
- ✅ Usuarios existentes
- ✅ Productos disponibles
- ✅ Funcionalidad de sincronización

### Pruebas Manuales
1. **Registrar usuario** en `/register.html`
2. **Iniciar sesión** en `/login.html`
3. **Agregar productos** a la wishlist
4. **Verificar sincronización** en `/wishlist.html`
5. **Comprobar persistencia** cerrando y abriendo navegador

## 📱 Uso del Sistema

### Para Usuarios
1. **Navegar** por productos en la tienda
2. **Hacer clic** en el corazón para agregar a favoritos
3. **Iniciar sesión** para sincronizar con su cuenta
4. **Ver favoritos** en `/wishlist.html`
5. **Sincronizar manualmente** con el botón "Sync with Account"

### Para Desarrolladores
1. **Monitorear logs** del servidor para debugging
2. **Verificar base de datos** con queries SQL
3. **Probar endpoints** con herramientas como Postman
4. **Revisar localStorage** en DevTools del navegador

## 🐛 Troubleshooting

### Problemas Comunes

**Error: "Usuario no autenticado"**
- Verificar que el token JWT esté en localStorage
- Comprobar que el usuario haya iniciado sesión

**Error: "Producto no encontrado"**
- Verificar que el producto existe en la base de datos
- Comprobar que el producto está activo (`is_active = true`)

**Error: "Error de conexión"**
- Verificar que el servidor esté corriendo
- Comprobar la configuración de la base de datos

### Logs de Debug
```javascript
// Habilitar logs detallados
localStorage.setItem('debug-wishlist-sync', 'true');
```

## 🔮 Mejoras Futuras

### Funcionalidades Adicionales
- [ ] Sincronización en tiempo real con WebSockets
- [ ] Historial de cambios en favoritos
- [ ] Compartir wishlist con otros usuarios
- [ ] Notificaciones cuando productos favoritos están en oferta
- [ ] Exportar wishlist a PDF/email

### Optimizaciones
- [ ] Cache de favoritos en el frontend
- [ ] Paginación para usuarios con muchos favoritos
- [ ] Compresión de datos de sincronización
- [ ] Sincronización diferencial (solo cambios)

## 📊 Monitoreo

### Métricas Importantes
- **Tasa de sincronización exitosa**: >95%
- **Tiempo de respuesta**: <2 segundos
- **Errores de sincronización**: <5%
- **Productos sincronizados por usuario**: Promedio

### Alertas
- Fallos de sincronización masivos
- Errores de base de datos
- Tiempo de respuesta alto
- Usuarios con problemas de autenticación

---

## 🎉 ¡Sistema Listo!

El sistema de sincronización de wishlist está completamente implementado y funcional. Los usuarios pueden ahora:

✅ **Agregar productos** a su wishlist localmente  
✅ **Iniciar sesión** para sincronizar con su cuenta  
✅ **Mantener favoritos** entre sesiones y dispositivos  
✅ **Sincronizar manualmente** cuando sea necesario  
✅ **Recibir notificaciones** del estado de sincronización  

¡La wishlist ahora es verdaderamente persistente y sincronizada! 🚀
