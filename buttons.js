let isLoading = false;

// 操作說明  ****************************************************************************************************

// 頁面 =====================================================================================
const instructionsTitle = document.querySelector('.instructionsTitle');
const instructionsArea = document.querySelector('.instructionsArea');
const covereditArea = document.querySelector('.covereditArea');

instructionsTitle.addEventListener('click', function () {
    // 定義要移動的距離
    const moveDistance = 820;
    instructionsArea.style.right = `calc(10px + ${moveDistance}px)`; // 往左移動指定的距離
    covereditArea.style.display = 'block';
    showLoadingImgArea2();
});

document.addEventListener('click', function (event) {
    const backInstructionsArea = event.target.closest('.instructionsArea');
    if (!backInstructionsArea) {

        instructionsArea.style.right = '10px';
        covereditArea.style.display = 'none';
        hideLoadingImgArea2();
    }
});

// 按鈕 =====================================================================================

// 取得所有按鈕和word的元素
const buttons = document.querySelectorAll('.btn');
const words = document.querySelectorAll('.word');

// 為每個按鈕添加點擊事件監聽器
buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        // 隱藏所有word的內容
        words.forEach((word) => {
            word.style.display = 'none';
        });
        // 顯示點擊的按鈕對應的word
        words[index].style.display = 'block';
    });
});

// 指定按鈕顯示/隱藏  ************************************************************************************************
function toggleButtons(showButtons, hideButtons) {
    // 顯示
    const showBtns = document.querySelectorAll(showButtons);
    showBtns.forEach(btn => {
        btn.style.display = 'block';
    });

    // 隱藏
    const hideBtns = document.querySelectorAll(hideButtons);
    hideBtns.forEach(btn => {
        btn.style.display = 'none';
    });
}

// 新增家具按鈕
function clickFurniture() {
    finishButton();
    regretButton();
    function1Button();
    showLoadingImgArea1();
    faddButton();
    toggleButtons('.Furniture, .Canvas4', '.Style, .Eraser, .btnB, .Canvas5');
}

// 魔術橡皮擦按鈕
function clickEraser() {
    drawMask();
    finishButton();
    regretButton();
    function1Button();
    showLoadingImgArea1();
    backeokButton();
    toggleButtons('.Eraser, .Canvas5', '.Style, .Furniture, .btnB, .Canvas4');
}

// 室內風格轉換按鈕
function clickStyle() {
    finishButton();
    regretButton();
    function1Button();
    showLoadingImgArea1();
    toggleButtons('.Style', '.Furniture, .Eraser, .btnB');
}

// 返回鈕
function rtn() {
    clrAll();
    rtnButton();
    function1RtnButton();
    hideLoadingImgArea1();
    backfaddButton();
    backeokButton();
    if (imageStatesA.length === 0) {
        regretButton();
    }
    toggleButtons('.btnB', '.Style, .Furniture, .Eraser, .Canvas4, .Canvas5');
}

// 禁用按鈕  *********************************************************************************************************

// 上傳按鈕 ==================================================================

const functionBox = document.querySelector('.functionbox');

// 在.functionbox裡，除了.Start的按鈕之外，其他按鈕全部禁用
if (functionBox) {
    const otherButtons = functionBox.querySelectorAll('button:not(.Start)');
    otherButtons.forEach(button => {
        button.disabled = true;
    });
}

// 新增家具 - 新增鈕 與 cover圖層 =============================================

function faddButton() {
    // 禁用新增按鈕
    const faddButton = document.querySelector('.Fadd');
    const cover = document.querySelector('.cover');
    if (faddButton) {
        faddButton.disabled = true;
        cover.style.display = 'block';
    }

    // 監聽具有特定類的 select 元素的變化事件
    const fsltButton = document.querySelector('.Fslt');
    if (fsltButton) {
        fsltButton.addEventListener('change', function () {
            const selectedValue = this.value;

            // 檢查所選值是否為空
            if (selectedValue !== '') {
                // 解除禁用新增按鈕
                if (faddButton) {
                    faddButton.disabled = false;
                    cover.style.display = 'none';
                }
            }
            else {
                // 若為空，重新禁用新增按鈕
                if (faddButton) {
                    faddButton.disabled = true;
                    cover.style.display = 'block';
                }
            }
        });
    }
}

function backfaddButton() {
    const cover = document.querySelector('.cover');

    // 檢查是否找到了 cover 元素
    if (cover) {
        // 顯示 cover
        cover.style.display = 'none';
    }
}

// Eok套用鈕 =================================================================


