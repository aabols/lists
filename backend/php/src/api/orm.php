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

// TABLE SCHEMAS
    $tableSchemas = [
        "Flashcards" => [
            "CardId" => [
                "pk" => true,
                "null" => false,
                "type" => "s",
                "filter" => false
            ],
            "CardDefinition" => [
                "pk" => false,
                "null" => false,
                "type" => "s",
                "filter" => false
            ]
        ],
        "Boards" => [
            "BoardId" => [
                "pk" => true,
                "null" => false,
                "type" => "s",
                "filter" => true
            ],
            "BoardName" => [
                "pk" => false,
                "null" => false,
                "type" => "s",
                "filter" => false
            ],
            "ModifiedOn" => [
                "pk" => false,
                "null" => false,
                "type" => "i",
                "filter" => false
            ],
            "SeqNo" => [
                "pk" => false,
                "null" => false,
                "type" => "i",
                "filter" => false
            ]
        ],
        "Lists" => [
            "ListId" => [
                "pk" => true,
                "null" => false,
                "type" => "s",
                "filter" => false
            ],
            "ListName" => [
                "pk" => false,
                "null" => false,
                "type" => "s",
                "filter" => false
            ],
            "BoardId" => [
                "pk" => false,
                "null" => false,
                "type" => "s",
                "filter" => true
            ],
            "ModifiedOn" => [
                "pk" => false,
                "null" => false,
                "type" => "i",
                "filter" => false
            ],
            "SeqNo" => [
                "pk" => false,
                "null" => false,
                "type" => "i",
                "filter" => false
            ]
        ],
        "Items" => [
            "ItemId" => [
                "pk" => true,
                "null" => false,
                "type" => "s",
                "filter" => false
            ],
            "ItemName" => [
                "pk" => false,
                "null" => false,
                "type" => "s",
                "filter" => false
            ],
            "ItemState" => [
                "pk" => false,
                "null" => false,
                "type" => "i",
                "filter" => false
            ],
            "ListId" => [
                "pk" => false,
                "null" => false,
                "type" => "s",
                "filter" => true
            ],
            "ModifiedOn" => [
                "pk" => false,
                "null" => false,
                "type" => "i",
                "filter" => false
            ],
            "SeqNo" => [
                "pk" => false,
                "null" => false,
                "type" => "i",
                "filter" => false
            ]
        ]
    ];
//

// OBJECT MAPPINGS
    $objectMappings = [
        "flashcard" => [
            "table" => "Flashcards",
            "fields" => [
                "id" => "CardId",
                "def" => "CardDefinition"
            ]
        ],
        "board" => [
            "table" => "Boards",
            "fields" => [
                "id" => "BoardId",
                "caption" => "BoardName",
                "modified" => "ModifiedOn",
                "seqNo" => "SeqNo"
            ],
            "filter" => "BoardId"
        ],
        "list" => [
            "table" => "Lists",
            "fields" => [
                "id" => "ListId",
                "caption" => "ListName",
                "boardId" => "BoardId",
                "modified" => "ModifiedOn",
                "seqNo" => "SeqNo"
            ],
            "filter" => "BoardId"
        ],
        "item" => [
            "table" => "Items",
            "fields" => [
                "id" => "ItemId",
                "caption" => "ItemName",
                "checked" => "ItemState",
                "listId" => "ListId",
                "modified" => "ModifiedOn",
                "seqNo" => "SeqNo"
            ],
            "filter" => "ListId"
        ]
    ];
//

function dbConnection() {
    global $host_name, $database, $user_name, $password;
    return new mysqli($host_name, $user_name, $password, $database);
}

function nonKeyFields($tableName) {
    global $tableSchemas;
    $columnSchemas = $tableSchemas[$tableName];

    return array_keys(array_filter(
        $columnSchemas,
        function($v, $k){
            return !($v["pk"]);
        },
        ARRAY_FILTER_USE_BOTH
    ));
}

function keyFields($tableName) {
    global $tableSchemas;
    $columnSchemas = $tableSchemas[$tableName];

    return array_keys(array_filter(
        $columnSchemas,
        function($v, $k){
            return ($v["pk"]);
        },
        ARRAY_FILTER_USE_BOTH
    ));
}

