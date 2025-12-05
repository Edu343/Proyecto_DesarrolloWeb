-- ============================================
-- BASE DE DATOS FERRETERÍA - VERSIÓN DEFINITIVA
-- Compatible con XAMPP y cumple TODOS los requisitos
-- ============================================

DROP DATABASE IF EXISTS ferreteria_db;
CREATE DATABASE ferreteria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ferreteria_db;

-- ============================================
-- TABLAS
-- ============================================

-- Tabla de Categorías
CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- Tabla de Productos
CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    categoria_id INT NOT NULL,
    imagen VARCHAR(255),
    destacado BOOLEAN DEFAULT FALSE,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    INDEX idx_categoria (categoria_id),
    INDEX idx_activo (activo),
    INDEX idx_destacado (destacado),
    INDEX idx_nombre (nombre)
) ENGINE=InnoDB;

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    rol ENUM('admin', 'cliente') DEFAULT 'cliente',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_sesion TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- Tabla de Sesiones
CREATE TABLE sesiones (
    id VARCHAR(128) PRIMARY KEY,
    usuario_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_actividad (ultima_actividad)
) ENGINE=InnoDB;

-- Tabla de Pedidos
CREATE TABLE pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    iva DECIMAL(10, 2) NOT NULL,
    costo_envio DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('pendiente', 'procesando', 'completado', 'cancelado') DEFAULT 'pendiente',
    tipo_envio ENUM('tienda', 'domicilio') DEFAULT 'tienda',
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB;

-- Tabla de Detalles de Pedido
CREATE TABLE pedido_detalles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    producto_nombre VARCHAR(200) NOT NULL,
    producto_precio DECIMAL(10, 2) NOT NULL,
    cantidad INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    INDEX idx_pedido (pedido_id),
    INDEX idx_producto (producto_id)
) ENGINE=InnoDB;

-- Tabla de Archivos
CREATE TABLE archivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_original VARCHAR(255) NOT NULL,
    nombre_guardado VARCHAR(255) NOT NULL,
    ruta VARCHAR(500) NOT NULL,
    tipo VARCHAR(100),
    tamanio INT,
    entidad_tipo ENUM('producto', 'usuario', 'pedido') NOT NULL,
    entidad_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entidad (entidad_tipo, entidad_id)
) ENGINE=InnoDB;

-- Tabla de Auditoría
CREATE TABLE auditoria_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tabla VARCHAR(50) NOT NULL,
    accion VARCHAR(50) NOT NULL,
    registro_id INT,
    usuario_id INT,
    datos_anteriores JSON,
    datos_nuevos JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tabla (tabla),
    INDEX idx_accion (accion),
    INDEX idx_usuario (usuario_id),
    INDEX idx_fecha (created_at)
) ENGINE=InnoDB;

-- ============================================
-- VISTAS (SNAPSHOTS)
-- ============================================

-- Vista: Productos completos con información de categoría
CREATE VIEW vista_productos_completo AS
SELECT
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.stock,
    p.imagen,
    p.destacado,
    p.activo,
    p.created_at,
    c.id AS categoria_id,
    c.nombre AS categoria_nombre,
    c.icono AS categoria_icono
FROM productos p
INNER JOIN categorias c ON p.categoria_id = c.id
WHERE p.activo = TRUE;

-- Vista: Estadísticas por categoría
CREATE VIEW vista_estadisticas_categoria AS
SELECT
    c.id AS categoria_id,
    c.nombre AS categoria_nombre,
    c.icono AS categoria_icono,
    COUNT(p.id) AS total_productos,
    SUM(p.stock) AS stock_total,
    AVG(p.precio) AS precio_promedio,
    MIN(p.precio) AS precio_minimo,
    MAX(p.precio) AS precio_maximo
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id AND p.activo = TRUE
WHERE c.activo = TRUE
GROUP BY c.id, c.nombre, c.icono;

-- Vista: Pedidos con información de usuario
CREATE VIEW vista_pedidos_completo AS
SELECT
    ped.id AS pedido_id,
    ped.total,
    ped.estado,
    ped.tipo_envio,
    ped.created_at AS fecha_pedido,
    u.id AS usuario_id,
    u.nombre AS usuario_nombre,
    u.email AS usuario_email,
    u.telefono AS usuario_telefono,
    COUNT(pd.id) AS total_items
FROM pedidos ped
INNER JOIN usuarios u ON ped.usuario_id = u.id
LEFT JOIN pedido_detalles pd ON ped.id = pd.pedido_id
GROUP BY ped.id, ped.total, ped.estado, ped.tipo_envio, ped.created_at,
         u.id, u.nombre, u.email, u.telefono;

-- ============================================
-- TRIGGERS (REQUISITO: AUDITORÍA AUTOMÁTICA)
-- ============================================

DELIMITER //

-- Trigger: Auditoría de INSERT en productos
CREATE TRIGGER trg_productos_audit_insert
AFTER INSERT ON productos
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_log (tabla, accion, registro_id, datos_nuevos)
    VALUES (
        'productos',
        'INSERT',
        NEW.id,
        JSON_OBJECT(
            'nombre', NEW.nombre,
            'precio', NEW.precio,
            'stock', NEW.stock,
            'categoria_id', NEW.categoria_id
        )
    );
