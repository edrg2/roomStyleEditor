<?php
header("Access-Control-Allow-Origin: *");
if(isset($_POST['img'])) {
  $img = $_POST['img'];

  $output_file = "editImg.png";

  file_put_contents($output_file, file_get_contents($img));
    echo 'PHP - 風格轉換API -> server <成功>';
} else {
    echo 'PHP - 風格轉換API -> server <失敗>';
}
?>