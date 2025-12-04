<?php
/**
 * API REST para Productos
 * Endpoints para operaciones CRUD del catálogo
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../auth/session_manager.php';

header('Content-Type: application/json');
Security::setSecurityHeaders();

class ProductosAPI {
    private $db;
    private $sessionManager;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->sessionManager = new SessionManager();
    }

    /**
     * Buscar productos con filtros (usa procedimiento almacenado)
     */
    public function buscar($params) {
        try {
            $termino = $params['termino'] ?? null;
            $categoriaId = $params['categoria_id'] ?? null;
            $precioMin = $params['precio_min'] ?? null;
            $precioMax = $params['precio_max'] ?? null;
            $ordenar = $params['ordenar'] ?? 'reciente';

            // Mapear ordenamiento
            $ordenarMap = [
                'precio_asc' => 'precio_asc',
                'precio_desc' => 'precio_desc',
                'nombre' => 'nombre',
                'reciente' => 'reciente'
            ];

            $ordenarParam = $ordenarMap[$ordenar] ?? 'reciente';

            // Llamar procedimiento almacenado
            $stmt = $this->db->prepare("CALL sp_buscar_productos(?, ?, ?, ?, ?)");
            $stmt->execute([
                $termino,
                $categoriaId,
                $precioMin,
                $precioMax,
                $ordenarParam
            ]);

            $productos = $stmt->fetchAll();

            // Sanitizar output (protección XSS)
            $productos = array_map(function($producto) {
                return [
                    'id' => (int)$producto['id'],
                    'nombre' => Security::sanitizeOutput($producto['nombre']),
                    'descripcion' => Security::sanitizeOutput($producto['descripcion']),
                    'precio' => (float)$producto['precio'],
                    'stock' => (int)$producto['stock'],
                    'categoria_id' => (int)$producto['categoria_id'],
                    'categoria_nombre' => Security::sanitizeOutput($producto['categoria_nombre']),
                    'categoria_icono' => Security::sanitizeOutput($producto['categoria_icono']),
                    'imagen' => Security::sanitizeOutput($producto['imagen'])
                ];
            }, $productos);

            return $this->jsonResponse([
                'success' => true,
                'data' => $productos,
                'count' => count($productos)
            ]);

        } catch (Exception $e) {
            error_log("Error en búsqueda: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al buscar productos'
            ], 500);
        }
    }

    /**
     * Obtener producto por ID
     */
    public function obtenerPorId($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM vista_productos_completo WHERE id = ?");
            $stmt->execute([$id]);
            $producto = $stmt->fetch();

            if (!$producto) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Producto no encontrado'
                ], 404);
            }

            return $this->jsonResponse([
                'success' => true,
                'data' => Security::sanitizeOutput($producto)
            ]);

        } catch (Exception $e) {
            error_log("Error al obtener producto: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al obtener producto'
            ], 500);
        }
    }

    /**
     * Obtener todas las categorías
     */
    public function obtenerCategorias() {
        try {
            $stmt = $this->db->query("SELECT * FROM categorias ORDER BY nombre");
            $categorias = $stmt->fetchAll();

            return $this->jsonResponse([
                'success' => true,
                'data' => Security::sanitizeOutput($categorias)
            ]);

        } catch (Exception $e) {
            error_log("Error al obtener categorías: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al obtener categorías'
            ], 500);
        }
    }

    /**
     * Obtener productos destacados (los más vendidos usando vista)
     */
    public function obtenerDestacados($limite = 6) {
        try {
            $stmt = $this->db->prepare("
                SELECT p.* FROM vista_productos_completo p
                ORDER BY RAND()
                LIMIT ?
            ");
            $stmt->execute([(int)$limite]);
            $productos = $stmt->fetchAll();

            return $this->jsonResponse([
                'success' => true,
                'data' => Security::sanitizeOutput($productos)
            ]);

        } catch (Exception $e) {
            error_log("Error al obtener destacados: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al obtener productos destacados'
            ], 500);
        }
    }

    /**
     * Crear producto (solo admin)
     */
    public function crear($data) {
        if (!$this->sessionManager->isAdmin()) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        try {
            $nombre = Security::sanitizeInput($data['nombre'] ?? '');
            $descripcion = Security::sanitizeInput($data['descripcion'] ?? '');
            $precio = (float)($data['precio'] ?? 0);
            $stock = (int)($data['stock'] ?? 0);
            $categoriaId = (int)($data['categoria_id'] ?? 0);
            $imagen = Security::sanitizeInput($data['imagen'] ?? '');

            if (empty($nombre) || $precio <= 0 || $categoriaId <= 0) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Datos incompletos o inválidos'
                ], 400);
            }

            $stmt = $this->db->prepare("
                INSERT INTO productos (nombre, descripcion, precio, stock, categoria_id, imagen)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([$nombre, $descripcion, $precio, $stock, $categoriaId, $imagen]);

            return $this->jsonResponse([
                'success' => true,
                'message' => 'Producto creado exitosamente',
                'id' => $this->db->lastInsertId()
            ], 201);

        } catch (Exception $e) {
            error_log("Error al crear producto: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al crear producto'
            ], 500);
        }
    }

    /**
     * Actualizar producto (solo admin)
     */
    public function actualizar($id, $data) {
        if (!$this->sessionManager->isAdmin()) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        try {
            $nombre = Security::sanitizeInput($data['nombre'] ?? '');
            $descripcion = Security::sanitizeInput($data['descripcion'] ?? '');
            $precio = (float)($data['precio'] ?? 0);
            $stock = (int)($data['stock'] ?? 0);
            $categoriaId = (int)($data['categoria_id'] ?? 0);
            $imagen = Security::sanitizeInput($data['imagen'] ?? '');

            $stmt = $this->db->prepare("
                UPDATE productos
                SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria_id = ?, imagen = ?
                WHERE id = ?
            ");

            $stmt->execute([$nombre, $descripcion, $precio, $stock, $categoriaId, $imagen, $id]);

            return $this->jsonResponse([
                'success' => true,
                'message' => 'Producto actualizado exitosamente'
            ]);

        } catch (Exception $e) {
            error_log("Error al actualizar producto: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al actualizar producto'
            ], 500);
        }
    }

    /**
     * Eliminar producto (solo admin)
     */
    public function eliminar($id) {
        if (!$this->sessionManager->isAdmin()) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        try {
            $stmt = $this->db->prepare("UPDATE productos SET activo = FALSE WHERE id = ?");
            $stmt->execute([$id]);

            return $this->jsonResponse([
                'success' => true,
                'message' => 'Producto eliminado exitosamente'
            ]);

        } catch (Exception $e) {
            error_log("Error al eliminar producto: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al eliminar producto'
            ], 500);
        }
    }

    /**
     * Respuesta JSON estandarizada
     */
    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Manejo de peticiones
