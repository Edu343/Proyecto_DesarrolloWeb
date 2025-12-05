<?php
/**
 * Clase de Seguridad
 * Protección contra XSS, CSRF, SQL Injection y otros ataques
 */

class Security {

    /**
     * Prevención de XSS - Sanitiza output HTML
     */
    public static function sanitizeOutput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeOutput'], $data);
        }
        return htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    }

    /**
     * Prevención de XSS - Sanitiza input
     */
    public static function sanitizeInput($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitizeInput'], $data);
        }
        $data = trim($data);
        $data = stripslashes($data);
        return $data;
    }

    /**
     * Validar email
     */
    public static function validateEmail($email) {
        $email = filter_var($email, FILTER_SANITIZE_EMAIL);
        return filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    /**
     * Generar token CSRF
     */
    public static function generateCSRFToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['csrf_token'];
    }

    /**
     * Verificar token CSRF
     */
    public static function verifyCSRFToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (!isset($_SESSION['csrf_token']) || !isset($token)) {
            return false;
        }

        return hash_equals($_SESSION['csrf_token'], $token);
    }

    /**
     * Hash de password seguro
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    }

    /**
     * Verificar password
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * Validar fortaleza de contraseña
     */
    public static function validatePasswordStrength($password) {
        // Mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
        $pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/';
        return preg_match($pattern, $password);
    }

    /**
     * Sanitizar nombre de archivo
     */
    public static function sanitizeFilename($filename) {
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
        return $filename;
    }

    /**
     * Prevenir Path Traversal
     */
    public static function validatePath($path, $allowedDir) {
        $realPath = realpath($path);
        $realAllowedDir = realpath($allowedDir);

        if ($realPath === false || strpos($realPath, $realAllowedDir) !== 0) {
            return false;
        }
        return true;
    }

    /**
     * Limitar tasa de peticiones (Rate Limiting básico)
     */
    public static function checkRateLimit($identifier, $maxAttempts = 5, $timeWindow = 300) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $key = 'rate_limit_' . $identifier;
        $now = time();

        if (!isset($_SESSION[$key])) {
            $_SESSION[$key] = ['count' => 1, 'time' => $now];
            return true;
        }

        $data = $_SESSION[$key];

        // Reiniciar si pasó el tiempo
        if ($now - $data['time'] > $timeWindow) {
            $_SESSION[$key] = ['count' => 1, 'time' => $now];
            return true;
        }

        // Incrementar contador
        if ($data['count'] >= $maxAttempts) {
            return false;
        }

        $_SESSION[$key]['count']++;
        return true;
    }

    /**
     * Obtener IP del cliente de forma segura
     */
    public static function getClientIP() {
        $ip = '';

        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'] ?? '';
        }

        // Validar IP
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }

    /**
     * Headers de seguridad HTTP
     */
    public static function setSecurityHeaders() {
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: SAMEORIGIN');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Content-Security-Policy: default-src \'self\'; script-src \'self\' \'unsafe-inline\' https://cdnjs.cloudflare.com; style-src \'self\' \'unsafe-inline\' https://cdnjs.cloudflare.com;');
    }

    /**
     * Limpiar datos de sesión al cerrar
     */
    public static function cleanSession() {
        if (session_status() === PHP_SESSION_ACTIVE) {
            $_SESSION = [];
            session_destroy();
        }
    }
}
