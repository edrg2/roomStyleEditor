const styleAPIKey = 'pk21O0NV4oEmlDc078k5dDnl211PnjVCHVdio5Zkmyne37jIFrVNLB7f2NJw'; // 風格轉換API金鑰
const eraserAPIToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjbGllbnRfaWQiOiItWEdBSWxZdTh3ZjlCVC1fY2EtMHY3blFBSzcwS1EtOXptcDVBNzF6YlhFIiwiZXhwIjoxNzA1MjIzNjE4LCJhcHBfbmFtZSI6IjY2MzA5NiIsIm1ldGFkYXRhIjpudWxsLCJncmFudF90eXBlIjoiY3JlZCJ9.4bGvZ91pB4kI_PRMC3sxl3oi-HBAZ67KlymB6ABbm58';
const imgURL = 'https://efb9-2001-b011-fc05-17ee-d9ec-2c30-48c3-dafe.ngrok-free.app/myweb/'
// https://cdn5.f-cdn.com/files/download/115460893/4x3-1497033-interior-design-1.png?image-optimizer=force&format=webply&width=1080

let newImg = new Image();
newImg.crossOrigin = "anonymous";
let lastImg = new Image();
const originalImg = new Image();
let hasSavedImage = false;

let imageUrl; // API回傳圖片儲存用

const imageStatesA = new Proxy([], {
  set(target, property, value) {
    target[property] = value;
    comparison(); // 每當 imageStatesA 更新時觸發 comparison 函數
    return true;
  },
});

// 在外部使用 editLog() 函數
const log = editLog();
const addNewImageURLToStates = log.addNewImageURLToStates;
const imageStatesB = log.imageStatesB;

// 上傳圖片
function initializeImagePicker() {
  const fileInput = document.getElementById('hiddenUploadInput');
  fileInput.value = '';
  fileInput.addEventListener('change', handleFileSelect); // 添加事件監聽器

  function openFilePicker() {
    fileInput.click();
    return false; // 阻止 Form 默認提交行為
  }

  function handleFileSelect() {
    showLoading();
    const uploadedImage = this.files[0];

    // 清空 imageStatesB 陣列
    imageStatesB.length = 0;

    // 移除網頁上所有的圖片
    const imgArea = document.getElementById('imgArea');
    while (imgArea.firstChild) {
      imgArea.removeChild(imgArea.firstChild);
    }

    const canvas0 = document.getElementById('editingImg0');
    const canvas1 = document.getElementById('editingImg1');
    const ctx0 = canvas0.getContext('2d');
    const ctx1 = canvas1.getContext('2d');
    ctx0.clearRect(0, 0, canvas0.width, canvas0.height);
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);

    const newImg = new Image();
    newImg.onload = function () {
      const ratio = Math.min(canvas1.width / newImg.width, canvas1.height / newImg.height);
      const newWidth = newImg.width * ratio;
      const newHeight = newImg.height * ratio;
      const offsetX = (canvas1.width - newWidth) / 2;
      const offsetY = (canvas1.height - newHeight) / 2;
      ctx1.drawImage(newImg, offsetX, offsetY, newWidth, newHeight);

      // 傳送至生成紀錄陣列
      const editedImageURL = canvas1.toDataURL();
      addNewImageURLToStates(editedImageURL);

      // 與 PHP 互動
      const formData = new FormData();
      formData.append('fileUpload', uploadedImage);

      fetch('openFilePicker.php', {
        method: 'POST',
        body: formData
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('上傳圖片 <網路資源取得錯誤>');
          }
          return response.text();
        })
        .then(data => {
          console.log(data); // 處理伺服器的回應
        })
        .catch(error => {
          console.error('error：', error);
          hideLoading();
          if (imageStatesA.length === 0) {
            regretButton();
          }
        });
    };

    newImg.src = URL.createObjectURL(uploadedImage);

    // 儲存比對圖片 (圖層0)
    lastImg = new Image();
    lastImg.src = newImg.src;
    lastImg.onload = function () {
      if (lastImg) {
        ctx0.clearRect(0, 0, canvas0.width, canvas0.height);

        const ratio = Math.min(canvas0.width / lastImg.width, canvas0.height / lastImg.height);
        const newWidth = lastImg.width * ratio;
        const newHeight = lastImg.height * ratio;
        const offsetX = (canvas0.width - newWidth) / 2;
        const offsetY = (canvas0.height - newHeight) / 2;
        ctx0.drawImage(lastImg, offsetX, offsetY, newWidth, newHeight);

        // 儲存初始圖
        originalImg.src = canvas0.toDataURL();
        hideLoading();
        if (imageStatesA.length === 0) {
          regretButton();
        }
      }
      console.log('比對圖片上傳 <成功>');
      console.log('圖片URL:', lastImg);
    }
  }

  return {
    openFilePicker: openFilePicker // 返回 openFilePicker 函數
  };
}

