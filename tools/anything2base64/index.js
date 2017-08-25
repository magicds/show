/**
 * 图片转base64
 * author:陈东顺
 * date:2016-09-28
 */

// 文件转化为dataUrl
function readFileAsDataURL(file, callback) {
    var a = new FileReader();
    a.onload = function(e) {
        callback && callback(e.target.result);
    };
    a.readAsDataURL(file);
}
// 处理每个文件
function processFiles(files, callback) {
    for (var i = 0, l = files.length; i < l; i++) {
        callback ? readFileAsDataURL(files[i], callback) : readFileAsDataURL(files[i]);
    }
}
// 复制到粘贴板
function copyToClipboard() {
    document.execCommand("Copy");
}

// 将dataUrl添加到页面
var resultList = document.querySelector('#resultList');

function addToPage(dataUrl) {
    var html = '<button>复制</button><textarea class="result-text" cols="30" rows="10"></textarea>';
    var result = document.createElement('div');
    result.className = "result";
    result.innerHTML = html;
    result.childNodes[1].value = dataUrl;
    result.childNodes[0].addEventListener('click', function(e) {
        var textarea = e.target.nextSibling;
        textarea.select();
        copyToClipboard();
    }, false);
    resultList.appendChild(result);
}
var dropArea = document.querySelector('#drop-area');

// 事件函数
var handleDragEnter = function(e) {
    this.classList.add('drag-over');
};

var handleDragOver = function(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy';
};

var handleDragLeave = function(e) {
    this.classList.remove('drag-over');
};

var handleDrop = function(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    if (files && files.length) {
        console.log(files);
        processFiles(files, addToPage);
    }

    this.classList.remove('drag-over');
};

// 绑定拖拽事件
dropArea.addEventListener('dragenter', handleDragEnter, false);
dropArea.addEventListener('dragleave', handleDragLeave, false);
dropArea.addEventListener('dragover', handleDragOver, false);
dropArea.addEventListener('drop', handleDrop, false);
