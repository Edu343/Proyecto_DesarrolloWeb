<?php
/**
 * Gestor de Sesiones
 * Manejo seguro de sesiones de usuario
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/security.php';

class SessionManager {
    private $db;
    private $sessionTimeout = 1800; // 30 minutos

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
        $this->initSession();
    }

    /**
     * Inicializar sesión con configuración segura
     */
    private function initSession() {
        if (session_status() === PHP_SESSION_NONE) {
            ini_set('session.cookie_httponly', 1);
            ini_set('session.use_only_cookies', 1);
            ini_set('session.cookie_secure', 0); // Cambiar a 1 si usas HTTPS
            ini_set('session.cookie_samesite', 'Strict');

            session_start();

            // Regenerar ID de sesión periódicamente
            if (!isset($_SESSION['created'])) {
                $_SESSION['created'] = time();
            } elseif (time() - $_SESSION['created'] > 1800) {
                session_regenerate_id(true);
                $_SESSION['created'] = time();
            }
        }
    }

    /**
     * Login de usuario
     */
    public function login($email, $password) {
        try {
            // Rate limiting
            if (!Security::checkRateLimit('login_' . $email, 5, 300)) {
                return ['success' => false, 'message' => 'Demasiados intentos. Intente en 5 minutos.'];
            }

            $email = Security::sanitizeInput($email);

            if (!Security::validateEmail($email)) {
                return ['success' => false, 'message' => 'Email inválido'];
            }

            // Buscar usuario
            $stmt = $this->db->prepare("SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user) {
                return ['success' => false, 'message' => 'Credenciales incorrectas'];
            }

            if (!$user['activo']) {
                return ['success' => false, 'message' => 'Usuario desactivado'];
            }

            // Verificar password
            if (!Security::verifyPassword($password, $user['password_hash'])) {
                return ['success' => false, 'message' => 'Credenciales incorrectas'];
            }

            // Crear sesión
            $this->createSession($user);

            return [
                'success' => true,
                'message' => 'Login exitoso',
                'user' => [
                    'id' => $user['id'],
                    'nombre' => $user['nombre'],
                    'email' => $user['email'],
                    'rol' => $user['rol']
                ]
            ];

        } catch (Exception $e) {
            error_log("Error en login: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error en el servidor'];
        }
    }

    /**
     * Registro de nuevo usuario
     */
    public function register($nombre, $email, $password, $telefono = null) {
        try {
            $nombre = Security::sanitizeInput($nombre);
            $email = Security::sanitizeInput($email);
            $telefono = Security::sanitizeInput($telefono);

            // Validaciones
            if (empty($nombre) || empty($email) || empty($password)) {
                return ['success' => false, 'message' => 'Todos los campos son obligatorios'];
            }

            if (!Security::validateEmail($email)) {
                return ['success' => false, 'message' => 'Email inválido'];
            }

            if (!Security::validatePasswordStrength($password)) {
                return ['success' => false, 'message' => 'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número'];
            }

            // Verificar si el email ya existe
            $stmt = $this->db->prepare("SELECT id FROM usuarios WHERE email = ?");
            $stmt->execute([$email]);

            if ($stmt->fetch()) {
                return ['success' => false, 'message' => 'El email ya está registrado'];
            }

            // Crear usuario
            $passwordHash = Security::hashPassword($password);

            $stmt = $this->db->prepare("
                INSERT INTO usuarios (nombre, email, password_hash, telefono, rol)
                VALUES (?, ?, ?, ?, 'cliente')
            ");

            $stmt->execute([$nombre, $email, $passwordHash, $telefono]);

            $userId = $this->db->lastInsertId();

            return [
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'user_id' => $userId
            ];

        } catch (Exception $e) {
            error_log("Error en registro: " . $e->getMessage());
            return ['success' => false, 'message' => 'Error al registrar usuario'];
        }
    }

    /**
     * Crear sesión en base de datos y PHP
     */
    private function createSession($user) {
        session_regenerate_id(true);

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_nombre'] = $user['nombre'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_rol'] = $user['rol'];
        $_SESSION['logged_in'] = true;
        $_SESSION['last_activity'] = time();

        // Guardar sesión en base de datos
        $sessionId = session_id();
        $ipAddress = Security::getClientIP();
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';

        try {
            $stmt = $this->db->prepare("
                INSERT INTO sesiones (id, usuario_id, ip_address, user_agent)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    ip_address = VALUES(ip_address),
                    user_agent = VALUES(user_agent),
                    ultima_actividad = CURRENT_TIMESTAMP
            ");

            $stmt->execute([$sessionId, $user['id'], $ipAddress, $userAgent]);
        } catch (Exception $e) {
            error_log("Error al guardar sesión: " . $e->getMessage());
        }
    }

    /**
     * Verificar si el usuario está autenticado
     */
    public function isLoggedIn() {
        if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
            return false;
        }

        // Verificar timeout
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $this->sessionTimeout) {
            $this->logout();
            return false;
        }

        $_SESSION['last_activity'] = time();
        return true;
    }

    /**
     * Verificar si el usuario es admin
     */
    public function isAdmin() {
        return $this->isLoggedIn() && isset($_SESSION['user_rol']) && $_SESSION['user_rol'] === 'admin';
    }

    /**
     * Obtener ID del usuario actual
     */
    public function obtenerIdUsuario() {
        if (!$this->isLoggedIn()) {
            return null;
        }
        return $_SESSION['user_id'] ?? null;
    }

    /**
     * Obtener datos del usuario actual
     */
    public function getCurrentUser() {
        if (!$this->isLoggedIn()) {
            return null;
        }

        return [
            'id' => $_SESSION['user_id'],
            'nombre' => $_SESSION['user_nombre'],
            'email' => $_SESSION['user_email'],
            'rol' => $_SESSION['user_rol']
        ];
    }

    /**
     * Logout
     */
    public function logout() {
        if (isset($_SESSION['user_id'])) {
            // Eliminar sesión de la base de datos
            try {
                $sessionId = session_id();
                $stmt = $this->db->prepare("DELETE FROM sesiones WHERE id = ?");
                $stmt->execute([$sessionId]);
            } catch (Exception $e) {
                error_log("Error al eliminar sesión: " . $e->getMessage());
            }
        }

        Security::cleanSession();
    }

    /**
     * Limpiar sesiones expiradas de la base de datos
     */
    public function cleanExpiredSessions() {
        try {
            $stmt = $this->db->prepare("
                DELETE FROM sesiones
                WHERE ultima_actividad < DATE_SUB(NOW(), INTERVAL ? SECOND)
            ");
            $stmt->execute([$this->sessionTimeout]);
        } catch (Exception $e) {
            error_log("Error al limpiar sesiones: " . $e->getMessage());
        }
    }
}