function filterFields($tableName) {
    global $tableSchemas;
    $columnSchemas = $tableSchemas[$tableName];

    return array_keys(array_filter(
        $columnSchemas,
        function($v, $k){
            return ($v["filter"]);
        },ARRAY_FILTER_USE_BOTH
    ));
}

function createUpdateQuery($tableName) {
    $nonKeyColumnNames = nonKeyFields($tableName);

    $keyColumnNames = keyFields($tableName);

    $setPart = "`" . implode("` = ?, `", $nonKeyColumnNames) . "` = ?";
    $wherePart = "`" . implode("` = ? AND `", $keyColumnNames) . "` = ?";

    return "UPDATE `${tableName}` SET ${setPart} WHERE ${wherePart}";
}

function createInsertQuery($tableName) {
    $columnNames = array_merge(keyFields($tableName), nonKeyFields($tableName));

    $columnPart = "`" . implode("`, `", $columnNames) . "`";
    $valuesPart = "?" . str_repeat(", ?", count($columnNames) - 1);

    return "INSERT INTO `${tableName}` (${columnPart}) VALUES (${valuesPart})";
}

function createDeleteQuery($tableName) {
    $columnNames = keyFields($tableName);

    $wherePart = "`" . implode("` = ? AND `", $columnNames) . "` = ?";

    return "DELETE FROM `${tableName}` WHERE ${wherePart}";
}

function createSelectQuery($tableName) {
    $columnNames = array_merge(keyFields($tableName), nonKeyFields($tableName));
    $filterColumnNames = filterFields($tableName);

    $columnPart = "`" . implode("`, `", $columnNames) . "`";

    $wherePart = "`" . implode("` LIKE ? AND `", $filterColumnNames) . "` LIKE ?";

    return "SELECT ${columnPart} FROM `${tableName}` WHERE ${wherePart}";
}

function createUpdateBindTypes($tableName) {
    global $tableSchemas;
    $columnSchemas = $tableSchemas[$tableName];
    $nonKeyBindTypes = array_map(
        function($v){
            if(!$v["pk"]) {return $v["type"];}
        },
        $columnSchemas
    );
    $keyBindTypes = array_map(
        function($v){
            if($v["pk"]) {return $v["type"];}
        },
        $columnSchemas
    );

    return implode("", $nonKeyBindTypes) . implode("", $keyBindTypes);
}

function createInsertBindTypes($tableName) {
    global $tableSchemas;
    $columnSchemas = $tableSchemas[$tableName];
    $nonKeyBindTypes = array_map(
        function($v){
            if(!$v["pk"]) {return $v["type"];}
        },
        $columnSchemas
    );
    $keyBindTypes = array_map(
        function($v){
            if($v["pk"]) {return $v["type"];}
        },
        $columnSchemas
    );

    return implode("", $keyBindTypes) . implode("", $nonKeyBindTypes);
}

function createDeleteBindTypes($tableName) {
    global $tableSchemas;
    $columnSchemas = $tableSchemas[$tableName];

    $keyBindTypes = array_map(
        function($v){
            if($v["pk"]) {return $v["type"];}
        },
        $columnSchemas
    );

    return implode("", $keyBindTypes);
}

function createSelectBindTypes($tableName) {
    global $tableSchemas;
    $columnSchemas = $tableSchemas[$tableName];

    $filterBindTypes = array_map(
        function($v){
            if($v["filter"]) {return $v["type"];}
        },
        $columnSchemas
    );

    return implode("", $filterBindTypes);
}

function updateRecords($tableName, $records) {
    $sqlUpdateQuery = createUpdateQuery($tableName);
    $bindTypes = createUpdateBindTypes($tableName);
    $columnNames = array_merge(nonKeyFields($tableName), keyFields($tableName));

    
    $updateBuffer = Array();
    foreach($columnNames as $columnName) {
        $updateBuffer[] = null;
        // $updateBuffer[$columnName] = null;
    }
    
    $con = dbConnection();
    $sqlUpdateStatement = $con->prepare($sqlUpdateQuery);
    $sqlUpdateStatement->bind_param($bindTypes, ...$updateBuffer);
    // $sqlUpdateStatement->bind_param($bindTypes, ...array_values($updateBuffer));

    foreach($records as $record) {
        // map record fields to update buffer
        $i = 0;
        foreach($columnNames as $columnName) {
            if($record[$columnName] || $record[$columnName] === 0) {
                $updateBuffer[$i] = $record[$columnName];
                // $updateBuffer[$columnName] = $record[$columnName];
            } else {
                $updateBuffer[$i] = null;
                // $updateBuffer[$columnName] = null;
            }

            $i += 1;
        }
        //echo json_encode($updateBuffer);
        // patch the record update
        $res = $sqlUpdateStatement->execute();
        echo json_encode($res);
    }

    $sqlUpdateStatement->close();
    $con->close();

    return true;
}

