<?php
/**
 * ============================================================================
 * EDITAR CONTACTO EXISTENTE
 * ============================================================================
 */

session_start();
require_once 'conexion.php';

header('Content-Type: application/json');

// Verificar sesión
if (!isset($_SESSION['logueado']) || !$_SESSION['logueado']) {
    echo json_encode([
        'success' => false,
        'message' => 'Sesión no válida'
    ]);
    exit;
}

// Verificar método POST
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Obtener datos
$id = (int)($_POST['id'] ?? 0);
$nombre = trim($_POST['nombre'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$email = trim($_POST['email'] ?? '');
$fecha_cumple = trim($_POST['fecha_cumple'] ?? '');
$correo_usuario = $_SESSION['email'];

// ============================================================================
// VALIDACIONES
// ============================================================================

if ($id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de contacto inválido'
    ]);
    exit;
}

if (empty($nombre)) {
    echo json_encode([
        'success' => false,
        'message' => 'El nombre es obligatorio'
    ]);
    exit;
}

// Validar email si se proporcionó
if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'success' => false,
        'message' => 'El formato del email no es válido'
    ]);
    exit;
}

// ============================================================================
// ACTUALIZAR CONTACTO
// ============================================================================

$conn = obtenerConexion();

if (!$conn) {
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión'
    ]);
    exit;
}

// Preparar valores (convertir vacíos a NULL)
$telefono = !empty($telefono) ? $telefono : null;
$email = !empty($email) ? $email : null;
$fecha_cumple = !empty($fecha_cumple) ? $fecha_cumple : null;

// IMPORTANTE: Verificar que el contacto pertenece al usuario logueado
$stmt = $conn->prepare("
    UPDATE contacto 
    SET nombre = ?, telefono = ?, correo = ?, FCumple = ?
    WHERE id = ? AND correo_usuario = ?
");

$stmt->bind_param("ssssIs", $nombre, $telefono, $email, $fecha_cumple, $id, $correo_usuario);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        $stmt->close();
        cerrarConexion($conn);
        
        echo json_encode([
            'success' => true,
            'message' => 'Contacto actualizado exitosamente'
        ]);
    } else {
        $stmt->close();
        cerrarConexion($conn);
        
        echo json_encode([
            'success' => false,
            'message' => 'No se encontró el contacto o no tienes permisos'
        ]);
    }
} else {
    $stmt->close();
    cerrarConexion($conn);
    
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar contacto'
    ]);
}