// 新增家具下拉式選單
function selectFurniture() {
  const selectFurniture = document.getElementById('selectFurniture');
  const selectedFurniture = selectFurniture.value;
  let furnitureImg = '';

  switch (selectedFurniture) {
    case 'chest':
      furnitureImg = 'Furniture/chest.png';
      break;
    case 'desk':
      furnitureImg = 'Furniture/desk.png';
      break;
    case 'chair':
      furnitureImg = 'Furniture/chair.png';
      break;
    case 'lamp':
      furnitureImg = 'Furniture/lamp.png';
      break;
    default:
      furnitureImg = '';
      break;
  }
  console.log("Furniture選單獲取 <成功>"); // 確認 furnitureImg 是否被正確設定
  return furnitureImg;
}

// 新增家具圖片至 Canvas 上，使用拖曳、縮放功能 
function addFurniture() {
  showLoading();
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let scale = 0.8; // 初始縮放比例
  const MIN_SCALE = 0.2; // 最小縮放比例
  const MAX_SCALE = 1.2; // 最大縮放比例
  const SCALE_SPEED = 0.1; // 縮放速度

  const canvas = document.getElementById('editingImg4');
  const ctx = canvas.getContext('2d');

  const selectedImg = selectFurniture();
  const furniture = new Image();
  furniture.src = selectedImg;
  console.log('所選的家具路徑:', furniture);

  furniture.onload = function () {
    offsetX = canvas.width / 2 - furniture.width / 2; // 設定初始位置為 Canvas 中心
    offsetY = canvas.height / 2 - furniture.height / 2;
    drawFurniture();
  }

  canvas.addEventListener('mousedown', startDragging);
  canvas.addEventListener('mousemove', dragFurniture);
  canvas.addEventListener('mouseup', stopDragging);
  canvas.addEventListener('wheel', zoomFurniture);

  // 繪製家具圖片
  function drawFurniture() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 用 scale 重新繪製家具圖片並顯示在 Canvas 上
    ctx.drawImage(furniture, offsetX, offsetY, furniture.width * scale, furniture.height * scale);
    confirmButton();
    hideLoading();
    regretButton();
    function1Button();
    showLoadingImgArea1();
  }

  // 圖片拖曳 - 按下
  function startDragging(e) {
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    if (
      mouseX >= offsetX &&
      mouseX <= offsetX + furniture.width &&
      mouseY >= offsetY &&
      mouseY <= offsetY + furniture.height
    ) {
      isDragging = true;
      dragStartX = mouseX - offsetX;
      dragStartY = mouseY - offsetY;
    }
  }

  // 圖片拖曳 - 按住拖動
  function dragFurniture(e) {
    if (isDragging) {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;

      offsetX = mouseX - dragStartX;
      offsetY = mouseY - dragStartY;

      drawFurniture();
    }
  }

  // 圖片拖曳 - 放開
  function stopDragging() {
    isDragging = false;
  }

  // 圖片縮放
  function zoomFurniture(e) {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const newScale = scale + direction * SCALE_SPEED;
    const prevScale = scale; // 保存前一次的縮放比例
    scale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);

    // 檢查是否已到達最大或最小值，如果是則暫停縮放功能
    if (scale === prevScale) {
      return;
    }

    // 計算新的 offset 以保持在滑鼠指向位置
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;
    offsetX = mouseX - (mouseX - offsetX) * (newScale / scale);
    offsetY = mouseY - (mouseY - offsetY) * (newScale / scale);

    drawFurniture();
  }
}

