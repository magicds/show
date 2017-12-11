/**
 * 网页文本朗读实现
 * author: cdswyda (Douglas Chen)
 * https://github.com/cdswyda/show
 * License: MIT
 * article: 
 */
(function ($) {
    if (typeof $ !== 'function') {
        console.error('require jQuery!');
    }

    if (!window.SpeechSynthesisUtterance || !window.speechSynthesis) {
        console.error('您的浏览器不支持，请使用 \r\n Chrome 33+ \r\n FireFox 49+ \r\n IE-Edge \r\n 等浏览器');
        alert('您的浏览器不支持，请使用 \r\n Chrome 33+ \r\n FireFox 49+ \r\n IE-Edge \r\n 等浏览器');
    }

    // 非正文需要朗读的标签 逗号分隔
    var speakTags = 'a, p, span, h1, h2, h3, h4, h5, h6, img, input, button';
    // 标签朗读文本
    var tagTextConfig = {
        'a': '链接',
        'input[text]': '文本输入框',
        'input[password]': '密码输入框',
        'button': '按钮',
        'img': '图片'
    };
    // 正文拆分配置
    var splitConfig = {
        // 内容分段标签名称
        unitTag: 'p',
        // 正文中分隔正则表达式
        splitReg: /[,;，；。]/g,
        // 包裹标签名
        wrapTag: 'label',
        // 包裹标签类名
        wrapCls: 'speak-lable',
        // 高亮样式名和样式
        hightlightCls: 'speak-help-hightlight',
        hightStyle: 'background: #000!important; color: #fff!important'
    };
    /**
     * 获取标签朗读文本
     * @param {HTMLElement} el 要处理的HTMLElement
     * @returns {String}   朗读文本
     */
    function getTagText(el) {
        if (!el) return '';

        var tagName = el.tagName.toLowerCase();

        // 处理input等多属性元素
        switch (tagName) {
            case 'input':
                tagName += '[' + el.type + ']';
                break;
            default:
                break;
        }

        return (tagTextConfig[tagName] || '') + ' ';
    }

    /**
     * 获取完整朗读文本
     * @param {HTMLElement} el 要处理的HTMLElement
     * @returns {String}   朗读文本
     */
    function getText(el) {
        if (!el) return '';

        return getTagText(el) + (el.title || el.alt || el.innerText || '');
    }


    /**
     * 正文内容分段处理
     * @param {jQueryObject/HTMLElement/String}  $content 要处理的正文jQ对象或HTMLElement或其对应选择器
     */
    function splitConent($content) {
        $content = $($content);

        $content.find(splitConfig.unitTag).each(function (index, item) {
            var $item = $(item),
                text = $item.text();

            if (!text) return;

            // 处理内容内容
            var nodes = $item[0].childNodes;

            $.each(nodes, function (i, node) {
                switch (node.nodeType) {
                    // text 节点
                    case 3:
                        // 由于是文本节点，标签被转义了，后续再转回来
                        node.data = '<' + splitConfig.wrapTag + '>' +
                            node.data.replace(splitConfig.splitReg, '</' + splitConfig.wrapTag + '>$&<' + splitConfig.wrapTag + '>') +
                            '</' + splitConfig.wrapTag + '>';
                        break;
                        // 元素节点
                    case 1:
                        var innerHtml = node.innerHTML,
                            start = '',
                            end = '';
                        // 如果首尾还有直接标签，先去掉
                        var startResult = /^<\w+?>/.exec(innerHtml);
                        if (startResult) {
                            start = startResult[0];
                            innerHtml = innerHtml.substr(start.length);
                        }
                        var endResult = /<\/\w+?>$/.exec(innerHtml);
                        if (endResult) {
                            end = endResult[0];
                            innerHtml = innerHtml.substring(0, endResult.index);
                        }
                        // 更新内部内容
                        node.innerHTML = start +
                            '<' + splitConfig.wrapTag + '>' +
                            innerHtml.replace(splitConfig.splitReg, '</' + splitConfig.wrapTag + '>$&<' + splitConfig.wrapTag + '>') +
                            '</' + splitConfig.wrapTag + '>' +
                            end;
                        break;
                    default:
                        break;
                }
            });

            // 处理文本节点中被转义的html标签
            $item[0].innerHTML = $item[0].innerHTML
                .replace(new RegExp('&lt;' + splitConfig.wrapTag + '&gt;', 'g'), '<' + splitConfig.wrapTag + '>')
                .replace(new RegExp('&lt;/' + splitConfig.wrapTag + '&gt;', 'g'), '</' + splitConfig.wrapTag + '>');

            $item.find(splitConfig.wrapTag).addClass(splitConfig.wrapCls);
        });
    }

    /**
     * 在页面上写入高亮样式
     */
    function createStyle() {
        if (document.getElementById('speak-light-style')) return;

        var style = document.createElement('style');
        style.id = 'speak-light-style';
        style.innerText = '.' + splitConfig.hightlightCls + '{' + splitConfig.hightStyle + '}';
        document.getElementsByTagName('head')[0].appendChild(style);
    }

    function initEvent() {
        $(document).on('mouseenter.speak-help', speakTags, function (e) {
            var $target = $(e.target);

            if ($target.parents('.' + splitConfig.wrapCls).length || $target.find('.' + splitConfig.wrapCls).length) {
                return;
            }

            // 图片样式单独处理 其他样式统一处理
            if (e.target.nodeName.toLowerCase() === 'img') {
                $target.css({
                    border: '2px solid #000'
                });
            } else {
                $target.addClass(splitConfig.hightlightCls);
            }

            // 开始朗读
            speakText(getText(e.target));

        }).on('mouseleave.speak-help', speakTags, function (e) {
            var $target = $(e.target);
            if ($(e.target).parents('.' + splitConfig.wrapCls).length || $target.find('.' + splitConfig.wrapCls).length) {
                return;
            }

            // 图片样式
            if (e.target.nodeName.toLowerCase() === 'img') {
                $target.css({
                    border: 'none'
                });
            } else {
                $target.removeClass(splitConfig.hightlightCls);
            }

            // 停止语音
            stopSpeak();
        });

        $(document).on('mouseenter.speak-help', '.' + splitConfig.wrapCls, function (e) {
            $(this).addClass(splitConfig.hightlightCls);

            // 开始朗读
            speakText(getText(this));
        }).on('mouseleave.speak-help', '.' + splitConfig.wrapCls, function (e) {
            $(this).removeClass(splitConfig.hightlightCls);

            // 停止语音
            stopSpeak();
        });
    }

    function offEvent() {
        $(document)
            .off('mouseenter.speak-help', speakTags)
            .off('mouseleave.speak-help', speakTags);

        $(document)
            .off('mouseenter.speak-help', '.' + splitConfig.wrapCls)
            .off('mouseleave.speak-help', '.' + splitConfig.wrapCls);
    }

    // 开始朗读
    var speaker = new window.SpeechSynthesisUtterance();
    var speakTimer;

    function speakText(text) {
        clearTimeout(speakTimer);
        window.speechSynthesis.cancel();
        speakTimer = setTimeout(function () {
            speaker.text = text;
            window.speechSynthesis.speak(speaker);
        }, 200);
    }

    // 停止朗读
    var stopTimer;

    function stopSpeak() {
        clearTimeout(stopTimer);
        // clearTimeout(speakTimer);
        stopTimer = setTimeout(function () {
            window.speechSynthesis.cancel();
        }, 100);
    }

    /**
     * 开始调用
     */
    // 创建样式
    createStyle();
    // 分隔正文内容
    // 指定正文区域进行大段文本处理
    splitConent($('.content'));
    // 初始化事件
    initEvent();

    /**
     *  关闭功能
     */
    // offEvent();

}(jQuery));