<?php
/**
 * API REST de Productos - Versión Definitiva Unificada
 * Compatible con XAMPP - Sin stored procedures complejos
 * Cumple todos los requisitos académicos
 *
 * REQUISITO: ADMINISTRAR CATÁLOGO CON BÚSQUEDA Y RELACIÓN ENTRE TABLAS (8 PTS) - PRODUCTOS RELACIONADOS CON CATEGORÍAS
 * REQUISITO: USO DE AJAX + JSON CON SERVICIO WEB (2 PTS) - API REST CON JSON
 */

// Configuración de errores (desarrollo)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers CORS y JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Incluir configuración
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';

// Aplicar headers de seguridad
Security::setSecurityHeaders();

/**
 * Función para enviar respuesta JSON
 */
function sendResponse($success, $data = null, $message = '', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Obtener conexión a base de datos
try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
} catch (Exception $e) {
    sendResponse(false, null, 'Error de conexión: ' . $e->getMessage(), 500);
}

// Obtener método y acción
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

/**
 * ===========================================
 * GET /api/productos.php?action=listar
 * Listar todos los productos activos
 * ===========================================
 */
if ($method === 'GET' && $action === 'listar') {
    try {
        $sql = "SELECT * FROM vista_productos_completo ORDER BY id DESC";
        $stmt = $pdo->query($sql);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, $productos, count($productos) . ' productos encontrados');

    } catch (Exception $e) {
        error_log("Error listar: " . $e->getMessage());
        sendResponse(false, null, 'Error al listar productos', 500);
    }
}

/**
 * ===========================================
 * GET /api/productos.php?action=buscar
 * Buscar productos con filtros
 * Parámetros: termino, categoria_id, precio_max, ordenar
 * ===========================================
 */
elseif ($method === 'GET' && $action === 'buscar') {
    try {
        $termino = $_GET['termino'] ?? '';
        $categoriaId = $_GET['categoria_id'] ?? '';
        $precioMax = $_GET['precio_max'] ?? '';
        $ordenar = $_GET['ordenar'] ?? 'reciente';

        // Query base
        $sql = "SELECT * FROM vista_productos_completo WHERE 1=1";
        $params = [];

        // Filtro por término de búsqueda
        if (!empty($termino)) {
            $termino = trim($termino);
            $sql .= " AND (nombre LIKE ? OR descripcion LIKE ?)";
            $params[] = "%$termino%";
            $params[] = "%$termino%";
        }

        // Filtro por categoría
        if (!empty($categoriaId) && is_numeric($categoriaId)) {
            $sql .= " AND categoria_id = ?";
            $params[] = (int)$categoriaId;
        }

        // Filtro por precio máximo
        if (!empty($precioMax) && is_numeric($precioMax) && $precioMax > 0) {
            $sql .= " AND precio <= ?";
            $params[] = (float)$precioMax;
        }

        // Ordenamiento
        switch ($ordenar) {
            case 'precio-menor':
            case 'precio_asc':
                $sql .= " ORDER BY precio ASC, nombre ASC";
                break;
            case 'precio-mayor':
            case 'precio_desc':
                $sql .= " ORDER BY precio DESC, nombre ASC";
                break;
            case 'nombre':
                $sql .= " ORDER BY nombre ASC";
                break;
            case 'destacados':
                $sql .= " ORDER BY destacado DESC, created_at DESC";
                break;
            default:
                $sql .= " ORDER BY id DESC";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, $productos, count($productos) . ' productos encontrados');

    } catch (Exception $e) {
        error_log("Error buscar: " . $e->getMessage());
        sendResponse(false, null, 'Error en la búsqueda', 500);
    }
}

/**
 * ===========================================
 * GET /api/productos.php?action=obtener&id=123
 * Obtener un producto específico por ID
 * ===========================================
 */
