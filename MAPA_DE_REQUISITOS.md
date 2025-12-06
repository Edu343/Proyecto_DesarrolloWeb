# 📋 MAPA DE REQUISITOS - PROYECTO FERRETERÍA

Este documento mapea cada requisito académico con su ubicación exacta en el código.

---

## ✅ REQUISITOS CUMPLIDOS (30 PUNTOS)

### 1. Manejo de Sesiones de Usuario (2 pts) ✓

**Ubicación:**
- **Archivo:** `php/auth/session_manager.php` (Línea 6)
- **Descripción:** Sistema completo de gestión de sesiones con regeneración de ID, timeout, y almacenamiento en base de datos
- **Características:**
  - Configuración segura de sesiones (HttpOnly, SameSite)
  - Regeneración periódica de ID de sesión
  - Control de timeout (30 minutos)
  - Rate limiting en login
  - Registro de sesiones en tabla `sesiones`

**Código específico:**
```php
// session_manager.php líneas 22-39
private function initSession() {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        // ... configuración completa
    }
}
```

---

### 2. Protección contra Ataques Básicos (2 pts) ✓

**Ubicación:**
- **Archivo:** `php/config/security.php` (Línea 6)
- **Descripción:** Clase de seguridad con múltiples capas de protección

**Protecciones implementadas:**
1. **XSS (Cross-Site Scripting)**
   - Sanitización de input/output
   - `htmlspecialchars()` con ENT_QUOTES

2. **SQL Injection**
   - PDO con prepared statements
   - Parámetros vinculados

3. **CSRF (Cross-Site Request Forgery)**
   - Tokens CSRF en formularios
   - Validación de tokens

4. **Rate Limiting**
   - Límite de intentos de login
   - Prevención de fuerza bruta

5. **Headers de Seguridad**
   - X-Frame-Options
   - X-Content-Type-Options
   - Content-Security-Policy

**Ejemplo:**
```php
// security.php líneas 12-17
public static function sanitizeOutput($data) {
    if (is_array($data)) {
        return array_map([self::class, 'sanitizeOutput'], $data);
    }
    return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
}
```

---

### 3. Administrar Catálogo con Búsqueda y Relaciones (8 pts) ✓

**Ubicación:**
- **Archivo:** `php/api/productos.php` (Líneas 7-8)
- **Base de Datos:** `database/ferreteria_db.sql`

**Catálogos implementados:**
1. **Productos** (tabla principal)
2. **Categorías** (tabla relacionada)
3. **Relación:** productos.categoria_id → categorias.id (Foreign Key)

**Funcionalidades de búsqueda:**
- Búsqueda por nombre de producto
- Filtrado por categoría
- Filtrado por destacados
- Ordenamiento por precio, nombre, fecha
- Paginación de resultados

**Endpoints API:**
```
GET /api/productos.php?action=listar         - Listar todos
GET /api/productos.php?action=buscar&q=...   - Búsqueda
GET /api/productos.php?action=categoria&id=X - Por categoría
GET /api/productos.php?action=destacados     - Destacados
```

**Código de búsqueda:**
```php
// productos.php líneas 150-170
if ($method === 'GET' && $action === 'buscar') {
    $q = $_GET['q'] ?? '';
    $stmt = $pdo->prepare("
        SELECT p.*, c.nombre as categoria_nombre
        FROM productos p
        INNER JOIN categorias c ON p.categoria_id = c.id
        WHERE p.nombre LIKE ? AND p.activo = 1
    ");
    $stmt->execute(["%$q%"]);
}
```

---

### 4. Uso de Vistas, Procedimientos y Triggers (2 pts) ✓

**Ubicación:** `database/ferreteria_db.sql`

#### A) **VISTAS (Snapshots)** - Línea 488

