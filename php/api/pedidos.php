<?php
/**
 * API REST de Pedidos - Versión Definitiva
 * Manejo de pedidos y checkout
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../auth/session_manager.php';

Security::setSecurityHeaders();

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

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    $sessionManager = new SessionManager();
} catch (Exception $e) {
    sendResponse(false, null, 'Error de conexión: ' . $e->getMessage(), 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

/**
 * POST /api/pedidos.php?action=crear
 * Crear un nuevo pedido
 */
if ($method === 'POST' && $action === 'crear') {
    try {
        // Verificar sesión activa
        if (!$sessionManager->isLoggedIn()) {
            sendResponse(false, null, 'Debe iniciar sesión para crear un pedido', 401);
        }

        $usuarioId = $sessionManager->obtenerIdUsuario();
        $input = json_decode(file_get_contents('php://input'), true);

        $items = $input['items'] ?? [];
        $tipoEnvio = $input['tipo_envio'] ?? 'tienda';
        $notas = $input['notas'] ?? '';

        if (empty($items) || !is_array($items)) {
            sendResponse(false, null, 'El carrito está vacío', 400);
        }

        // Validar tipo de envío
        if (!in_array($tipoEnvio, ['tienda', 'domicilio'])) {
            $tipoEnvio = 'tienda';
        }

        // Calcular costos
        $subtotal = 0;
        $costoEnvio = ($tipoEnvio === 'domicilio') ? 50.00 : 0.00;
        $IVA_RATE = 0.16;

        // Iniciar transacción
        $pdo->beginTransaction();

        // Verificar stock y calcular subtotal
        $productosValidados = [];
        foreach ($items as $item) {
            $productId = (int)($item['id'] ?? 0);
            $cantidad = (int)($item['cantidad'] ?? 0);

            if ($productId <= 0 || $cantidad <= 0) {
                continue;
            }

            $stmt = $pdo->prepare("
                SELECT id, nombre, precio, stock
                FROM productos
                WHERE id = ? AND activo = TRUE
                FOR UPDATE
            ");
            $stmt->execute([$productId]);
            $producto = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$producto) {
                $pdo->rollBack();
                sendResponse(false, null, "Producto ID $productId no encontrado", 404);
            }

            if ($producto['stock'] < $cantidad) {
                $pdo->rollBack();
                sendResponse(
                    false,
                    null,
                    "Stock insuficiente para {$producto['nombre']}. Disponible: {$producto['stock']}",
                    400
                );
            }

            $productosValidados[] = [
                'id' => $producto['id'],
                'nombre' => $producto['nombre'],
                'precio' => (float)$producto['precio'],
                'cantidad' => $cantidad
            ];

            $subtotal += (float)$producto['precio'] * $cantidad;
        }

        if (empty($productosValidados)) {
            $pdo->rollBack();
            sendResponse(false, null, 'No hay productos válidos en el carrito', 400);
        }

        $iva = $subtotal * $IVA_RATE;
        $total = $subtotal + $iva + $costoEnvio;

        // Crear pedido
        $stmt = $pdo->prepare("
            INSERT INTO pedidos (usuario_id, subtotal, iva, costo_envio, total, tipo_envio, notas, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')
        ");
        $stmt->execute([
            $usuarioId,
            $subtotal,
            $iva,
            $costoEnvio,
            $total,
            $tipoEnvio,
            Security::sanitizeInput($notas)
        ]);

        $pedidoId = $pdo->lastInsertId();

        // Crear detalles y actualizar stock
        $stmtDetalle = $pdo->prepare("
            INSERT INTO pedido_detalles (pedido_id, producto_id, producto_nombre, producto_precio, cantidad, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        ");

        $stmtStock = $pdo->prepare("
            UPDATE productos
            SET stock = stock - ?
            WHERE id = ?
        ");

        foreach ($productosValidados as $prod) {
            $subtotalItem = $prod['precio'] * $prod['cantidad'];

            $stmtDetalle->execute([
                $pedidoId,
                $prod['id'],
                $prod['nombre'],
                $prod['precio'],
                $prod['cantidad'],
                $subtotalItem
            ]);

            $stmtStock->execute([
                $prod['cantidad'],
                $prod['id']
            ]);
        }

        // Confirmar transacción
        $pdo->commit();

        sendResponse(true, [
            'pedido_id' => $pedidoId,
            'total' => $total,
            'subtotal' => $subtotal,
            'iva' => $iva,
            'costo_envio' => $costoEnvio,
            'factura_url' => 'factura.html?pedido_id=' . $pedidoId
        ], 'Pedido creado exitosamente', 201);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Error crear pedido: " . $e->getMessage());
        sendResponse(false, null, 'Error al crear pedido: ' . $e->getMessage(), 500);
    }
}

/**
 * GET /api/pedidos.php?action=mis_pedidos
 * Obtener pedidos del usuario actual
 */
elseif ($method === 'GET' && $action === 'mis_pedidos') {
    try {
        if (!$sessionManager->isLoggedIn()) {
            sendResponse(false, null, 'Debe iniciar sesión', 401);
        }

        $usuarioId = $sessionManager->obtenerIdUsuario();

        $stmt = $pdo->prepare("
            SELECT * FROM vista_pedidos_completo
            WHERE usuario_id = ?
            ORDER BY fecha_pedido DESC
        ");
        $stmt->execute([$usuarioId]);
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, $pedidos, count($pedidos) . ' pedidos encontrados');

    } catch (Exception $e) {
        error_log("Error mis_pedidos: " . $e->getMessage());
        sendResponse(false, null, 'Error al obtener pedidos', 500);
    }
}

/**
 * GET /api/pedidos.php?action=detalle&id=123
 * Obtener detalle de un pedido específico
 */
elseif ($method === 'GET' && $action === 'detalle') {
    try {
        if (!$sessionManager->isLoggedIn()) {
            sendResponse(false, null, 'Debe iniciar sesión', 401);
        }

        $pedidoId = (int)($_GET['id'] ?? 0);
        $usuarioId = $sessionManager->obtenerIdUsuario();

        if ($pedidoId <= 0) {
            sendResponse(false, null, 'ID de pedido inválido', 400);
        }

        // Obtener información del pedido con datos del usuario
        $stmt = $pdo->prepare("
            SELECT p.*, u.nombre as usuario_nombre, u.email, u.telefono, u.direccion
            FROM pedidos p
            INNER JOIN usuarios u ON p.usuario_id = u.id
            WHERE p.id = ? AND p.usuario_id = ?
        ");
        $stmt->execute([$pedidoId, $usuarioId]);
        $pedido = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pedido) {
            sendResponse(false, null, 'Pedido no encontrado', 404);
        }

        // Obtener detalles del pedido
        $stmt = $pdo->prepare("
            SELECT * FROM pedido_detalles
            WHERE pedido_id = ?
            ORDER BY id
        ");
        $stmt->execute([$pedidoId]);
        $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $pedido['detalles'] = $detalles;

        sendResponse(true, $pedido, 'Detalle del pedido obtenido');

    } catch (Exception $e) {
        error_log("Error detalle pedido: " . $e->getMessage());
        sendResponse(false, null, 'Error al obtener detalle', 500);
    }
}

/**
 * GET /api/pedidos.php?action=todos (solo admin)
 * Obtener todos los pedidos
 */
elseif ($method === 'GET' && $action === 'todos') {
    try {
        if (!$sessionManager->isAdmin()) {
            sendResponse(false, null, 'No autorizado', 403);
        }

        $stmt = $pdo->query("
            SELECT * FROM vista_pedidos_completo
            ORDER BY fecha_pedido DESC
        ");
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, $pedidos, count($pedidos) . ' pedidos en total');

    } catch (Exception $e) {
        error_log("Error todos pedidos: " . $e->getMessage());
        sendResponse(false, null, 'Error al obtener pedidos', 500);
    }
}

/**
 * PUT /api/pedidos.php?action=actualizar_estado
 * Actualizar estado de un pedido (solo admin)
 */
elseif ($method === 'PUT' && $action === 'actualizar_estado') {
    try {
        if (!$sessionManager->isAdmin()) {
            sendResponse(false, null, 'No autorizado', 403);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $pedidoId = (int)($input['pedido_id'] ?? 0);
        $nuevoEstado = $input['estado'] ?? '';

        $estadosValidos = ['pendiente', 'procesando', 'completado', 'cancelado'];

        if ($pedidoId <= 0) {
            sendResponse(false, null, 'ID de pedido inválido', 400);
        }

        if (!in_array($nuevoEstado, $estadosValidos)) {
            sendResponse(false, null, 'Estado inválido', 400);
        }

        $stmt = $pdo->prepare("
            UPDATE pedidos
            SET estado = ?
            WHERE id = ?
        ");
        $stmt->execute([$nuevoEstado, $pedidoId]);

        if ($stmt->rowCount() > 0) {
            sendResponse(true, null, 'Estado actualizado correctamente');
        } else {
            sendResponse(false, null, 'Pedido no encontrado', 404);
        }

    } catch (Exception $e) {
        error_log("Error actualizar estado: " . $e->getMessage());
        sendResponse(false, null, 'Error al actualizar estado', 500);
    }
}

/**
 * Endpoint no encontrado
 */
else {
    sendResponse(
        false,
        null,
        'Endpoint no encontrado. Acciones disponibles: crear, mis_pedidos, detalle, todos, actualizar_estado',
        404
    );
}
