-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 06-12-2025 a las 00:03:56
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ferreteria_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `archivos`
--

CREATE TABLE `archivos` (
  `id` int(11) NOT NULL,
  `nombre_original` varchar(255) NOT NULL,
  `nombre_guardado` varchar(255) NOT NULL,
  `ruta` varchar(500) NOT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `tamanio` int(11) DEFAULT NULL,
  `entidad_tipo` enum('producto','usuario','pedido','contacto') NOT NULL,
  `entidad_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_log`
--

CREATE TABLE `auditoria_log` (
  `id` int(11) NOT NULL,
  `tabla` varchar(50) NOT NULL,
  `accion` varchar(50) NOT NULL,
  `registro_id` int(11) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `datos_anteriores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_anteriores`)),
  `datos_nuevos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`datos_nuevos`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `auditoria_log`
--

INSERT INTO `auditoria_log` (`id`, `tabla`, `accion`, `registro_id`, `usuario_id`, `datos_anteriores`, `datos_nuevos`, `created_at`) VALUES
(1, 'productos', 'INSERT', 1, NULL, NULL, '{\"nombre\": \"Martillo de Acero 16oz\", \"precio\": 249.99, \"stock\": 50, \"categoria_id\": 1}', '2025-12-05 21:09:34'),
(2, 'productos', 'INSERT', 2, NULL, NULL, '{\"nombre\": \"Taladro Inalámbrico 18V\", \"precio\": 1299.99, \"stock\": 25, \"categoria_id\": 1}', '2025-12-05 21:09:34'),
(3, 'productos', 'INSERT', 3, NULL, NULL, '{\"nombre\": \"Set Destornilladores 6pz\", \"precio\": 189.99, \"stock\": 100, \"categoria_id\": 1}', '2025-12-05 21:09:34'),
(4, 'productos', 'INSERT', 4, NULL, NULL, '{\"nombre\": \"Sierra Circular 7 1/4\\\"\", \"precio\": 899.99, \"stock\": 15, \"categoria_id\": 1}', '2025-12-05 21:09:34'),
(5, 'productos', 'INSERT', 5, NULL, NULL, '{\"nombre\": \"Llave Inglesa 12\\\"\", \"precio\": 159.99, \"stock\": 40, \"categoria_id\": 1}', '2025-12-05 21:09:34'),
(6, 'productos', 'INSERT', 6, NULL, NULL, '{\"nombre\": \"Nivel Láser Autonivelante\", \"precio\": 599.99, \"stock\": 20, \"categoria_id\": 1}', '2025-12-05 21:09:34'),
(7, 'productos', 'INSERT', 7, NULL, NULL, '{\"nombre\": \"Pintura Vinílica Blanca 19L\", \"precio\": 599.99, \"stock\": 80, \"categoria_id\": 2}', '2025-12-05 21:09:34'),
(8, 'productos', 'INSERT', 8, NULL, NULL, '{\"nombre\": \"Brocha 4 pulgadas\", \"precio\": 89.99, \"stock\": 120, \"categoria_id\": 2}', '2025-12-05 21:09:34'),
(9, 'productos', 'INSERT', 9, NULL, NULL, '{\"nombre\": \"Rodillo con Charola\", \"precio\": 149.99, \"stock\": 60, \"categoria_id\": 2}', '2025-12-05 21:09:34'),
(10, 'productos', 'INSERT', 10, NULL, NULL, '{\"nombre\": \"Esmalte Acrílico Rojo 1L\", \"precio\": 199.99, \"stock\": 45, \"categoria_id\": 2}', '2025-12-05 21:09:34'),
(11, 'productos', 'INSERT', 11, NULL, NULL, '{\"nombre\": \"Thinner 1L\", \"precio\": 79.99, \"stock\": 90, \"categoria_id\": 2}', '2025-12-05 21:09:34'),
(12, 'productos', 'INSERT', 12, NULL, NULL, '{\"nombre\": \"Lija Grano 80\", \"precio\": 12.99, \"stock\": 200, \"categoria_id\": 2}', '2025-12-05 21:09:34'),
(13, 'productos', 'INSERT', 13, NULL, NULL, '{\"nombre\": \"Llave Mezcladora Lavabo\", \"precio\": 449.99, \"stock\": 30, \"categoria_id\": 3}', '2025-12-05 21:09:34'),
(14, 'productos', 'INSERT', 14, NULL, NULL, '{\"nombre\": \"Tubería PVC 1/2\\\" 6m\", \"precio\": 89.99, \"stock\": 200, \"categoria_id\": 3}', '2025-12-05 21:09:34'),
(15, 'productos', 'INSERT', 15, NULL, NULL, '{\"nombre\": \"Codo PVC 1/2\\\" 90°\", \"precio\": 12.99, \"stock\": 500, \"categoria_id\": 3}', '2025-12-05 21:09:34'),
(16, 'productos', 'INSERT', 16, NULL, NULL, '{\"nombre\": \"Flotador Universal WC\", \"precio\": 79.99, \"stock\": 75, \"categoria_id\": 3}', '2025-12-05 21:09:34'),
(17, 'productos', 'INSERT', 17, NULL, NULL, '{\"nombre\": \"Llave de Paso 1/2\\\"\", \"precio\": 129.99, \"stock\": 60, \"categoria_id\": 3}', '2025-12-05 21:09:34'),
(18, 'productos', 'INSERT', 18, NULL, NULL, '{\"nombre\": \"Cinta Teflón\", \"precio\": 15.99, \"stock\": 300, \"categoria_id\": 3}', '2025-12-05 21:09:34'),
(19, 'productos', 'INSERT', 19, NULL, NULL, '{\"nombre\": \"Cable Cal. 12 (metro)\", \"precio\": 18.99, \"stock\": 1000, \"categoria_id\": 4}', '2025-12-05 21:09:34'),
(20, 'productos', 'INSERT', 20, NULL, NULL, '{\"nombre\": \"Apagador Sencillo\", \"precio\": 29.99, \"stock\": 300, \"categoria_id\": 4}', '2025-12-05 21:09:34'),
(21, 'productos', 'INSERT', 21, NULL, NULL, '{\"nombre\": \"Contacto Doble Polarizado\", \"precio\": 39.99, \"stock\": 250, \"categoria_id\": 4}', '2025-12-05 21:09:34'),
(22, 'productos', 'INSERT', 22, NULL, NULL, '{\"nombre\": \"Foco LED 12W Luz Blanca\", \"precio\": 59.99, \"stock\": 400, \"categoria_id\": 4}', '2025-12-05 21:09:34'),
(23, 'productos', 'INSERT', 23, NULL, NULL, '{\"nombre\": \"Caja Chalupa Cuadrada\", \"precio\": 8.99, \"stock\": 500, \"categoria_id\": 4}', '2025-12-05 21:09:34'),
(24, 'productos', 'INSERT', 24, NULL, NULL, '{\"nombre\": \"Multímetro Digital\", \"precio\": 299.99, \"stock\": 35, \"categoria_id\": 4}', '2025-12-05 21:09:34'),
(25, 'productos', 'INSERT', 25, NULL, NULL, '{\"nombre\": \"Cemento Gris 50kg\", \"precio\": 189.99, \"stock\": 500, \"categoria_id\": 5}', '2025-12-05 21:09:34'),
(26, 'productos', 'INSERT', 26, NULL, NULL, '{\"nombre\": \"Arena de Río (bulto)\", \"precio\": 79.99, \"stock\": 300, \"categoria_id\": 5}', '2025-12-05 21:09:34'),
(27, 'productos', 'INSERT', 27, NULL, NULL, '{\"nombre\": \"Varilla 3/8\\\" 6m\", \"precio\": 149.99, \"stock\": 150, \"categoria_id\": 5}', '2025-12-05 21:09:34'),
(28, 'productos', 'INSERT', 28, NULL, NULL, '{\"nombre\": \"Block 15x20x40\", \"precio\": 19.99, \"stock\": 2000, \"categoria_id\": 5}', '2025-12-05 21:09:34'),
(29, 'productos', 'INSERT', 29, NULL, NULL, '{\"nombre\": \"Grava 3/4 (bulto)\", \"precio\": 89.99, \"stock\": 250, \"categoria_id\": 5}', '2025-12-05 21:09:34'),
(30, 'productos', 'INSERT', 30, NULL, NULL, '{\"nombre\": \"Cemento Blanco 1kg\", \"precio\": 45.99, \"stock\": 100, \"categoria_id\": 5}', '2025-12-05 21:09:34'),
(31, 'productos', 'INSERT', 31, NULL, NULL, '{\"nombre\": \"Manguera 1/2\\\" 15m\", \"precio\": 299.99, \"stock\": 40, \"categoria_id\": 6}', '2025-12-05 21:09:34'),
(32, 'productos', 'INSERT', 32, NULL, NULL, '{\"nombre\": \"Pala Jardinería\", \"precio\": 179.99, \"stock\": 35, \"categoria_id\": 6}', '2025-12-05 21:09:34'),
(33, 'productos', 'INSERT', 33, NULL, NULL, '{\"nombre\": \"Tijeras de Podar 8\\\"\", \"precio\": 249.99, \"stock\": 50, \"categoria_id\": 6}', '2025-12-05 21:09:34'),
(34, 'productos', 'INSERT', 34, NULL, NULL, '{\"nombre\": \"Fertilizante Triple 17\", \"precio\": 89.99, \"stock\": 100, \"categoria_id\": 6}', '2025-12-05 21:09:34'),
(35, 'productos', 'INSERT', 35, NULL, NULL, '{\"nombre\": \"Rastrillo Metálico\", \"precio\": 139.99, \"stock\": 45, \"categoria_id\": 6}', '2025-12-05 21:09:34'),
(36, 'productos', 'INSERT', 36, NULL, NULL, '{\"nombre\": \"Regadera Plástico 10L\", \"precio\": 129.99, \"stock\": 60, \"categoria_id\": 6}', '2025-12-05 21:09:34'),
(37, 'productos', 'UPDATE', 1, NULL, '{\"nombre\": \"Martillo de Acero 16oz\", \"precio\": 249.99, \"stock\": 50}', '{\"nombre\": \"Martillo de Acero 16oz\", \"precio\": 249.99, \"stock\": 50}', '2025-12-05 21:11:28'),
(38, 'productos', 'UPDATE', 1, NULL, '{\"nombre\": \"Martillo de Acero 16oz\", \"precio\": 249.99, \"stock\": 50}', '{\"nombre\": \"Martillo de Acero 16oz\", \"precio\": 249.99, \"stock\": 50}', '2025-12-05 21:14:30'),
(39, 'productos', 'UPDATE', 1, NULL, '{\"nombre\": \"Martillo de Acero 16oz\", \"precio\": 249.99, \"stock\": 50}', '{\"nombre\": \"Martillo de Acero 16oz\", \"precio\": 249.99, \"stock\": 50}', '2025-12-05 21:14:39'),
(40, 'productos', 'UPDATE', 2, NULL, '{\"nombre\": \"Taladro Inalámbrico 18V\", \"precio\": 1299.99, \"stock\": 25}', '{\"nombre\": \"Taladro Inalámbrico 18V\", \"precio\": 1299.99, \"stock\": 25}', '2025-12-05 21:17:41'),
(41, 'productos', 'UPDATE', 34, NULL, '{\"nombre\": \"Fertilizante Triple 17\", \"precio\": 89.99, \"stock\": 100}', '{\"nombre\": \"Fertilizante Triple 17\", \"precio\": 89.99, \"stock\": 100}', '2025-12-05 22:26:03'),
(42, 'productos', 'UPDATE', 3, NULL, '{\"nombre\": \"Set Destornilladores 6pz\", \"precio\": 189.99, \"stock\": 100}', '{\"nombre\": \"Set Destornilladores 6pz\", \"precio\": 189.99, \"stock\": 100}', '2025-12-05 22:39:57'),
(43, 'productos', 'UPDATE', 4, NULL, '{\"nombre\": \"Sierra Circular 7 1/4\\\"\", \"precio\": 899.99, \"stock\": 15}', '{\"nombre\": \"Sierra Circular 7 1/4\\\"\", \"precio\": 899.99, \"stock\": 15}', '2025-12-05 22:40:15'),
(44, 'productos', 'UPDATE', 5, NULL, '{\"nombre\": \"Llave Inglesa 12\\\"\", \"precio\": 159.99, \"stock\": 40}', '{\"nombre\": \"Llave Inglesa 12\\\"\", \"precio\": 159.99, \"stock\": 40}', '2025-12-05 22:40:48'),
(45, 'productos', 'UPDATE', 6, NULL, '{\"nombre\": \"Nivel Láser Autonivelante\", \"precio\": 599.99, \"stock\": 20}', '{\"nombre\": \"Nivel Láser Autonivelante\", \"precio\": 599.99, \"stock\": 20}', '2025-12-05 22:41:09'),
(46, 'productos', 'UPDATE', 7, NULL, '{\"nombre\": \"Pintura Vinílica Blanca 19L\", \"precio\": 599.99, \"stock\": 80}', '{\"nombre\": \"Pintura Vinílica Blanca 19L\", \"precio\": 599.99, \"stock\": 80}', '2025-12-05 22:41:35'),
(47, 'productos', 'UPDATE', 8, NULL, '{\"nombre\": \"Brocha 4 pulgadas\", \"precio\": 89.99, \"stock\": 120}', '{\"nombre\": \"Brocha 4 pulgadas\", \"precio\": 89.99, \"stock\": 120}', '2025-12-05 22:42:06'),
(48, 'productos', 'UPDATE', 9, NULL, '{\"nombre\": \"Rodillo con Charola\", \"precio\": 149.99, \"stock\": 60}', '{\"nombre\": \"Rodillo con Charola\", \"precio\": 149.99, \"stock\": 60}', '2025-12-05 22:42:19'),
(49, 'productos', 'UPDATE', 10, NULL, '{\"nombre\": \"Esmalte Acrílico Rojo 1L\", \"precio\": 199.99, \"stock\": 45}', '{\"nombre\": \"Esmalte Acrílico Rojo 1L\", \"precio\": 199.99, \"stock\": 45}', '2025-12-05 22:42:51'),
(50, 'productos', 'UPDATE', 11, NULL, '{\"nombre\": \"Thinner 1L\", \"precio\": 79.99, \"stock\": 90}', '{\"nombre\": \"Thinner 1L\", \"precio\": 79.99, \"stock\": 90}', '2025-12-05 22:43:23'),
(51, 'productos', 'UPDATE', 12, NULL, '{\"nombre\": \"Lija Grano 80\", \"precio\": 12.99, \"stock\": 200}', '{\"nombre\": \"Lija Grano 80\", \"precio\": 12.99, \"stock\": 200}', '2025-12-05 22:43:45'),
(52, 'productos', 'UPDATE', 13, NULL, '{\"nombre\": \"Llave Mezcladora Lavabo\", \"precio\": 449.99, \"stock\": 30}', '{\"nombre\": \"Llave Mezcladora Lavabo\", \"precio\": 449.99, \"stock\": 30}', '2025-12-05 22:44:00'),
(53, 'productos', 'UPDATE', 13, NULL, '{\"nombre\": \"Llave Mezcladora Lavabo\", \"precio\": 449.99, \"stock\": 30}', '{\"nombre\": \"Llave Mezcladora Lavabo\", \"precio\": 449.99, \"stock\": 30}', '2025-12-05 22:44:05'),
(54, 'productos', 'UPDATE', 14, NULL, '{\"nombre\": \"Tubería PVC 1/2\\\" 6m\", \"precio\": 89.99, \"stock\": 200}', '{\"nombre\": \"Tubería PVC 1/2\\\" 6m\", \"precio\": 89.99, \"stock\": 200}', '2025-12-05 22:44:33'),
(55, 'productos', 'UPDATE', 15, NULL, '{\"nombre\": \"Codo PVC 1/2\\\" 90°\", \"precio\": 12.99, \"stock\": 500}', '{\"nombre\": \"Codo PVC 1/2\\\" 90°\", \"precio\": 12.99, \"stock\": 500}', '2025-12-05 22:45:46'),
(56, 'productos', 'UPDATE', 14, NULL, '{\"nombre\": \"Tubería PVC 1/2\\\" 6m\", \"precio\": 89.99, \"stock\": 200}', '{\"nombre\": \"Tubería PVC 1/2\\\" 6m\", \"precio\": 89.99, \"stock\": 200}', '2025-12-05 22:45:51'),
(57, 'productos', 'UPDATE', 16, NULL, '{\"nombre\": \"Flotador Universal WC\", \"precio\": 79.99, \"stock\": 75}', '{\"nombre\": \"Flotador Universal WC\", \"precio\": 79.99, \"stock\": 75}', '2025-12-05 22:46:36'),
(58, 'productos', 'UPDATE', 17, NULL, '{\"nombre\": \"Llave de Paso 1/2\\\"\", \"precio\": 129.99, \"stock\": 60}', '{\"nombre\": \"Llave de Paso 1/2\\\"\", \"precio\": 129.99, \"stock\": 60}', '2025-12-05 22:47:03'),
(59, 'productos', 'UPDATE', 18, NULL, '{\"nombre\": \"Cinta Teflón\", \"precio\": 15.99, \"stock\": 300}', '{\"nombre\": \"Cinta Teflón\", \"precio\": 15.99, \"stock\": 300}', '2025-12-05 22:47:25'),
(60, 'productos', 'UPDATE', 19, NULL, '{\"nombre\": \"Cable Cal. 12 (metro)\", \"precio\": 18.99, \"stock\": 1000}', '{\"nombre\": \"Cable Cal. 12 (metro)\", \"precio\": 18.99, \"stock\": 1000}', '2025-12-05 22:47:46'),
(61, 'productos', 'UPDATE', 20, NULL, '{\"nombre\": \"Apagador Sencillo\", \"precio\": 29.99, \"stock\": 300}', '{\"nombre\": \"Apagador Sencillo\", \"precio\": 29.99, \"stock\": 300}', '2025-12-05 22:48:02'),
(62, 'productos', 'UPDATE', 19, NULL, '{\"nombre\": \"Cable Cal. 12 (metro)\", \"precio\": 18.99, \"stock\": 1000}', '{\"nombre\": \"Cable Cal. 12 (metro)\", \"precio\": 18.99, \"stock\": 1000}', '2025-12-05 22:48:07'),
(63, 'productos', 'UPDATE', 21, NULL, '{\"nombre\": \"Contacto Doble Polarizado\", \"precio\": 39.99, \"stock\": 250}', '{\"nombre\": \"Contacto Doble Polarizado\", \"precio\": 39.99, \"stock\": 250}', '2025-12-05 22:48:24'),
(64, 'productos', 'UPDATE', 22, NULL, '{\"nombre\": \"Foco LED 12W Luz Blanca\", \"precio\": 59.99, \"stock\": 400}', '{\"nombre\": \"Foco LED 12W Luz Blanca\", \"precio\": 59.99, \"stock\": 400}', '2025-12-05 22:48:41'),
(65, 'productos', 'UPDATE', 23, NULL, '{\"nombre\": \"Caja Chalupa Cuadrada\", \"precio\": 8.99, \"stock\": 500}', '{\"nombre\": \"Caja Chalupa Cuadrada\", \"precio\": 8.99, \"stock\": 500}', '2025-12-05 22:49:03'),
(66, 'productos', 'UPDATE', 24, NULL, '{\"nombre\": \"Multímetro Digital\", \"precio\": 299.99, \"stock\": 35}', '{\"nombre\": \"Multímetro Digital\", \"precio\": 299.99, \"stock\": 35}', '2025-12-05 22:49:27'),
(67, 'productos', 'UPDATE', 25, NULL, '{\"nombre\": \"Cemento Gris 50kg\", \"precio\": 189.99, \"stock\": 500}', '{\"nombre\": \"Cemento Gris 50kg\", \"precio\": 189.99, \"stock\": 500}', '2025-12-05 22:49:56'),
(68, 'productos', 'UPDATE', 4, NULL, '{\"nombre\": \"Sierra Circular 7 1/4\\\"\", \"precio\": 899.99, \"stock\": 15}', '{\"nombre\": \"Sierra Circular 7 1/4\\\"\", \"precio\": 899.99, \"stock\": 15}', '2025-12-05 22:50:11'),
(69, 'productos', 'UPDATE', 27, NULL, '{\"nombre\": \"Varilla 3/8\\\" 6m\", \"precio\": 149.99, \"stock\": 150}', '{\"nombre\": \"Varilla 3/8\\\" 6m\", \"precio\": 149.99, \"stock\": 150}', '2025-12-05 22:51:55'),
(70, 'productos', 'UPDATE', 28, NULL, '{\"nombre\": \"Block 15x20x40\", \"precio\": 19.99, \"stock\": 2000}', '{\"nombre\": \"Block 15x20x40\", \"precio\": 19.99, \"stock\": 2000}', '2025-12-05 22:52:14'),
(71, 'productos', 'UPDATE', 29, NULL, '{\"nombre\": \"Grava 3/4 (bulto)\", \"precio\": 89.99, \"stock\": 250}', '{\"nombre\": \"Grava 3/4 (bulto)\", \"precio\": 89.99, \"stock\": 250}', '2025-12-05 22:52:50'),
(72, 'productos', 'UPDATE', 30, NULL, '{\"nombre\": \"Cemento Blanco 1kg\", \"precio\": 45.99, \"stock\": 100}', '{\"nombre\": \"Cemento Blanco 1kg\", \"precio\": 45.99, \"stock\": 100}', '2025-12-05 22:53:30'),
(73, 'productos', 'UPDATE', 31, NULL, '{\"nombre\": \"Manguera 1/2\\\" 15m\", \"precio\": 299.99, \"stock\": 40}', '{\"nombre\": \"Manguera 1/2\\\" 15m\", \"precio\": 299.99, \"stock\": 40}', '2025-12-05 22:54:09'),
(74, 'productos', 'UPDATE', 32, NULL, '{\"nombre\": \"Pala Jardinería\", \"precio\": 179.99, \"stock\": 35}', '{\"nombre\": \"Pala Jardinería\", \"precio\": 179.99, \"stock\": 35}', '2025-12-05 22:54:23'),
(75, 'productos', 'UPDATE', 33, NULL, '{\"nombre\": \"Tijeras de Podar 8\\\"\", \"precio\": 249.99, \"stock\": 50}', '{\"nombre\": \"Tijeras de Podar 8\\\"\", \"precio\": 249.99, \"stock\": 50}', '2025-12-05 22:54:45'),
(76, 'productos', 'UPDATE', 34, NULL, '{\"nombre\": \"Fertilizante Triple 17\", \"precio\": 89.99, \"stock\": 100}', '{\"nombre\": \"Fertilizante Triple 17\", \"precio\": 89.99, \"stock\": 100}', '2025-12-05 22:55:07'),
(77, 'productos', 'UPDATE', 35, NULL, '{\"nombre\": \"Rastrillo Metálico\", \"precio\": 139.99, \"stock\": 45}', '{\"nombre\": \"Rastrillo Metálico\", \"precio\": 139.99, \"stock\": 45}', '2025-12-05 22:55:37'),
(78, 'productos', 'UPDATE', 36, NULL, '{\"nombre\": \"Regadera Plástico 10L\", \"precio\": 129.99, \"stock\": 60}', '{\"nombre\": \"Regadera Plástico 10L\", \"precio\": 129.99, \"stock\": 60}', '2025-12-05 22:56:24'),
(79, 'productos', 'UPDATE', 26, NULL, '{\"nombre\": \"Arena de Río (bulto)\", \"precio\": 79.99, \"stock\": 300}', '{\"nombre\": \"Arena de Río (bulto)\", \"precio\": 79.99, \"stock\": 300}', '2025-12-05 22:59:11');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `icono` varchar(50) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `contactos`
--

CREATE TABLE `contactos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `asunto` enum('cotizacion','productos','dano_producto','otro') NOT NULL,
  `mensaje` text NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `producto_id` int(11) DEFAULT NULL,
  `tiene_foto` tinyint(1) DEFAULT 0,
  `estado` enum('pendiente','atendido','resuelto') DEFAULT 'pendiente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `icono`, `activo`, `created_at`) VALUES