// 新增家具完成鈕 合併家具圖層
function addFurnitureFinish() {
  showLoading();

  const canvas1 = document.getElementById('editingImg1');
  const canvas4 = document.getElementById('editingImg4');
  const ctx1 = canvas1.getContext('2d');
  const ctx4 = canvas4.getContext('2d');

  // 在按下完成前，將當前圖片狀態推送到陣列中
  const currentState = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
  imageStatesA.push(currentState);

  const imgData1 = canvas1.toDataURL();
  const imgData4 = canvas4.toDataURL();

  // 確定兩張圖片的尺寸
  const width1 = canvas1.width;
  const height1 = canvas1.height;
  const width4 = canvas4.width;
  const height4 = canvas4.height;
  const maxWidth = Math.max(width1, width4);
  const maxHeight = Math.max(height1, height4);

  // 建立新的 Canvas 來合併圖片
  const mergedCanvas = document.createElement('canvas');
  const mergedCtx = mergedCanvas.getContext('2d');
  mergedCanvas.width = maxWidth;
  mergedCanvas.height = maxHeight;

  // 繪製兩張圖片到 mergedCanvas
  const image1 = new Image();
  image1.src = imgData1;
  image1.onload = function () {
    mergedCtx.drawImage(image1, 0, 0);

    const targetImage = new Image();
    targetImage.src = imgData4;
    targetImage.onload = function () {
      mergedCtx.drawImage(targetImage, 0, 0);
      const mergedImgData = mergedCanvas.toDataURL();

      // 將合併後的圖片資料傳送到伺服器
      fetch('addFurnitureFinish.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `mergedImgData=${encodeURIComponent(mergedImgData)}`,
      })
        .then((response) => {
          // 處理伺服器回應
          if (response.ok) {
            console.log('家具圖合併 <成功>');

            // 傳送至生成紀錄陣列
            addNewImageURLToStates(mergedImgData);

            // 在 canvas1 中顯示合併後的圖片
            canvas1.src = mergedImgData;

            const image4 = new Image();
            image4.src = mergedImgData;
            image4.onload = function () {
              ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
              ctx1.drawImage(image4, 0, 0);
              backfaddButton();
              hideLoading();
              rtn();
              if (imageStatesA.length === 0) {
                regretButton();
              }
            };
          } else {
            console.error('家具圖合併 <失敗>');
            backfaddButton();
            hideLoading();
            rtn();
            if (imageStatesA.length === 0) {
              regretButton();
            }
          }
        })
        .catch((error) => {
          console.error('error:', error);
          backfaddButton();
          hideLoading();
          rtn();
          if (imageStatesA.length === 0) {
            regretButton();
          }
        });
    };
  };
}

