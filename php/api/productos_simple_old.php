<?php
/**
 * API REST Simplificada para Productos
 * Compatible con XAMPP
 */

// Configuración de errores para desarrollo
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

// Conexión a base de datos
try {
    $pdo = new PDO(
        'mysql:host=localhost;dbname=ferreteria_db;charset=utf8mb4',
        'root',
        '',
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión: ' . $e->getMessage()
    ]);
    exit;
}

// Obtener acción
$action = $_GET['action'] ?? '';

/**
 * BUSCAR PRODUCTOS
 */
if ($action === 'buscar') {
    try {
        $termino = $_GET['termino'] ?? '';
        $categoriaId = $_GET['categoria_id'] ?? '';
        $precioMax = $_GET['precio_max'] ?? '';
        $ordenar = $_GET['ordenar'] ?? 'reciente';

        // Query base
        $sql = "SELECT * FROM vista_productos_completo WHERE 1=1";
        $params = [];

        // Filtro por término
        if (!empty($termino)) {
            $sql .= " AND (nombre LIKE ? OR descripcion LIKE ?)";
            $params[] = "%$termino%";
            $params[] = "%$termino%";
        }

        // Filtro por categoría
        if (!empty($categoriaId)) {
            $sql .= " AND categoria_id = ?";
            $params[] = $categoriaId;
        }

        // Filtro por precio
        if (!empty($precioMax)) {
            $sql .= " AND precio <= ?";
            $params[] = $precioMax;
        }

        // Ordenamiento
        switch ($ordenar) {
            case 'precio_asc':
            case 'precio-menor':
                $sql .= " ORDER BY precio ASC";
                break;
            case 'precio_desc':
            case 'precio-mayor':
                $sql .= " ORDER BY precio DESC";
                break;
            case 'nombre':
                $sql .= " ORDER BY nombre ASC";
                break;
            default:
                $sql .= " ORDER BY id DESC";
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $productos = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => $productos,
            'count' => count($productos)
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al buscar: ' . $e->getMessage()
        ]);
    }
}

/**
 * OBTENER PRODUCTO POR ID
 */
elseif ($action === 'obtener') {
    try {
        $id = $_GET['id'] ?? 0;

        $stmt = $pdo->prepare("SELECT * FROM vista_productos_completo WHERE id = ?");
        $stmt->execute([$id]);
        $producto = $stmt->fetch();

        if ($producto) {
            echo json_encode([
                'success' => true,
                'data' => $producto
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Producto no encontrado'
            ]);
        }

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}

/**
 * OBTENER CATEGORÍAS
 */
elseif ($action === 'categorias') {
    try {
        $stmt = $pdo->query("SELECT * FROM categorias ORDER BY nombre");
        $categorias = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => $categorias
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}

/**
 * PRODUCTOS DESTACADOS
 */
elseif ($action === 'destacados') {
    try {
        $limite = $_GET['limite'] ?? 6;

        $stmt = $pdo->prepare("
            SELECT * FROM vista_productos_completo
            WHERE stock > 0
            ORDER BY RAND()
            LIMIT ?
        ");
        $stmt->execute([(int)$limite]);
        $productos = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data' => $productos
        ]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
}

/**
 * ENDPOINT NO ENCONTRADO
 */
else {
    http_response_code(404);
    echo json_encode([
        'success' => false,
        'message' => 'Endpoint no encontrado. Acciones disponibles: buscar, obtener, categorias, destacados'
    ]);
}