(1, 'Herramientas', 'Herramientas manuales y eléctricas de alta calidad', 'fas fa-hammer', 1, '2025-12-05 21:09:34'),
(2, 'Pinturas', 'Pinturas, barnices y accesorios para pintar', 'fas fa-paint-roller', 1, '2025-12-05 21:09:34'),
(3, 'Plomería', 'Tuberías, llaves y accesorios sanitarios', 'fas fa-faucet', 1, '2025-12-05 21:09:34'),
(4, 'Electricidad', 'Material eléctrico, cables y contactos', 'fas fa-bolt', 1, '2025-12-05 21:09:34'),
(5, 'Construcción', 'Materiales básicos para construcción', 'fas fa-hard-hat', 1, '2025-12-05 21:09:34'),
(6, 'Jardinería', 'Herramientas y productos para jardín', 'fas fa-seedling', 1, '2025-12-05 21:09:34');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `iva` decimal(10,2) NOT NULL,
  `costo_envio` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','procesando','completado','cancelado') DEFAULT 'pendiente',
  `tipo_envio` enum('tienda','domicilio') DEFAULT 'tienda',
  `notas` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedido_detalles`
--

CREATE TABLE `pedido_detalles` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `producto_nombre` varchar(200) NOT NULL,
  `producto_precio` decimal(10,2) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `pedido_detalles`
-- REQUISITO: USO DE TRIGGERS (2 PTS) - VALIDACIÓN AUTOMÁTICA DE STOCK
--
DELIMITER $$
CREATE TRIGGER `trg_pedido_detalle_validar_stock` BEFORE INSERT ON `pedido_detalles` FOR EACH ROW BEGIN
    DECLARE stock_disponible INT;

    SELECT stock INTO stock_disponible
    FROM productos
    WHERE id = NEW.producto_id;

    IF stock_disponible < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para el producto';
    END IF;

    -- Actualizar stock del producto
    UPDATE productos
    SET stock = stock - NEW.cantidad
    WHERE id = NEW.producto_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `categoria_id` int(11) NOT NULL,
  `imagen` varchar(255) DEFAULT NULL,
  `destacado` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `stock`, `categoria_id`, `imagen`, `destacado`, `activo`, `created_at`, `updated_at`) VALUES
(1, 'Martillo de Acero 16oz', 'Martillo profesional con mango ergonómico antideslizante. Cabeza forjada en acero templado de alta resistencia.', 249.99, 50, 1, 'MartilloAcero.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 21:14:39'),
(2, 'Taladro Inalámbrico 18V', 'Taladro percutor inalámbrico con batería de litio y cargador rápido. Incluye maletín y 20 accesorios.', 1299.99, 25, 1, 'TaladroInalambrico18v.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 21:17:41'),
(3, 'Set Destornilladores 6pz', 'Juego de destornilladores profesionales con mangos ergonómicos. Incluye planos y phillips en diferentes medidas.', 189.99, 100, 1, 'Destornilladores6pz.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:39:57'),
(4, 'Sierra Circular 7 1/4\"', 'Sierra circular eléctrica 1800W con guía láser y ajuste de profundidad. Incluye disco para madera.', 899.99, 15, 1, 'SierraMadera.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 22:50:11'),
(5, 'Llave Inglesa 12\"', 'Llave ajustable cromada con acabado antideslizante. Apertura máxima 32mm.', 159.99, 40, 1, 'LlaveInglesa12.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:40:48'),
(6, 'Nivel Láser Autonivelante', 'Nivel láser de líneas cruzadas con trípode incluido. Alcance de 20 metros.', 599.99, 20, 1, 'NivelLaserAutonivelante.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 22:41:09'),
(7, 'Pintura Vinílica Blanca 19L', 'Pintura lavable para interiores. Rendimiento de 12-14 m² por litro. Secado rápido.', 599.99, 80, 2, 'PinturaBlancaVinilica.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 22:41:35'),
(8, 'Brocha 4 pulgadas', 'Brocha profesional con cerda natural. Ideal para acabados finos en madera y metal.', 89.99, 120, 2, 'Brocha4Pulgadas.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:42:06'),
(9, 'Rodillo con Charola', 'Kit completo para pintar: rodillo de 9\", charola plástica y extensión telescópica de 2m.', 149.99, 60, 2, 'RodilloCharola.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:42:19'),
(10, 'Esmalte Acrílico Rojo 1L', 'Esmalte de secado rápido con acabado brillante profesional. Para interiores y exteriores.', 199.99, 45, 2, 'EsmalteAcrilicoRojo1L.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:42:51'),
(11, 'Thinner 1L', 'Diluyente para pinturas y esmaltes alquídicos. Alta pureza.', 79.99, 90, 2, 'Thinner1L.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:43:23'),
(12, 'Lija Grano 80', 'Papel lija de óxido de aluminio para madera y metal. Hoja de 9x11 pulgadas.', 12.99, 200, 2, 'LijaGrano80.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:43:45'),
(13, 'Llave Mezcladora Lavabo', 'Llave monomando con acabado cromado. Cartucho cerámico de alta duración.', 449.99, 30, 3, 'LlaveMezcladoraMonomando.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 22:44:05'),
(14, 'Tubería PVC 1/2\" 6m', 'Tubería cédula 40 para agua fría. Resistente a la corrosión.', 89.99, 200, 3, 'TuberiaPVC6m.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:45:51'),
(15, 'Codo PVC 1/2\" 90°', 'Codo de 90 grados para tubería cédula 40. Conexión por cementado.', 12.99, 500, 3, 'TuberiaCodo90.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:45:46'),
(16, 'Flotador Universal WC', 'Flotador ajustable para tanque de inodoro. Compatible con la mayoría de marcas.', 79.99, 75, 3, 'FlotadorUniversal.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:46:36'),
(17, 'Llave de Paso 1/2\"', 'Llave esférica de bronce con palanca. Para instalaciones de agua.', 129.99, 60, 3, 'LlavePasoBronce.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:47:03'),
(18, 'Cinta Teflón', 'Cinta selladora de roscas. Rollo de 12mm x 10m.', 15.99, 300, 3, 'CintaTeflon12x10.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:47:25'),
(19, 'Cable Cal. 12 (metro)', 'Cable THW color negro calibre 12. Para instalaciones eléctricas 600V.', 18.99, 1000, 4, 'CableTWS600v.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:48:07'),
(20, 'Apagador Sencillo', 'Apagador de una vía, blanco marfil. 15A 120V con placa incluida.', 29.99, 300, 4, 'ApagadorSencillo.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:48:02'),
(21, 'Contacto Doble Polarizado', 'Contacto con tierra 15A 120V. Incluye placa decorativa blanca.', 39.99, 250, 4, 'ContactoDuplex.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:48:24'),
(22, 'Foco LED 12W Luz Blanca', 'Foco ahorrador LED equivalente a 100W. Base E27, 6000K luz fría.', 59.99, 400, 4, 'FocoLed.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 22:48:41'),
(23, 'Caja Chalupa Cuadrada', 'Caja de conexiones de PVC. Para empotrar en muros.', 8.99, 500, 4, 'ChalupaCuadradaPVC.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:49:03'),
(24, 'Multímetro Digital', 'Probador de voltaje AC/DC, resistencia y continuidad. Pantalla LCD.', 299.99, 35, 4, 'MultimetroLCD.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 22:49:27'),
(25, 'Cemento Gris 50kg', 'Cemento Portland Tipo I para uso general. Alta resistencia.', 189.99, 500, 5, 'CementoGris50kg.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 22:49:56'),
(26, 'Arena de Río (bulto)', 'Arena lavada para construcción. Saco de aproximadamente 40kg.', 79.99, 300, 5, 'ArenaRio.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:59:11'),
(27, 'Varilla 3/8\" 6m', 'Varilla corrugada grado 42 para estructuras de concreto.', 149.99, 150, 5, 'VarillaCorrugada6m.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:51:55'),
(28, 'Block 15x20x40', 'Block de concreto hueco para muros. Alta resistencia a la compresión.', 19.99, 2000, 5, 'Block15x20x40.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:52:14'),
(29, 'Grava 3/4 (bulto)', 'Grava triturada para concreto. Saco de aproximadamente 40kg.', 89.99, 250, 5, 'Grava.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:52:50'),
(30, 'Cemento Blanco 1kg', 'Cemento blanco para acabados y juntas. Bolsa de 1kg.', 45.99, 100, 5, 'CementoBlanco1kg.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:53:30'),
(31, 'Manguera 1/2\" 15m', 'Manguera reforzada antirayos UV. Conexiones de bronce incluidas.', 299.99, 40, 6, 'Manguera15m.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 22:54:09'),
(32, 'Pala Jardinería', 'Pala de acero con mango de madera. Para transplante y cultivo.', 179.99, 35, 6, 'PalaJardin.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:54:23'),
(33, 'Tijeras de Podar 8\"', 'Tijeras profesionales de acero forjado. Corte tipo bypass.', 249.99, 50, 6, 'TijeraPodar8.jpg', 1, 1, '2025-12-05 21:09:34', '2025-12-05 22:54:45'),
(34, 'Fertilizante Triple 17', 'Fertilizante NPK 17-17-17 multiusos. Bolsa de 25kg.', 89.99, 100, 6, 'Fertilizante17.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:55:07'),
(35, 'Rastrillo Metálico', 'Rastrillo de jardín con 16 dientes de acero y mango de madera.', 139.99, 45, 6, 'RastrilloJardin16dientes.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:55:37'),
(36, 'Regadera Plástico 10L', 'Regadera de polietileno con rociador ajustable. Capacidad 10 litros.', 129.99, 60, 6, 'Regadera10L.jpg', 0, 1, '2025-12-05 21:09:34', '2025-12-05 22:56:24');

--
-- Disparadores `productos`
-- REQUISITO: USO DE TRIGGERS (2 PTS) - AUDITORÍA AUTOMÁTICA DE CAMBIOS
--
DELIMITER $$
CREATE TRIGGER `trg_productos_audit_delete` AFTER DELETE ON `productos` FOR EACH ROW BEGIN
    INSERT INTO auditoria_log (tabla, accion, registro_id, datos_anteriores)
    VALUES (
        'productos',
        'DELETE',
        OLD.id,
        JSON_OBJECT(
            'nombre', OLD.nombre,
            'precio', OLD.precio,
            'stock', OLD.stock
        )
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_productos_audit_insert` AFTER INSERT ON `productos` FOR EACH ROW BEGIN
    INSERT INTO auditoria_log (tabla, accion, registro_id, datos_nuevos)
    VALUES (
        'productos',
        'INSERT',
        NEW.id,
        JSON_OBJECT(
            'nombre', NEW.nombre,
            'precio', NEW.precio,
            'stock', NEW.stock,
            'categoria_id', NEW.categoria_id
        )
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_productos_audit_update` AFTER UPDATE ON `productos` FOR EACH ROW BEGIN
    INSERT INTO auditoria_log (tabla, accion, registro_id, datos_anteriores, datos_nuevos)
    VALUES (
        'productos',
        'UPDATE',
        NEW.id,
        JSON_OBJECT(
            'nombre', OLD.nombre,
            'precio', OLD.precio,
            'stock', OLD.stock
        ),
        JSON_OBJECT(
            'nombre', NEW.nombre,
            'precio', NEW.precio,
            'stock', NEW.stock
        )
    );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones`
--

CREATE TABLE `sesiones` (
  `id` varchar(128) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `ultima_actividad` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Disparadores `sesiones`
--
DELIMITER $$
CREATE TRIGGER `trg_sesiones_update_usuario` AFTER INSERT ON `sesiones` FOR EACH ROW BEGIN
    UPDATE usuarios
    SET ultima_sesion = CURRENT_TIMESTAMP
    WHERE id = NEW.usuario_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `rol` enum('admin','cliente') DEFAULT 'cliente',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultima_sesion` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `telefono`, `direccion`, `rol`, `activo`, `created_at`, `ultima_sesion`) VALUES
(1, 'Administrador Sistema', 'admin@ferreteria.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9991234567', 'Calle 50 #123, Centro, Mérida, Yucatán', 'admin', 1, '2025-12-05 21:09:34', NULL),
(2, 'Juan Pérez García', 'cliente@ejemplo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9999876543', 'Calle 60 #456, Col. Centro, Mérida, Yucatán', 'cliente', 1, '2025-12-05 21:09:34', NULL),
(3, 'María López Hernández', 'maria.lopez@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '9991112233', 'Calle 45 #789, Fracc. Las Américas, Mérida', 'cliente', 1, '2025-12-05 21:09:34', NULL);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_estadisticas_categoria`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_estadisticas_categoria` (
`categoria_id` int(11)
,`categoria_nombre` varchar(100)
,`categoria_icono` varchar(50)
,`total_productos` bigint(21)
,`stock_total` decimal(32,0)
,`precio_promedio` decimal(14,6)
,`precio_minimo` decimal(10,2)
,`precio_maximo` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_pedidos_completo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_pedidos_completo` (
`pedido_id` int(11)
,`total` decimal(10,2)
,`estado` enum('pendiente','procesando','completado','cancelado')
,`tipo_envio` enum('tienda','domicilio')
,`fecha_pedido` timestamp
,`usuario_id` int(11)
,`usuario_nombre` varchar(100)
,`usuario_email` varchar(150)
,`usuario_telefono` varchar(20)
,`total_items` bigint(21)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `vista_productos_completo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `vista_productos_completo` (
`id` int(11)
,`nombre` varchar(200)
,`descripcion` text
,`precio` decimal(10,2)
,`stock` int(11)
,`imagen` varchar(255)
,`destacado` tinyint(1)
,`activo` tinyint(1)
,`created_at` timestamp
,`categoria_id` int(11)
,`categoria_nombre` varchar(100)
,`categoria_icono` varchar(50)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_estadisticas_categoria`
-- REQUISITO: USO DE VISTAS (2 PTS) - VISTA PARA ESTADÍSTICAS DE CATEGORÍAS
--
DROP TABLE IF EXISTS `vista_estadisticas_categoria`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_estadisticas_categoria`  AS SELECT `c`.`id` AS `categoria_id`, `c`.`nombre` AS `categoria_nombre`, `c`.`icono` AS `categoria_icono`, count(`p`.`id`) AS `total_productos`, sum(`p`.`stock`) AS `stock_total`, avg(`p`.`precio`) AS `precio_promedio`, min(`p`.`precio`) AS `precio_minimo`, max(`p`.`precio`) AS `precio_maximo` FROM (`categorias` `c` left join `productos` `p` on(`c`.`id` = `p`.`categoria_id` and `p`.`activo` = 1)) WHERE `c`.`activo` = 1 GROUP BY `c`.`id`, `c`.`nombre`, `c`.`icono` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_pedidos_completo`
--
DROP TABLE IF EXISTS `vista_pedidos_completo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_pedidos_completo`  AS SELECT `ped`.`id` AS `pedido_id`, `ped`.`total` AS `total`, `ped`.`estado` AS `estado`, `ped`.`tipo_envio` AS `tipo_envio`, `ped`.`created_at` AS `fecha_pedido`, `u`.`id` AS `usuario_id`, `u`.`nombre` AS `usuario_nombre`, `u`.`email` AS `usuario_email`, `u`.`telefono` AS `usuario_telefono`, count(`pd`.`id`) AS `total_items` FROM ((`pedidos` `ped` join `usuarios` `u` on(`ped`.`usuario_id` = `u`.`id`)) left join `pedido_detalles` `pd` on(`ped`.`id` = `pd`.`pedido_id`)) GROUP BY `ped`.`id`, `ped`.`total`, `ped`.`estado`, `ped`.`tipo_envio`, `ped`.`created_at`, `u`.`id`, `u`.`nombre`, `u`.`email`, `u`.`telefono` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `vista_productos_completo`
--
DROP TABLE IF EXISTS `vista_productos_completo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_productos_completo`  AS SELECT `p`.`id` AS `id`, `p`.`nombre` AS `nombre`, `p`.`descripcion` AS `descripcion`, `p`.`precio` AS `precio`, `p`.`stock` AS `stock`, `p`.`imagen` AS `imagen`, `p`.`destacado` AS `destacado`, `p`.`activo` AS `activo`, `p`.`created_at` AS `created_at`, `c`.`id` AS `categoria_id`, `c`.`nombre` AS `categoria_nombre`, `c`.`icono` AS `categoria_icono` FROM (`productos` `p` join `categorias` `c` on(`p`.`categoria_id` = `c`.`id`)) WHERE `p`.`activo` = 1 ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `archivos`
--
ALTER TABLE `archivos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entidad` (`entidad_tipo`,`entidad_id`);

--
-- Indices de la tabla `auditoria_log`
--
ALTER TABLE `auditoria_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tabla` (`tabla`),
  ADD KEY `idx_accion` (`accion`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_fecha` (`created_at`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_activo` (`activo`);

--
-- Indices de la tabla `contactos`
--
ALTER TABLE `contactos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_asunto` (`asunto`),
  ADD KEY `idx_pedido` (`pedido_id`),
  ADD KEY `idx_producto` (`producto_id`),
  ADD KEY `idx_fecha` (`created_at`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha` (`created_at`);

--
-- Indices de la tabla `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pedido` (`pedido_id`),
  ADD KEY `idx_producto` (`producto_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categoria` (`categoria_id`),
  ADD KEY `idx_activo` (`activo`),
  ADD KEY `idx_destacado` (`destacado`),
  ADD KEY `idx_nombre` (`nombre`);

--
-- Indices de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_actividad` (`ultima_actividad`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_activo` (`activo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `archivos`
--
ALTER TABLE `archivos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auditoria_log`
--
ALTER TABLE `auditoria_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `contactos`
--
ALTER TABLE `contactos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `pedido_detalles`
--
ALTER TABLE `pedido_detalles`
  ADD CONSTRAINT `pedido_detalles_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pedido_detalles_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
