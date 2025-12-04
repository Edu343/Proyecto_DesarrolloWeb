<?php
/**
 * Archivo de prueba para verificar la conexión a la base de datos
 */

// Mostrar errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Test de Conexión a Base de Datos</h1>";

try {
    // Intentar conectar
    $host = 'localhost';
    $database = 'ferreteria_db';
    $username = 'root';
    $password = '';

    $dsn = "mysql:host={$host};dbname={$database};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ];

    $pdo = new PDO($dsn, $username, $password, $options);

    echo "<p style='color: green;'><strong>✅ Conexión exitosa a la base de datos!</strong></p>";

    // Probar consulta
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM productos");
    $result = $stmt->fetch();

    echo "<p style='color: green;'>✅ Total de productos en la base de datos: <strong>" . $result['total'] . "</strong></p>";

    // Probar categorías
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM categorias");
    $result = $stmt->fetch();

    echo "<p style='color: green;'>✅ Total de categorías: <strong>" . $result['total'] . "</strong></p>";

    // Probar usuarios
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios");
    $result = $stmt->fetch();

    echo "<p style='color: green;'>✅ Total de usuarios: <strong>" . $result['total'] . "</strong></p>";

    echo "<hr>";
    echo "<h2>Primeros 5 productos:</h2>";
    $stmt = $pdo->query("SELECT nombre, precio, stock FROM productos LIMIT 5");
    $productos = $stmt->fetchAll();

    echo "<ul>";
    foreach ($productos as $prod) {
        echo "<li><strong>{$prod['nombre']}</strong> - Precio: \${$prod['precio']} - Stock: {$prod['stock']}</li>";
    }
    echo "</ul>";

    echo "<hr>";
    echo "<p style='color: blue;'><strong>TODO FUNCIONA CORRECTAMENTE!</strong></p>";
    echo "<p>Ahora puedes probar el sitio web en: <a href='/Proyecto_DesarrolloWeb/src/index.html'>http://localhost/Proyecto_DesarrolloWeb/src/index.html</a></p>";

} catch (PDOException $e) {
    echo "<p style='color: red;'><strong>❌ Error de conexión:</strong></p>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";

    echo "<hr>";
    echo "<h3>Soluciones posibles:</h3>";
    echo "<ul>";
    echo "<li>Verifica que MySQL esté corriendo en XAMPP (debe estar verde)</li>";
    echo "<li>Verifica que la base de datos se llame exactamente: <strong>ferreteria_db</strong></li>";
    echo "<li>Verifica que el usuario sea: <strong>root</strong></li>";
    echo "<li>Verifica que el password esté vacío (sin contraseña)</li>";
    echo "</ul>";
}
?>