**Vista 1: vista_estadisticas_categoria**
```sql
-- Líneas 488-492
CREATE VIEW vista_estadisticas_categoria AS
SELECT
    c.id AS categoria_id,
    c.nombre AS categoria_nombre,
    COUNT(p.id) AS total_productos,
    SUM(p.stock) AS stock_total,
    AVG(p.precio) AS precio_promedio
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
GROUP BY c.id;
```

**Vista 2: vista_pedidos_completo**
- Combina pedidos, usuarios y detalles
- Líneas 496-502

**Vista 3: vista_productos_completo**
- Combina productos con categorías
- Líneas 505-511

#### B) **TRIGGERS (Disparadores)** - Líneas 229, 316

**Trigger 1: trg_pedido_detalle_validar_stock**
```sql
-- Línea 232
CREATE TRIGGER trg_pedido_detalle_validar_stock
BEFORE INSERT ON pedido_detalles
FOR EACH ROW BEGIN
    -- Valida stock disponible automáticamente
    -- Actualiza stock al insertar pedido
END
```

**Trigger 2: trg_productos_audit_delete**
```sql
-- Línea 319
CREATE TRIGGER trg_productos_audit_delete
AFTER DELETE ON productos
FOR EACH ROW BEGIN
    -- Auditoría automática de eliminaciones
END
```

**Trigger 3: trg_productos_audit_insert**
- Auditoría de inserciones (Línea 334)

**Trigger 4: trg_productos_audit_update**
- Auditoría de actualizaciones (Línea 352)

**Trigger 5: trg_sesiones_update_usuario**
- Actualiza última sesión del usuario (Línea 390)

---

### 5. Manejo de Cookies y Local Storage (2 pts) ✓

**Ubicación:** `src/js/principal.js` (Líneas 5-7)