END //

-- Trigger: Auditoría de UPDATE en productos
CREATE TRIGGER trg_productos_audit_update
AFTER UPDATE ON productos
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_log (tabla, accion, registro_id, datos_anteriores, datos_nuevos)
    VALUES (
        'productos',
        'UPDATE',
        NEW.id,
        JSON_OBJECT(
            'nombre', OLD.nombre,
            'precio', OLD.precio,
            'stock', OLD.stock
        ),
        JSON_OBJECT(
            'nombre', NEW.nombre,
            'precio', NEW.precio,
            'stock', NEW.stock
        )
    );
END //

-- Trigger: Auditoría de DELETE en productos
CREATE TRIGGER trg_productos_audit_delete
AFTER DELETE ON productos
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_log (tabla, accion, registro_id, datos_anteriores)
    VALUES (
        'productos',
        'DELETE',
        OLD.id,
        JSON_OBJECT(
            'nombre', OLD.nombre,
            'precio', OLD.precio,
            'stock', OLD.stock
        )
    );
END //

-- Trigger: Actualizar última sesión del usuario
CREATE TRIGGER trg_sesiones_update_usuario
AFTER INSERT ON sesiones
FOR EACH ROW
BEGIN
    UPDATE usuarios
    SET ultima_sesion = CURRENT_TIMESTAMP
    WHERE id = NEW.usuario_id;
END //

-- Trigger: Validar stock al crear detalle de pedido
CREATE TRIGGER trg_pedido_detalle_validar_stock
BEFORE INSERT ON pedido_detalles
FOR EACH ROW
BEGIN
    DECLARE stock_disponible INT;

    SELECT stock INTO stock_disponible
    FROM productos
    WHERE id = NEW.producto_id;

    IF stock_disponible < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para el producto';
    END IF;

    -- Actualizar stock del producto
    UPDATE productos
    SET stock = stock - NEW.cantidad
    WHERE id = NEW.producto_id;
END //

DELIMITER ;

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

-- Categorías (6)
INSERT INTO categorias (nombre, descripcion, icono, activo) VALUES
('Herramientas', 'Herramientas manuales y eléctricas de alta calidad', 'fas fa-hammer', TRUE),
('Pinturas', 'Pinturas, barnices y accesorios para pintar', 'fas fa-paint-roller', TRUE),
('Plomería', 'Tuberías, llaves y accesorios sanitarios', 'fas fa-faucet', TRUE),
('Electricidad', 'Material eléctrico, cables y contactos', 'fas fa-bolt', TRUE),
('Construcción', 'Materiales básicos para construcción', 'fas fa-hard-hat', TRUE),
('Jardinería', 'Herramientas y productos para jardín', 'fas fa-seedling', TRUE);

-- Productos (36 productos - 6 por categoría)
INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, destacado) VALUES
-- HERRAMIENTAS (cat 1)
('Martillo de Acero 16oz', 'Martillo profesional con mango ergonómico antideslizante. Cabeza forjada en acero templado de alta resistencia.', 249.99, 50, 1, TRUE),
('Taladro Inalámbrico 18V', 'Taladro percutor inalámbrico con batería de litio y cargador rápido. Incluye maletín y 20 accesorios.', 1299.99, 25, 1, TRUE),
('Set Destornilladores 6pz', 'Juego de destornilladores profesionales con mangos ergonómicos. Incluye planos y phillips en diferentes medidas.', 189.99, 100, 1, FALSE),
('Sierra Circular 7 1/4"', 'Sierra circular eléctrica 1800W con guía láser y ajuste de profundidad. Incluye disco para madera.', 899.99, 15, 1, TRUE),
('Llave Inglesa 12"', 'Llave ajustable cromada con acabado antideslizante. Apertura máxima 32mm.', 159.99, 40, 1, FALSE),
('Nivel Láser Autonivelante', 'Nivel láser de líneas cruzadas con trípode incluido. Alcance de 20 metros.', 599.99, 20, 1, TRUE),

-- PINTURAS (cat 2)
('Pintura Vinílica Blanca 19L', 'Pintura lavable para interiores. Rendimiento de 12-14 m² por litro. Secado rápido.', 599.99, 80, 2, TRUE),
('Brocha 4 pulgadas', 'Brocha profesional con cerda natural. Ideal para acabados finos en madera y metal.', 89.99, 120, 2, FALSE),
('Rodillo con Charola', 'Kit completo para pintar: rodillo de 9", charola plástica y extensión telescópica de 2m.', 149.99, 60, 2, FALSE),
('Esmalte Acrílico Rojo 1L', 'Esmalte de secado rápido con acabado brillante profesional. Para interiores y exteriores.', 199.99, 45, 2, FALSE),
('Thinner 1L', 'Diluyente para pinturas y esmaltes alquídicos. Alta pureza.', 79.99, 90, 2, FALSE),
('Lija Grano 80', 'Papel lija de óxido de aluminio para madera y metal. Hoja de 9x11 pulgadas.', 12.99, 200, 2, FALSE),

