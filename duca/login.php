<?php
// Habilitar reporte de errores para debug
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Configuración de la base de datos
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dulcami";

try {
    // Crear conexión PDO
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Obtener datos del request
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Debug: Log de datos recibidos
    error_log('Datos recibidos: ' . print_r($input, true));
    
    // Validar datos de entrada
    if (!isset($input['email']) || !isset($input['password'])) {
        throw new Exception('Email y contraseña son requeridos');
    }
    
    $email = trim($input['email']);
    $password = $input['password'];
    
    // Validar formato de email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Formato de email inválido');
    }
    
    // Buscar usuario por correo (usando los nombres correctos de columnas)
    $stmt = $pdo->prepare("SELECT id, usuario, correo, contraseña FROM usuarios WHERE correo = ?");
    $stmt->execute([$email]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$usuario) {
        // Para debug: verificar si hay usuarios en la tabla
        $countStmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios");
        $totalUsers = $countStmt->fetch()['total'];
        
        throw new Exception("Usuario no encontrado. Total usuarios en DB: $totalUsers");
    }
    
    // Verificar contraseña
    if (!password_verify($password, $usuario['contraseña'])) {
        throw new Exception('Contraseña incorrecta');
    }
    
    // Actualizar último acceso (opcional)
    // $updateStmt = $pdo->prepare("UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?");
    // $updateStmt->execute([$usuario['id']]);
    
    // Preparar datos del usuario para la respuesta
    $userData = [
        'id' => $usuario['id'],
        'nombre' => $usuario['usuario'], // La columna 'usuario' contiene el nombre
        'email' => $usuario['correo']    // La columna 'correo' contiene el email
    ];
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'user' => $userData
    ]);
    
} catch (PDOException $e) {
    // Error de base de datos
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // Otros errores
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>