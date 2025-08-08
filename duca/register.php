<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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
    
    // Validar datos de entrada
    if (!isset($input['nombre']) || !isset($input['email']) || !isset($input['password'])) {
        throw new Exception('Nombre, email y contraseña son requeridos');
    }
    
    $nombre = trim($input['nombre']);
    $email = trim($input['email']);
    $password = $input['password'];
    
    // Validaciones
    if (strlen($nombre) < 2) {
        throw new Exception('El nombre debe tener al menos 2 caracteres');
    }
    
    if (strlen($nombre) > 50) { // Cambiado de 100 a 50 según tu estructura de tabla
        throw new Exception('El nombre no puede tener más de 50 caracteres');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Formato de email inválido');
    }
    
    if (strlen($email) > 100) { // Validación adicional para el campo correo
        throw new Exception('El email no puede tener más de 100 caracteres');
    }
    
    if (strlen($password) < 6) {
        throw new Exception('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (strlen($password) > 255) {
        throw new Exception('La contraseña es demasiado larga');
    }
    
    // Verificar si el correo ya existe (usando 'correo' no 'email')
    $checkStmt = $pdo->prepare("SELECT id FROM usuarios WHERE correo = ?");
    $checkStmt->execute([$email]);
    
    if ($checkStmt->fetch()) {
        throw new Exception('El email ya está registrado');
    }
    
    // Encriptar contraseña
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Insertar nuevo usuario (usando nombres correctos de columnas)
    $stmt = $pdo->prepare("
        INSERT INTO usuarios (usuario, correo, contraseña) 
        VALUES (?, ?, ?)
    ");
    
    $stmt->execute([$nombre, $email, $hashedPassword]);
    
    // Obtener ID del usuario recién creado
    $userId = $pdo->lastInsertId();
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Usuario registrado exitosamente',
        'user_id' => $userId
    ]);
    
} catch (PDOException $e) {
    // Error de base de datos
    http_response_code(500);
    
    // Verificar si es error de duplicado de email
    if ($e->getCode() == 23000) {
        echo json_encode([
            'success' => false,
            'message' => 'El email ya está registrado'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error de base de datos: ' . $e->getMessage()
        ]);
    }
} catch (Exception $e) {
    // Otros errores
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>