elseif ($method === 'GET' && $action === 'obtener') {
    try {
        $id = $_GET['id'] ?? 0;

        if (!is_numeric($id) || $id <= 0) {
            sendResponse(false, null, 'ID inválido', 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM vista_productos_completo WHERE id = ?");
        $stmt->execute([(int)$id]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($producto) {
            sendResponse(true, $producto, 'Producto encontrado');
        } else {
            sendResponse(false, null, 'Producto no encontrado', 404);
        }

    } catch (Exception $e) {
        error_log("Error obtener: " . $e->getMessage());
        sendResponse(false, null, 'Error al obtener producto', 500);
    }
}

/**
 * ===========================================
 * GET /api/productos.php?action=destacados&limite=6
 * Obtener productos destacados
 * ===========================================
 */
elseif ($method === 'GET' && $action === 'destacados') {
    try {
        $limite = $_GET['limite'] ?? 6;

        if (!is_numeric($limite) || $limite <= 0) {
            $limite = 6;
        }

        $stmt = $pdo->prepare("
            SELECT * FROM vista_productos_completo
            WHERE destacado = TRUE AND stock > 0
            ORDER BY created_at DESC
            LIMIT ?
        ");
        $stmt->execute([(int)$limite]);
        $productos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, $productos, count($productos) . ' productos destacados');

    } catch (Exception $e) {
        error_log("Error destacados: " . $e->getMessage());
        sendResponse(false, null, 'Error al obtener destacados', 500);
    }
}

/**
 * ===========================================
 * GET /api/productos.php?action=categorias
 * Obtener todas las categorías activas
 * ===========================================
 */
elseif ($method === 'GET' && $action === 'categorias') {
    try {
        $stmt = $pdo->query("
            SELECT * FROM categorias
            WHERE activo = TRUE
            ORDER BY nombre ASC
        ");
        $categorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, $categorias, count($categorias) . ' categorías disponibles');

    } catch (Exception $e) {
        error_log("Error categorías: " . $e->getMessage());
        sendResponse(false, null, 'Error al obtener categorías', 500);
    }
}

/**
 * ===========================================
 * GET /api/productos.php?action=estadisticas
 * Obtener estadísticas por categoría (usa vista)
 * ===========================================
 */
elseif ($method === 'GET' && $action === 'estadisticas') {
    try {
        $stmt = $pdo->query("SELECT * FROM vista_estadisticas_categoria ORDER BY categoria_nombre");
        $estadisticas = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, $estadisticas, 'Estadísticas obtenidas');

    } catch (Exception $e) {
        error_log("Error estadísticas: " . $e->getMessage());
        sendResponse(false, null, 'Error al obtener estadísticas', 500);
    }
}

/**
 * ===========================================
 * POST /api/productos.php?action=verificar_stock
 * Verificar disponibilidad de stock
 * Body: { "items": [{"id": 1, "cantidad": 2}, ...] }
 * ===========================================
 */
elseif ($method === 'POST' && $action === 'verificar_stock') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        $items = $input['items'] ?? [];

        if (empty($items) || !is_array($items)) {
            sendResponse(false, null, 'No se proporcionaron productos', 400);
        }

        $resultados = [];
        $todoDisponible = true;

        foreach ($items as $item) {
            $id = (int)($item['id'] ?? 0);
            $cantidad = (int)($item['cantidad'] ?? 0);

            if ($id <= 0 || $cantidad <= 0) {
                continue;
            }

            $stmt = $pdo->prepare("
                SELECT id, nombre, precio, stock
                FROM productos
                WHERE id = ? AND activo = TRUE
            ");
            $stmt->execute([$id]);
            $producto = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$producto) {
                $resultados[] = [
                    'id' => $id,
                    'disponible' => false,
                    'mensaje' => 'Producto no encontrado o inactivo'
                ];
                $todoDisponible = false;
            } elseif ($producto['stock'] < $cantidad) {
                $resultados[] = [
                    'id' => $id,
                    'nombre' => $producto['nombre'],
                    'disponible' => false,
                    'stock_disponible' => (int)$producto['stock'],
                    'cantidad_solicitada' => $cantidad,
                    'mensaje' => 'Stock insuficiente'
                ];
                $todoDisponible = false;
            } else {
                $resultados[] = [
                    'id' => $id,
                    'nombre' => $producto['nombre'],
                    'precio' => (float)$producto['precio'],
                    'disponible' => true,
                    'stock_disponible' => (int)$producto['stock']
                ];
            }
        }

        sendResponse(
            $todoDisponible,
            $resultados,
            $todoDisponible ? 'Todo el stock está disponible' : 'Algunos productos tienen stock insuficiente'
        );

    } catch (Exception $e) {
        error_log("Error verificar_stock: " . $e->getMessage());
        sendResponse(false, null, 'Error al verificar stock', 500);
    }
}

/**
 * ===========================================
 * Endpoint no encontrado
 * ===========================================
 */
else {
    sendResponse(
        false,
        null,
        'Endpoint no encontrado. Acciones disponibles: listar, buscar, obtener, destacados, categorias, estadisticas, verificar_stock',
        404
    );
}