-- PLOMERÍA (cat 3)
('Llave Mezcladora Lavabo', 'Llave monomando con acabado cromado. Cartucho cerámico de alta duración.', 449.99, 30, 3, TRUE),
('Tubería PVC 1/2" 6m', 'Tubería cédula 40 para agua fría. Resistente a la corrosión.', 89.99, 200, 3, FALSE),
('Codo PVC 1/2" 90°', 'Codo de 90 grados para tubería cédula 40. Conexión por cementado.', 12.99, 500, 3, FALSE),
('Flotador Universal WC', 'Flotador ajustable para tanque de inodoro. Compatible con la mayoría de marcas.', 79.99, 75, 3, FALSE),
('Llave de Paso 1/2"', 'Llave esférica de bronce con palanca. Para instalaciones de agua.', 129.99, 60, 3, FALSE),
('Cinta Teflón', 'Cinta selladora de roscas. Rollo de 12mm x 10m.', 15.99, 300, 3, FALSE),

-- ELECTRICIDAD (cat 4)
('Cable Cal. 12 (metro)', 'Cable THW color negro calibre 12. Para instalaciones eléctricas 600V.', 18.99, 1000, 4, FALSE),
('Apagador Sencillo', 'Apagador de una vía, blanco marfil. 15A 120V con placa incluida.', 29.99, 300, 4, FALSE),
('Contacto Doble Polarizado', 'Contacto con tierra 15A 120V. Incluye placa decorativa blanca.', 39.99, 250, 4, FALSE),
('Foco LED 12W Luz Blanca', 'Foco ahorrador LED equivalente a 100W. Base E27, 6000K luz fría.', 59.99, 400, 4, TRUE),
('Caja Chalupa Cuadrada', 'Caja de conexiones de PVC. Para empotrar en muros.', 8.99, 500, 4, FALSE),
('Multímetro Digital', 'Probador de voltaje AC/DC, resistencia y continuidad. Pantalla LCD.', 299.99, 35, 4, TRUE),

-- CONSTRUCCIÓN (cat 5)
('Cemento Gris 50kg', 'Cemento Portland Tipo I para uso general. Alta resistencia.', 189.99, 500, 5, TRUE),
('Arena de Río (bulto)', 'Arena lavada para construcción. Saco de aproximadamente 40kg.', 79.99, 300, 5, FALSE),
('Varilla 3/8" 6m', 'Varilla corrugada grado 42 para estructuras de concreto.', 149.99, 150, 5, FALSE),
('Block 15x20x40', 'Block de concreto hueco para muros. Alta resistencia a la compresión.', 19.99, 2000, 5, FALSE),
('Grava 3/4 (bulto)', 'Grava triturada para concreto. Saco de aproximadamente 40kg.', 89.99, 250, 5, FALSE),
('Cemento Blanco 1kg', 'Cemento blanco para acabados y juntas. Bolsa de 1kg.', 45.99, 100, 5, FALSE),

-- JARDINERÍA (cat 6)
('Manguera 1/2" 15m', 'Manguera reforzada antirayos UV. Conexiones de bronce incluidas.', 299.99, 40, 6, TRUE),
('Pala Jardinería', 'Pala de acero con mango de madera. Para transplante y cultivo.', 179.99, 35, 6, FALSE),
('Tijeras de Podar 8"', 'Tijeras profesionales de acero forjado. Corte tipo bypass.', 249.99, 50, 6, TRUE),
('Fertilizante Triple 17', 'Fertilizante NPK 17-17-17 multiusos. Bolsa de 1kg.', 89.99, 100, 6, FALSE),
('Rastrillo Metálico', 'Rastrillo de jardín con 16 dientes de acero y mango de madera.', 139.99, 45, 6, FALSE),
('Regadera Plástico 10L', 'Regadera de polietileno con rociador ajustable. Capacidad 10 litros.', 129.99, 60, 6, FALSE);

-- Usuarios de prueba
-- Password para todos: admin123 (hash bcrypt)
INSERT INTO usuarios (nombre, email, password_hash, telefono, direccion, rol, activo) VALUES
('Administrador Sistema', 'admin@ferreteria.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9991234567', 'Calle 50 #123, Centro, Mérida, Yucatán', 'admin', TRUE),
('Juan Pérez García', 'cliente@ejemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9999876543', 'Calle 60 #456, Col. Centro, Mérida, Yucatán', 'cliente', TRUE),
('María López Hernández', 'maria.lopez@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9991112233', 'Calle 45 #789, Fracc. Las Américas, Mérida', 'cliente', TRUE);

-- ============================================
-- CONSULTAS DE VERIFICACIÓN
-- ============================================

-- Verificar productos por categoría
SELECT
    c.nombre AS categoria,
    COUNT(p.id) AS total_productos,
    SUM(p.stock) AS stock_total
FROM categorias c
LEFT JOIN productos p ON c.id = p.categoria_id
GROUP BY c.id, c.nombre
ORDER BY c.nombre;

-- Verificar productos destacados
SELECT nombre, precio, stock, destacado
FROM productos
WHERE destacado = TRUE
ORDER BY precio DESC;

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