function insertRecords($tableName, $records) {
    $sqlInsertQuery = createInsertQuery($tableName);
    $bindTypes = createInsertBindTypes($tableName);
    $columnNames = array_merge(keyFields($tableName), nonKeyFields($tableName));

    
    $insertBuffer = Array();
    foreach($columnNames as $columnName) {
        $insertBuffer[] = null;
    }
    
    $con = dbConnection();
    $sqlInsertStatement = $con->prepare($sqlInsertQuery);
    $sqlInsertStatement->bind_param($bindTypes, ...$insertBuffer);

    foreach($records as $record) {
        // map record fields to update buffer
        $i = 0;
        foreach($columnNames as $columnName) {
            if($record[$columnName] || $record[$columnName] === 0) {
                $insertBuffer[$i] = $record[$columnName];
            } else {
                $insertBuffer[$i] = null;
            }

            $i += 1;
        }
        // patch the record update
        $sqlInsertStatement->execute();
    }

    $sqlInsertStatement->close();
    $con->close();

    return true;
}

function deleteRecords($tableName, $records) {
    $sqlDeleteQuery = createDeleteQuery($tableName);
    $bindTypes = createDeleteBindTypes($tableName);
    $columnNames = keyFields($tableName);

    
    $deleteBuffer = Array();
    foreach($columnNames as $columnName) {
        $deleteBuffer[] = null;
    }
    
    $con = dbConnection();
    $sqlDeleteStatement = $con->prepare($sqlDeleteQuery);
    $sqlDeleteStatement->bind_param($bindTypes, ...$deleteBuffer);

    foreach($records as $record) {
        // map record fields to update buffer
        $i = 0;
        foreach($columnNames as $columnName) {
            if($record[$columnName] || $record[$columnName] === 0) {
                $deleteBuffer[$i] = $record[$columnName];
            } else {
                $deleteBuffer[$i] = null;
            }

            $i += 1;
        }
        // patch the record update
        $sqlDeleteStatement->execute();
    }

    $sqlDeleteStatement->close();
    $con->close();

    return true;
}

function selectRecords($tableName, $filterString) {
    $sqlSelectQuery = createSelectQuery($tableName);
    $bindTypes = createSelectBindTypes($tableName);

    $con = dbConnection();
    $sqlSelectStatement = $con->prepare($sqlSelectQuery);
    $sqlSelectStatement->bind_param("s", $filterString);
    $sqlSelectStatement->execute();
    $sqlResult = $sqlSelectStatement->get_result();

    $records = Array();
    while($resultRecord = mysqli_fetch_assoc($sqlResult)) {
        $records[] = $resultRecord;
    }

    return $records;
}

function mapObjectsToRecords($objectType, $objects) {
    global $objectMappings;

    $records = Array();
    $i = 0;
    foreach($objects as $object) {
        foreach($objectMappings[$objectType]['fields'] as $o => $r){
            $records[$i][$r] = $object[$o];
        }
        $i++;
    }

    return $records;
}

function mapRecordsToObjects($objectType, $records) {
    global $objectMappings;

    $objects = Array();
    $i = 0;
    foreach($records as $record) {
        foreach($objectMappings[$objectType]['fields'] as $o => $r) {
            $objects[$i][$o] = $record[$r];
        }
        $i++;
    }

    return $objects;
}

function updateObjects($payload, $jwt) {
    global $objectMappings;
    $objectType = $payload['type'];
    $objects = $payload['content'];

    $records = mapObjectsToRecords($objectType, $objects);
    $tableName = $objectMappings[$objectType]['table'];

    return updateRecords($tableName, $records);
}

