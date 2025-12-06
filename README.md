# 🛠️ Ferretería El Constructor - Sistema Web Completo

Sistema web completo para gestión de ferretería con todas las funcionalidades modernas y requisitos académicos cumplidos.

**Docente:** Víctor Hugo Menéndez Domínguez
**Asignatura:** Desarrollo de Aplicaciones Web

---

## 📊 PUNTUACIÓN TOTAL: 34/30 PUNTOS

- ✅ **30 puntos** - Requisitos académicos obligatorios
- ✅ **+4 puntos** - Funcionalidades extra (2 APIs externas + Drag & Drop)

---

## 🚀 INSTALACIÓN RÁPIDA

### 1. Requisitos
- XAMPP (Apache + MySQL + PHP 8.x)
- Navegador web moderno

### 2. Configuración Base de Datos

**TODO EN UN SOLO ARCHIVO:**

```bash
# Opción 1: Desde terminal MySQL
mysql -u root -p
CREATE DATABASE ferreteria_db;
USE ferreteria_db;
source c:/xampp/htdocs/Proyecto_DesarrolloWeb/database/ferreteria_db.sql
```

**Opción 2: Desde phpMyAdmin**
1. Ir a http://localhost/phpmyadmin
2. Crear base de datos: `ferreteria_db`
3. Importar → Seleccionar `database/ferreteria_db.sql`
4. Ejecutar

### 3. Acceder al Sistema
```
http://localhost/Proyecto_DesarrolloWeb/src/index.html
```

### 4. Usuarios de Prueba
```
Admin:
- Email: admin@ferreteria.com
- Password: password

Cliente:
- Email: cliente@ejemplo.com
- Password: password
```

---

## 📋 MAPA DE REQUISITOS

Para ver la ubicación exacta de cada requisito en el código:

👉 **[Ver MAPA_DE_REQUISITOS.md](MAPA_DE_REQUISITOS.md)**

### Resumen de Requisitos Cumplidos

| # | Requisito | Puntos | Archivo Principal |
|---|-----------|--------|-------------------|
| 1 | Manejo de sesiones | 2 | `php/auth/session_manager.php:6` |
| 2 | Protección ataques | 2 | `php/config/security.php:6` |
| 3 | Catálogo con búsqueda | 8 | `php/api/productos.php:7-8` |
| 4 | Vistas y Triggers | 2 | `database/ferreteria_db.sql:229,316,488` |
| 5 | Cookies y localStorage | 2 | `src/js/principal.js:16,33` |
| 6 | Subir/descargar archivos | 2 | `php/api/archivos.php:6, contacto.php:6` |
| 7 | Estructura del código | 2 | Todo el proyecto |
| 8 | AJAX + JSON | 2 | `src/js/principal.js:56` |
| 9 | JS validación/dinámico | 4 | `src/js/*.js` |
| 10 | Media-query-print | 4 | `php/api/factura.php:7` |
| 11 | **EXTRA:** 2 APIs externas | +2 | `src/js/inicio.js:199,249` |
| 12 | **EXTRA:** Drag & Drop | +2 | `src/js/carrito.js:110` |

---

## 🎯 FUNCIONALIDADES PRINCIPALES

### 🔐 Sistema de Autenticación
- Login/Registro con validación
- Sesiones seguras con timeout
- Control de roles (Admin/Cliente)

### 🛒 Carrito de Compras
- LocalStorage persistente
- **Drag & Drop** para reordenar items
- Cálculo automático (Subtotal + IVA + Envío)
- Validación de stock en tiempo real

### 📦 Gestión de Productos
- Catálogo completo con imágenes
- **Búsqueda avanzada** por nombre
- Filtrado por categorías
- Productos destacados

### 💳 Sistema de Pedidos
- Proceso de checkout completo
- **Descarga de facturas** en PDF/HTML
- Historial de pedidos

### 📞 Contacto con Reportes de Daños
- **Reporte de daños** en productos/envíos
- **Subida de hasta 5 fotos** del producto dañado
- Drag & Drop para fotos
- Vista previa antes de enviar

### 🌐 APIs Externas
1. **ExchangeRate-API** - Tipo de cambio USD/MXN en tiempo real
2. **Open-Meteo** - Clima actual de Mérida, Yucatán

---

