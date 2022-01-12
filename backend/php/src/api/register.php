<?php
// SET RESPONSE HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding");
header("Content-Type: JSON");

// ERROR REPORTING  
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
//

// DB CREDENTIALS  
    $host_name = '';
    $database = '';
    $user_name = '';
    $password = '';
//

// JWT DETAILS
$algorithm = 'sha256';
$jwtAlgorithm = 'HS256';
$secretKey = 'hmmm I guess this should be a reasonably complicated string of text yes? Maybe with some numbers like 99944273 and symbols like ^*()()(£££ as well? Just to be safe maybe I will repeat it a couple times: hmmm I guess this should be a reasonably complicated string of text yes? Maybe with some numbers like 99944273 and symbols like ^*()()(£££ as well? Just to be safe maybe I will repeat it a couple times: hmmm I guess this should be a reasonably complicated string of text yes? Maybe with some numbers like 999454273 and symbols like ^*()()(£££ as well? Just to be safe maybe I will repeat it a couple times: ';
//

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function base64url_decode($data) {
    return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
}
function dbConnection() {
    global $host_name, $database, $user_name, $password;
    return new mysqli($host_name, $user_name, $password, $database);
}

function validateUsername($username) {
    $uName = trim($username);

    if (empty($uName)) { return false; }

    if (!preg_match('/^[a-zA-Z0-9_]+$/', $uName)) { return false; }

    $sql = "SELECT `UserName` FROM `Users` WHERE `UserName` = ?";
    if (!$con = dbConnection()) { return false; }
    if (!$stmt = $con->prepare($sql)) { return false; }

    $stmt->bind_param("s", $uName);
    if (!$stmt->execute()) { return false; }

    $stmt->store_result();
    if ($stmt->num_rows == 1) { return false; }

    return true;
}

function validatePin($pin) {
    $uPin = trim($pin);

    if (empty($uPin)) { return false; }

    if (strlen($uPin) < 4) { return false; }

    if (!preg_match('/^[0-9]+$/', $uPin)) { return false; }

    return true;
}

function validateConfirmation($confirmPin, $pin) {
    $uPin = trim($pin);
    $uConf = trim($confirmPin);

    if ($uPin !== $uConf) { return false; }

    return true;
}

function registerResponse() {
    $_POST = json_decode(file_get_contents('php://input'), true);
    $username = $_POST['username'];
    $pin = $_POST['pin'];
    $confirmPin = $_POST['confirmPin'];

    $validUsername = validateUsername($username);
    if (!$validUsername) {
        http_response_code(409);
        return false;
    }

    $validPin = validatePin($pin);
    if (!$validPin) {
        http_response_code(400);
        return false;
    }

    $validConfirmation = validateConfirmation($confirmPin, $pin);
    if (!$validConfirmation) {
        http_response_code(400);
        return false;
    }

    $uName = trim($username);
    $uPin = trim($pin);
    $pinHash = password_hash($uPin, PASSWORD_DEFAULT);

    $sql = "INSERT INTO `Users` (`UserName`, `UserPin`) VALUES (?, ?)";

    if (!$con = dbConnection()) {
        http_response_code(500);
        return false;
    }
    if (!$stmt = $con->prepare($sql)) {
        http_response_code(500);
        return false;
    }

    $stmt->bind_param("ss", $uName, $pinHash);
    if (!$stmt->execute()) {
        http_response_code(500);
        return false;
    }
    
    return true;
}

echo json_encode(registerResponse());

?>