// Mask繪製
function drawMask() {
  let isDrawing = false;
  let brushSize = 10; // 初始筆刷大小
  const drawnPaths = []; // 儲存繪製的路徑

  const canvas = document.getElementById('editingImg5');
  const ctx = canvas.getContext('2d');
  ctx.lineWidth = brushSize;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'white'; // 白色筆刷

  function draw(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (!isDrawing) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  canvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    canvas.addEventListener('mousemove', draw);
  });

  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    canvas.removeEventListener('mousemove', draw);

    // 儲存繪製的路徑
    const path = new Path2D();
    path.moveTo(0, 0);
    path.lineTo(canvas.width, 0);
    path.lineTo(canvas.width, canvas.height);
    path.lineTo(0, canvas.height);
    path.closePath();
    drawnPaths.push(path);
  });

  // 調整筆刷大小
  canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    brushSize += event.deltaY * -0.1;
    if (brushSize < 5) brushSize = 5; // 最小筆刷大小
    if (brushSize > 50) brushSize = 50; // 最大筆刷大小
    ctx.lineWidth = brushSize;
  });
}

// 完成Mask遮罩圖
function finishMask() {
  showLoading();
  const canvas5 = document.getElementById('editingImg5');
  const canvas0 = document.getElementById('black');
  const ctx5 = canvas5.getContext('2d');
  const ctx0 = canvas0.getContext('2d');

  const imgData5 = canvas5.toDataURL();

  const image5 = new Image();
  image5.src = imgData5;

  image5.onload = function () {
    ctx0.fillStyle = 'black';
    ctx0.fillRect(0, 0, canvas0.width, canvas0.height);
    ctx0.drawImage(image5, 0, 0);

    const imageData = encodeURIComponent(canvas0.toDataURL('image/png'));
    const data = 'imageData=' + imageData;

    // 發送至後端伺服器的請求
    fetch('drawMask.php', {
      method: 'POST',
      body: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
      .then(response => {
        if (response.ok) {
          console.log('Mask遮罩繪製 <成功>');
          // 在此處放置後端代理服務器的請求
          deleteAPI();
        } else {
          throw new Error('Mask遮罩繪製 <失敗>');
        }
      })
      .catch(error => {
        console.error('error:', error);
      });
  };
}

// 物件消除修補API傳遞，由finishMask()觸發
async function deleteAPI() {
  try {
    const myHeaders = new Headers();
    myHeaders.append("accesstoken", eraserAPIToken);

    // 讀取圖像檔案和遮罩檔案
    const [imageResponse, maskResponse] = await Promise.all([
      fetch('./editImg.png'),
      fetch('./mask.png')
    ]);

    // 確認圖像和遮罩檔案是否成功讀取
    if (!imageResponse.ok || !maskResponse.ok) {
      throw new Error('魔術橡皮擦API <無法讀取圖像>');
    }

    // 將圖像和遮罩轉換為 Blob
    const [imageBlob, maskBlob] = await Promise.all([
      imageResponse.blob(),
      maskResponse.blob()
    ]);

    // 創建 File 物件
    const imageFile = new File([imageBlob], 'editImg.png', { type: 'image/png' });
    const maskFile = new File([maskBlob], 'mask.png', { type: 'image/png' });

    // 創建 FormData 對象，並添加檔案
    const formData = new FormData();
    formData.append("image_file", imageFile);
    formData.append("mask_file", maskFile);
    formData.append("filename", "editImg.png");

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formData,
      redirect: 'follow'
    };

    // 發送請求
    const response = await fetch('deleteAPI_1.php', requestOptions);
    const resultText = await response.text();

    // 檢查 API 回傳是否成功
    if (resultText.includes("image_url")) {
      const startIndex = resultText.indexOf("http");
      const endIndex = resultText.indexOf('"', startIndex);
      imageUrl = resultText.substring(startIndex, endIndex);
      console.log("魔術橡皮擦API回傳圖片 <成功>");

      // 下載圖片
      const imageBlob = await fetch(imageUrl).then((response) => response.blob());

      const img = new Image();
      img.onload = function () {
        const canvas = document.getElementById('editingImg3');
        const ctx = canvas.getContext('2d');
        clrAll();

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // 傳送至生成紀錄陣列
        const editedImageURL = canvas.toDataURL();
        addNewImageURLToStates(editedImageURL);
        confirmButton();
        hideLoading();
        regretButton();
        function1Button();
        eokButton();
        showLoadingImgArea1();
      };
      img.src = URL.createObjectURL(imageBlob);
    }
    // 清空畫布
    clrAll()

  } catch (error) {
    console.error('error:', error);
    hideLoading();
    if (imageStatesA.length === 0) {
      regretButton();
    }
  }
}

// 魔術橡皮擦完成鈕
function eraserFinish() {
  showLoading();
  const canvas1 = document.getElementById('editingImg1');
  const canvas3 = document.getElementById('editingImg3');
  const ctx1 = canvas1.getContext('2d');
  const ctx3 = canvas3.getContext('2d');

  // 將圖片傳送到伺服器資料夾
  fetch('deleteAPI_2.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'img=' + encodeURIComponent(imageUrl)
  })
    .then(response => {
      if (response.ok) {
        return response.text();
      }
    })
    .then(data => {
      console.log(data); // 處理伺服器的回應

      // 將 editImg.png 傳送到圖層一
      fetch('editImg.png')
        .then(response => {
          if (!response.ok) {
            throw new Error('完成魔術橡皮擦 <網路資源取得錯誤>');
          }
          return response.blob();
        })
        .then(blob => {
          // 在按下完成前，將當前圖片狀態推送到陣列中
          const currentState = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
          imageStatesA.push(currentState);

          const img = new Image();
          img.onload = function () {
            canvas1.width = img.width;
            canvas1.height = img.height;
            ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
            ctx1.drawImage(img, 0, 0);
            hideLoading();
            rtn();
            if (imageStatesA.length === 0) {
              regretButton();
            }
          };
          img.src = URL.createObjectURL(blob);
        })
        .catch(error => {
          console.error('error:', error);
          hideLoading();
          rtn();
          if (imageStatesA.length === 0) {
            regretButton();
          }
        });
    })
    .catch(error => {
      console.error('error:', error);
      hideLoading();
      rtn();
      if (imageStatesA.length === 0) {
        regretButton();
      }
    });
}