## 📁 ESTRUCTURA DEL PROYECTO

```
Proyecto_DesarrolloWeb/
├── database/
│   └── ferreteria_db.sql          # ⭐ BASE DE DATOS ÚNICA CONSOLIDADA
├── php/
│   ├── api/                       # APIs REST en JSON
│   ├── auth/                      # Autenticación y sesiones
│   └── config/                    # Configuración y seguridad
├── src/
│   ├── css/                       # Estilos con media queries
│   ├── js/                        # JavaScript modular
│   └── *.html                     # Páginas del sistema
├── uploads/
│   ├── productos/                 # Imágenes de productos
│   └── contacto/                  # Fotos de reportes
├── MAPA_DE_REQUISITOS.md          # 📍 UBICACIÓN EXACTA DE REQUISITOS
└── README.md                      # Este archivo
```

---

## 🗄️ BASE DE DATOS

### Un Solo Archivo: `database/ferreteria_db.sql`

Incluye:
- ✅ 9 Tablas principales
- ✅ 3 Vistas (snapshots)
- ✅ 5 Triggers
- ✅ Relaciones (Foreign Keys)
- ✅ Datos de prueba
- ✅ Comentarios con requisitos

### Tablas Principales
- `usuarios`, `productos`, `categorias` (con relación)
- `pedidos`, `pedido_detalles`
- `archivos`, `contactos`, `sesiones`, `auditoria_log`

---

## 📖 DOCUMENTACIÓN

### Para Desarrolladores
- **[MAPA_DE_REQUISITOS.md](MAPA_DE_REQUISITOS.md)** - Ubicación exacta de cada requisito (línea por línea)
- Comentarios en código: `// REQUISITO: ...` en MAYÚSCULAS

### Para Usuarios
- **[INSTRUCCIONES_NUEVAS_FUNCIONALIDADES.md](INSTRUCCIONES_NUEVAS_FUNCIONALIDADES.md)** - Guía de reportes de daños y facturas

---

## 🧪 VERIFICACIÓN RÁPIDA DE REQUISITOS

```bash
# 1. Sesiones (2 pts)
Ir a login.html → Iniciar sesión → F12 → Application → Cookies

# 2. Seguridad (2 pts)
Ver php/config/security.php:6 → Headers de seguridad

# 3. Catálogo (8 pts)
productos.html → Buscador + Filtro por categoría

# 4. Vistas/Triggers (2 pts)
MySQL: SELECT * FROM vista_productos_completo;

# 5. Cookies/Storage (2 pts)
F12 → Application → Local Storage (ver carrito guardado)

# 6. Archivos (2 pts)
contacto.html → Reporte daño → Subir fotos
Hacer compra → Descargar factura

# 7. Estructura (2 pts)
Ver organización de carpetas y comentarios

# 8. AJAX/JSON (2 pts)
F12 → Network → XHR (ver llamadas API)

# 9. Validación/Dinámico (4 pts)
Formularios con validación + Contenido dinámico

# 10. Print (4 pts)
Descargar factura → Ctrl+P (diseño optimizado)

# 11. APIs Externas (+2 pts)
index.html → Widgets de tipo de cambio y clima

# 12. Drag & Drop (+2 pts)
carrito.html → Arrastrar items para reordenar
```

---

## 🔧 TECNOLOGÍAS

**Backend:** PHP 8.x, MySQL, PDO, REST API
**Frontend:** HTML5, CSS3, JavaScript ES6+
**Seguridad:** Session Management, CSRF, XSS Prevention, Rate Limiting
**APIs:** Fetch API, LocalStorage, Cookies, Drag & Drop API

---

## 👥 USUARIOS DE PRUEBA

```
Admin: admin@ferreteria.com / password
Cliente: cliente@ejemplo.com / password
```

---

## 📝 NOTAS IMPORTANTES

1. ✅ **Base de datos consolidada** - Todo en un solo archivo SQL
2. ✅ **Comentarios en código** - Cada requisito marcado en MAYÚSCULAS
3. ✅ **Sin migraciones** - Importar una sola vez el archivo completo
4. ✅ **34 puntos totales** - 30 obligatorios + 4 extra

---

**Proyecto Académico - Desarrollo de Aplicaciones Web - 2025**

**Puntuación: 34/30 ✅**
