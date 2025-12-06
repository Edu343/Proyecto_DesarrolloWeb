<?php
/**
 * API de Gestión de Archivos
 * Subida y descarga de imágenes y documentos
 *
 * REQUISITO: SUBIR Y DESCARGAR ARCHIVOS (2 PTS) - IMPLEMENTADO AQUÍ
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../auth/session_manager.php';

Security::setSecurityHeaders();

class ArchivosAPI {
    private $db;
    private $sessionManager;
    private $uploadDir = __DIR__ . '/../../uploads/';
    private $allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private $allowedDocTypes = ['application/pdf'];
    private $maxFileSize = 5242880; // 5MB

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->sessionManager = new SessionManager();

        // Crear directorio de uploads si no existe
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }

        // Crear subdirectorios
        $subdirs = ['productos', 'usuarios', 'facturas'];
        foreach ($subdirs as $subdir) {
            $path = $this->uploadDir . $subdir;
            if (!file_exists($path)) {
                mkdir($path, 0755, true);
            }
        }
    }

    /**
     * Subir archivo
     */
    public function upload() {
        // Verificar autenticación
        if (!$this->sessionManager->isLoggedIn()) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'No autorizado'
            ], 401);
        }

        if (!isset($_FILES['archivo']) || $_FILES['archivo']['error'] !== UPLOAD_ERR_OK) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al subir archivo'
            ], 400);
        }

        $file = $_FILES['archivo'];
        $tipo = $_POST['tipo'] ?? 'otro';
        $entidadTipo = Security::sanitizeInput($_POST['entidad_tipo'] ?? 'otro');
        $entidadId = (int)($_POST['entidad_id'] ?? 0);

        try {
            // Validar tamaño
            if ($file['size'] > $this->maxFileSize) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'El archivo es demasiado grande (máximo 5MB)'
                ], 400);
            }

            // Validar tipo MIME
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            $allowedTypes = array_merge($this->allowedImageTypes, $this->allowedDocTypes);

            if (!in_array($mimeType, $allowedTypes)) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Tipo de archivo no permitido'
                ], 400);
            }

            // Generar nombre único
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $nombreAlmacenado = uniqid() . '_' . time() . '.' . $extension;

            // Determinar subdirectorio
            $subdir = $entidadTipo === 'producto' ? 'productos' : ($entidadTipo === 'usuario' ? 'usuarios' : 'facturas');
            $rutaCompleta = $this->uploadDir . $subdir . '/' . $nombreAlmacenado;

            // Mover archivo
            if (!move_uploaded_file($file['tmp_name'], $rutaCompleta)) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Error al guardar archivo'
                ], 500);
            }

            // Guardar en base de datos
            $usuario = $this->sessionManager->getCurrentUser();

            $stmt = $this->db->prepare("
                INSERT INTO archivos (nombre_original, nombre_almacenado, ruta, tipo, tamano, usuario_id, entidad_tipo, entidad_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                Security::sanitizeFilename($file['name']),
                $nombreAlmacenado,
                $subdir . '/' . $nombreAlmacenado,
                $mimeType,
                $file['size'],
                $usuario['id'],
                $entidadTipo,
                $entidadId
            ]);

            $archivoId = $this->db->lastInsertId();

            return $this->jsonResponse([
                'success' => true,
                'message' => 'Archivo subido exitosamente',
                'archivo' => [
                    'id' => $archivoId,
                    'nombre' => $file['name'],
                    'url' => '/uploads/' . $subdir . '/' . $nombreAlmacenado,
                    'tipo' => $mimeType
                ]
            ], 201);

        } catch (Exception $e) {
            error_log("Error al subir archivo: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al procesar archivo'
            ], 500);
        }
    }

    /**
     * Descargar archivo
     */
    public function download($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM archivos WHERE id = ?");
            $stmt->execute([$id]);
            $archivo = $stmt->fetch();

            if (!$archivo) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Archivo no encontrado'
                ], 404);
            }

            $rutaCompleta = $this->uploadDir . $archivo['ruta'];

            // Validar path traversal
            if (!Security::validatePath($rutaCompleta, $this->uploadDir)) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Acceso denegado'
                ], 403);
            }

            if (!file_exists($rutaCompleta)) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Archivo no encontrado en el servidor'
                ], 404);
            }

            // Descargar archivo
            header('Content-Type: ' . $archivo['tipo']);
            header('Content-Disposition: attachment; filename="' . $archivo['nombre_original'] . '"');
            header('Content-Length: ' . filesize($rutaCompleta));
            header('Cache-Control: no-cache');

            readfile($rutaCompleta);
            exit;

        } catch (Exception $e) {
            error_log("Error al descargar archivo: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al descargar archivo'
            ], 500);
        }
    }

    /**
     * Listar archivos de una entidad
     */
    public function listar($entidadTipo, $entidadId) {
        try {
            $stmt = $this->db->prepare("
                SELECT id, nombre_original, nombre_almacenado, ruta, tipo, tamano, created_at
                FROM archivos
                WHERE entidad_tipo = ? AND entidad_id = ?
                ORDER BY created_at DESC
            ");

            $stmt->execute([$entidadTipo, $entidadId]);
            $archivos = $stmt->fetchAll();

            $archivos = array_map(function($archivo) {
                return [
                    'id' => (int)$archivo['id'],
                    'nombre' => Security::sanitizeOutput($archivo['nombre_original']),
                    'url' => '/uploads/' . Security::sanitizeOutput($archivo['ruta']),
                    'tipo' => $archivo['tipo'],
                    'tamano' => (int)$archivo['tamano'],
                    'fecha' => $archivo['created_at']
                ];
            }, $archivos);

            return $this->jsonResponse([
                'success' => true,
                'data' => $archivos
            ]);

        } catch (Exception $e) {
            error_log("Error al listar archivos: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al listar archivos'
            ], 500);
        }
    }

    /**
     * Eliminar archivo
     */
    public function eliminar($id) {
        // Solo admin puede eliminar
        if (!$this->sessionManager->isAdmin()) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'No autorizado'
            ], 403);
        }

        try {
            $stmt = $this->db->prepare("SELECT * FROM archivos WHERE id = ?");
            $stmt->execute([$id]);
            $archivo = $stmt->fetch();

            if (!$archivo) {
                return $this->jsonResponse([
                    'success' => false,
                    'message' => 'Archivo no encontrado'
                ], 404);
            }

            $rutaCompleta = $this->uploadDir . $archivo['ruta'];

            // Eliminar archivo físico
            if (file_exists($rutaCompleta)) {
                unlink($rutaCompleta);
            }

            // Eliminar de base de datos
            $stmt = $this->db->prepare("DELETE FROM archivos WHERE id = ?");
            $stmt->execute([$id]);

            return $this->jsonResponse([
                'success' => true,
                'message' => 'Archivo eliminado exitosamente'
            ]);

        } catch (Exception $e) {
            error_log("Error al eliminar archivo: " . $e->getMessage());
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Error al eliminar archivo'
            ], 500);
        }
    }

    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Manejo de peticiones
try {
    $api = new ArchivosAPI();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    switch($action) {
        case 'upload':
            if ($method === 'POST') {
                $api->upload();
            }
            break;

        case 'download':
            $id = (int)($_GET['id'] ?? 0);
            $api->download($id);
            break;

        case 'listar':
            $entidadTipo = $_GET['entidad_tipo'] ?? '';
            $entidadId = (int)($_GET['entidad_id'] ?? 0);
            $api->listar($entidadTipo, $entidadId);
            break;

        case 'eliminar':
            if ($method === 'DELETE') {
                $id = (int)($_GET['id'] ?? 0);
                $api->eliminar($id);
            }
            break;

        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Endpoint no encontrado']);
            break;
    }

} catch (Exception $e) {
    error_log("Error en Archivos API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor']);
}
