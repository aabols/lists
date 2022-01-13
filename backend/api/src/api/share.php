<?php
// SET RESPONSE HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding");
header("Content-Type: JSON");

// ERROR REPORTING  
    //error_reporting(E_ALL);
    //ini_set('display_errors', 1);
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

function sendError($errCode, $errMessage) {
    http_response_code($errCode);
    echo $errMessage;
}

function validateToken($jwt) {
    global $algorithm, $secretKey;
    $tokenSplit = explode('.', $jwt);
    if (count($tokenSplit) !== 3) return null;

    $jwtHeader = $tokenSplit[0];
    $jwtPayload = $tokenSplit[1];
    $jwtSignature = $tokenSplit[2];
    if (!$jwtHeader || !$jwtPayload || !$jwtSignature) return null;

    $jwtSignatureCheck = base64url_encode(hash_hmac($algorithm, "${jwtHeader}.${jwtPayload}", $secretKey, true));
    if ($jwtSignature !== $jwtSignatureCheck) return null;

    $user = json_decode(base64url_decode($jwtPayload), true);
    return $user;
}

function getResourcePermissions($resourceId) {
    $con = dbConnection();
    if (!$con) return sendError(503, "Database unavailable");

    $stmt = $con->prepare("SELECT `ResourceId`, `UserName`, `PermissionTypes` FROM `Permissions` WHERE `ResourceId` = ?");
    if (!$stmt) return sendError(500, "Database error");

    $stmt->bind_param("s", $resourceId);
    if (!$stmt->execute()) return sendError(500, "Database error");
    $res = $stmt->get_result();

    $records = Array();
    while ($resRecord = mysqli_fetch_assoc($res)) {
        $records[] = $resRecord;
    }

    $stmt->close();
    $con->close();

    return $records;
}

function getUserPermissions($resourceId, $userName) {
    $con = dbConnection();
    if (!$con) return sendError(503, "Database unavailable");

    $stmt = $con->prepare("SELECT `PermissionTypes` FROM `Permissions` WHERE `ResourceId` = ? AND `UserName` = ?");
    if (!$stmt) return sendError(500, "Database error");

    $stmt->bind_param("ss", $resourceId, $userName);
    if (!$stmt->execute()) return sendError(500, "Database error");
    $stmt->store_result();

    if ($stmt->num_rows !== 1) return null;

    $stmt->bind_result($resultPermissions);
    $stmt->fetch();

    $stmt->close();
    $con->close();
    
    return $resultPermissions;
}

function validUserName($userName) {
    $con = dbConnection();
    if (!$con) return sendError(503, "Database unavailable");

    $stmt = $con->prepare("SELECT `UserName` FROM `Users` WHERE `UserName` = ?");
    if (!$stmt) {
        $con->close();
        return sendError(500, "Database error");
    }

    $stmt->bind_param("s", $userName);
    if (!$stmt->execute()) {
        $con->close();
        return sendError(500, "Database error");
    }
    $stmt->store_result();

    if ($stmt->num_rows === 1) {
        $stmt->close();
        $con->close();
        return true;
    }

    $stmt->close();
    $con->close();

    return false;
}

if (!function_exists('str_contains')) {
    function str_contains($haystack, $needle) {
        return $needle !== '' && mb_strpos($haystack, $needle) !== false;
    }
}

function shareResource($resourceId, $userName) {
    $permissionString = "rwsd";
    $userPermissions = getUserPermissions($resourceId, $userName);
    if (!!$userPermissions) return sendError(409, "User already has access");

    $con = dbConnection();
    if (!$con) return sendError(503, "Database unavailable");

    $stmt = $con->prepare("INSERT INTO `Permissions` (`ResourceId`, `UserName`, `PermissionTypes`) VALUES (?, ?, ?)");
    if (!$stmt) {
        $con->close();
        return sendError(500, "Database error");
    }

    $stmt->bind_param("sss", $resourceId, $userName, $permissionString);
    if (!$stmt->execute()) {
        $con->close();
        return sendError(500, "Database error");
    }

    $stmt->close();
    $con->close();

    echo "Shared with ${userName}";
}

function unshareResource($resourceId, $userName) {
    $userPermissions = getUserPermissions($resourceId, $userName);
    if (!$userPermissions) return sendError(409, "User already doesn't have access");

    $con = dbConnection();
    if (!$con) return sendError(503, "Database unavailable");

    $stmt = $con->prepare("DELETE FROM `Permissions` WHERE `ResourceId` = ? AND `UserName` = ?");
    if (!$stmt) {
        $con->close();
        return sendError(500, "Database error");
    }

    $stmt->bind_param("ss", $resourceId, $userName);
    if (!$stmt->execute()) {
        $con->close();
        return sendError(500, "Database error");
    }

    $stmt->close();
    $con->close();

    echo "Unshared with ${userName}";
}

function resourceOwners($resourceId) {
    $con = dbConnection();
    if (!$con) return sendError(503, "Database unavailable");

    $stmt = $con->prepare("SELECT `UserName` FROM `Permissions` WHERE `ResourceId` = ?");
    if (!$stmt) {
        $con->close();
        return sendError(500, "Database error");
    }

    $stmt->bind_param("s", $resourceId);
    if (!$stmt->execute()) {
        $con->close();
        return sendError(500, "Database error");
    }

    $stmt->store_result();
    $stmt->bind_result($resUserName);

    $owners = Array();
    while ($stmt->fetch()) {
        $owners[] = $resUserName;
    }

    $stmt->close();
    $con->close();

    echo json_encode($owners);
}

$_POST = json_decode(file_get_contents('php://input'), true);

$jwt = $_POST['jwt'];
if (!$jwt) return sendError(401, "No authorisation");

$user = validateToken($jwt); // {name: ""}
if (!$user) return sendError(401, "No authorisation");

$action = $_POST['action'];
if (!$action) return sendError(400, "No action specified");

$resourceId = $_POST['resourceId'];
if (!$resourceId) return sendError(400, "No resource specified");

$userPermissions = getUserPermissions($resourceId, $user['name']); // "rwsd"
if (!$userPermissions) return sendError(401, "No authorisation");
if ($action === 'share' && !str_contains($userPermissions, 's')) return sendError(401, "No authorisation");
if ($action === 'unshare' && !str_contains($userPermissions, 's')) return sendError(401, "No authorisation");
if ($action === 'view' && !str_contains($userPermissions, 'r')) return sendError(401, "No authorisation");

if ($action === 'view') return resourceOwners($resourceId);

$userName = $_POST['userName'];
if (!$userName) return sendError(400, "No user specified");

if (!validUserName($userName)) return sendError(404, "User not found");

if ($action === 'share') return shareResource($resourceId, $userName);
if ($action === 'unshare') return unshareResource($resourceId, $userName);

return sendError(400, "Unknown action");

?>