function insertObjects($payload, $jwt) {
    global $objectMappings;
    $objectType = $payload['type'];
    $objects = $payload['content'];

    $records = mapObjectsToRecords($objectType, $objects);
    $tableName = $objectMappings[$objectType]['table'];

    return insertRecords($tableName, $records);
}

function deleteObjects($payload, $jwt) {
    global $objectMappings;
    $objectType = $payload['type'];
    $objects = $payload['content'];

    $records = mapObjectsToRecords($objectType, $objects);
    $tableName = $objectMappings[$objectType]['table'];

    return deleteRecords($tableName, $records);
}

function selectObjects($payload, $jwt) {
    global $objectMappings;
    $objectType = $payload['type'];
    if (array_key_exists('filter',$payload)) {
        $filterString = $payload['filter'] . '%';
    } else {
        $filterString = '%';
    }
    $tableName = $objectMappings[$objectType]['table'];

    $records = selectRecords($tableName, $filterString);
    return mapRecordsToObjects($objectType, $records);
}






function getListItems($listId) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlSelectStatement = $dbConnection->prepare("SELECT `ItemId` AS `id`, `ItemName` AS `caption`, `ItemState` AS `checked`, `ListId` AS `listId`, `ModifiedOn` AS `modified`, `SeqNo` AS `seqNo` FROM `Items` WHERE `ListId` = ?");
    $sqlSelectStatement->bind_param("s", $listId);
    $sqlSelectStatement->execute();
    $sqlResult = $sqlSelectStatement->get_result();

    $itemRecords = array();
    while ($resultRecord = mysqli_fetch_assoc($sqlResult)) {
        $itemRecords[] = $resultRecord;
    }

    return $itemRecords;
}

function getBoardLists($boardId) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlSelectStatement = $dbConnection->prepare("SELECT `ListId` AS `id`, `ListName` AS `caption`, `BoardId` AS `boardId`, `ModifiedOn` AS `modified`, `SeqNo` AS `seqNo` FROM `Lists` WHERE `BoardId` = ?");
    $sqlSelectStatement->bind_param("s", $boardId);
    $sqlSelectStatement->execute();
    $sqlResult = $sqlSelectStatement->get_result();

    $listRecords = array();
    while ($resultRecord = mysqli_fetch_assoc($sqlResult)) {
        $resultRecord['items'] = getListItems($resultRecord['id']);
        $listRecords[] = $resultRecord;
    }

    return $listRecords;
}

function getBoardObjects($jwt) {
    global $host_name, $database, $user_name, $password;

    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlSelectStatement = $dbConnection->prepare("SELECT `BoardId` AS `id`, `BoardName` AS `caption`, `ModifiedOn` AS `modified`, `SeqNo` AS `seqNo` FROM `Boards`");
    $sqlSelectStatement->execute();
    $sqlResult = $sqlSelectStatement->get_result();

    $boardRecords = array();
    while ($resultRecord = mysqli_fetch_assoc($sqlResult)) {
        $resultRecord['lists'] = getBoardLists($resultRecord['id']);
        $boardRecords[] = $resultRecord;
    }

    return $boardRecords;
}

function getListObjects($jwt, $filterString) {
    global $host_name, $database, $user_name, $password;

    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlSelectStatement = $dbConnection->prepare("SELECT `ListId` AS `id`, `ListName` AS `caption`, `BoardId` AS `boardId`, `ModifiedOn` AS `modified`, `SeqNo` AS `seqNo` FROM `Lists` WHERE `BoardId` LIKE ?");
    $sqlSelectStatement->bind_param("s", $filterString);
    $sqlSelectStatement->execute();
    $sqlResult = $sqlSelectStatement->get_result();

    $listRecords = array();
    while ($resultRecord = mysqli_fetch_assoc($sqlResult)) {
        $listRecords[] = $resultRecord;
    }

    return $listRecords;
}