// 風格下拉式選單
function selectStyle() {
  const selectStyle = document.getElementById('selectStyle');
  const selectedStyle = selectStyle.value;
  let Style = '';

  switch (selectedStyle) {
    case 'classical':
      Style = 'modern style,Simple Design,Neutral Tones,Open Space,Natural Light,Modern Furniture,  ';
      break;
    case 'industrial':
      Style = 'industrial style,Iron Decor,Natural Wood Materials,Dark Tones,Repurposed Items,Concrete Elements,  ';
      break;
    case 'nordic':
      Style = 'nordic style,Light Tones,Minimalist Design,Soft Furnishings,Natural Materials,Nordic Lighting,  ';
      break;
    case 'country':
      Style = 'country style,Light Tones,Floral Patterns,Antique Furniture,Textile Decorations,Wooden Decor,  ';
      break;
    case 'mediterranean':
      Style = 'mediterranean style,Mediterranean Tones,Ceramic Tiles,Blue and White Contrast,Maritime Elements,Arch Structures,  ';
      break;
    case 'classic':
      Style = 'classic style,Ornate Decor,Symmetrical Design,Noble Tones,Classical Furniture,Classic Light Fixtures,  ';
      break;
    case 'luxury':
      Style = 'luxury style,Golden Elements,Silk and Satin,Crystal Chandeliers,Leather Furniture,Customized Design,  ';
      break;
    default:
      Style = 'modern style,Simple Design,Neutral Tones,Open Space,Natural Light,Modern Furniture,  ';
      break;
  }
  console.log("Style選單獲取 <成功>"); // 確認 Style 是否被正確設定
  return Style;
}

