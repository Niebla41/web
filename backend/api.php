<?php
require_once 'config.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Max-Age: 3600");

// Validar clave API (opcional pero recomendado)
if (!isset($_GET['apikey']) || $_GET['apikey'] !== API_KEY) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

// Conexión a la base de datos de productos
$products_db = new mysqli(PRODUCTS_DB_HOST, PRODUCTS_DB_USER, PRODUCTS_DB_PASS, PRODUCTS_DB_NAME);
if ($products_db->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de productos']);
    exit;
}

// Conexión a la base de datos de registros
$records_db = new mysqli(RECORDS_DB_HOST, RECORDS_DB_USER, RECORDS_DB_PASS, RECORDS_DB_NAME);
if ($records_db->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de registros']);
    exit;
}

// Obtener la acción solicitada
$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($action) {
        case 'get_product':
            if ($method !== 'GET') {
                http_response_code(405);
                echo json_encode(['error' => 'Método no permitido']);
                break;
            }
            
            $code = $products_db->real_escape_string($_GET['code'] ?? '');
            $query = "SELECT * FROM products WHERE code = '$code' LIMIT 1";
            $result = $products_db->query($query);
            
            if ($result && $result->num_rows > 0) {
                echo json_encode($result->fetch_assoc());
            } else {
                echo json_encode(['error' => 'Producto no encontrado']);
            }
            break;
            
        case 'get_next_sequential':
            if ($method !== 'GET') {
                http_response_code(405);
                echo json_encode(['error' => 'Método no permitido']);
                break;
            }
            
            $month = $records_db->real_escape_string($_GET['month'] ?? '');
            $product_code = $records_db->real_escape_string($_GET['product_code'] ?? '');
            
            $query = "SELECT MAX(SUBSTRING(code, -2)) AS last_seq FROM activities 
                     WHERE month = '$month' AND product_code = '$product_code'";
            $result = $records_db->query($query);
            
            $next = 1;
            if ($result && $row = $result->fetch_assoc()) {
                $next = intval($row['last_seq']) + 1;
            }
            
            echo json_encode(['nextSequential' => $next]);
            break;
            
        case 'get_records':
            if ($method !== 'GET') {
                http_response_code(405);
                echo json_encode(['error' => 'Método no permitido']);
                break;
            }
            
            $limit = intval($_GET['limit'] ?? 100);
            $query = "SELECT * FROM activities ORDER BY timestamp DESC LIMIT $limit";
            $result = $records_db->query($query);
            
            $records = [];
            while ($row = $result->fetch_assoc()) {
                $records[] = $row;
            }
            
            echo json_encode($records);
            break;
            
        case 'save_record':
            if ($method !== 'POST') {
                http_response_code(405);
                echo json_encode(['error' => 'Método no permitido']);
                break;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                http_response_code(400);
                echo json_encode(['error' => 'Datos inválidos']);
                break;
            }
            
            // Validar y sanitizar datos
            $required = ['date', 'time', 'code', 'product', 'duration', 'option', 'month', 'productCode'];
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    http_response_code(400);
                    echo json_encode(['error' => "Campo $field es requerido"]);
                    exit;
                }
            }
            
            $stmt = $records_db->prepare("INSERT INTO activities 
                (date, time, code, product, duration, `option`, month, product_code, timestamp) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, UNIX_TIMESTAMP())");
            
            $stmt->bind_param("ssssssss", 
                $data['date'], $data['time'], $data['code'], 
                $data['product'], $data['duration'], $data['option'],
                $data['month'], $data['productCode']);
            
            if ($stmt->execute()) {
                echo json_encode(['status' => 'success', 'id' => $stmt->insert_id]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Error al guardar registro']);
            }
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Acción no válida']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
} finally {
    $products_db->close();
    $records_db->close();
}
?>