function getItemObjects($jwt, $filterString) {
    global $host_name, $database, $user_name, $password;

    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlSelectStatement = $dbConnection->prepare("SELECT `ItemId` AS `id`, `ItemName` AS `caption`, `ItemState` AS `checked`, `ListId` AS `listId`, `ModifiedOn` AS `modified`, `SeqNo` AS `seqNo` FROM `Items` WHERE `ListId` LIKE ?");
    $sqlSelectStatement->bind_param("s", $filterString);
    $sqlSelectStatement->execute();
    $sqlResult = $sqlSelectStatement->get_result();

    $itemRecords = array();
    while ($resultRecord = mysqli_fetch_assoc($sqlResult)) {
        $itemRecords[] = $resultRecord;
    }

    return $itemRecords;
}

function getObjects($payload, $jwt) {
    $objectType = $payload['type'];

    if (array_key_exists('filter',$payload)) {
        $filterString = $payload['filter'] . '%';
    } else {
        $filterString = '%';
    }

    if ($objectType === 'board') {
        return getBoardObjects($jwt);
    }

    if ($objectType === 'list') {
        return getListObjects($jwt, $filterString);
    }

    if ($objectType === 'item') {
        return getItemObjects($jwt, $filterString);
    }
}

function existingBoard($boardId) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlSelectStatement = $dbConnection->prepare("SELECT COUNT(`BoardId`) AS `count` FROM `Boards` WHERE `BoardId` = ?");
    $sqlSelectStatement->bind_param("s", $boardId);
    $sqlSelectStatement->execute();
    $boardCount = $sqlSelectStatement->get_result()->fetch_assoc()['count'];
    return $boardCount === 1;
}

function updateBoard($board) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlUpdateStatement = $dbConnection->prepare("UPDATE `Boards` SET `BoardName` = ?, `ModifiedOn` = ?, `SeqNo` = ? WHERE `BoardId` = ?");
    $sqlUpdateStatement->bind_param("siis", $board['caption'], $board['modified'], $board['seqNo'], $board['id']);
    $sqlUpdateStatement->execute();
}

function createBoard($board) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlInsertStatement = $dbConnection->prepare("INSERT INTO `Boards` (`BoardId`, `BoardName`, `ModifiedOn`, `SeqNo`) VALUES (?, ?, ?, ?)");
    $sqlInsertStatement->bind_param("ssii", $board['id'], $board['caption'], $board['modified'], $board['seqNo']);
    $sqlInsertStatement->execute();
}

function existingList($listId) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlSelectStatement = $dbConnection->prepare("SELECT COUNT(`ListId`) AS `count` FROM `Lists` WHERE `ListId` = ?");
    $sqlSelectStatement->bind_param("s", $listId);
    $sqlSelectStatement->execute();
    $listCount = $sqlSelectStatement->get_result()->fetch_assoc()['count'];
    return $listCount === 1;
}

function updateList($list, $boardId) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlUpdateStatement = $dbConnection->prepare("UPDATE `Lists` SET `ListName` = ?, `BoardId` = ?, `ModifiedOn` = ?, `SeqNo` = ? WHERE `ListId` = ?");
    $sqlUpdateStatement->bind_param("ssiis", $list['caption'], $boardId, $list['modified'], $list['seqNo'], $list['id']);
    $sqlUpdateStatement->execute();
}

function createList($list, $boardId) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlInsertStatement = $dbConnection->prepare("INSERT INTO `Lists` (`ListId`, `ListName`, `BoardId`, `ModifiedOn`, `SeqNo`) VALUES (?, ?, ?, ?, ?)");
    $sqlInsertStatement->bind_param("sss", $list['id'], $list['caption'], $boardId, $list['modified'], $list['seqNo']);
    $sqlInsertStatement->execute();
}

function existingItem($itemId) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlSelectStatement = $dbConnection->prepare("SELECT COUNT(`ItemId`) AS `count` FROM `Items` WHERE `ItemId` = ?");
    $sqlSelectStatement->bind_param("s", $itemId);
    $sqlSelectStatement->execute();
    $itemCount = $sqlSelectStatement->get_result()->fetch_assoc()['count'];
    return $itemCount === 1;
}

function updateItem($item, $listId) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlUpdateStatement = $dbConnection->prepare("UPDATE `Items` SET `ItemName` = ?, `ItemState` = ?, `ListId` = ?, `ModifiedOn` = ?, `SeqNo` = ? WHERE `ItemId` = ?");
    $itemChecked = (int)($item['checked']);
    $sqlUpdateStatement->bind_param("sisiis", $item['caption'], $itemChecked, $listId, $item['modified'], $item['seqNo'], $item['id']);
    $sqlUpdateStatement->execute();
}