try {
    $api = new ProductosAPI();
    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_GET['action'] ?? '';

    // Obtener datos según el método
    $data = [];
    if ($method === 'POST' || $method === 'PUT') {
        $rawData = file_get_contents('php://input');
        $data = json_decode($rawData, true) ?? [];
    }

    // Parámetros de URL
    $params = $_GET;
    unset($params['action']);

    // Routing
    switch($path) {
        case 'buscar':
            $api->buscar($params);
            break;

        case 'obtener':
            $id = (int)($params['id'] ?? 0);
            $api->obtenerPorId($id);
            break;

        case 'categorias':
            $api->obtenerCategorias();
            break;

        case 'destacados':
            $limite = (int)($params['limite'] ?? 6);
            $api->obtenerDestacados($limite);
            break;

        case 'crear':
            if ($method === 'POST') {
                $api->crear($data);
            }
            break;

        case 'actualizar':
            if ($method === 'PUT') {
                $id = (int)($params['id'] ?? 0);
                $api->actualizar($id, $data);
            }
            break;

        case 'eliminar':
            if ($method === 'DELETE') {
                $id = (int)($params['id'] ?? 0);
                $api->eliminar($id);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Endpoint no encontrado']);
            break;
    }

} catch (Exception $e) {
    error_log("Error en API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor']);
}
