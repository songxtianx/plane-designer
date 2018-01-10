
/**
 * 绘制设计图
 * 
 * Written by maowenchao @ 2017-12
 * maowc@chinasap.cn
 * http://www.chinasapi.com
 */

(function (win, doc) {

    /**
     * 筛选单个 DOM 对象
     * 
     * @param {string} selector     选择器
     * @param {Element} [context]   筛选上下文
     */
    function qs(selector, context) {
        try {
            return (context || doc).querySelector(selector);
        } catch (e) {
            return null;
        }
    }

    /**
     * 筛选多个 DOM 对象
     * 
     * @param {string} selector     选择器
     * @param {Element} [context]   筛选上下文
     */
    function qsa(selector, context) {
        return Array.prototype.slice.call((context || doc).querySelectorAll(selector) || []);
    }

    function extend(target, src, deep) {
        var key;
        var value;

        if (target instanceof Object && src instanceof Object) {
            for (key in src) {
                value = src[key];

                if (deep && value instanceof Object) {
                    target[key] = extend(Array.isArray(value) ? [] : {}, value);
                }
                else {
                    target[key] = value;
                }
            }
        }

        return target;
    }

    function assign() {
        var args = [].slice.call(arguments);
        var target;

        if (typeof Object.assign === 'function') {
            return Object.assign.apply(null, args);
        }
        else {
            return args.reduceRight(function (prev, current) {
                return extend(current, prev);
            }, {});
        }
    }

    function handleTouchEvent(handler) {
        var _ = this;
        return function (e) {
            if (e.targetTouches.length === 1) {
                handler.call(this, e.targetTouches[0]);
            }
        };
    }

    /**
     * 事件绑定
     * 
     * @param {Element|Document}  el     指定响应事件的元素
     * @param {string}   type            事件类型，无需前缀 on
     * @param {EventListener} handler    事件处理回调
     */
    function on(el, type, handler) {
        var eventMap = {
            'mousedown': 'touchstart',
            'mousemove': 'touchmove',
            'mouseup': 'touchend'
        };

        if (el) {
            el.addEventListener(type, handler, false);

            if ('ontouchstart' in doc && type in eventMap) {
                el.addEventListener(eventMap[type], handleTouchEvent(handler), false);
            }
        }
    }

    /**
     * 手工触发指定事件
     * 
     * @param {Node} el      触发事件的元素
     * @param {string}  type     指定事件类型，无需前缀 on
     */
    function trigger(el, type) {
        if (el) {
            var event = document.createEvent('Event');

            event.initEvent(type, true, true);
            el.dispatchEvent(event);
        }
    }

    /**
     * 从指定元素中移除一个类
     * 
     * @param {Element}  el          移除类的元素
     * @param {string}   name        待移除的类名，仅限一个，同时移除多个类需多次调用本函数
     * @param {function} [callback]  执行移除样式类后执行的回调
     */
    function removeClass(el, name, callback) {
        var classList = [];
        var newClassList = [];
        var baseVal;

        if (!(el instanceof Element)) {
            return;
        }

        baseVal = typeof el.className['baseVal'] === 'string';

        if (baseVal) {
            classList = el.className['baseVal'].split(' ');
        }
        else {
            classList = el.className.split(' ');
        }

        classList.forEach(function (c) {
            if (c !== name) {
                newClassList.push(c);
            }
        });

        if (typeof callback == 'function') {
            callback(newClassList);
        }

        if (newClassList.length === 0) {
            el.removeAttribute('class');
        }
        else {
            if (baseVal) {
                el.className['baseVal'] = newClassList.join(' ');
            }
            else {
                el.className = newClassList.join(' ');
            }
        }
    }

    /**
     * 向指定元素添加类
     * 
     * @param {Element} el  添加类的元素
     * @param {string}  name 指定添加的类名，仅限一个，同时添加多个类需多次调用本函数
     */
    function addClass(el, name) {
        if (el) {
            removeClass(el, name, function (classList) {
                classList.push(name);
            });
        }
    }

    function hasClass(el, selector) {
        if (el.matches) {
            return el.matches(selector);
        }
        else if (el.matchesSelector) {
            return el.matchesSelector(selector);
        }
        else if (el.webkitMatchesSelector) {
            return el.webkitMatchesSelector(selector);
        }
        else if (el.msMatchesSelector) {
            return el.msMatchesSelector(selector);
        }
        else if (el.mozMatchesSelector) {
            return el.mozMatchesSelector(selector);
        }
        else if (el.oMatchesSelector) {
            return el.oMatchesSelector(selector);
        }
    }

    /**
     * 解释URL（？号后的）搜索字符串为对象
     * 
     * @param {string} [url] 指定URL
     */
    function urlSearch(url) {
        var result = { length: 0 };
        var set = (typeof url == 'string' ? url : doc.location.search).match(/\w+\=[^&|$]*/g);

        if (set != null) {
            set.forEach(function (description) {
                var d = description.match(/(\w+)\=(.*)/);

                d[2] = decodeURI(d[2]);
                result[d[1]] = /^\-?(\d*\.)?\d+(\e\-?\d+)?$/.test(d[2]) ? float(d[2]) : d[2];
            });

            result.length = set.length;
        }

        return result;
    }

    /**
     * 发起 ajax 请求
     * 
     * @param {object} o 发起 ajax 请求的配置对象
     */
    function ajax(o) {
        var req = new XMLHttpRequest();
        var post = [];
        var contentType = {
            json: 'application/json',
            form: 'application/x-www-form-urlencoded; charset=UTF-8',
            text: 'text/plain',
            html: 'text/html',
            xml: 'application/xml',
            svg: 'image/svg+xml'
        };

        if (typeof o.data == 'object') {
            Object.keys(o.data).forEach(function (key) {
                post.push(encodeURIComponent(key) + '=' + encodeURIComponent(o.data[key]));
            });

            o.data = post.join('&');
        }
        else {
            o.data = '';
        }

        o.type = o.type || 'json';
        o.async = (o.async === false ? false : true);

        req.open(o.method || 'GET', o.url, o.async, o.user || '', o.password || '');

        req.timeout = o.timeout || 0;
        req.onerror = o.fail;

        req.setRequestHeader('content-type', contentType[o.type]);

        if (Array.isArray(o.header)) {
            o.header.forEach(function (item) {
                req.setRequestHeader(item.name, item.value);
            });
        }

        req.onreadystatechange = function () {
            var text;

            if (req.readyState === 4) {
                if (req.status === 200 && typeof o.success == 'function') {
                    text = req.responseText;
                    o.success(typeof text == 'string' && o.type === 'json' ? JSON.parse(text) : text);
                }
                else {
                    typeof o.fail === 'function' && o.fail();
                }
            }
        }

        if (typeof o.before == 'function') {
            o.before(req);
        }

        req.send(o.data);

        return req;
    }

    /**
     * 简易消息展示，指定时间内自动隐藏
     * 
     * @param {string} msg          消息内容
     * @param {number} [timeout]    自动隐藏时间，单位毫秒，默认4秒（4000毫秒）
     */
    function message(msg, timeout) {
        var m = doc.createElement('div');

        assign(m.style, {
            position: 'absolute',
            left: '0',
            top: '0',
            right: '0',
            bottom: '0',
            width: '280px',
            height: '30px',
            lineHeight: '30px',
            textAlign: 'center',
            borderRadius: '10px',
            backgroundColor: '#000',
            padding: '15px',
            color: '#fff',
            opacity: '0.7',
            margin: 'auto'
        });

        m.textContent = msg;

        doc.body.appendChild(m);

        setTimeout(function () {
            if (typeof m.remove === 'function') {
                m.remove();
            }
            else {
                m.parentNode.removeChild(m);
            }
        }, timeout || 4000);
    }

    // 创建短随机字符串
    function randomString() {
        return Math.random().toString(36).substr(2);
    }

    function disablePageSelect() {
        on(doc, 'selectstart', function (e) {
            e.preventDefault();
            return false;
        });
    }

    // 禁用浏览器默认的页面缩放
    function disablePageZoom() {
        function handler(e) {
            if ((e.wheelDelta && e.ctrlKey) || e.detail) {
                e.returnValue = false;
                return false;
            }
        }

        on(doc, 'mousewheel', handler);
    }

    function disableContextMenu() {
        on(doc, 'contextmenu', function (e) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        });
    }

    function px(x) {
        return (x || 0) + 'px';
    }

    function float(n) {
        return parseFloat(n) || 0;
    }

    function fontSize(size) {
        return px(float(size) / 5);
    }

    function lineHeight(height) {
        return px(float(height) - float(fontSize(height)) / 2)
    }

    function trim(str) {
        return typeof String.prototype.trim === 'function' ? str.trim() : str.replace(/^\s+|\s+$/g, '');
    }

    function View() {
        var KEY_CODE_DELETE = 46;
        var KEY_CODE_ESC = 27;
        var KEY_CODE_LEFT_ARROW = 37;
        var KEY_CODE_UP_ARROW = 38;
        var KEY_CODE_RIGHT_ARROW = 39;
        var KEY_CODE_BOTTOM_ARROW = 40;
        var KEY_CODE_SPACE = 32;
        var KEY_CODE_RETURN = 13;
        var KEY_CODE_CTRL = 17;
        var DESIGN_TIME = 0;
        var DESIGN_HITPOINT = 1;
        var FILTER_HOUSE = 0;
        var FILTER_UNIT = 1;
        var FILTER_NONE = 2;
        var FILTER_ALL = 3;

        var XML_NS = 'http://www.w3.org/2000/svg';

        var loadCallbacks = [];
        var loadCounter = 0;

        var topBar;
        var mainView;

        var dataSource;
        var urlData;

        function TopBar() {
            var $topbar = qs('.top-bar');

            var unitbar;
            var operation;

            var selectCallbacks = [];

            function Unitbar() {
                var $unitbar = $topbar.firstElementChild;

                var changeCallbacks = [];
                var selectItem = null;

                function fireChange(current) {
                    changeCallbacks.forEach(function (callback) {
                        callback(current);
                    });
                }

                function onchange(callback) {
                    if (typeof callback === 'function') {
                        changeCallbacks.push(callback);
                    }
                }

                function select(index) {
                    trigger(qs(':nth-child(' + ((index < 0 ? 0 : index) + 1) + ')', $unitbar), 'click');
                }

                function getSelectItem() {
                    return selectItem;
                }

                function init() {
                    qsa('li', $unitbar).forEach(function (item) {
                        on(item, 'click', function (e) {
                            var $li = this;

                            if ($li['className'].match(/(^\s*selected|\s+selected(\s+|$))/) === null) {
                                [].slice.call($li['parentElement'].querySelectorAll('li.selected')).forEach(function (n) {
                                    removeClass(n, 'selected');
                                });

                                addClass($li, 'selected');
                                selectItem = $li;
                                fireChange($li);
                            }
                        });
                    });

                    return {
                        onchange: onchange,
                        getSelectItem: getSelectItem,
                        select: select
                    };
                }

                return init();
            }

            function Operation() {
                var $operation = qs('.operation', $topbar);
                var ops = ['move', 'delete', 'edit', 'filter', 'save'];
                var api = {};
                var callbacks = {};

                function clearSelection() {
                    qsa('.op-btn.selected', $operation).forEach(function (el) {
                        trigger(el, 'click');
                    });
                }

                function bindEvent(el, name) {
                    return function () {
                        callbacks[name].forEach(function (callback) {
                            if (hasClass(el, '.toggle')) {
                                if (hasClass(el, '.selected')) {
                                    removeClass(el, 'selected');
                                    callback(false);
                                }
                                else {
                                    clearSelection();
                                    addClass(el, 'selected');
                                    callback(true);
                                }
                            }
                            else {
                                callback();
                            }
                        });
                    };
                }

                function bindCallback(name) {
                    return function (callback) {
                        if (typeof callback === 'function') {
                            callbacks[name].push(callback);
                        }
                    };
                }

                function binding(name) {
                    var op = qs('[data-op="' + name + '"]', $operation);

                    callbacks[name] = [];
                    api['on' + name] = bindCallback(name);
                    on(op, 'click', bindEvent(op, name));
                }

                function show() {
                    $operation['style'].display = 'flex';
                }

                function init() {
                    ops.forEach(binding);

                    api.clearSelection = clearSelection;
                    api.show = show;

                    return api;
                }

                return init();
            }

            function init() {
                unitbar = Unitbar();
                operation = Operation();

                $topbar['style'].display = 'block';

                return {
                    select: unitbar.select,
                    onchange: unitbar.onchange,
                    getSelectScheme: unitbar.getSelectScheme,
                    getSelectItem: unitbar.getSelectItem,
                    operation: operation
                };
            }

            return init();
        }

        function MainView(image) {
            var MIN_SHAPE_SIZE = 14;

            var $main = qs('.main-view');
            var $content = qs('.main-content', $main);
            var $img = qs('.master', $content);
            var $canvasWrapper = qs('.shape-canvas', $content);
            var $canvas;

            var controlDrag = false;
            var controlDraw = false;

            var current = null;
            var contentStyle = $content['style'];
            var scale = 1;

            var textbox;
            var filterbox;
            var canvas;

            function cursor(icon) {
                $main['style'].cursor = (typeof icon === 'string') ?
                    'url(./images/' + icon + '.png), url(./images/' + icon + '.cur), auto' :
                    'default';
            }

            function moveShape(shape, delta) {
                if (shape) {
                    shape.parent.position = shape.parent.position.add(delta);
                }
            }

            function deleteShape(shape) {
                var lastChild;

                if (shape !== null) {
                    if (shape.parent.previousSibling) {
                        selectShape(shape.parent.previousSibling.firstChild);
                    }
                    else if (shape.parent.nextSibling) {
                        selectShape(shape.parent.nextSibling.firstChild);
                    }

                    shape.parent.remove();
                }
            }

            function selectShape(shape) {
                canvas.cancelSelected();

                if (shape) {
                    current = shape;
                    shape.selected = true;
                }
            }

            function doDrag() {
                var dragging = false;
                var flag_catch = true;
                var point;
                var left;
                var top;

                function dragmove(delta) {
                    assign(contentStyle, {
                        left: px(left + delta.x),
                        top: px(top + delta.y)
                    });
                }

                on(doc, 'keydown', function (e) {
                    if (e['keyCode'] === KEY_CODE_SPACE) {
                        controlDrag = true;

                        if (flag_catch) {
                            flag_catch = false;
                            cursor('catch');
                        }
                    }
                });

                on(doc, 'keyup', function (e) {
                    if (e['keyCode'] === KEY_CODE_SPACE) {
                        dragging = false;
                        controlDrag = false;

                        flag_catch = true;
                        cursor();

                        topBar && topBar.operation.clearSelection();
                    }
                });

                on($content, 'mousedown', function (e) {
                    if (e['button'] === 0 && controlDrag) {
                        cursor('grab');

                        left = float(getComputedStyle($content).left);
                        top = float(getComputedStyle($content).top);

                        point = { x: e['clientX'], y: e['clientY'] };
                        dragging = true;
                    }
                });

                on(doc, 'mousemove', function (e) {
                    dragging && dragmove({ x: e['clientX'] - point.x, y: e['clientY'] - point.y });
                });

                on($content, 'mouseover', function () {
                    if (controlDrag) {
                        cursor('catch');
                    }
                });

                on($content, 'mouseleave', function () {
                    if (controlDrag) {
                        cursor();
                    }
                });

                on(doc, 'mouseup', function (e) {
                    if (dragging) {
                        dragging = false;
                        cursor('catch');
                    }
                });
            }

            function doScale() {
                var scaleStep = 0.01;

                function getScale(matrix) {
                    return float(matrix.match(/^matrix\(([^,]+),/) [1]);
                }

                function handler(e) {
                    var cs = getComputedStyle($content);

                    scale = getScale(cs.transform) + (e.wheelDelta > 0 ? scaleStep : scaleStep * (-1));
                    scale = scale < 0.05 ? 0.05 : (scale > 50 ? 50 : scale);

                    assign(contentStyle, {
                        transform: 'scale(' + scale + ')'
                    });
                }

                function init() {
                    on(doc, 'mousewheel', handler);
                }

                init();
            }

            function importData(items) {
                var unitData = [];
                var houseData = [];
                var target;

                items.forEach(function (item) {
                    var group = new win['paper'].Group().importJSON(item.Info);

                    group.data = item.Id;
                    target = float(item.Type) === 0 ? houseData : unitData;
                    target.push(group);
                });

                canvas.importData(unitData, houseData);
            }

            function loadImage() {
                loadCounter += 1;

                on($img, 'load', function () {
                    if (/\.svg$/i.test(urlData.src)) {
                        getSVGSize(urlData.src, function (size) {
                            $img['style'].width = size;

                            loadCounter -= 1;
                            fireLoad();
                        });
                    }
                    else {
                        loadCounter -= 1;
                        fireLoad();
                    }
                });

                on($img, 'error', function () {
                    message('[E1] 找不到图片。');
                });

                $img['src'] = urlData.src;
            }

            function organizeData() {
                var data = extend({}, dataSource, true);

                data.Items = canvas.exportData();

                return data;
            }

            function executeSaveData() {
                saveData(organizeData(), function () {
                    message('保存成功!');
                });
            }

            function TextBox() {
                var $textbox = qs('.name-box', $content);

                var textStyle = $textbox['style'];
                var currentText = null;
                var targetStyle;
                var bounds;
                var oldText;

                function changeBounds() {
                    bounds = currentText.bounds;

                    assign(textStyle, {
                        fontSize: px(targetStyle.fontSize),
                        width: px(bounds.width),
                        height: px(bounds.height),
                        left: px(bounds.left),
                        top: px(bounds.top),
                        display: 'block'
                    });
                }

                function attach(shape) {
                    oldText = '';

                    if (canvas.isText(shape)) {
                        currentText = shape;
                        targetStyle = canvas.getTextStyle();

                        changeBounds();
                        $textbox['value'] = oldText = shape.content;

                        $textbox['select']();
                        $textbox['focus']();
                    }
                }

                function hide() {
                    currentText = null;
                    textStyle.display = 'none';

                    trigger($textbox, 'blur');
                }

                function hideAndRevert() {
                    if (currentText) {
                        textStyle.display = 'none';
                        currentText.content = oldText;
                        currentText = null;
                    }
                }

                function handleText() {
                    function ignore(e) {
                        e.stopPropagation();
                        e.preventDefault();

                        return false;
                    }

                    on($textbox, 'blur', function () {
                        var newText;

                        if (currentText) {
                            newText = trim($textbox['value']);

                            if (newText.length > 0) {
                                currentText.content = $textbox['value'];
                            }
                            else {
                                currentText.content = oldText;
                            }

                            $textbox['value'] = '';
                            hide();
                        }
                    });

                    on($textbox, 'keyup', function (e) {
                        switch (e['keyCode']) {
                            case KEY_CODE_RETURN:
                                trigger($textbox, 'blur');
                                ignore(e);
                                break;
                            case KEY_CODE_ESC:
                                hideAndRevert();
                                break;
                        }
                    });

                    on($textbox, 'input', function (e) {
                        currentText.content = $textbox['value'];
                        changeBounds();
                    });

                    on($textbox, 'mousedown', ignore);
                    on($textbox, 'mouseup', ignore);
                    on($textbox, 'mousemove', ignore);
                }

                function init() {
                    handleText();

                    return {
                        attach: attach,
                        hide: hide
                    };
                }

                return init();
            }

            function Canvas() {
                var paper = win['paper'];
                var pdoc;
                var view;

                var unitStyle = {
                    strokeColor: 'rgb(204, 62, 90, 0.9)',
                    strokeWidth: 2,
                    fillColor: 'rgb(255, 77, 112, 0.4)'
                };

                var houseStyle = {
                    strokeColor: 'rgb(0, 122, 204, 0.8)',
                    strokeWidth: 2,
                    fillColor: 'rgb(0, 152, 255, 0.3)'
                };

                var textStyle = {
                    fontFamily: '微软雅黑',
                    fontSize: 16,
                    fillColor: 'white',
                    shadowColor: 'black',
                    shadowBlur: 1,
                    shadowOffset: new paper.Point(1, 1),
                    justification: 'center'
                };

                var hitOptions = {
                    segments: true,
                    stroke: true,
                    fill: true,
                    tolerance: 5
                };

                var hitCallbacks = [];

                var unitLayer;
                var houseLayer;

                var drawTool;
                var hitTool;
                var defaultTool;

                function setActivateLayer(layerId) {
                    cancelSelected();

                    if (layerId === 1) {
                        pdoc.activateLayer = unitLayer;
                        unitLayer.activate();
                    }
                    else {
                        pdoc.activateLayer = houseLayer;
                        houseLayer.activate();
                    }
                }

                function getActivateLayer() {
                    return pdoc.activateLayer;
                }

                function isText(pointText) {
                    return pointText && pointText.className === 'PointText';
                }

                function canvasCursor(hit) {
                    if (hit && !controlDrag) {
                        if (isText(hit.item)) {
                            $canvas['style'].cursor = 'text';
                        }
                        else if (hit.type === 'stroke') {
                            $canvas['style'].cursor = 'copy';
                        }
                        else if (hit.type === 'fill') {
                            $canvas['style'].cursor = 'move';
                        }
                        else {
                            $canvas['style'].cursor = 'default';
                        }
                    }
                    else {
                        $canvas['style'] = '';
                    }
                }

                function currentStyle() {
                    return pdoc.activateLayer === unitLayer ? unitStyle : houseStyle;
                }

                function fireHit(info) {
                    hitCallbacks.forEach(function (callback) {
                        callback(info);
                    });
                }

                function createHitTool() {
                    var tool = new paper.Tool();
                    var circle;
                    var hit;
                    var size = typeof urlData.size === 'number' ? urlData.size || 10 : 10;
                    var style = {
                        strokeWidth: 2,
                        fillColor: 'rgb(255, 77, 112)',
                        strokeColor: 'rgb(204, 62, 90)'
                    };

                    if (urlData.point) {
                        circle = new paper.Path.Circle(new paper.Point(urlData.point[0], urlData.point[1]).divide(scale), size);
                        circle.style = style;
                        circle.bringToFront();

                        win.scrollTo(urlData.point[0] - float(win.innerWidth) / 2, urlData.point[1] - float(win.innerHeight) / 2);
                    }

                    if (urlData.readonly) {
                        return tool;
                    }
                    else if (urlData.point) {
                        circle.removeOnDown();
                    }

                    view.on('click', function (e) {
                        var info = { x: e.point.x, y: e.point.y };

                        circle = new paper.Path.Circle(new paper.Point(e.point.divide(scale)), size);
                        circle.removeOnDown();

                        hit = pdoc.hitTest(e.point.divide(scale), hitOptions);

                        if (hit) {
                            assign(info, {
                                id: hit.item.parent.data,
                                name: isText(hit.item) ? hit.item.content : hit.item.nextSibling.content,
                                type: (hit.item.parent.parent === unitLayer) ? 1 : 0
                            });
                        }
                        else {
                            assign(info, {
                                id: '',
                                name: '公共区域',
                                type: 2
                            });
                        }

                        circle.style = style;
                        circle.bringToFront();

                        fireHit(info);
                    });

                    return tool;
                }

                function onhit(callback) {
                    if (typeof callback === 'function') {
                        hitCallbacks.push(callback);
                    }
                }

                function figureShiftPoint(start, end) {
                    var delta = end.subtract(start);
                    var angle = delta.angle;

                    if ((angle >= 45 && angle < 135) || (angle > -135 && angle < -45)) {
                        return new paper.Point(start.x, end.y);
                    }
                    else {
                        return new paper.Point(end.x, start.y);
                    }
                }

                function createDrawTool() {
                    var tool = new paper.Tool();
                    var path;
                    var style;
                    var segment;
                    var selectItem;

                    function createPath() {
                        style = currentStyle();

                        return new paper.Group().addChild(new paper.Path({
                            strokeWidth: style.strokeWidth,
                            strokeColor: style.strokeColor,
                            selectedColor: style.strokeColor
                        }));
                    }

                    tool.on('mousedown', function (e) {
                        var hit;

                        textbox.hide();

                        if (controlDrag || controlDraw) {
                            return;
                        }

                        segment = selectItem = null;
                        hit = pdoc.activateLayer.hitTest(e.point.divide(scale), hitOptions);

                        if (e.event.button == 2) {
                            if (hit) {
                                selectItem = hit.item;
                                selectShape(selectItem);

                                if (hit.type === 'segment') {
                                    hit.segment.remove();

                                    if (selectItem.segments.length < 3) {
                                        selectItem.parent.remove();
                                    }
                                };
                            }

                            return;
                        }

                        if (e.event.button == 0) {
                            if (hit) {
                                selectItem = hit.item;
                                selectShape(selectItem);

                                if (hit.type === 'segment') {
                                    segment = hit.segment;

                                    if (e.event.shiftKey) {
                                        if (segment.point.x === segment.next.point.x) {
                                            segment.point.x = segment.previous.point.x;
                                            segment.point.y = segment.next.point.y;
                                        }
                                        else {
                                            segment.point.x = segment.next.point.x;
                                            segment.point.y = segment.previous.point.y;
                                        }
                                    }
                                }
                                else if (hit.type === 'stroke') {
                                    segment = hit.item.insert(hit.location.index + 1, e.point.divide(scale));
                                }
                            }
                            else if (!path && !controlDraw) {
                                path = createPath();
                                controlDraw = true;
                            }
                        }
                    });

                    tool.on('mousedrag', function (e) {
                        if (controlDrag || controlDraw) {
                            return;
                        }

                        if (segment) {
                            segment.point = e.point.divide(scale);
                        }
                        else if (selectItem) {
                            if (selectItem.className !== 'PointText') {
                                selectItem.parent.translate(e.delta.divide(scale));
                            }
                            else {
                                selectItem.translate(e.delta.divide(scale));
                            }
                        }
                    });

                    tool.on('mousemove', function (e) {
                        if (path && controlDraw) {
                            if (path.segments.length > 1) {
                                path.lastSegment.remove();
                            }

                            path.add(
                                e.modifiers.shift ?
                                    figureShiftPoint(path.lastSegment.point, e.point.divide(scale)) :
                                    e.point.divide(scale)
                            );
                        }
                        else {
                            canvasCursor(pdoc.activateLayer.hitTest(e.point.divide(scale), hitOptions));
                        }
                    });

                    tool.on('mouseup', function (e) {
                        var size;

                        if (controlDrag) {
                            return;
                        }

                        if (path && controlDraw) {
                            if (e.event.button == 2) {
                                if (path.segments.length > 1) {
                                    path.lastSegment.remove();
                                }

                                path.fillColor = style.fillColor;
                                path.closed = true;
                                current = path;

                                size = path.bounds.size;

                                if (size.width >= MIN_SHAPE_SIZE && size.height >= MIN_SHAPE_SIZE) {
                                    path.parent.addChild(
                                        new paper.PointText(assign({
                                            point: path.bounds.center,
                                            content: '未命名' + (pdoc.activateLayer === unitLayer ? '单元' : '户型')
                                        }, textStyle))
                                    );

                                    selectShape(path);
                                }
                                else {
                                    path.parent.remove();
                                    current = null;
                                }

                                controlDraw = false;
                                path = null;
                                e.stop();
                            }
                            else {
                                path.add(
                                    e.modifiers.shift && path.segments.length > 1 ?
                                        figureShiftPoint(path.lastSegment.point, e.point.divide(scale)) :
                                        e.point.divide(scale)
                                );
                            }
                        }
                    });

                    tool.on('keyup', function (e) {
                        switch (e.event.keyCode) {
                            case KEY_CODE_DELETE: deleteShape(current); break;
                            case KEY_CODE_RETURN: canvas.editText(current); break;
                            case KEY_CODE_ESC:
                                if (controlDraw) {
                                    path.parent.remove();
                                    controlDraw = false;
                                    current = null;
                                    path = null;
                                }

                                break;
                        }
                    });

                    tool.on('keydown', function (e) {
                        var delta = new paper.Point(0, 0);

                        switch (e.event.keyCode) {
                            case KEY_CODE_UP_ARROW: delta.y = -1; break;
                            case KEY_CODE_BOTTOM_ARROW: delta.y = 1; break;
                            case KEY_CODE_LEFT_ARROW: delta.x = -1; break;
                            case KEY_CODE_RIGHT_ARROW: delta.x = 1; break;
                            default: return;
                        }

                        moveShape(current, delta);
                    });

                    return tool;
                }

                function cancelSelected() {
                    pdoc.layers.forEach(function (layer) {
                        layer.selected = false;
                    });
                }

                function getTextStyle() {
                    return textStyle;
                }

                function editText(text) {
                    if (!isText(text)) {
                        text = text.nextSibling;
                    }

                    text.selected = true;
                    textbox.attach(text);
                }

                function exportData() {
                    var items = [];

                    pdoc.layers.forEach(function (layer, type) {
                        layer.children.forEach(function (item) {
                            items.push({
                                id: randomString(),
                                type: type === 0 ? 1 : 0,
                                name: item.lastChild.content,
                                info: JSON.stringify(item)
                            });
                        });
                    });

                    return items;
                }

                function importData(unitData, houseData) {
                    unitLayer.addChildren(unitData);
                    houseLayer.addChildren(houseData);

                    houseLayer.bringToFront();

                    var unitStyle = {
                        strokeColor: 'rgb(204, 62, 90, 0.9)',
                        fillColor: 'rgb(255, 77, 112, 0.4)'
                    };

                    var houseStyle = {
                        strokeColor: 'rgb(0, 122, 204, 0.8)',
                        fillColor: 'rgb(0, 152, 255, 0.3)'
                    };

                    var textStyle = {
                        fillColor: 'white',
                        shadowColor: 'black',
                    };

                    if (urlData.mode === DESIGN_TIME) {
                        unitLayer.children.forEach(function (item) {
                            var p = item.firstChild;
                            item.lastChild.visible = true;

                            if (urlData.readonly) {
                                item.selected = false;
                            }

                            if (p.fillColor) { p.fillColor.alpha = 0.4; }
                            if (p.strokeColor) { p.strokeColor.alpha = 0.9; }
                        });

                        houseLayer.children.forEach(function (item) {
                            var p = item.firstChild;
                            item.lastChild.visible = true;

                            if (urlData.readonly) {
                                item.selected = false;
                            }

                            if (p.fillColor) { p.fillColor.alpha = 0.3; }
                            if (p.strokeColor) { p.strokeColor.alpha = 0.8; }
                        });
                    }
                    else {
                        pdoc.layers.forEach(function (layer) {
                            layer.children.forEach(function (item) {
                                if (item.className === 'Group') {
                                    var p = item.firstChild;
                                    item.selected = false;
                                    item.lastChild.visible = false;

                                    if (p.fillColor) { p.fillColor.alpha = 0.01; }
                                    if (p.strokeColor) { p.strokeColor.alpha = 0.01; }
                                }
                            });
                        });
                    }
                }

                function init() {
                    $canvas = qs('#view', $canvasWrapper);

                    paper.setup($canvas);

                    pdoc = paper.project;
                    view = paper.view;

                    pdoc.getOptions().handleSize = 8;

                    houseLayer = new paper.Layer(houseStyle);
                    unitLayer = new paper.Layer(unitStyle);

                    pdoc.addLayer(houseLayer);
                    pdoc.addLayer(unitLayer);

                    hitTool = createHitTool();
                    drawTool = createDrawTool();
                    defaultTool = new paper.Tool();

                    if (urlData.mode === DESIGN_TIME) {
                        if (urlData.readonly) {
                            defaultTool.activate();
                        } else {
                            drawTool.activate();
                        }
                    }
                    else if (urlData.mode === DESIGN_HITPOINT) {
                        hitTool.activate();
                    }

                    pdoc.view.on('doubleclick', function (e) {
                        var hit;
                        var text;

                        if (controlDraw || controlDrag || urlData.mode !== DESIGN_TIME || urlData.readonly) {
                            return;
                        }

                        hit = pdoc.activateLayer.hitTest(e.point, hitOptions);
                        hit && editText(hit.item);
                    });

                    return {
                        setActivateLayer: setActivateLayer,
                        getActivateLayer: getActivateLayer,
                        cancelSelected: cancelSelected,
                        isText: isText,
                        getTextStyle: getTextStyle,
                        editText: editText,
                        onhit: onhit,
                        exportData: exportData,
                        importData: importData
                    };
                }

                return init();
            }

            function fixedPosition() {
                if (urlData.mode === DESIGN_TIME && !urlData.readonly && !urlData.point) {
                    assign($content['style'], {
                        left: '30px',
                        top: '80px'
                    });
                }
            }

            function initCanvas() {
                canvas = Canvas();
                importData(dataSource.Items);
                return canvas;
            }

            function init() {
                var op;

                on($img, 'mousedown', function (e) {
                    if (controlDrag) {
                        e.preventDefault();
                        return false;
                    }
                });

                on($img, 'dragstart', function (e) {
                    e.preventDefault();
                    return false;
                });

                on($img, 'selectstart', function (e) {
                    e.preventDefault();
                    return false;
                });

                if (!urlData.touch) {
                    doDrag();
                    doScale();
                }

                if (urlData.mode === DESIGN_TIME && !urlData.readonly) {
                    textbox = TextBox();

                    op = topBar.operation;

                    op.onsave(function () {
                        executeSaveData();
                    });

                    op.ondelete(function () {
                        if (current) {
                            deleteShape(current);
                        }
                    });

                    op.onfilter(function () {
                        filterbox.show();
                    });

                    op.onedit(function () {
                        if (current) {
                            canvas.editText(current);
                        }
                    });

                    op.onmove(function (isMove) {
                        controlDrag = isMove;
                        cursor(isMove ? 'catch' : undefined);
                    });

                    topBar.onchange(function (drawArea) {
                        canvas.setActivateLayer(float(drawArea.getAttribute('data-id')));
                    });
                }
                else if (urlData.mode === DESIGN_HITPOINT) {
                    addClass($main, 'readonly');
                }

                return {
                    importData: importData,
                    loadImage: loadImage,
                    fixedPosition: fixedPosition,
                    initCanvas: initCanvas
                };
            }

            return init();
        }

        function fireLoad() {
            var cv;

            if (loadCounter === 0) {
                mainView.fixedPosition();
                cv = mainView.initCanvas();
                topBar && topBar.select(0);

                loadCallbacks.forEach(function (callback) {
                    callback({
                        dataSource: dataSource,
                        urlData: urlData,
                        topBar: topBar,
                        mainView: mainView,
                        canvas: cv
                    });
                });
            }
        }

        function loadDataFail(msg) {
            message(msg || '[E0] 数据加载失败。');
        }

        function figureSize(svg) {
            var viewBox;
            var height;

            var text = svg.substring(0, 1000).match(/<svg(.|\r|\n)*?>/i) [0];
            var width = text.match(/\bwidth\=(?:\'\")(.*?)(?:\'\")/i);

            if (width != null && (height = text.match(/\bheight\=(?:\'\")(.*?)(?:\'\")/i)) != null) {
                return px(float(width[1]));
            }
            else {
                viewBox = text.match(/\bviewBox\=(?:\'|\")(.*?)(?:\'|\")/i);
                return px(float(viewBox != null ? viewBox[1].split(/\,|\s/i) [2] : 0));
            }
        }

        function loadDataSuccess(d) {
            if (parseInt(d.Code) === 0) {
                dataSource = d.Data;

                loadCounter -= 1;
                topBar && topBar.operation.show();

                fireLoad();
            }
            else {
                loadDataFail(d.Message);
            }
        }

        function getSVGSize(url, callback) {
            ajax({
                url: url,
                type: 'svg',
                success: function (svg) {
                    callback(figureSize(svg));
                }
            });
        }

        function loadData() {
            loadCounter += 1;

            if (urlData.mode === DESIGN_HITPOINT) {
                loadDataSuccess(win.parent ? win.parent['planeData'] : { Types: [], Code: 0, Items: [] });
            }
            else {
                ajax({
                    url: '../data/sample.json',
                    success: loadDataSuccess,
                    fail: function () {
                        loadDataFail();
                    }
                });
            }
        }

        function saveData(data, successCallback) {
            ajax({
                url: '',
                data: data,
                success: successCallback
            });
        }

        function organizeUrlData(u) {
            if (typeof u.mode === 'number') {
                u.mode = u.mode < 0 || u.mode > 1 ? 0 : u.mode;
            }
            else {
                u.mode = DESIGN_TIME;
            }

            if ('point' in u) {
                if (typeof u.point === 'string' && u.point.length > 0) {
                    u.point = u.point.split(',');

                    if (u.point.length > 2) {
                        u.point.length = 2;
                    }

                    if (u.point.length === 1) {
                        u.point[1] = u.point[0];
                    }

                    u.point[0] = float(u.point[0]);
                    u.point[1] = float(u.point[1]);
                }
                else if (typeof u.point === 'number') {
                    u.point = [u.point, u.point];
                }
            }
            else if ('pointX' in u && typeof u.pointX === 'number') {
                u.point = [u.pointX, u.pointY];
            }
            else {
                u.point = null;
            }
        }

        function init() {
            urlData = urlSearch();
            organizeUrlData(urlData);

            if (urlData.mode === DESIGN_TIME && !urlData.readonly) {
                topBar = TopBar();
            }

            mainView = MainView();
            mainView.loadImage();

            loadData();

            return {
                onload: function (callback) {
                    if (typeof callback === 'function') {
                        loadCallbacks.push(callback);
                    }
                }
            };
        }

        return init();
    }

    function init() {
        disablePageZoom();
        disablePageSelect();
        disableContextMenu();

        View().onload(function (view) {
            view.canvas.onhit(function (info) {
                console.table(info);
                if (win.parent !== win && typeof win.parent['onpos'] === 'function') {
                    win.parent['onpos'](info);
                }
            });
        });
    }

    return init();

})(window, document);