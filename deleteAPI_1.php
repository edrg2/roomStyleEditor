<?php
header("Access-Control-Allow-Origin: *");
function uploadFilesToAPI($imageFile, $maskFile, $filename, $accessToken) {
    $apiUrl = 'https://api.magicstudio.com/magiceraser/erase';

    // 檢查檔案是否上傳成功
    if ($imageFile['error'] !== UPLOAD_ERR_OK || $maskFile['error'] !== UPLOAD_ERR_OK) {
        return 'PHP - 魔術橡皮擦 <檔案上傳失敗>';
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_POST, 1);

    $postData = array(
        'image_file' => new CURLFile($imageFile['tmp_name'], $imageFile['type'], $imageFile['name']),
        'mask_file' => new CURLFile($maskFile['tmp_name'], $maskFile['type'], $maskFile['name']),
        'filename' => $filename
    );

    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);

    $headers = array(
        'accessToken: ' . $accessToken,
    );

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);

    if(curl_errno($ch)) {
        return 'PHP - 魔術橡皮擦 <CURL錯誤> :' . curl_error($ch);
    }

    curl_close($ch);

    if ($response) {
        echo 'PHP - 魔術橡皮擦 -> server <成功>';
        return $response;
    } else {
        echo 'PHP - 魔術橡皮擦 -> server <失敗>';
        return $response;
    }
}

// 獲取從前端傳遞過來的圖像檔案和遮罩檔案
$imageFile = $_FILES['image_file'];
$maskFile = $_FILES['mask_file'];
$filename = $_POST['filename'];
$accessToken = $_SERVER['HTTP_ACCESSTOKEN'];

// 上傳檔案到 API
$response = uploadFilesToAPI($imageFile, $maskFile, $filename, $accessToken);

// 輸出 API 回應
echo $response;
?>