#### A) **COOKIES** - Línea 16
```javascript
// Objeto Cookie para gestión completa
const Cookie = {
    set: (name, value, days = 7) => {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`;
    },
    get: (name) => { /* ... */ },
    delete: (name) => { /* ... */ }
};
```

**Uso de cookies:**
- Preferencias de usuario
- Configuración de vista
- Tokens de sesión

#### B) **LOCAL STORAGE** - Línea 33
```javascript
// Objeto Storage para gestión de localStorage
const Storage = {
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get: (key) => {
        return JSON.parse(localStorage.getItem(key));
    },
    remove: (key) => { /* ... */ }
};
```

**Uso de localStorage:**
- **Carrito de compras** (`src/js/carrito.js` línea 24)
- **Datos de usuario** (login persistente)
- **Caché de API** (tipo de cambio)
- **Preferencias** (tema, idioma)

---

### 6. Subir y Descargar Archivos (2 pts) ✓

**Ubicaciones:**

#### A) **SUBIDA DE ARCHIVOS**

**Archivo 1:** `php/api/archivos.php` (Línea 6)
- Subida de imágenes de productos
- Validación de tipo y tamaño
- Nombres únicos
- Almacenamiento en `uploads/productos/`

**Archivo 2:** `php/api/contacto.php` (Línea 6)
- Subida de fotos de productos dañados
- Hasta 5 fotos por reporte
- Formatos: JPG, PNG, GIF, WEBP
- Máximo 5MB por archivo
- Almacenamiento en `uploads/contacto/`

```php
// contacto.php líneas 89-140
foreach ($_FILES['fotos']['name'] as $key => $filename) {
    // Validación de tipo
    if (!in_array($fileType, $allowedTypes)) {
        sendResponse(false, null, 'Solo se permiten imágenes', 400);
    }
    // Validación de tamaño
    if ($fileSize > 5 * 1024 * 1024) {
        sendResponse(false, null, 'Tamaño máximo: 5MB', 400);
    }
    // Mover archivo
    move_uploaded_file($tmpName, $rutaCompleta);
}
```

#### B) **DESCARGA DE ARCHIVOS**

**Archivo:** `php/api/factura.php` (Líneas 6-7)
- Generación y descarga de facturas en PDF/HTML
- Solo el propietario puede descargar
- Formato optimizado para impresión

```php
// factura.php líneas 15-20
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="factura_' . $pedido['id'] . '.pdf"');
```

---

### 7. Estructura y Claridad en el Código (2 pts) ✓

**Evidencia de buena estructura:**

1. **Organización por capas:**
   ```
   php/
   ├── api/          # Endpoints REST
   ├── auth/         # Autenticación
   ├── config/       # Configuración
   src/
   ├── js/           # JavaScript modular
   ├── css/          # Estilos organizados
   └── *.html        # Vistas
   ```

2. **Comentarios descriptivos:**
   - Cada función documentada
   - Requisitos marcados en código
   - Explicaciones en línea

3. **Nombres significativos:**
   - Funciones: `cargarProductosDestacados()`
   - Variables: `productosDestacadosContainer`
   - Clases: `SessionManager`, `Security`

4. **Separación de responsabilidades:**
   - MVC pattern
   - API REST separada de lógica
   - JavaScript modular

5. **Estándares de código:**
   - Indentación consistente
   - PSR-style en PHP
   - ES6+ en JavaScript

---

### 8. Uso de AJAX + JSON con Servicio Web (2 pts) ✓

**Ubicación:** `src/js/principal.js` (Líneas 6, 56)

#### **Objeto AJAX**
```javascript
// principal.js línea 56
const Ajax = {
    async request(url, options = {}) {
        const response = await fetch(url, {
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        return await response.json();
    },

    get(url, params = {}) { /* ... */ },
    post(url, data = {}) { /* ... */ },
    put(url, data = {}) { /* ... */ },
    delete(url) { /* ... */ }
};
```

#### **Servicios Web REST**
Todos en: `php/api/*.php` (Línea 8 en productos.php)

**APIs implementadas:**
1. **productos.php** - Catálogo de productos
2. **auth.php** - Autenticación
3. **pedidos.php** - Gestión de pedidos
4. **archivos.php** - Subida/descarga
5. **contacto.php** - Formulario contacto
6. **factura.php** - Generación facturas

**Ejemplo de uso:**
```javascript
// Llamada AJAX con JSON
const productos = await Ajax.get(API_BASE + 'productos.php?action=listar');
const pedido = await Ajax.post(API_BASE + 'pedidos.php?action=crear', {
    items: carrito,
    tipo_envio: 'domicilio'
});
```

---

### 9. JavaScript para Validación y Generación Dinámica (4 pts) ✓

**Ubicación:** `src/js/principal.js` (Línea 7)

#### A) **VALIDACIÓN** (2 pts)

**Validaciones implementadas:**

1. **Formulario de Login** (`src/js/principal.js` líneas 200-250)
```javascript
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarPassword(password) {
    return password.length >= 6;
}
```

2. **Formulario de Contacto** (`src/js/contacto.js` líneas 57-86)
```javascript
function agregarArchivos(files) {
    for (let file of files) {
        // Validar tipo
        if (!allowedTypes.includes(file.type)) {
            mostrarToast('Tipo de archivo no permitido', 'error');
            continue;
        }
        // Validar tamaño
        if (file.size > maxSize) {
            mostrarToast('Tamaño máximo 5MB', 'error');
            continue;
        }
    }
}
```

3. **Carrito de Compras** (`src/js/carrito.js` líneas 227-242)
```javascript
function actualizarCantidad(id, cantidad) {
    if (cantidad > item.stock) {
        mostrarToast('Stock insuficiente', 'error');
        return;
    }
    item.cantidad = Math.max(1, cantidad);
}
```

#### B) **GENERACIÓN DINÁMICA DE CONTENIDO** (2 pts)

**Ejemplos:**

1. **Renderizado de productos** (`src/js/productos.js` líneas 100-150)
```javascript
function renderizarProductos(productos) {
    productosContainer.innerHTML = '';
    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}">
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio}</p>
            <button onclick="agregarAlCarrito(${producto.id})">
                Agregar al Carrito
            </button>
        `;
        productosContainer.appendChild(card);
    });
}
```

2. **Modal dinámico** (`src/js/carrito.js` líneas 312-359)
```javascript
function mostrarModalConfirmacion(datosPedido) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-contenido-confirmacion">
            <h3>¡Pedido Realizado con Éxito!</h3>
            <p>Número: #${datosPedido.pedido_id}</p>
            <a href="${datosPedido.factura_url}">Descargar Factura</a>
        </div>
    `;
    document.body.appendChild(modal);
}
```

3. **Widgets de API** (`src/js/inicio.js` líneas 244-280)
```javascript
function mostrarWidgetClima(clima) {
    const widget = document.createElement('div');
    widget.innerHTML = `
        <h4>🌡️ Clima en Mérida</h4>
        <div>${clima.temperature}°C</div>
    `;
    footer.parentNode.insertBefore(widget, footer);
}
```

---

### 10. Diseño de Interfaz con Media-Query-Print (4 pts) ✓

**Ubicación:** `php/api/factura.php` (Línea 7)

#### **FACTURA OPTIMIZADA PARA IMPRESIÓN**

**Características:**
- Diseño específico para impresión
- Auto-trigger de diálogo de impresión
- Estilos optimizados para papel
- Ocultación de elementos no imprimibles

```html
<!-- factura.php líneas 75-175 -->
<style>
    @media print {
        /* Ocultar botones y elementos de navegación */
        button, .no-print {
            display: none !important;
        }

        /* Optimizar para página A4 */
        body {
            margin: 0;
            padding: 20px;
            font-size: 12pt;
        }

        /* Evitar saltos de página en elementos */
        .confirmacion-info,
        table {
            page-break-inside: avoid;
        }
    }

    /* Estilos generales */
    body {
        font-family: Arial, sans-serif;
        margin: 40px;
        color: #333;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }
</style>

<script>
    // Auto-abrir diálogo de impresión
    window.onload = function() {
        window.print();
    }
</script>
```

**Media queries adicionales:**
- `src/css/estilos.css` - Responsive design
- `src/css/carrito.css` - Mobile optimizado
- `src/css/contacto.css` - Tablet/desktop

---

## 🎁 FUNCIONALIDADES EXTRA

### 11. Conexión a 2 APIs Externas ✓

**Ubicación:** `src/js/inicio.js` (Línea 4)

#### **API #1: ExchangeRate-API** (Línea 199)
```javascript
// Tipo de cambio USD/MXN
const urlApi = 'https://api.exchangerate-api.com/v4/latest/USD';
const respuesta = await fetch(urlApi);
const datos = await respuesta.json();
// Muestra: 1 USD = XX.XX MXN
```

**Características:**
- Actualización automática
- Caché en localStorage (24h)
- Widget interactivo
- Convertidor al hacer click

#### **API #2: Open-Meteo** (Línea 249)
```javascript
// Clima actual de Mérida, Yucatán
const urlApi = 'https://api.open-meteo.com/v1/forecast?latitude=20.97&longitude=-89.62&current_weather=true';
const respuesta = await fetch(urlApi);
const clima = await respuesta.json();
// Muestra: Temperatura y viento actual
```

**Características:**
- API gratuita sin API key
- Datos meteorológicos en tiempo real
- Coordenadas de Mérida
- Widget visual

---

### 12. Drag & Drop ✓

**Ubicación:** `src/js/carrito.js` (Líneas 5, 110)

**Funcionalidad:**
- Reordenar items del carrito arrastrando
- Visual feedback (drag-over)
- Persistencia del orden en localStorage
- Animaciones suaves

```javascript
// carrito.js líneas 110-156
function attachDragAndDrop() {
    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedElement = item;
            item.classList.add('dragging');
        });

        item.addEventListener('drop', (e) => {
            // Reordenar elementos
            if (draggedIndex < targetIndex) {
                item.parentNode.insertBefore(draggedElement, item.nextSibling);
            } else {
                item.parentNode.insertBefore(draggedElement, item);
            }
            actualizarOrden();
        });
    });
}
```

---

## 📊 RESUMEN DE PUNTUACIÓN

| Requisito | Puntos | Estado | Ubicación Principal |
|-----------|--------|--------|---------------------|
| Sesiones de usuario | 2 | ✅ | `php/auth/session_manager.php:6` |
| Protección ataques | 2 | ✅ | `php/config/security.php:6` |
| Catálogo con búsqueda | 8 | ✅ | `php/api/productos.php:7` |
| Vistas, triggers | 2 | ✅ | `database/ferreteria_db.sql:229,488` |
| Cookies y localStorage | 2 | ✅ | `src/js/principal.js:16,33` |
| Subir/descargar archivos | 2 | ✅ | `php/api/archivos.php:6, contacto.php:6` |
| Estructura del código | 2 | ✅ | Todo el proyecto |
| AJAX + JSON | 2 | ✅ | `src/js/principal.js:56` |
| JS validación/dinámico | 4 | ✅ | `src/js/*.js` |
| Media-query-print | 4 | ✅ | `php/api/factura.php:7` |
| **EXTRA:** 2 APIs | +2 | ✅ | `src/js/inicio.js:199,249` |
| **EXTRA:** Drag & Drop | +2 | ✅ | `src/js/carrito.js:110` |
| **TOTAL** | **30+4** | **✅** | **34 puntos** |

---

## 🔍 CÓMO VERIFICAR CADA REQUISITO

### 1. Sesiones
- Ir a `login.html`
- Iniciar sesión
- Verificar en DevTools → Application → Cookies
- Ver tabla `sesiones` en MySQL

### 2. Seguridad
- Intentar XSS en formularios
- Ver headers en DevTools → Network
- Revisar código en `security.php`

### 3. Catálogo
- Ir a `productos.html`
- Usar buscador
- Filtrar por categoría
- Ver relaciones en base de datos

### 4. Vistas/Triggers
- Ejecutar: `SELECT * FROM vista_productos_completo;`
- Ejecutar: `SELECT * FROM vista_estadisticas_categoria;`
- Hacer un pedido y ver trigger de stock
- Ver tabla `auditoria_log`

### 5. Cookies/Storage
- F12 → Application → Local Storage
- Ver carrito guardado
- Ver datos de usuario

### 6. Archivos
- Ir a `contacto.html`
- Seleccionar "Reporte de daño"
- Subir fotos
- Hacer una compra y descargar factura

### 7. Código
- Revisar estructura de carpetas
- Ver comentarios en código
- Verificar convenciones

### 8. AJAX/JSON
- F12 → Network → XHR
- Ver llamadas a API
- Ver formato JSON

### 9. JavaScript
- Ver validaciones en formularios
- Ver generación dinámica de productos
- Ver modales dinámicos

### 10. Print
- Descargar factura
- Ctrl+P para imprimir
- Ver diseño optimizado

### 11. APIs Externas
- Ir a `index.html`
- Ver widget de tipo de cambio (abajo)
- Ver widget de clima (abajo)

### 12. Drag & Drop
- Ir a `carrito.html`
- Agregar varios productos
- Arrastrar items para reordenar

---

## 📝 NOTAS IMPORTANTES

1. **Base de datos consolidada:** Todo en `database/ferreteria_db.sql`
2. **Comentarios en código:** Cada requisito marcado con `// REQUISITO:` o `/* REQUISITO: */`
3. **Documentación completa:** Ver `INSTRUCCIONES_NUEVAS_FUNCIONALIDADES.md`
4. **APIs sin API key:** Ambas APIs externas son gratuitas y no requieren registro

---

**Última actualización:** Diciembre 2025