function createItem($item, $listId) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlInsertStatement = $dbConnection->prepare("INSERT INTO `Items` (`ItemId`, `ItemName`, `ItemState`, `ListId`, `ModifiedOn`, `SeqNo`) VALUES (?, ?, ?, ?, ?, ?)");
    $itemChecked = (int)($item['checked']);
    $sqlInsertStatement->bind_param("ssisii", $item['id'], $item['caption'], $itemChecked, $listId, $item['modified'], $item['seqNo']);
    $sqlInsertStatement->execute();
}

function saveListItems($list) {
    $itemObjects = $list['items'];
    foreach($itemObjects as $item) {
        if (existingItem($item['id'])) {
            updateItem($item, $list['id']);
        } else {
            createItem($item, $list['id']);
        }
    }
}

function saveBoardLists($board) {
    $listObjects = $board['lists'];
    foreach($listObjects as $list) {
        if (existingList($list['id'])) {
            updateList($list, $board['id']);
        } else {
            createList($list, $board['id']);
        }

        saveListItems($list);
    }
}

function deleteBoard($boardId) {
    global $host_name, $database, $user_name, $password;
    
    $dbConnection = new mysqli($host_name, $user_name, $password, $database);
    $sqlDeleteStatement = $dbConnection->prepare("DELETE FROM `Boards` WHERE `BoardId` = ?");
    $sqlDeleteStatement->bind_param("s", $boardId);
    $sqlDeleteStatement->execute();
}

function deleteMissingBoards($remainingBoardObjects, $jwt) {
    $currentBoardObjects = getBoardObjects($jwt);
    foreach($currentBoardObjects as $curBoard) {
        $deleteBoard = true;
        foreach($remainingBoardObjects as $remBoard) {
            if ($curBoard['id'] === $remBoard['id']) {
                $deleteBoard = false;
            }
        }
        if ($deleteBoard) {
            deleteBoard($curBoard['id']);
        }
    }
}

function saveBoardObjects($payload, $jwt) {
    $boardObjects = $payload['content'];
    foreach($boardObjects as $board) {
        if (existingBoard($board['id'])) {
            updateBoard($board);
        } else {
            createBoard($board);
        }

        saveBoardLists($board);
    }

    deleteMissingBoards($boardObjects, $jwt);

    return true;
}

function updateBoardObjects($payload, $jwt) {
    $boardObjects = $payload['content'];
    foreach($boardObjects as $board) {
        if (existingBoard($board['id'])) {
            updateBoard($board);
        } else {
            createBoard($board);
        }
    }

    return true;
}

function updateListObjects($payload, $jwt) {
    $listObjects = $payload['content'];
    foreach($listObjects as $list) {
        if (existingList($list['id'])) {
            updateList($list);
        } else {
            createList($list);
        }
    }

    return true;
}

function updateItemObjects($payload, $jwt) {
    $itemObjects = $payload['content'];
    foreach($itemObjects as $item) {
        if (existingItem($item['id'])) {
            updateItem($item);
        } else {
            createItem($item);
        }
    }

    return true;
}

function saveObjects($payload, $jwt) {
    $objectType = $payload['type'];

    if ($objectType === 'board') {
        return saveBoardObjects($payload, $jwt);
    }

    return false;
}

function ormResponse() {
    $_POST = json_decode(file_get_contents('php://input'), true);
    $action = $_POST['action'];
    $payload = $_POST['payload'];
    $jwt = $_POST['jwt'];

    if ($action === 'get') {
        return getObjects($payload, $jwt);
    }

    if ($action === 'save') {
        return saveObjects($payload, $jwt);
    }

    if ($action === 'update') {
        return updateObjects($payload, $jwt);
    }

    if ($action === 'insert') {
        return insertObjects($payload, $jwt);
    }

    if ($action === 'delete') {
        return deleteObjects($payload, $jwt);
    }

    if ($action === 'select') {
        return selectObjects($payload, $jwt);
    }
}

echo json_encode(ormResponse());

?>