!(function ($) {
    if (typeof $ != 'function') {
        throw new Error('jQuery is required!');
    }
    $.fn.initStep = function (opt) {
        opt = $.extend({
            title: [],
            lineLimit: 8,
            duration: 400,
            injectStyle: true
        }, opt);
        this.stepOpts = opt;
        this.stepActiveIndex = -1;
        this.stepCurrIndex = -1;
        this.$activeStep = null;
        this.stepOpts.injectStyle && initStyle();
        initView(opt, this);
        return this;
    };

    $.fn.toStep = function (n) {
        n = parseInt(n, 10);
        if (!this.stepOpts || !$.isNumeric(n)) {
            return -1;
        }
        if (n >= this.stepOpts.title.length) {
            n = this.stepOpts.title.length - 1;
        }
        if (n < 0) {
            n = -1;
        }
        var step = Math.abs(this.stepCurrIndex - n);

        if (step === 0) {
            return -1;
        }

        // 激活的索引和dom
        this.stepActiveIndex = n;
        this.$activeStep = this.find('.flow-item').removeClass('activeItem')
            .filter('[data-index="' + this.stepActiveIndex + '"]').addClass('activeItem');
        if (!this.$activeStep.length) {
            this.$activeStep = null;
        }

        var $el = (function (that) {
            if (that.$currItem && that.$currItem.length) {
                return that.$currItem;
            } else {
                return that.find('.flow-item:first');
            }
        })(this);

        if (this.stepCurrIndex < n) {
            animateNext(this, $el, n, this.stepOpts.duration / step);
        } else {
            animatePrev(this, $el, n, this.stepOpts.duration / step);
        }


        return step;
    };
    $.fn.nextStep = function () {
        return this.toStep(this.stepActiveIndex + 1);
    };
    $.fn.prevStep = function () {
        return this.toStep(this.stepActiveIndex - 1);
    };
    $.fn.getActiveSetp = function () {
        if (!this.stepOpts) return null;
        return {
            index: this.stepActiveIndex,
            text: this.$activeStep ? this.$activeStep.data('text') : ''
        };
    };

    function initView(opt, $el) {
        var flows = opt.title;
        if (!flows || !flows.length) {
            throw new Error('必须制定流程步骤集合');
        }

        var len = flows.length,
            lines = Math.ceil(len / opt.lineLimit);

        var i = 0,
            j = 0,
            curr = 0,
            w = 'style=width:' + (100 / opt.lineLimit) + '%',
            html = '';

        while (i < lines) {
            html += '<div class="flow-line-wrap line-' + i + (i % 2 === 0 ? '' : ' reverse') + '">';

            html += '<div class="flow-item-list">';
            for (j = 0; j < opt.lineLimit; j++) {
                if (curr >= len) {
                    break;
                }
                html += '<div class="flow-item" ' + w + ' data-index="' + curr + '" data-text="' + flows[curr] + '"><div class="flow-item-content">' + flows[curr] + '</div><div class="flow-item-info" ' + w + '><div class="flow-item-progress"></div><span class="flow-item-index">' + (curr + 1) + '</span></div></div>';

                curr++;
            }
            html += '</div><div class="flow-progress"></div>';
            html += '<div class="flow-progress-r"></div>';
            html += '</div>';
            i++;
        }

        $(html).appendTo($el.empty());
    }
    /**
     * 向后动画
     * 
     * @param {any} $this 当前实例
     * @param {any} $el 起始操作元素
     * @param {any} n 目前索引
     * @param {any} duration 每步动画时间
     */
    function animateNext($this, $el, n, duration) {
        // 往后进行时，若起始已经是高亮则直接到下一个开始
        if ($el.hasClass('active')) {
            var $next = $el.next();
            if ($next.length) {
                $el = $next;
            } else {
                // 如果传入的第一个恰好是一行的末尾 还需要处理折线

                $el.closest('.flow-line-wrap').addClass('active');
                $el = $this.find('.flow-item[data-index="' + ($this.stepCurrIndex + 1) + '"]');
            }
        }
        $this.$currItem = $el;
        var index = $el.data('index');
        $this.stepCurrIndex = index;

        $el.stop(true).addClass('active').find('.flow-item-progress').animate({
            width: '100%'
        }, duration || 200, function () {
            // 若不是目标步骤则继续

            if (index < n) {
                if (!$el.next().length) {
                    $el.closest('.flow-line-wrap').addClass('active');
                }
                animateNext($this, $this.find('[data-index="' + (index + 1) + '"]'), n, duration);
            }
        });
    }
    /**
     * 向前动画
     * 
     * @param {any} $this 当前实例
     * @param {any} $el 起始操作元素
     * @param {any} n 目前索引
     * @param {any} duration 每步动画时间
     */
    function animatePrev($this, $el, n, duration) {
        var $prev = $el.prev();
        if ($prev.length) {
            $this.$currItem = $prev;
        } else {
            $this.$currItem = $el.closest('.flow-line-wrap').prev().find('.flow-item:last');
        }

        var index = $el.data('index');
        $this.stepCurrIndex = index - 1;

        $el.stop(true).removeClass('active').find('.flow-item-progress').animate({
            width: '0'
        }, duration || 200, function () {
            // 若不是目标步骤则继续
            if (index > n) {
                // 处理竖线
                if (!$el.prev().length) {
                    $el.closest('.flow-line-wrap').prev().removeClass('active');
                }
                // 处理前一个
                if (index - 1 > n) {
                    animatePrev($this, $this.find('[data-index="' + (index - 1) + '"]'), n, duration);
                }
            }
        });
    }

    function initStyle() {
        if (document.getElementById('step-style')) {
            return;
        }
        var styleText = '.flow-line-wrap{width:100%;position:relative;padding-top:40px;line-height:26px}.flow-line-wrap:after,.flow-item-list:after{display:block;content:"";clear:both}.flow-progress{position:absolute;top:20px;height:10px;width:100%;-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px;background:#ddd;z-index:-2}.flow-item{margin-bottom:30px;float:left;padding-bottom:20px;text-align:center}.flow-line-wrap.reverse .flow-item{float:right}.flow-item-content{padding:10px 10px 0}.flow-item-info{position:absolute;top:10px;height:20px;text-align:center}.flow-item-progress{position:absolute;left:0;width:0;top:10px;height:10px;background:#38c538;z-index:-1}.flow-line-wrap.reverse .flow-item-progress{left:auto;right:0}.flow-item-index{display:inline-block;width:30px;height:30px;-webkit-border-radius:50%;-moz-border-radius:50%;border-radius:50%;background:#ddd;line-height:30px;text-align:center}.flow-item.active .flow-item-index{background:#38c538;color:#fff}.flow-progress-r{background:#ddd;-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px;width:10px;height:100%;position:absolute;bottom:0;right:0;top:25px;z-index:-2}.flow-line-wrap.active>.flow-progress-r{background:#38c538}.flow-line-wrap.reverse>.flow-progress-r{right:auto;left:0}.flow-line-wrap:last-child>.flow-progress-r{display:none}';

        $('<style id="step-style">' + styleText + '</style>').appendTo('head');
    }
}(jQuery));