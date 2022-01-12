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
    $tokenType = 'JWT';
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

function validateDetails($username, $pin) {
    $uName = trim($username);
    $uPin = trim($pin);

    if (empty($uName) || empty($uPin)) { return false; }

    $sql = "SELECT `UserName`, `UserPin` FROM `Users` WHERE `UserName` = ?";

    if (!$con = dbConnection()) { return false; }
    if (!$stmt = $con->prepare($sql)) { return false; }

    $stmt->bind_param("s", $uName);
    if (!$stmt->execute()) { return false; }

    $stmt->store_result();
    if ($stmt->num_rows !== 1) { return false; }

    $stmt->bind_result($resUserName, $resUserPin);
    if (!$stmt->fetch()) { return false; }

    if (!password_verify($uPin, $resUserPin)) { return false; }

    $stmt->close();
    $con->close();

    return true;
}

function loginResponse() {
    global $algorithm, $jwtAlgorithm, $tokenType, $secretKey;
    $_POST = json_decode(file_get_contents('php://input'), true);
    $username = $_POST['username'];
    $pin = $_POST['pin'];

    $validUser = validateDetails($username, $pin);

    if ($validUser) {

        $jwtHeader = base64url_encode(json_encode(array(
            "alg" => $jwtAlgorithm,
            "typ" => $tokenType
        )));

        $jwtPayload = base64url_encode(json_encode(array(
            "name" => $username
        )));

        $jwtSignature = base64url_encode(hash_hmac(
            $algorithm,
            "${jwtHeader}.${jwtPayload}",
            $secretKey,
            true
        ));

        $jwt = "${jwtHeader}.${jwtPayload}.${jwtSignature}";

        return $jwt;

    } else {

        http_response_code(404);
        return false;

    }
}

echo json_encode(loginResponse());

?>