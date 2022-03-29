pdfjsLib.GlobalWorkerOptions.workerSrc = "./js/pdfjs/build/pdf.worker.js";

const A4_SIZE = [595.28, 841.89];

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
initDrop();
function initDrop() {
    var dropArea = document.querySelector("#drop-area");

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

            console.log(files);
            // store.files = [];
            const idArr = [];
            [].slice.call(files).forEach(function (file) {
                if (
                    file.type === "application/pdf" ||
                    /^image/.test(file.type)
                ) {
                    const id = ++store.index;
                    console.log(id, file);
                    idArr.push(id);
                    store.fileMap[id] = { file };
                } else {
                    alert(
                        `您选择的 【${file.name}】 不支持，请选择图片或者pdf`
                    );
                }
                // debugger
            });
            console.log(idArr);
            store.files.push(...idArr);
        },
        false
    );
}

var sortable = new Sortable(document.querySelector("#list"), {
    sort: true,

    // Changed sorting within list
    onUpdate: function (/**Event*/ evt) {
        // same properties as onEnd
        console.log(evt);
        var arr = sortable.toArray();
        console.log(arr);
        store.files = arr;
    },
});

var store = PetiteVue.reactive({
    index: 0,
    // files: [1, 2, 3],
    files: [],
    fileMap: {},
    compress: true,
    size: "A4",
    sizeList: {
        A4: "A4",
        origin: "原始尺寸",
    },
    outputName: "合并pdf",
});

var app = PetiteVue.createApp({
    store,
    currentIndex: 0,
    mounted() {},
    isPdf(id) {
        const item = store.fileMap[id];
        if (!item) return false;
        return item.file.type === "application/pdf";
    },
    isImg(id) {
        const item = store.fileMap[id];
        if (!item) return false;
        return /^image/.test(item.file.type);
    },

    getPreview(id) {
        const fileItem = store.fileMap[id];
        if (fileItem.url) {
            return fileItem.url;
        }
        fileItem.url = URL.createObjectURL(fileItem.file);
        return fileItem.url;
    },

    make() {
        console.log("x");
        const list = [];
        if (!store.files.length) {
            return;
        }
        const doc = new jspdf.jsPDF({
            unit: "pt",
            format: "A4", // A4 [595.28, 841.89]
            compress: true,
        });
        this.currentIndex = 0;
        this.appendFile(this.currentIndex, doc);

        // 不能并行 需要串行
        // var promises = [];
        // store.files.forEach((id) => {
        //     const file = store.fileMap[id];
        //     list.push(file);
        //     if (this.isImg(id)) {
        //         promises.push(this.appendImage(doc, file));
        //     }
        // });
        // Promise.all(promises).then(() => {
        //     console.log("alldone");
        //     doc.save("1.pdf");
        // });
    },

    appendFile(index, doc) {
        if (index >= store.files.length) {
            doc.save("1.pdf");
            return;
        }
        var id = store.files[index];
        var file = store.fileMap[id];
        // return new Promise((resolve, reject) => {
        //     if (this.isImg(id)) {
        //         this.appendImage(doc, file).then(() => {
        //             resolve();
        //         });
        //     }
        // })
        output.log(`${index + 1} 开始处理 ${file.file.name}`);
        if (this.isImg(id)) {
            return this.appendImage(doc, file).then(() => {
                output.log(`${index + 1} 处理 ${file.file.name} 完成`);
                this.currentIndex++;
                this.appendFile(this.currentIndex, doc);
            });
        }
    },
    appendImage(doc, file) {
        return new Promise((resolve, reject) => {
            var img = new Image();
            img.onload = () => {
                const { width, height } = this.getImgSize(img);
                console.log(width, height);
                var canvas = document.createElement("canvas");
                console.log(store.compress);
                if (store.compress) {
                    canvas.width = A4_SIZE[0] * 2;
                    canvas.height = A4_SIZE[1] * 2;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, A4_SIZE[0] * 2, A4_SIZE[1] * 2);
                } else {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
                if (this.currentIndex !== 0) {
                    doc.addPage();
                }
                doc.addImage(canvas, "JPEG", 0, 0, width, height);
                // doc.addImage(canvas, "JPEG", 0, 0, width, height, "", "SLOW");
                resolve();
            };
            img.src = file.url;
        });
    },
    appendPdfFile(doc, file) {},
    getImgSize(img) {
        const width = img.width;
        const height = img.height;
        const ratio = width / height;
        const maxWidth = A4_SIZE[0];
        const maxHeight = A4_SIZE[1];
        const result = {
            width: width,
            height: height,
        };
        if (width > maxWidth) {
            result.width = maxWidth;
            result.height = result.width / ratio;
        }
        if (result.height > maxHeight) {
            result.height = maxHeight;
            result.width = result.height * ratio;
        }
        return result;
    },

    reset() {
        store.files = [];
        Object.keys(store.fileMap).forEach((id) => {
            const item = store.fileMap[id];
            URL.revokeObjectURL(item.url);
            console.log(item);
        });
        store.index = 0;
        store.fileMap = {};
        this.currentIndex = 0;
    },
}).mount();
