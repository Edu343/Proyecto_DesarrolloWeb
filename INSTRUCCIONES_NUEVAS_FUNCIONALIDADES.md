# Nuevas Funcionalidades Implementadas

## 1. Sistema de Reporte de Daños en Contacto

### Características
- Opción de reportar daños en productos o envíos desde el formulario de contacto
- Subida de hasta 5 fotos del producto dañado
- Soporte para arrastrar y soltar imágenes (drag & drop)
- Vista previa de las fotos antes de enviar
- Opción de agregar número de pedido relacionado

### Archivos Modificados/Creados
- **Base de datos:**
  - `database/ferreteria_db.sql` - Base de datos consolidada con tabla `contactos`

- **Backend:**
  - `php/api/contacto.php` - Nueva API para manejar contactos con fotos

- **Frontend:**
  - `src/contacto.html` - Formulario actualizado con campos de daño
  - `src/css/contacto.css` - Estilos para subida de fotos
  - `src/js/contacto.js` - Lógica de manejo de fotos y envío

### Instalación

**Base de datos única y consolidada:**
```sql
-- Importar el archivo completo (incluye todo)
source database/ferreteria_db.sql
```

O desde phpMyAdmin:
1. Crear base de datos `ferreteria_db`
2. Importar → Seleccionar `database/ferreteria_db.sql`
3. Ejecutar

### Uso
1. Ve a la página de Contacto
2. Selecciona "Reporte de Daño en Producto/Envío"
3. Se mostrarán campos adicionales para:
   - Número de pedido (opcional)
   - Subir fotos del producto dañado
4. Arrastra las fotos o haz clic para seleccionarlas
5. Máximo 5 fotos, 5MB cada una
6. Formatos: JPG, PNG, GIF, WEBP

---

## 2. Sistema de Generación de Facturas PDF

### Características
- Generación automática de factura después de cada compra
- Factura descargable en formato HTML/PDF
- Incluye toda la información del pedido:
  - Datos del cliente
  - Detalles de productos
  - Subtotal, IVA, costo de envío
  - Total a pagar
- Diseño profesional con logo de la ferretería

### Archivos Modificados/Creados
- **Backend:**
  - `php/api/factura.php` - API para obtener detalles del pedido
  - `php/api/pedidos.php` - Actualizado para incluir URL de factura

- **Frontend:**
  - `src/factura.html` - Plantilla HTML para factura con generación dinámica
  - `src/js/carrito.js` - Modal de confirmación con botón de descarga
  - `src/css/carrito.css` - Estilos para modal de confirmación

### Instalación
No requiere cambios en la base de datos. Solo asegúrate de tener todos los archivos PHP en su lugar.

### Uso
1. Realiza una compra normalmente
2. Después de completar el pedido, verás un modal de confirmación
3. Haz clic en "Descargar Factura"
4. Se abrirá una nueva ventana con la factura
5. Puedes imprimirla o guardarla como PDF desde el navegador (Ctrl+P)

### Acceso a Facturas
- **URL directa:** `src/factura.html?pedido_id=XXX`
- Reemplaza XXX con el número de pedido
- Solo usuarios autenticados pueden ver sus propias facturas
- Para guardar como PDF: Haz clic en el botón "Imprimir / Guardar PDF" o presiona Ctrl+P y selecciona "Guardar como PDF"

---

## Estructura de Directorios Creados

```
uploads/
└── contacto/          # Fotos de productos dañados
```

## Permisos Necesarios

Asegúrate de que el servidor web tenga permisos de escritura en:
```bash
chmod 755 uploads/contacto/
```

En Windows (XAMPP), no se requieren permisos especiales.

---

## Características de Seguridad Implementadas

### Sistema de Contacto
- Validación de tipos de archivo (solo imágenes)
- Límite de tamaño de archivo (5MB)
- Sanitización de datos de entrada
- Nombres únicos para archivos
- Almacenamiento en directorio protegido

### Sistema de Facturas
- Verificación de sesión activa
- Solo el propietario del pedido puede descargar su factura
- Protección contra SQL injection
- Validación de parámetros

---

## Pruebas Recomendadas

### Sistema de Contacto
1. Enviar reporte sin fotos
2. Enviar reporte con 1 foto
3. Intentar subir más de 5 fotos
4. Intentar subir archivo no permitido (.exe, .pdf)
5. Intentar subir imagen mayor a 5MB

### Sistema de Facturas
1. Realizar compra y descargar factura
2. Intentar acceder a factura de otro usuario
3. Verificar que todos los datos sean correctos
4. Probar impresión desde el navegador

---

## Soporte

Si encuentras algún problema:
1. Verifica que los directorios tengan los permisos correctos
2. Revisa los logs de PHP: `php/logs/` o consola del navegador
3. Asegúrate de tener las tablas actualizadas en la base de datos

---

## Próximas Mejoras Sugeridas

1. **Facturas:**
   - Generar PDF real usando biblioteca como FPDF o TCPDF
   - Envío automático por correo electrónico
   - Almacenamiento de facturas en servidor

2. **Contacto:**
   - Panel de administración para ver reportes
   - Notificaciones por email al recibir reporte de daño
   - Sistema de tickets para seguimiento

3. **General:**
   - Historial de pedidos con acceso a facturas antiguas
   - Descarga masiva de facturas por período
   - Facturación fiscal con RFC