// 房型下拉式選單
function selectRoom() {
  const selectRoom = document.getElementById('selectRoom');
  const selectedRoom = selectRoom.value;
  let Room = '';

  switch (selectedRoom) {
    case 'bedroom':
      Room = 'bedroom,  ';
      break;
    case 'living room':
      Room = 'living room,  ';
      break;
    case 'meeting room':
      Room = 'meeting room,  ';
      break;
    default:
      Room = 'bedroom,  ';
      break;
  }
  console.log("Room選單獲取 <成功>");
  return Room;
}

// 風格轉換API傳遞
function changeStyleAPI() {
  showLoading();
  const canvas2 = document.getElementById('editingImg2');
  const ctx2 = canvas2.getContext('2d');
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

  var myimage = document.getElementById('selectedImage');
  const Style = selectStyle(); // 獲取下拉式選單的值
  const Room = selectRoom();
  const Furniture = selectFurniture();
  console.log('所選的風格:', Style);
  console.log('所選的房型:', Room);
  console.log('新增的家具:', Furniture);

  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var requestBody = JSON.stringify({
    "key": styleAPIKey,
    "prompt": Style + Room + Furniture,
    "negative_prompt": null,
    "init_image": imgURL + "editImg.png",
    "width": "320",
    "height": "160",
    "samples": "1",
    "num_inference_steps": "30",
    "safety_checker": "no",
    "enhance_prompt": "yes",
    "guidance_scale": 7.5,
    "strength": 0.7,
    "base64": "no",
    "seed": null,
    "webhook": null,
    "track_id": null
  });

  var requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: requestBody,
    redirect: 'follow'
  };

  fetch("https://stablediffusionapi.com/api/v3/img2img", requestOptions)
    .then(response => response.json())
    .then(result => {
      imageUrl = result.output[0];

      const generatedImage = new Image();
      generatedImage.crossOrigin = "Anonymous";
      generatedImage.onload = function () {
        canvas2.width = generatedImage.width;
        canvas2.height = generatedImage.height;
        ctx2.drawImage(generatedImage, 0, 0); // 將 API 返回的圖片繪製到 圖層2 上

        changeStyleAPIdone();
      };
      generatedImage.src = imageUrl;
      console.log('轉換風格API回傳圖片 <成功>');
    })
    .catch(error => console.error('error', error));
}

// 風格轉換API傳遞完成後續，由changeStyleAPI()觸發
function changeStyleAPIdone() {
  const canvas2 = document.getElementById('editingImg2');
  const ctx2 = canvas2.getContext('2d');

  // 傳送至生成紀錄陣列
  const editedImageURL = canvas2.toDataURL();
  addNewImageURLToStates(editedImageURL);

  // 家具、風格、房型選擇清單還原初始狀態
  furnitureImg = '';
  const selectFurniture = document.getElementById('selectFurniture');
  selectFurniture.selectedIndex = 0;
  const selectStyle = document.getElementById('selectStyle');
  selectStyle.selectedIndex = 0;
  const selectRoom = document.getElementById('selectRoom');
  selectRoom.selectedIndex = 0;

  confirmButton();
  hideLoading();
  regretButton();
  function1Button();
  showLoadingImgArea1();
}

// 風格轉換完成鈕
function changeStyleFinish() {
  showLoading();
  const canvas1 = document.getElementById('editingImg1');
  const canvas2 = document.getElementById('editingImg2');
  const ctx1 = canvas1.getContext('2d');
  const ctx2 = canvas2.getContext('2d');

  // 將圖片傳送到伺服器資料夾
  fetch('changeStyleAPI.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'img=' + encodeURIComponent(imageUrl)
  })
    .then(response => {
      if (response.ok) {
        return response.text();
      }
    })
    .then(data => {
      console.log(data); // 處理伺服器的回應

      // 將 editImg.png 傳送到圖層一
      fetch('editImg.png')
        .then(response => {
          if (!response.ok) {
            throw new Error('完成轉換風格 <網路資源取得錯誤>');
          }
          return response.blob();
        })
        .then(blob => {
          // 在按下完成前，將當前圖片狀態推送到陣列中
          const currentState = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
          imageStatesA.push(currentState);

          const img = new Image();
          img.onload = function () {
            canvas1.width = img.width;
            canvas1.height = img.height;
            ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
            ctx1.drawImage(img, 0, 0);
            hideLoading();
            rtn();
            if (imageStatesA.length === 0) {
              regretButton();
            }
          };
          img.src = URL.createObjectURL(blob);
        })
        .catch(error => {
          console.error('error:', error);
          hideLoading();
          rtn();
          if (imageStatesA.length === 0) {
            regretButton();
          }
        });
    })
    .catch(error => {
      console.error('error:', error);
      hideLoading();
      rtn();
      if (imageStatesA.length === 0) {
        regretButton();
      }
    });
}

