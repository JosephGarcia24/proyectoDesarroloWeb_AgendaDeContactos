<?php
/**
 * ============================================================================
 * EXPORTAR CONTACTOS A CSV
 * ============================================================================
 */

session_start();
require_once 'conexion.php';

// Verificar sesión
if (!isset($_SESSION['logueado']) || !$_SESSION['logueado']) {
    http_response_code(401);
    exit('No autorizado');
}

$conn = obtenerConexion();

if (!$conn) {
    http_response_code(500);
    exit('Error de conexión');
}

$email_usuario = $_SESSION['email'];

// Obtener contactos del usuario
$stmt = $conn->prepare("
    SELECT nombre, telefono, correo, FCumple 
    FROM contacto 
    WHERE correo_usuario = ?
    ORDER BY nombre ASC
");

$stmt->bind_param("s", $email_usuario);
$stmt->execute();
$resultado = $stmt->get_result();

// Configurar headers para descarga CSV
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="contactos_' . date('Y-m-d_His') . '.csv"');

// Crear output stream
$output = fopen('php://output', 'w');

// BOM UTF-8 para Excel
fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

// Escribir encabezados
fputcsv($output, ['Nombre', 'Teléfono', 'Email', 'Fecha de Cumpleaños'], ',');

// Escribir datos
while ($fila = $resultado->fetch_assoc()) {
    $fecha = $fila['FCumple'] ? date('d/m/Y', strtotime($fila['FCumple'])) : '';
    
    fputcsv($output, [
        $fila['nombre'],
        $fila['telefono'] ?: '',
        $fila['correo'] ?: '',
        $fecha
    ], ',');
}

fclose($output);
$stmt->close();
cerrarConexion($conn);
exit;