// 禁用
function eokButton() {
    if (!isLoading) {
        const eokButton = document.querySelectorAll('.Eok');
        eokButton.forEach(button => {
            button.setAttribute('disabled', 'disabled');
        });
    }
}

function backeokButton() {
    const backeokButton = document.querySelectorAll('.Eok');
    backeokButton.forEach(button => {
        button.removeAttribute('disabled');
    });
}

// 撤銷鈕 ====================================================================

// 禁用撤銷按鈕
function regretButton() {
    if (!isLoading) {
        const regretButton = document.querySelectorAll('.btnC');
        regretButton.forEach(button => {
            button.setAttribute('disabled', 'disabled');
        });
    }
}

function rtnButton() {
    const rtnButton = document.querySelectorAll('.btnC');
    rtnButton.forEach(button => {
        button.removeAttribute('disabled');
    });
}

// 上傳、下載鈕 ==============================================================

// 禁用上傳、下載鈕
function function1Button() {
    if (!isLoading) {
        const function1Button = document.querySelectorAll('.btnA');
        function1Button.forEach(button => {
            button.setAttribute('disabled', 'disabled');
        });
    }
}

function function1RtnButton() {
    const function1RtnButton = document.querySelectorAll('.btnA');
    function1RtnButton.forEach(button => {
        button.removeAttribute('disabled');
    });
}

// 套用鈕 ====================================================================

// 禁用完成按鈕
function finishButton() {
    const finishButton = document.querySelectorAll('.Confirm');
    finishButton.forEach(button => {
        button.setAttribute('disabled', 'disabled');
    });
}

// 當按下套用鍵時解開完成按紐
function confirmButton() {
    const confirmButton = document.querySelectorAll('.Confirm');
    confirmButton.forEach(button => {
        button.removeAttribute('disabled');
    });
}

// 生成紀錄阻擋框 =============================================================

function showLoadingImgArea1() {
    const loadingImgArea = document.querySelector('.loadingImgArea1');
    if (loadingImgArea) {
        loadingImgArea.style.display = 'block';
    }
}

function hideLoadingImgArea1() {
    const loadingImgArea = document.querySelector('.loadingImgArea1');
    if (loadingImgArea) {
        loadingImgArea.style.display = 'none';
    }
}

function showLoadingImgArea2() {
    const loadingImgArea = document.querySelector('.loadingImgArea2');
    if (loadingImgArea) {
        loadingImgArea.style.display = 'block';
    }
}

function hideLoadingImgArea2() {
    const loadingImgArea = document.querySelector('.loadingImgArea2');
    if (loadingImgArea) {
        loadingImgArea.style.display = 'none';
    }
}

// 加載動畫  *********************************************************************************************************

// 顯示加載動畫
function showLoading() {
    const loadingCircle = document.querySelector('.loadingCircle');
    if (loadingCircle) {
        loadingCircle.style.display = 'flex';
        isLoading = true;

        // 禁用所有按鈕
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = true;
        });
        showLoadingImgArea1();
    }
}

// 隱藏
function hideLoading() {
    const loadingCircle = document.querySelector('.loadingCircle');
    if (loadingCircle) {
        loadingCircle.style.display = 'none';
        isLoading = false;

        // 解除所有禁用按鈕
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = false;
        });
        hideLoadingImgArea1();
    }
}

// 新舊對比 懸停  ****************************************************************************************************
function hideCanvasesExcept(canvasToKeep) {
    const allCanvases = document.querySelectorAll('canvas'); // 獲取所有 Canvas 元素

    // 遍歷所有 Canvas 元素
    allCanvases.forEach(canvas => {
        // 如果當前迴圈的 Canvas 不是要保留的 Canvas，則隱藏它；否則顯示它
        if (!canvas.isSameNode(canvasToKeep)) {
            canvas.style.opacity = '0';
        } else {
            canvas.style.opacity = '1';
        }
    });
}

const animatedComponent = document.querySelector('.originalPic');
const canvasToKeep = document.querySelector('.Canvas0');

// 懸停時
animatedComponent.addEventListener('mouseenter', function () {
    hideCanvasesExcept(canvasToKeep);
});

// 離開時
animatedComponent.addEventListener('mouseleave', function () {
    const allCanvases = document.querySelectorAll('canvas');

    allCanvases.forEach(canvas => {
        if (!canvas.isSameNode(canvasToKeep)) {
            canvas.style.opacity = '1';
        } else {
            canvas.style.opacity = '0';
        }
    });
});

// 返回頁首  ********************************************************************************************************

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}