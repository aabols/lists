<?php
// SET RESPONSE HEADERS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: X-Requested-With, Content-Type, Origin, Cache-Control, Pragma, Authorization, Accept, Accept-Encoding");
header("Content-Type: JSON");

// ERROR REPORTING
    // error_reporting(E_ALL);
    // ini_set('display_errors', 1);
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

function validatePayload($payload, $fieldNames) {
    foreach ($payload as $record) {
        foreach ($fieldNames as $field => $type) {
            if (!array_key_exists($field, $record)) return false;
            switch ($type) {
                case "s":
                    if (!is_string($record[$field])) return false;
                    break;
                case "i":
                    if (!is_numeric($record[$field])) return false;
                    break;
                default:
                    return false;
            }
        }
    }
    return true;
}

function selectRecords($user, $type, $filter) {
    if (!is_string($type)) return sendError(400, "Type not specified");
    $userName = $user['name'];
    $con = dbConnection();
    if (!$con) return sendError(503, "Database unavailable");

    switch ($type) {
        case "noun":
            $sql = "SELECT `Nouns`.`NounId` AS `id`,
                        `Nouns`.`Nom` AS `nom`,
                        `Nouns`.`Declension` AS `dec`,
                        `Nouns`.`English` AS `eng`,
                        `Nouns`.`Proper` AS `proper`
                    FROM `Nouns`";
            
            $stmt = $con->prepare($sql);
            if (!$stmt) {
                $con->close();
                return sendError(500, "Database error");
            }
            break;
        case "user":
            $sql = "SELECT `Users`.`UserName` AS `userName`
                    FROM `Users`
                    WHERE `Users`.`UserName` != ?";
            
            $stmt = $con->prepare($sql);
            if (!$stmt) {
                $con->close();
                return sendError(500, "Database error");
            }
            $stmt->bind_param("s", $userName);
            break;
        case "board":
            $sql = "SELECT `Boards`.`BoardId` AS `id`,
                        `Boards`.`BoardName` AS `caption`,
                        `Boards`.`ModifiedOn` AS `modified`,
                        `Boards`.`SeqNo` AS `seqNo`,
                        `Boards`.`Active` AS `active`
                    FROM `Boards`
                        LEFT JOIN `Permissions`
                            ON `Boards`.`BoardId` = `Permissions`.`ResourceId`
                    WHERE `Permissions`.`UserName` = ?
                        AND `Permissions`.`PermissionTypes` LIKE '%r%'
                        AND `Boards`.`Active` = 1";

            $stmt = $con->prepare($sql);
            if (!$stmt) {
                $con->close();
                return sendError(500, "Database error");
            }
            $stmt->bind_param("s", $userName);
            break;
        case "list":
            if (!is_string($filter)) return sendError(400, "Board not specified");

            $sql = "SELECT `Lists`.`ListId` AS `id`,
                        `Lists`.`ListName` AS `caption`,
                        `Lists`.`ModifiedOn` AS `modified`,
                        `Lists`.`SeqNo` AS `seqNo`,
                        `Lists`.`BoardId` AS `boardId`,
                        `Lists`.`Active` AS `active`
                    FROM `Lists`
                        LEFT JOIN `Boards`
                            ON `Lists`.`BoardId` = `Boards`.`BoardId`
                        LEFT JOIN `Permissions`
                            ON `Boards`.`BoardId` = `Permissions`.`ResourceId`
                    WHERE `Permissions`.`UserName` = ?
                        AND `Permissions`.`PermissionTypes` LIKE '%r%'
                        AND `Boards`.`BoardId` = ?
                        AND `Lists`.`Active` = 1";
            
            $stmt = $con->prepare($sql);
            if (!$stmt) {
                $con->close();
                return sendError(500, "Database error");
            }
            $stmt->bind_param("ss", $userName, $filter);
            break;
        case "item":
            if (!is_string($filter)) return sendError(400, "List not specified");

            $sql = "SELECT `Items`.`ItemId` AS `id`,
                        `Items`.`ItemName` AS `caption`,
                        `Items`.`ItemState` AS `checked`,
                        `Items`.`ListId` AS `listId`,
                        `Items`.`ModifiedOn` AS `modified`,
                        `Items`.`SeqNo` AS `seqNo`,
                        `Items`.`Active` AS `active`
                    FROM `Items`
                        LEFT JOIN `Lists`
                            ON `Items`.`ListId` = `Lists`.`ListId`
                        LEFT JOIN `Boards`
                            ON `Lists`.`BoardId` = `Boards`.`BoardId`
                        LEFT JOIN `Permissions`
                            ON `Boards`.`BoardId` = `Permissions`.`ResourceId`
                    WHERE `Permissions`.`UserName` = ?
                        AND `Permissions`.`PermissionTypes` LIKE '%r%'
                        AND `Lists`.`ListId` = ?
                        AND `Items`.`Active` = 1";

            $stmt = $con->prepare($sql);
            if (!$stmt) {
                $con->close();
                return sendError(500, "Database error");
            }
            $stmt->bind_param("ss", $userName, $filter);
            break;
        default:
            $con->close();
            return sendError(400, "Type not found");
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $records = Array();
    while ($resultRecord = mysqli_fetch_assoc($result)) {
        $records[] = $resultRecord;
    }

    echo json_encode($records);
    $stmt->close();
    $con->close();

}

function insertRecords($user, $type, $payload) {
    if (!is_string($type)) return sendError(400, "Type not specified");
    if (!is_array($payload)) return sendError(400, "No records provided");
    if (count($payload) < 1) return sendError(400, "No records provided");

    $userName = $user['name'];
    $con = dbConnection();
    if (!$con) return sendError(503, "Database unavailable");

    switch ($type) {
        case "noun":
            $payloadValid = validatePayload($payload, [
                'id' => 's',
                'nom' => 's',
                'dec' => 'i',
                'eng' => 's',
                'proper' => 'i'
            ]);
            if (!$payloadValid) {
                $con->close();
                return sendError(400, "Invalid record schema");
            }

            $sqlRecords = "INSERT INTO `Nouns` (
                            `NounId`,
                            `Nom`,
                            `Declension`,
                            `English`,
                            `Proper`
                            ) VALUES (?, ?, ?, ?, ?)";
            
            $recordId = null;
            $recordNom = null;
            $recordDeclension = null;
            $recordEnglish = null;
            $recordProper = null;

            $stmtRecords = $con->prepare($sqlRecords);
            if (!$stmtRecords) {
                $con->close();
                return sendError(500, "Database error");
            }

            $stmtRecords->bind_param(
                "ssisi",
                $recordId,
                $recordNom,
                $recordDeclension,
                $recordEnglish,
                $recordProper
            );
            $recordCount = 0;
            foreach ($payload as $record) {
                $recordId = $record['id'];
                $recordNom = $record['nom'];
                $recordDeclension = $record['dec'];
                $recordEnglish = $record['eng'];
                $recordProper = $record['proper'];
                if ($stmtRecords->execute()) {
                    $recordCount += 1;
                }
            }
            $stmtRecords->close();
            break;
        case "board":
            $payloadValid = validatePayload($payload, [
                'id' => 's',
                'caption' => 's',
                'modified' => 'i',
                'seqNo' => 'i'
            ]);
            if (!$payloadValid) {
                $con->close();
                return sendError(400, "Invalid record schema");
            }

            $sqlRecords = "INSERT INTO `Boards` (
                    `BoardId`,
                    `BoardName`,
                    `ModifiedOn`,
                    `SeqNo`
                ) VALUES (?, ?, ?, ?)";
            $sqlPermissions = "INSERT INTO `Permissions` (`ResourceId`, `UserName`, `PermissionTypes`) VALUES (?, ?, 'rwsd')";

            $recordId = null;
            $recordCaption = null;
            $recordModified = null;
            $recordSeqNo = null;

            $stmtRecords = $con->prepare($sqlRecords);
            if (!$stmtRecords) {
                $con->close();
                return sendError(500, "Database error");
            }
            $stmtPermissions = $con->prepare($sqlPermissions);
            if (!$stmtPermissions) {
                $stmtRecords->close();
                $con->close();
                return sendError(500, "Database error");
            }

            $stmtRecords->bind_param("ssii", $recordId, $recordCaption, $recordModified, $recordSeqNo);
            $stmtPermissions->bind_param("ss", $recordId, $userName);

            $recordCount = 0;
            foreach ($payload as $record) {
                $recordId = $record['id'];
                $recordCaption = $record['caption'];
                $recordModified = $record['modified'];
                $recordSeqNo = $record['seqNo'];
                if ($stmtRecords->execute() && $stmtPermissions->execute()) {
                    $recordCount += 1;
                }
            }
            $stmtRecords->close();
            $stmtPermissions->close();
            break;
        case "list":
            $payloadValid = validatePayload($payload, [
                'id' => 's',
                'caption' => 's',
                'boardId' => 's',
                'modified' => 'i',
                'seqNo' => 'i'
            ]);
            if (!$payloadValid) {
                $con->close();
                return sendError(400, "Invalid record schema");
            }

            $sqlRecords = "INSERT INTO `Lists` (`ListId`, `ListName`, `BoardId`, `ModifiedOn`, `SeqNo`) VALUES (?, ?, ?, ?, ?)";
            $sqlPermissions = "SELECT * FROM `Boards` LEFT JOIN `Permissions` ON `Boards`.`BoardId` = `Permissions`.`ResourceId` WHERE `Boards`.`BoardId` = ? AND `Permissions`.`UserName` = ? AND `Permissions`.`PermissionTypes` LIKE '%w%'";

            $recordId = null;
            $recordCaption = null;
            $recordBoardId = null;
            $recordModified = null;
            $recordSeqNo = null;

            $stmtRecords = $con->prepare($sqlRecords);
            if (!$stmtRecords) {
                $con->close();
                return sendError(500, "Database error");
            }
            $stmtPermissions = $con->prepare($sqlPermissions);
            if (!$stmtPermissions) {
                $stmtRecords->close();
                $con->close();
                return sendError(500, "Database error");
            }

            $stmtRecords->bind_param(
                "sssii",
                $recordId,
                $recordCaption,
                $recordBoardId,
                $recordModified,
                $recordSeqNo
            );
            $stmtPermissions->bind_param(
                "ss",
                $recordBoardId,
                $userName
            );

            $recordCount = 0;
            foreach ($payload as $record) {
                $recordId = $record['id'];
                $recordCaption = $record['caption'];
                $recordBoardId = $record['boardId'];
                $recordModified = $record['modified'];
                $recordSeqNo = $record['seqNo'];

                if ($stmtPermissions->execute()) {
                    $stmtPermissions->store_result();
                    if ($stmtPermissions->num_rows === 1) {
                        // user has write permissions for this Board
                        if ($stmtRecords->execute()) $recordCount += 1;
                    }
                }
            }
            $stmtRecords->close();
            $stmtPermissions->close();
            break;
        case "item":
            $payloadValid = validatePayload($payload, [
                'id' => 's',
                'caption' => 's',
                'checked' => 'i',
                'listId' => 's',
                'modified' => 'i',
                'seqNo' => 'i'
            ]);
            if (!$payloadValid) {
                $con->close();
                return sendError(400, "Invalid record schema");
            }

            $sqlRecords = "INSERT INTO `Items` (`ItemId`, `ItemName`, `ItemState`, `ListId`, `ModifiedOn`, `SeqNo`) VALUES (?, ?, ?, ?, ?, ?)";
            $sqlPermissions = "SELECT * FROM `Lists` LEFT JOIN `Permissions` ON `Lists`.`BoardId` = `Permissions`.`ResourceId` WHERE `Lists`.`ListId` = ? AND `Permissions`.`UserName` = ? AND `Permissions`.`PermissionTypes` LIKE '%w%'";

            $recordId = null;
            $recordCaption = null;
            $recordChecked = null;
            $recordListId = null;
            $recordModified = null;
            $recordSeqNo = null;

            $stmtRecords = $con->prepare($sqlRecords);
            if (!$stmtRecords) {
                $con->close();
                return sendError(500, "Database error");
            }
            $stmtPermissions = $con->prepare($sqlPermissions);
            if (!$stmtPermissions) {
                $stmtRecords->close();
                $con->close();
                return sendError(500, "Database error");
            }

            $stmtRecords->bind_param(
                "ssisii",
                $recordId,
                $recordCaption,
                $recordChecked,
                $recordListId,
                $recordModified,
                $recordSeqNo
            );
            $stmtPermissions->bind_param(
                "ss",
                $recordListId,
                $userName
            );

            $recordCount = 0;
            foreach ($payload as $record) {
                $recordId = $record['id'];
                $recordCaption = $record['caption'];
                $recordChecked = $record['checked'];
                $recordListId = $record['listId'];
                $recordModified = $record['modified'];
                $recordSeqNo = $record['seqNo'];

                if ($stmtPermissions->execute()) {
                    $stmtPermissions->store_result();
                    if ($stmtPermissions->num_rows === 1) {
                        // user has write permissions for this Board
                        if ($stmtRecords->execute()) $recordCount += 1;
                    }
                }
            }
            $stmtRecords->close();
            $stmtPermissions->close();
            break;
        default:
            $con->close();
            return sendError(400, "Type not found");
    }

    $con->close();
    if ($recordCount < 1) return sendError(400, "0 records inserted");
    echo "${recordCount} record(s) inserted";
}

