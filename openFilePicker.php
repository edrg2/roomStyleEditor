<?php
header("Access-Control-Allow-Origin: *");
if ($_FILES["fileUpload"]["error"] == 0) {
    if (move_uploaded_file($_FILES["fileUpload"]["tmp_name"],"./editImg.png")) {
        echo 'PHP - 初始圖檔 -> server <成功>';
    } else {
        echo 'PHP - 初始圖檔 -> server <失敗>';
    }
} else {
    echo 'PHP - 初始圖檔 <無法讀取>';
}
?>