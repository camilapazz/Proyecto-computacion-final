<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dulcami";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $productora = isset($_GET['productora']) ? trim($_GET['productora']) : '';
    $orderBy = isset($_GET['order']) ? $_GET['order'] : 'id';
    $orderDirection = isset($_GET['direction']) ? strtoupper($_GET['direction']) : 'ASC';

    // Solo campos válidos de tu tabla
    $allowedOrderFields = ['id', 'titulo', 'casa_productora', 'presupuesto', 'director_id'];
    if (!in_array($orderBy, $allowedOrderFields)) {
        $orderBy = 'id';
    }

    if (!in_array($orderDirection, ['ASC', 'DESC'])) {
        $orderDirection = 'ASC';
    }

    // Base SQL
    $sql = "SELECT id, titulo, casa_productora, presupuesto, director_id, actores
            FROM peliculas
            WHERE 1=1";

    $params = [];

    if (!empty($search)) {
        $sql .= " AND titulo LIKE ?";
        $params[] = "%$search%";
    }

    if (!empty($productora)) {
        $sql .= " AND casa_productora = ?";
        $params[] = $productora;
    }

    $sql .= " ORDER BY $orderBy $orderDirection";

    if ($limit !== null) {
        $sql .= " LIMIT " . intval($limit);
        if ($offset > 0) {
            $sql .= " OFFSET " . intval($offset);
        }
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $peliculas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Conteo total
    $countSql = "SELECT COUNT(*) as total FROM peliculas WHERE 1=1";
    $countParams = [];

    if (!empty($search)) {
        $countSql .= " AND titulo LIKE ?";
        $countParams[] = "%$search%";
    }

    if (!empty($productora)) {
        $countSql .= " AND casa_productora = ?";
        $countParams[] = $productora;
    }

    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($countParams);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    $peliculasFormateadas = array_map(function ($p) {
        return [
            'id' => (int)$p['id'],
            'titulo' => $p['titulo'],
            'casa_productora' => $p['casa_productora'],
            'presupuesto' => $p['presupuesto'] ? (float)$p['presupuesto'] : null,
            'director_id' => $p['director_id'],
            'actores' => $p['actores']
        ];
    }, $peliculas);

    echo json_encode([
        'success' => true,
        'message' => 'Películas obtenidas exitosamente',
        'peliculas' => $peliculasFormateadas,
        'total' => (int)$totalCount,
        'count' => count($peliculasFormateadas),
        'filters' => [
            'search' => $search,
            'productora' => $productora,
            'order_by' => $orderBy,
            'order_direction' => $orderDirection,
            'limit' => $limit,
            'offset' => $offset
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Error inesperado: ' . $e->getMessage()
    ]);
}
?>