function deleteRecords($user, $type, $payload) {
    if (!is_string($type)) return sendError(400, "Type not specified");
    if (!is_array($payload)) return sendError(400, "No records provided");
    if (count($payload) < 1) return sendError(400, "No records provided");

    $userName = $user['name'];
    $con = dbConnection();
    if (!$con) return sendError(503, "Database unavailable");

    switch ($type) {
        case "board":
            $sql = "DELETE B, L, I, P
                FROM `Boards` AS B
                LEFT JOIN `Lists` AS L
                    ON B.`BoardId` = L.`BoardId`
                LEFT JOIN `Items` AS I
                    ON L.`ListId` = I.`ListId`
                LEFT JOIN `Permissions` AS P
                    ON B.`BoardId` = P.`ResourceId`
                WHERE B.`BoardId` = ?
                    AND P.`UserName` = ?
                    AND P.`PermissionTypes` LIKE '%d%'";
            $idKey = 'id';
            break;
        case "list":
            $sql = "DELETE `Lists`, `Items`
                FROM `Lists`
                LEFT JOIN `Items`
                    ON `Lists`.`ListId` = `Items`.`ListId`
                LEFT JOIN `Permissions`
                    ON `Lists`.`BoardId` = `Permissions`.`ResourceId`
                WHERE `Lists`.`ListId` = ?
                    AND `Permissions`.`UserName` = ?
                    AND `Permissions`.`PermissionTypes` LIKE '%w%'";
            $idKey = 'id';
            break;
        case "item":
            $sql = "DELETE `Items`
                FROM `Items`
                LEFT JOIN `Lists`
                    ON `Items`.`ListId` = `Lists`.`ListId`
                LEFT JOIN `Permissions`
                    ON `Lists`.`BoardId` = `Permissions`.`ResourceId`
                WHERE `Items`.`ItemId` = ?
                    AND `Permissions`.`UserName` = ?
                    AND `Permissions`.`PermissionTypes` LIKE '%w%'";
            $idKey = 'id';
            break;
        default:
            $con->close();
            return sendError(400, "Type not found");
    }

    $payloadValid = validatePayload($payload, [
        $idKey => 's'
    ]);
    if (!$payloadValid) {
        $con->close();
        return sendError(400, "Invalid record schema");
    }

    $recordId = null;

    $stmt = $con->prepare($sql);
    if (!$stmt) {
        $con->close();
        return sendError(500, "Database error");
    }

    $stmt->bind_param("ss", $recordId, $userName);

    $recordCount = 0;
    foreach ($payload as $record) {
        $recordId = $record[$idKey];

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) $recordCount += 1;
        };
    }
    $stmt->close();
    $con->close();
    if ($recordCount < 1) return sendError(400, "0 records deleted");
    echo "${recordCount} record(s) deleted";
}

