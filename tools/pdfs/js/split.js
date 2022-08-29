// var canvas = document.getElementById('canvas');
pdfjsLib.GlobalWorkerOptions.workerSrc = "./js/pdfjs/build/pdf.worker.js";
var result = document.getElementById("result");
var dropArea = document.querySelector("#drop-area");

class Output {
    /**
     * @param {HTMLElement} el
     */
    constructor(el) {
        this.el = el;
    }
    log(str) {
        // this.el.insertAdjacentHTML('beforeend', `<p>${str}</p>`);
        var p = document.createElement("p");
        p.innerText = str;
        this.el.appendChild(p);
        p.scrollIntoView();
    }
    clear() {
        this.el.innerText = "";
    }
}
var output = new Output(document.getElementById("output"));

// 拖拽
dropArea.addEventListener(
    "dragenter",
    function () {
        this.classList.add("drag-over");
    },
    false
);
dropArea.addEventListener(
    "dragleave",
    function () {
        this.classList.remove("drag-over");
    },
    false
);
dropArea.addEventListener(
    "dragover",
    function (e) {
        e.stopPropagation();
        e.preventDefault();

        e.dataTransfer.dropEffect = "copy";
    },
    false
);
dropArea.addEventListener("click", function () {
    document.getElementById("file-label").click();
});
function handleFile(file) {
    console.log(file);
    if (file.type !== "application/pdf" || !/\.pdf/i.test(file.name)) {
        alert("请放入PDF文件");
    }

    // URL.createObjectURL(file)
    splitPdf(URL.createObjectURL(file), file.name);
}
dropArea.addEventListener(
    "drop",
    function (e) {
        e.stopPropagation();
        e.preventDefault();

        var files = e.dataTransfer.files;

        this.classList.remove("drag-over");
        if (!files || !files.length) {
            console.log(files);
            return;
        }

        var file = files[0];
        handleFile(file);
    },
    false
);
document.querySelector("#file-picker").addEventListener("change", function (e) {
    handleFile(this.files[0]);
});
document.getElementById("btn-reset").addEventListener("click", function (e) {
    e.stopPropagation();
    output.clear();
    result.innerHTML = "";
});

// 分割pdf 通过地址
function splitPdf(filePath, fileName = "") {
    output.clear();
    result.innerHTML = "";

    var loadingTask = pdfjsLib.getDocument({
        url: filePath,
        cMapUrl: "../web/cmaps/", // 路径是以pdfjs为基准的
        standardFontDataUrl: "../web/standard_fonts/",
        cMapPacked: true,
        useSystemFonts: true,
    });

    var hasAlerted = false;
    loadingTask.onUnsupportedFeature = (e) => {
        if (!hasAlerted) {
            window.alert(`出现 ${e} 错误，PDF渲染可能不正常`);
            hasAlerted = true;
        }
    };
    output.log(`正在处理 【${fileName}】`);

    loadingTask.promise.then(function (pdf) {
        window.pdf = pdf;
        var pageCount = pdf._pdfInfo.numPages;

        output.log(`【${fileName}】 共有 ${pageCount} 页`);

        if (pageCount <= 1) {
            return alert("此PDF无须分割");
        }

        for (var i = 0; i < pageCount; i++) {
            ((index) => {
                pdf.getPage(index).then(function (page) {
                    renderPage(page, index, fileName);
                });
            })(i + 1);
        }
    });
}

// splitPdf('./a.pdf');

function renderPage(page, index, fileName) {
    output.log(`正在显示第 ${index} 页`);
    var viewport = page.getViewport({ scale: 2 });
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    var div = document.createElement("article");
    var h = document.createElement("h2");
    h.innerText = index;
    div.appendChild(h);
    div.appendChild(canvas);

    fileName = fileName.replace(/\.pdf/i, "");

    var renderTask = page.render({
        viewport: viewport,
        canvasContext: ctx,
        stopAtErrors: true,
    });

    result.appendChild(div);

    renderTask.promise.then(function () {
        setTimeout(() => {
            output.log(`正在分割第 ${index} 页`);
            var doc = new jspdf.jsPDF({
                unit: "pt",
                format: "A4", // A4 [595.28, 841.89]
            });
            // (imageData, format, x, y, width, height, alias, compression, rotation)
            var height = (595.28 / canvas.width) * canvas.height;
            var width = 595.28;
            doc.addImage(canvas, "JPEG", 0, 0, width, height);

            doc.save(`${fileName} - 第${index}页.pdf`);

            output.log(`第 ${index} 页分割完成`);
        }, 300);
    });

    (window._czc || []).push(["_trackEvent", "PDFsplit", "page"]);
}
