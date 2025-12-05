<?php
/**
 * API de Autenticación
 * Login, Registro, Logout
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';
require_once __DIR__ . '/../auth/session_manager.php';

Security::setSecurityHeaders();

class AuthAPI {
    private $sessionManager;

    public function __construct() {
        $this->sessionManager = new SessionManager();
    }

    public function login($data) {
        // Verificar CSRF token (opcional en desarrollo)
        // if (!isset($data['csrf_token']) || !Security::verifyCSRFToken($data['csrf_token'])) {
        //     return $this->jsonResponse([
        //         'success' => false,
        //         'message' => 'Token CSRF inválido'
        //     ], 403);
        // }

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($email) || empty($password)) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Email y contraseña son requeridos'
            ], 400);
        }

        $result = $this->sessionManager->login($email, $password);

        if ($result['success']) {
            return $this->jsonResponse($result, 200);
        } else {
            return $this->jsonResponse($result, 401);
        }
    }

    public function register($data) {
        // Verificar CSRF token (opcional en desarrollo)
        // if (!isset($data['csrf_token']) || !Security::verifyCSRFToken($data['csrf_token'])) {
        //     return $this->jsonResponse([
        //         'success' => false,
        //         'message' => 'Token CSRF inválido'
        //     ], 403);
        // }

        $nombre = $data['nombre'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $telefono = $data['telefono'] ?? null;

        $result = $this->sessionManager->register($nombre, $email, $password, $telefono);

        if ($result['success']) {
            return $this->jsonResponse($result, 201);
        } else {
            return $this->jsonResponse($result, 400);
        }
    }

    public function logout() {
        $this->sessionManager->logout();
        return $this->jsonResponse([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente'
        ]);
    }

    public function checkSession() {
        $isLoggedIn = $this->sessionManager->isLoggedIn();
        $user = $this->sessionManager->getCurrentUser();

        return $this->jsonResponse([
            'success' => true,
            'logged_in' => $isLoggedIn,
            'user' => $user
        ]);
    }

    public function getCSRFToken() {
        $token = Security::generateCSRFToken();
        return $this->jsonResponse([
            'success' => true,
            'csrf_token' => $token
        ]);
    }

    private function jsonResponse($data, $status = 200) {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Manejo de peticiones
try {
    $api = new AuthAPI();
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? '';

    $data = [];
    if ($method === 'POST') {
        $rawData = file_get_contents('php://input');
        $data = json_decode($rawData, true) ?? [];
    }

    switch($action) {
        case 'login':
            $api->login($data);
            break;

        case 'register':
            $api->register($data);
            break;

        case 'logout':
            $api->logout();
            break;

        case 'check':
            $api->checkSession();
            break;

        case 'csrf':
            $api->getCSRFToken();
            break;

        default:
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Endpoint no encontrado']);
            break;
    }

} catch (Exception $e) {
    error_log("Error en Auth API: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error del servidor']);
}
