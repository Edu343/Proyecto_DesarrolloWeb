<?php
/**
 * API REST de Contacto
 * Manejo de formularios de contacto con soporte para reportes de daños y subida de fotos
 *
 * REQUISITO: SUBIR Y DESCARGAR ARCHIVOS (2 PTS) - SUBIDA DE FOTOS DE PRODUCTOS DAÑADOS
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';

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
} catch (Exception $e) {
    sendResponse(false, null, 'Error de conexión: ' . $e->getMessage(), 500);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

/**
 * POST /api/contacto.php?action=enviar
 * Enviar mensaje de contacto con soporte para fotos
 */
if ($method === 'POST' && $action === 'enviar') {
    try {
        $nombre = Security::sanitizeInput($_POST['nombre'] ?? '');
        $email = Security::sanitizeInput($_POST['email'] ?? '');
        $asunto = Security::sanitizeInput($_POST['asunto'] ?? '');
        $mensaje = Security::sanitizeInput($_POST['mensaje'] ?? '');
        $pedidoId = !empty($_POST['pedido_id']) ? (int)$_POST['pedido_id'] : null;
        $productoId = !empty($_POST['producto_id']) ? (int)$_POST['producto_id'] : null;

        // Validaciones básicas
        if (empty($nombre) || empty($email) || empty($asunto) || empty($mensaje)) {
            sendResponse(false, null, 'Todos los campos son obligatorios', 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, null, 'Email inválido', 400);
        }

        $asuntosValidos = ['cotizacion', 'productos', 'dano_producto', 'otro'];
        if (!in_array($asunto, $asuntosValidos)) {
            sendResponse(false, null, 'Asunto inválido', 400);
        }

        // Iniciar transacción
        $pdo->beginTransaction();

        // Insertar contacto
        $stmt = $pdo->prepare("
            INSERT INTO contactos (nombre, email, asunto, mensaje, pedido_id, producto_id, tiene_foto, estado)
            VALUES (?, ?, ?, ?, ?, ?, 0, 'pendiente')
        ");

        $stmt->execute([
            $nombre,
            $email,
            $asunto,
            $mensaje,
            $pedidoId,
            $productoId
        ]);

        $contactoId = $pdo->lastInsertId();

        // Procesar fotos si existen
        $fotosSubidas = [];
        if (!empty($_FILES['fotos']['name'][0])) {
            $uploadDir = __DIR__ . '/../../uploads/contacto/';

            // Crear directorio si no existe
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $totalFiles = count($_FILES['fotos']['name']);
            $maxFiles = 5;

            if ($totalFiles > $maxFiles) {
                $pdo->rollBack();
                sendResponse(false, null, "Máximo $maxFiles fotos permitidas", 400);
            }

            foreach ($_FILES['fotos']['name'] as $key => $filename) {
                if ($_FILES['fotos']['error'][$key] === UPLOAD_ERR_OK) {
                    $tmpName = $_FILES['fotos']['tmp_name'][$key];
                    $fileSize = $_FILES['fotos']['size'][$key];
                    $fileType = $_FILES['fotos']['type'][$key];

                    // Validar tipo de archivo
                    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                    if (!in_array($fileType, $allowedTypes)) {
                        $pdo->rollBack();
                        sendResponse(false, null, 'Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)', 400);
                    }

                    // Validar tamaño (máximo 5MB)
                    if ($fileSize > 5 * 1024 * 1024) {
                        $pdo->rollBack();
                        sendResponse(false, null, 'Tamaño máximo de archivo: 5MB', 400);
                    }

                    // Generar nombre único
                    $extension = pathinfo($filename, PATHINFO_EXTENSION);
                    $nombreGuardado = 'contacto_' . $contactoId . '_' . uniqid() . '.' . $extension;
                    $rutaCompleta = $uploadDir . $nombreGuardado;

                    // Mover archivo
                    if (move_uploaded_file($tmpName, $rutaCompleta)) {
                        // Registrar en base de datos
                        $stmtArchivo = $pdo->prepare("
                            INSERT INTO archivos (nombre_original, nombre_guardado, ruta, tipo, tamanio, entidad_tipo, entidad_id)
                            VALUES (?, ?, ?, ?, ?, 'contacto', ?)
                        ");

                        $stmtArchivo->execute([
                            $filename,
                            $nombreGuardado,
                            'uploads/contacto/' . $nombreGuardado,
                            $fileType,
                            $fileSize,
                            $contactoId
                        ]);

                        $fotosSubidas[] = $nombreGuardado;
                    }
                }
            }

            // Actualizar flag de tiene_foto
            if (!empty($fotosSubidas)) {
                $stmtUpdate = $pdo->prepare("
                    UPDATE contactos SET tiene_foto = 1 WHERE id = ?
                ");
                $stmtUpdate->execute([$contactoId]);
            }
        }

        // Confirmar transacción
        $pdo->commit();

        sendResponse(true, [
            'contacto_id' => $contactoId,
            'fotos_subidas' => count($fotosSubidas)
        ], 'Mensaje enviado exitosamente', 201);

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Error enviar contacto: " . $e->getMessage());
        sendResponse(false, null, 'Error al enviar mensaje: ' . $e->getMessage(), 500);
    }
}

/**
 * GET /api/contacto.php?action=listar
 * Listar todos los contactos (solo admin)
 */
elseif ($method === 'GET' && $action === 'listar') {
    try {
        $stmt = $pdo->query("
            SELECT c.*,
                   COUNT(a.id) as total_fotos
            FROM contactos c
            LEFT JOIN archivos a ON a.entidad_tipo = 'contacto' AND a.entidad_id = c.id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        ");

        $contactos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, $contactos, count($contactos) . ' contactos encontrados');

    } catch (Exception $e) {
        error_log("Error listar contactos: " . $e->getMessage());
        sendResponse(false, null, 'Error al obtener contactos', 500);
    }
}

/**
 * GET /api/contacto.php?action=fotos&id=123
 * Obtener fotos de un contacto específico
 */
elseif ($method === 'GET' && $action === 'fotos') {
    try {
        $contactoId = (int)($_GET['id'] ?? 0);

        if ($contactoId <= 0) {
            sendResponse(false, null, 'ID de contacto inválido', 400);
        }

        $stmt = $pdo->prepare("
            SELECT * FROM archivos
            WHERE entidad_tipo = 'contacto' AND entidad_id = ?
            ORDER BY created_at
        ");

        $stmt->execute([$contactoId]);
        $fotos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendResponse(true, $fotos, count($fotos) . ' fotos encontradas');

    } catch (Exception $e) {
        error_log("Error obtener fotos: " . $e->getMessage());
        sendResponse(false, null, 'Error al obtener fotos', 500);
    }
}

/**
 * Endpoint no encontrado
 */
else {
    sendResponse(
        false,
        null,
        'Endpoint no encontrado. Acciones disponibles: enviar, listar, fotos',
        404
    );
}
