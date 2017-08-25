(function(win) {
    $(win).on('resize', function() {
        ChartTransition.win_size.width = $(win).width();
        ChartTransition.win_size.height = $(win).height();
    });
    var ChartTransition = {
        // 默认配置
        DEFAULT_SETTINGS: {
            // 消失时，高度相对屏幕高度
            missSize: 0.8,
            // 消失时有宽度还剩下多少可见
            missVisible: 1,
            // 运动类型：time为定时，使用duration计算速度。 speed表示匀速，使用speed设定值作为运动速度
            moveType: 'time',
            // moveType: 'speed',
            // 运动速度：
            speed: 100 / 1000,
            // 动画时间 毫秒
            duration: 2000
        },
        win_size: {
            width: $(window).width(),
            height: $(window).height()
        },
        cfg: null,
        // 获取起点坐标
        getStartPos: function($el) {
            var pos = $el.offset();
            return {
                x: pos.left,
                y: pos.top
            };
        },
        // 获取终点坐标
        getEndPos: function() {
            var size = this.getStartSize(this.$el);
            // 终点时 高度和宽度
            var c_h = this.win_size.height * this.cfg.missSize,
                c_w = size.width / size.height * c_h;
            // 此时坐标，body为原点
            var x = this.win_size.width - c_w * this.cfg.missVisible,
                y = (this.win_size.height - c_h) / 2;

            return {
                x: x,
                y: y
            };
        },
        // 获取运动速度
        getSpeed: function() {

            var startPos = this.getStartPos(this.$el),
                endPos = this.getEndPos();
            console.log('end', endPos);
            var x_distance = endPos.x - startPos.x,
                y_distance = endPos.y - startPos.y;

            var vx, xy;

            // 如果是指定速度的 
            if (this.cfg.moveType == 'speed') {
                var xtime = Math.abs(x_distance / this.cfg.speed),
                    ytime = Math.abs(y_distance / this.cfg.speed);
                // 取较长的时间
                var time = xtime > ytime ? xtime : ytime;

                // 即设定的速度作为位移较大的方法的速度，另一个速度据此等比换算。
                vx = x_distance / time;
                vy = y_distance / time;

                // 记录时间
                this.cfg.duration = time;

            } else if (this.cfg.moveType == 'time') {
                // 指定时间的
                vx = x_distance / this.cfg.duration;
                vy = y_distance / this.cfg.duration;
            }


            return {
                vx: vx,
                vy: vy
            };
        },
        // 获取运动时间 
        getMoveDuration: function() {
            if (this.cfg.moveType == 'time') {
                return this.cfg.duration;
            } else if (this.cfg.moveType == 'speed') {
                // 应该计算 但在获取速度中已经计算了，暂时这么用吧
                return this.cfg.duration;
            }
        },
        // 获取初始高度
        getStartSize: function($el) {
            return {
                width: $el.width(),
                height: $el.height()
            };
        },
        // 获取尺寸增加值
        getSizeStep: function(startSize) {
            if (startSize === undefined) startSize = this.getStartSize(this.$el);
            // 结束时高度
            var end_height = this.win_size.height * this.cfg.missSize;
            console.log('end_height', end_height);
            // 高度增加值 (结束时高度 - 初始高度)/时间
            var size_increase_h = (end_height - startSize.height) / this.cfg.duration,
                // 宽度 = 宽高比*高step
                size_increase_w = startSize.width / startSize.height * size_increase_h;
            return {
                widthStep: size_increase_w,
                heightStep: size_increase_h
            };
        },
        addCover: function() {
            $('#chart-cover').removeClass('hidden');
        },
        removeCover: function() {
            $('#chart-cover').addClass('hidden');
        },
        move: function(el, cfg) {

            this.cfg = $.extend(true, {}, this.DEFAULT_SETTINGS, cfg);

            var $el = $(el),
                // 只要容器就好了
                $copy = $el.clone(false).empty();

            this.cfg = $.extend(true, {}, this.DEFAULT_SETTINGS, cfg);
            this.$el = $el;
            this.$copy = $copy;

            var startPos = this.getStartPos($el),
                size = this.getStartSize($el);
            console.log('start');
            console.log(startPos);
            // 更改ID
            $copy[0].id = $el[0].id + '-copy';
            // 处理canvas        
            var $canvas = this._dealCanvas($el);
            $canvas.appendTo($copy);

            // 设置初始位置
            $copy.css({
                position: 'absolute',
                background: '#fff',
                zIndex: 1000,
                top: startPos.y,
                left: startPos.x,
                width: size.width,
                height: size.height
            });

            // 添加到body
            $copy.appendTo('body');
            var endPos = this.getEndPos();
            // 开始移动
            var movePromise = this._move(50, $copy, $canvas, startPos, endPos, size);

            // 移动完成的回调
            movePromise.done($.proxy(this._stop, this));


        },
        _move: function(space, $copy, $canvas, startPos, endPos, size) {
            var dtd = $.Deferred();
            // 添加遮罩
            this.addCover();
            // 移动
            var ct = startPos.y,
                cl = startPos.x,
                cw = size.width,
                ch = size.height;
            // 速度
            var speed = this.getSpeed();
            console.log('速度', speed);
            var sizeStep = this.getSizeStep(size);
            console.log('sizeStep', sizeStep);
            // 不断移动
            var that = this;

            // 位置 和 尺寸 每次增加值
            var c_y = speed.vy * space,
                c_x = speed.vx * space,
                c_w = sizeStep.widthStep * space,
                c_h = sizeStep.heightStep * space;

            // 结束时高度
            var end_height = this.win_size.height * this.cfg.missSize;

            var _go = function() {
                // 动画结束
                if (ch - c_h >= end_height) {
                    clearInterval(moveTimer);
                    dtd.resolve();
                    return;
                }
                // if (cl >= endPos.x) {
                //     clearInterval(moveTimer);
                //     dtd.resolve();
                // }
                ct += c_y;
                cl += c_x;
                cw += c_w;
                ch += c_h;

                $copy.css({
                    top: ct,
                    left: cl,
                    width: cw,
                    height: ch
                });
                if ($canvas.length) {
                    $canvas.css({
                        width: cw,
                        height: ch
                    });
                }
            };
            _go();
            var moveTimer = setInterval(_go, space);

            return dtd.promise();
        },
        _stop: function() {
            var that = this;
            this.$copy.fadeOut('slow', function() {
                that.removeCover();
                that.$copy.remove();
            });
        },
        /**
         * [_dealCanvas  处理canvas，由于直接复制一份canvas出来，里面是空白的，需要读出图像数据，再创建一个新的写入]
         * @param  {[dom对象或jQuery对象]} el [内部包含canvas元素的对象]
         * @return {[undefined|内部含canvas的jQuery对象]}    [el中有canvas，则返回一个新的canvas；否则返回undefined]
         */
        _dealCanvas: function(el) {
            var $canvas = $(el).find('canvas');

            if (!$canvas.length) return;

            var canvas = $canvas[0],
                canvasContext = canvas.getContext('2d'),
                chartData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
            /**
             * chartData
             *      data:imgdata,
             *      height:
             *      width:
             */

            var canvasCopy = document.createElement('canvas');
            canvasCopy.width = canvas.width;
            canvasCopy.height = canvas.height;
            canvasCopy.id = +new Date() + '-copy';

            canvasCopy.getContext('2d').putImageData(chartData, 0, 0);

            return $(canvasCopy);
        }


    };


    win.ChartTransition = ChartTransition;
})(window);

// 点击效果
(function(win, $) {

    $('body').on('click', '.histogram', function(e) {

        ChartTransition.move(this);

    }).on('click', '.heibeimap', function(e) {

        ChartTransition.move(this, {
            // 消失时，高度相对屏幕高度
            missSize: 0.8,
            // 消失时有宽度还剩下多少可见 百分比
            missVisible: 0,
            // 运动类型：time为定时，使用duration计算速度(speed将忽略)
            //           speed表示匀速，使用speed设定值作为运动速度(duration设定将被忽略)
            moveType: 'speed',
            // 运动速度：
            speed: 200 / 1000,
            // 动画时间 毫秒
            duration: 3000
        });

    });


})(window, jQuery);