// 清空編輯圖層以外的 Canvas
function clrAll() {
  const canvas2 = document.getElementById('editingImg2');
  const canvas3 = document.getElementById('editingImg3');
  const canvas4 = document.getElementById('editingImg4');
  const canvas5 = document.getElementById('editingImg5');
  const ctx2 = canvas2.getContext('2d');
  const ctx3 = canvas3.getContext('2d');
  const ctx4 = canvas4.getContext('2d');
  const ctx5 = canvas5.getContext('2d');
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
  ctx4.clearRect(0, 0, canvas4.width, canvas4.height);
  ctx5.clearRect(0, 0, canvas5.width, canvas5.height);
}

// 撤銷鍵
function regret() {
  showLoading();
  if (imageStatesA.length > 0) {
    // 從陣列中彈出最後一個圖片狀態
    const previousState = imageStatesA.pop();

    // 恢復為上一個圖片狀態
    const canvas = document.getElementById('editingImg1');
    const ctx = canvas.getContext('2d');
    ctx.putImageData(previousState, 0, 0);

    // 取得 previousState 裡的值
    const stateValue = canvas.toDataURL();

    fetch('regret.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'imageData=' + encodeURIComponent(stateValue),
    })
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw new Error('撤銷鍵 <網路資源取得錯誤>');
      })
      .then(data => {
        console.log(data);
        hideLoading();
        if (imageStatesA.length === 0) {
          regretButton();
        }
      })
      .catch(error => {
        console.error('error:', error);
        hideLoading();
        if (imageStatesA.length === 0) {
          regretButton();
        }
      });
  } else {
    console.log('撤銷鍵 <無法返回更多步驟>');
    regretButton();
  }
}

// 比對圖
function comparison() {
  function uploadImageToCanvas(previousState) {
    const canvas = document.getElementById('editingImg0');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(previousState, 0, 0);
    console.log('比對圖上傳 <成功>');
  }

  if (imageStatesA.length >= 2) {
    const previousState = imageStatesA[imageStatesA.length - 1];
    uploadImageToCanvas(previousState);
  } else {
    const canvas = document.getElementById('editingImg0');
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImg, 0, 0, canvas.width, canvas.height);
    console.log('比對圖尚未取得足夠圖片狀態，初始圖上傳 <成功>');
  }
}

