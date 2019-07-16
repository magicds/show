/**
 * 折扇图片+气泡
 * author：陈东顺
 * date：2016-9-30
 */
// 折扇
(function() {
  // 初始化
  function init(id) {
    var imgbox = document.querySelector(id);
    if (!imgbox) return;
    var fanli = imgbox.querySelectorAll('.fanli');
    var len = fanli.length;
    // 封面 即最后一个点击事件

    fanli[len - 1].addEventListener(
      'click',
      function() {
        var i = 0;
        if (!foldingFan.fanOpened) {
          for (i = 0; i < len; i++) {
            fanli[i].style.transform = 'rotate(' + 15 * (i - len / 2) + 'deg)';
          }
          foldingFan.fanOpened = true;
          return;
        }

        for (i = 0; i < len; i++) {
          fanli[i].style.transform = 'rotate(360deg)';
        }
        foldingFan.fanOpened = false;
      },
      false
    );

    // 非最后一个点击 当前为0度 左侧+=-15 右侧 30 开始之后+=15
    imgbox.addEventListener(
      'click',
      function(e) {
        var target = e.target;
        if (target.nodeName.toLowerCase() != 'img') return;

        // 当前点击的 0 度
        var nowLi = target.parentNode;
        if (getSibling(nowLi, 'next') === null) return;
        nowLi.style.transform = 'rotate(0deg)';
        // 左侧的依次递减15°
        var leftdeg = 0;
        // var preLi = nowLi.previousSibling; // 获取当前的前一个节点  可能返回空文本节点
        var preLi = getSibling(nowLi, 'prev'); // 获取当前的前一个节点

        while (preLi) {
          leftdeg -= 15;
          preLi.style.transform = 'rotate(' + leftdeg + 'deg)';
          preLi = getSibling(preLi, 'prev'); // 继续取这个的前一个；
        }
        // 右侧的 依次递增15°
        var rightdeg = 20;
        var nextLi = getSibling(nowLi, 'next');
        while (nextLi) {
          rightdeg += 15;
          nextLi.style.transform = 'rotate(' + rightdeg + 'deg)';
          nextLi = getSibling(nextLi, 'next'); // 继续取下一个
        }
      },
      true
    );
  }

  /**
   * [getSibling description] 获取兄弟元素，原生的nextSibling和previousSibling可能返回空文本节点
   * @param  {[type]} source    [description] 当前元素
   * @param  {[type]} direction [description] 方向 prev || next
   * @return {[type]}           [description] null OR element
   */
  function getSibling(source, direction) {
    var result = null;
    if (direction == 'prev') {
      result = source.previousSibling;
      //  非null 且为文本节点时继续
      while (result && result.nodeName.toLowerCase() == '#text') {
        result = result.previousSibling;
      }
    } else if (direction == 'next') {
      result = source.nextSibling;
      while (result && result.nodeName.toLowerCase() == '#text') {
        result = result.nextSibling;
      }
    }
    return result;
  }

  var foldingFan = {
    fanOpened: false, //  记录折扇是否打开
    init: init
  };

  // 初始化折扇
  foldingFan.init('#imgbox');
})();

// 画布
(function() {
  // 画布
  var canvas = document.querySelector('#canvas');
  var canvasContext = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener(
    'resize',
    function() {
      setTimeout(function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }, 100);
    },
    false
  );

  // ball
  /*var circle = {
        x: x,
        y: y,
        r: r,
        vx: vx,
        vy: xy,
        color: color
    };*/
  // var colors = [''];

  function Circle(x, y) {
    this.x = x + random(-5, 5);
    this.y = y + random(-5, 5);
    this.r = random(10, 35);
    this.vx = Math.random() - 0.5;
    this.vy = Math.random() - 0.5;
    this.color = '#' + random(0, 16).toString(16) + random(0, 16).toString(16) + random(0, 16).toString(16);
    // this.color = '#fff';
  }
  // 随机数
  function random(x, y) {
    return Math.round(Math.random() * (y - x) + x);
  }
  // 画圆
  function drawCircle(c) {
    canvasContext.beginPath();
    // 画
    canvasContext.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    // 填充颜色
    canvasContext.fillStyle = c.color;
    // 叠加样式
    canvasContext.globalCompositeOperation = 'lighter';
    // 添加到画布
    canvasContext.fill();
  }
  var circles = [];
  // 鼠标移动事件
  var timer;
  var autoRuning = true; // 记录是定时器在调用
  canvas.addEventListener('mousemove', function(e) {
    for (var i = 0; i < 2; i++) {
      circles.push(new Circle(e.clientX, e.clientY));
      if (circles.length > 300) circles.shift();
    }
    if (autoRuning) {
      clearInterval(timer);
      timer = setInterval(moveDraw, 30);
      autoRuning = false;
    }
  });
  // 实时画圆
  function moveDraw() {
    // 清空画布
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    // 此数组长度变化，不要直接在首次获取长度
    for (var i = 0; i < circles.length; i++) {
      // 更改小圆位置和半径
      circles[i].x += circles[i].vx * 10;
      circles[i].y += circles[i].vy * 10;
      circles[i].r *= 0.95;

      /*// 半径小于1时不用画出  这样不够合理，小圆仍占据数组位置，当都很小时需要清空定时器。
            if (circles[i].r > 1) {
                drawCircle(circles[i]);
            }*/
      // 半径过小时，从数组中移除这个元素
      if (circles[i].r < 1) {
        circles.splice(i, 1);
        i--; // 当前元素移除，下一个占据此位置，需要调整i
        continue;
      }
      drawCircle(circles[i]);
    }
    // 数组都为空时，清除计时器
    if (circles.length === 0) {
      clearInterval(timer);
      autoRuning = true;
    }
  }
})();