function updateRecords($user, $type, $payload) {
    if (!is_string($type)) return sendError(400, "Type not specified");
    if (!is_array($payload)) return sendError(400, "No records provided");
    if (count($payload) < 1) return sendError(400, "No records provided");

    $userName = $user['name'];
    $con = dbConnection();
    if (!$con) return sendError(503, "Database unavailable");

    switch ($type) {
        case "board":
            $payloadValid = validatePayload($payload, [
                'id' => 's',
                'caption' => 's',
                'modified' => 'i',
                'seqNo' => 'i',
                'active' => 'i'
            ]);
            if (!$payloadValid) {
                $con->close();
                return sendError(400, "Invalid record schema");
            }

            $sql = "UPDATE `Boards`
                    LEFT JOIN `Permissions`
                        ON `Boards`.`BoardId` = `Permissions`.`ResourceId`
                    SET `Boards`.`BoardName` = ?,
                        `Boards`.`ModifiedOn` = ?,
                        `Boards`.`SeqNo` = ?,
                        `Boards`.`Active` = ?
                    WHERE `Boards`.`BoardId` = ?
                        AND `Permissions`.`UserName` = ?
                        AND `Permissions`.`PermissionTypes` LIKE '%w%'";
            
            $recordId = null;
            $recordCaption = null;
            $recordModified = null;
            $recordSeqNo = null;
            $recordActive = null;

            $stmt = $con->prepare($sql);
            if (!$stmt) {
                $con->close();
                return sendError(500, "Database error");
            }

            $stmt->bind_param(
                "siiiss",
                $recordCaption,
                $recordModified,
                $recordSeqNo,
                $recordActive,
                $recordId,
                $userName
            );

            $recordCount = 0;
            foreach ($payload as $record) {
                $recordId = $record['id'];
                $recordCaption = $record['caption'];
                $recordModified = $record['modified'];
                $recordSeqNo = $record['seqNo'];
                $recordActive = $record['active'];

                if ($stmt->execute()) $recordCount += $stmt->affected_rows;
            }
            $stmt->close();
            break;
        case "list":
            $payloadValid = validatePayload($payload, [
                'id' => 's',
                'caption' => 's',
                'boardId' => 's',
                'modified' => 'i',
                'seqNo' => 'i',
                'active' => 'i'
            ]);
            if (!$payloadValid) {
                $con->close();
                return sendError(400, "Invalid record schema");
            }

            $sqlRecords = "UPDATE `Lists`
                    LEFT JOIN `Permissions`
                        ON `Lists`.`BoardId` = `Permissions`.`ResourceId`
                    SET `Lists`.`ListName` = ?,
                        `Lists`.`BoardId` = ?,
                        `Lists`.`ModifiedOn` = ?,
                        `Lists`.`SeqNo` = ?,
                        `Lists`.`Active` = ?
                    WHERE `Lists`.`ListId` = ?
                        AND `Permissions`.`UserName` = ?
                        AND `Permissions`.`PermissionTypes` LIKE '%w%'";
            $sqlPermissions = "SELECT * FROM `Permissions`
                    WHERE `Permissions`.`ResourceId` = ?
                        AND `Permissions`.`UserName` = ?
                        AND `Permissions`.`PermissionTypes` LIKE '%w%'";
            
            $recordId = null;
            $recordCaption = null;
            $recordBoardId = null;
            $recordModified = null;
            $recordSeqNo = null;
            $recordActive = null;

            $stmtRecords = $con->prepare($sqlRecords);
            if (!$stmtRecords) {
                $con->close();
                return sendError(500, "Database error");
            }
            $stmtPermissions = $con->prepare($sqlPermissions);
            if (!$stmtPermissions) {
                $stmtRecords->close();
                $con->close();
                return sendError(500, "Database error");
            }

            $stmtRecords->bind_param(
                "ssiiiss",
                $recordCaption,
                $recordBoardId,
                $recordModified,
                $recordSeqNo,
                $recordActive,
                $recordId,
                $userName
            );
            $stmtPermissions->bind_param(
                "ss",
                $recordBoardId,
                $userName
            );

            $recordCount = 0;
            foreach ($payload as $record) {
                $recordId = $record['id'];
                $recordCaption = $record['caption'];
                $recordBoardId = $record['boardId'];
                $recordModified = $record['modified'];
                $recordSeqNo = $record['seqNo'];
                $recordActive = $record['active'];

                if ($stmtPermissions->execute()) {
                    $stmtPermissions->store_result();
                    if ($stmtPermissions->num_rows === 1) {
                        // user has write permissions for target Board
                        if ($stmtRecords->execute()) $recordCount += $stmtRecords->affected_rows;
                    }
                }
            }
            $stmtRecords->close();
            $stmtPermissions->close();
            break;
        case "item":
            $payloadValid = validatePayload($payload, [
                'id' => 's',
                'caption' => 's',
                'checked' => 'i',
                'listId' => 's',
                'modified' => 'i',
                'seqNo' => 'i',
                'active' => 'i'
            ]);
            if (!$payloadValid) {
                $con->close();
                return sendError(400, "Invalid record schema");
            }

            $sqlRecords = "UPDATE `Items`
                    LEFT JOIN `Lists`
                        ON `Items`.`ListId` = `Lists`.`ListId`
                    LEFT JOIN `Permissions`
                        ON `Lists`.`BoardId` = `Permissions`.`ResourceId`
                    SET `Items`.`ItemName` = ?,
                        `Items`.`ItemState` = ?,
                        `Items`.`ListId` = ?,
                        `Items`.`ModifiedOn` = ?,
                        `Items`.`SeqNo` = ?,
                        `Items`.`Active` = ?
                    WHERE `Items`.`ItemId` = ?
                        AND `Permissions`.`UserName` = ?
                        AND `Permissions`.`PermissionTypes` LIKE '%w%'";
            $sqlPermissions = "SELECT * FROM `Lists`
                            LEFT JOIN `Permissions`
                                ON `Lists`.`BoardId` = `Permissions`.`ResourceId`
                            WHERE `Lists`.`ListId` = ?
                                AND `Permissions`.`UserName` = ?
                                AND `Permissions`.`PermissionTypes` LIKE '%w%'";
            
            $recordId = null;
            $recordCaption = null;
            $recordChecked = null;
            $recordListId = null;
            $recordModified = null;
            $recordSeqNo = null;
            $recordActive = null;

            $stmtRecords = $con->prepare($sqlRecords);
            if (!$stmtRecords) {
                $con->close();
                return sendError(500, "Database error");
            }
            $stmtPermissions = $con->prepare($sqlPermissions);
            if (!$stmtPermissions) {
                $stmtRecords->close();
                $con->close();
                return sendError(500, "Database error");
            }

            $stmtRecords->bind_param(
                "sisiiiss",
                $recordCaption,
                $recordChecked,
                $recordListId,
                $recordModified,
                $recordSeqNo,
                $recordActive,
                $recordId,
                $userName
            );
            $stmtPermissions->bind_param(
                "ss",
                $recordListId,
                $userName
            );

            $recordCount = 0;
            foreach ($payload as $record) {
                $recordId = $record['id'];
                $recordCaption = $record['caption'];
                $recordChecked = $record['checked'];
                $recordListId = $record['listId'];
                $recordModified = $record['modified'];
                $recordSeqNo = $record['seqNo'];
                $recordActive = $record['active'];

                if ($stmtPermissions->execute()) {
                    $stmtPermissions->store_result();
                    if ($stmtPermissions->num_rows === 1) {
                        // user has permissions for target Board
                        if ($stmtRecords->execute()) $recordCount += $stmtRecords->affected_rows;
                    }
                }
            }
            $stmtRecords->close();
            $stmtPermissions->close();
            break;
        default:
            $con->close();
            return sendError(400, "Type not found");
    }

    $con->close();
    if ($recordCount < 1) return sendError(400, "0 records updated");
    echo "${recordCount} record(s) updated";
}

$_POST = json_decode(file_get_contents('php://input'), true);

$jwt = $_POST['jwt'];
$action = $_POST['action'];
$type = $_POST['type'];
$filter = $_POST['filter'];
$payload = $_POST['payload'];

if ($type === 'noun' && $action === 'select') return selectRecords(['name' => 'guest'], $type, '');

if (!$jwt) return sendError(401, "No authorisation");

$user = validateToken($jwt); // {name: ""}
if (!$user) return sendError(401, "No authorisation");

if (!$action) return sendError(400, "No action specified");

if (!$type) return sendError(400, "No type specified");

if ($action === 'select') return selectRecords($user, $type, $filter);
if ($action === 'insert') return insertRecords($user, $type, $payload);
if ($action === 'delete') return deleteRecords($user, $type, $payload);
if ($action === 'update') return updateRecords($user, $type, $payload);

return sendError(400, "Unknown action");

?>