// 生成紀錄
function editLog() {
  const imageStatesB = [];

  // 監聽器函數，用於觸發圖片更新
  function handleImageStateChanges(changes) {
    console.log('生成紀錄 <狀態已更新>：', changes);
  };

  // 創建 Proxy 來監聽 imageStatesB 陣列的變化
  const imageStatesProxy = new Proxy(imageStatesB, {
    set(target, property, value) {
      target[property] = value;
      handleImageStateChanges({ property, value }); // 在添加新圖片時觸發更新
      return true;
    }
  });

  // 添加新圖片到 imageStatesB 陣列中
  function addNewImageURLToStates(imageURL) {
    imageStatesProxy.push(imageURL); // 這裡將觸發 Proxy 的 set 方法

    // 創建新的圖片元素
    const newImage = document.createElement('img');
    newImage.src = imageURL;

    // 設置圖片元素的點擊事件，當圖片被點擊時執行上傳至 Canvas 的操作
    newImage.addEventListener('click', function () {
      showLoading();
      const canvas = document.getElementById('editingImg1');
      const ctx = canvas.getContext('2d');

      // 在按下完成前，將當前圖片狀態推送到陣列中
      const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
      imageStatesA.push(currentState);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(newImage, 0, 0, canvas.width, canvas.height);
      console.log('生成紀錄圖片上傳 <成功>');

      const ImageData = canvas.toDataURL(); // 將當前 canvas 元素轉換為 base64 格式

      // 透過 fetch 發送至伺服器
      fetch('editLog.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'imageData=' + encodeURIComponent(ImageData),
      })
        .then(response => {
          if (response.ok) {
            return response.text();
          }
          throw new Error('生成紀錄 <網路資源取得錯誤>');
        })
        .then(data => {
          console.log(data);
          hideLoading();
          if (imageStatesA.length === 0) {
            regretButton();
          }
        })
        .catch(error => {
          console.error('error:', error);
          hideLoading();
          if (imageStatesA.length === 0) {
            regretButton();
          }
        });
    });

    // 將新圖片元素添加到網頁中
    const imgArea = document.getElementById('imgArea');
    imgArea.appendChild(newImage);

    // 處理圖片載入失敗
    newImage.onerror = function () {
      console.error('圖片載入失敗');
    };
  }

  // 返回函數供外部調用以添加新圖片
  return {
    addNewImageURLToStates: addNewImageURLToStates, // 返回函數
    imageStatesB: imageStatesB // 返回 imageStatesB 陣列
  };
}

// 儲存圖片
function saveImage() {
  if (hasSavedImage) {
    return;
  }
  const canvas0 = document.getElementById('editingImg0');
  const canvas1 = document.getElementById('editingImg1');
  const ctx0 = canvas0.getContext('2d');
  const ctx1 = canvas1.getContext('2d');

  // 尋找實際範圍的邊界
  const imageData = ctx1.getImageData(0, 0, canvas1.width, canvas1.height);
  const pixels = imageData.data;
  let minX = canvas1.width;
  let minY = canvas1.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < canvas1.height; y++) {
    for (let x = 0; x < canvas1.width; x++) {
      const index = (y * canvas1.width + x) * 4;
      const alpha = pixels[index + 3];
      if (alpha > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // 裁剪 Canvas 中的圖片
  const croppedImage = ctx1.getImageData(minX, minY, maxX - minX + 1, maxY - minY + 1);
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = maxX - minX + 1;
  croppedCanvas.height = maxY - minY + 1;
  const croppedCtx = croppedCanvas.getContext('2d');
  croppedCtx.putImageData(croppedImage, 0, 0);

  // 下載裁剪後的圖片
  const link = document.createElement('a');
  link.download = 'download.png';
  const image = croppedCanvas.toDataURL('image/png');
  link.href = image;

  document.body.appendChild(link); // 將 <a> 元素添加到頁面並模擬點擊下載
  link.click();
  document.body.removeChild(link); // 移除 <a> 元素

  hasSavedImage = true;

  // 清空 imageStates 陣列
  imageStatesA.length = 0;
  imageStatesB.length = 0;

  // 移除網頁上所有的圖片
  const imgArea = document.getElementById('imgArea');
  while (imgArea.firstChild) {
    imgArea.removeChild(imgArea.firstChild);
  }

  ctx0.clearRect(0, 0, canvas0.width, canvas0.height);
  ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
  clrAll();
  const otherButtons = document.querySelectorAll('button:not(.Start)');
  otherButtons.forEach(button => {
    button.disabled = true;
  });
  const imagePicker = initializeImagePicker();
  const openFilePicker = imagePicker.openFilePicker;
}

// 重新上傳圖片時重置
function reUploadImage() {
  hasSavedImage = false;
}