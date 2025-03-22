<?php
header("Access-Control-Allow-Origin: *");
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 接收從前端傳送的圖片資料
    $imgData = $_POST['mergedImgData']; // 接收 base64 編碼的圖片資料

    // 將 base64 轉換為圖片檔案
    $imgData = str_replace('data:image/png;base64,', '', $imgData);
    $imgData = str_replace(' ', '+', $imgData);
    $imgBinary = base64_decode($imgData);

    // 設定儲存圖片的路徑和檔名
    $filePath = './' . 'editImg.png';

    // 儲存圖片到伺服器資料夾
    if (file_put_contents($filePath, $imgBinary)) {
        echo 'PHP - 家具圖合併 -> server <成功>';
    } else {
        echo 'PHP - 家具圖合併 -> server <失敗>';
    }
} else {
    echo 'PHP - 家具圖合併 <無效請求>';
}
?>