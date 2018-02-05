
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
     * 
     * @returns {HTMLElement}
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

    /**
     * 事件绑定
     * 
     * @param {Element|Document|Window}  el     指定响应事件的元素
     * @param {string}   type            事件类型，无需前缀 on
     * @param {EventListener} handler    事件处理回调
     */
    function on(el, type, handler) {
        if (el) {
            el.addEventListener(type, handler, false);
        }
    }

    /**
     * 手工触发指定事件
     * 
     * @param {Node|Element|Window} el      触发事件的元素
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
     * @param {EventTarget}  el          移除类的元素
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
     * @param {Element|EventTarget} el  添加类的元素
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
        return px(float(height) - float(fontSize(height)) / 2);
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
        var KEY_CODE_IE_CTRL_Z = 26;
        var KEY_CODE_IE_CTRL_Y = 25;
        var KEY_CODE_CTRL_Z = 90;
        var KEY_CODE_CTRL_Y = 89;
        var KEY_CODE_PAGE_UP = 33;
        var KEY_CODE_PAGE_DOWN = 34;

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

        function Revocable() {
            var current;
            var head;
            var max = 100;
            var undoCallbacks = [];
            var redoCallbacks = [];

            function createStack(data) {
                current = {
                    parent: null,
                    next: null,
                    data: data
                };

                head = current;
            }

            function isHead() {
                return head === current;
            }

            function push(data) {
                if (typeof current === 'undefined') {
                    createStack(data);
                }
                else {
                    current.next = {
                        parent: current,
                        next: null,
                        data: data
                    };

                    current = current.next;
                }
            }

            function stackLength() {
                var start = head;
                var length = 1;

                if (!start) {
                    return 0;
                }

                while (start = start.next && length++);

                return length;
            }

            function checkOverflow() {
                if (stackLength() > max) {
                    head = head.next;
                    head.parent = null;
                }
            }

            function whole(callbacks) { callbacks.forEach(function (f) { f(current); }); }

            function appendCallback(dest, handler) {
                if (typeof handler === 'function') {
                    dest.push(handler);
                }
            }

            function getCurrentData() { return current && current.data; }

            function onredo(handler) { appendCallback(redoCallbacks, handler); };

            function onundo(handler) { appendCallback(undoCallbacks, handler); }

            function onaction(handler) {
                onredo(handler);
                onundo(handler);
            }

            function stack(data) {
                push(data);
                checkOverflow();

                return current;
            }

            function undo() {
                if (current && current.parent) {
                    current = current.parent;
                    whole(undoCallbacks);
                }
            }

            function redo() {
                if (current && current.next) {
                    current = current.next;
                    whole(redoCallbacks);
                }
            }

            function init() {
                return {
                    onundo: onundo,
                    onredo: onredo,
                    onaction: onaction,
                    undo: undo,
                    redo: redo,
                    stack: stack,
                    isHead: isHead,
                    getCurrentData: getCurrentData
                };
            }

            return init();
        }

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

                function getSelectIndex() {
                    return float(selectItem.getAttribute('data-id'));
                }

                function init() {
                    qsa('li', $unitbar).forEach(function (item) {
                        on(item, 'click', function (e) {
                            var $li = this;

                            if ($li.className.match(/(^\s*selected|\s+selected(\s+|$))/) === null) {
                                [].slice.call($li.parentElement.querySelectorAll('li.selected')).forEach(function (n) {
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
                        getSelectIndex: getSelectIndex,
                        select: select
                    };
                }

                return init();
            }

            function Operation() {
                var $operation = qs('.operation', $topbar);
                var $contextMenuBox = qs('.context-menu-box');

                var ops = ['move', 'delete', 'edit', 'save', 'rotate', 'redo', 'undo', 'copy'];
                var api = {};
                var callbacks = {};

                function clearSelection() {
                    qsa('.op-btn.selected', $operation).forEach(function (el) {
                        trigger(el, 'click');
                    });
                }

                function clearContextMenuSelected() {
                    qsa('.op-btn.selected-menu', $operation).forEach(function (el) {
                        removeClass(el, 'selected-menu');
                    });
                }

                function bindEvent(el, name) {
                    return function (e) {
                        var target = e.target;
                        var more;

                        if (hasClass(target, '.more')) {
                            more = qs(target.getAttribute('data-context-menu'), $contextMenuBox);
                        }
                        else if (hasClass(target.parentElement, '.more')) {
                            more = qs(target.parentElement.getAttribute('data-context-menu'), $contextMenuBox);
                        }

                        if (more) {
                            e.stopPropagation();

                            addClass(el, 'selected-menu');
                            removeClass(more, 'collapse');
                            addClass(more, 'expando');

                            assign(more.style, {
                                right: px(float(more.getAttribute('data-right') || 10)),
                                width: px(float(more.getAttribute('data-width') || 100))
                            });

                            more.focus();
                        }
                        else {
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
                        }
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
                    $operation.style.display = 'flex';
                }

                function hideMenus() {
                    trigger($contextMenuBox, 'focusout');
                }

                function init() {
                    on($contextMenuBox, 'focusout', function (e) {
                        var target = e.target;

                        clearContextMenuSelected();

                        if (hasClass(target, '.context-menu-item')) {
                            removeClass(target, 'expando');
                            addClass(target, 'collapse');
                        }
                        else {
                            [].slice.call($contextMenuBox.children).forEach(function (menu) {
                                trigger(menu, 'focusout');
                            });
                        }
                    });

                    on($contextMenuBox, 'click', function (e) {
                        var target = e.target;
                        var parent = target['parentElement'];

                        if (hasClass(target, 'li') && !hasClass(target, '.menu-line') && hasClass(parent, '.context-menu-item')) {
                            trigger(parent, 'focusout');
                        }
                        else if (hasClass(parent, 'li') && hasClass(parent.parentElement, '.context-menu-item')) {
                            trigger(parent.parentElement, 'focusout');
                        }
                    });

                    ops.forEach(binding);

                    return assign(api, {
                        clearSelection: clearSelection,
                        hideMenus: hideMenus,
                        show: show
                    });
                }

                return init();
            }

            function init() {
                unitbar = Unitbar();
                operation = Operation();

                $topbar.style.display = 'block';

                return {
                    select: unitbar.select,
                    onchange: unitbar.onchange,
                    getSelectScheme: unitbar.getSelectScheme,
                    getSelectItem: unitbar.getSelectItem,
                    getSelectIndex: unitbar.getSelectIndex,
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
            var controlCopy = false;
            var controlRotate = false;

            var current = null;
            var contentStyle = $content.style;
            var scale = 1;

            var textbox;
            var canvas;
            var stacker;

            function cursor(icon) {
                $main.style.cursor = (typeof icon === 'string') ?
                    'url(./images/' + icon + '.png), url(./images/' + icon + '.cur), auto' :
                    'default';
            }

            function rotateShape(shape, angle) {
                if (shape) {
                    shape.rotate(angle);
                    stack();
                }
            }

            function moveShape(shape, delta) {
                if (shape) {
                    shape.parent.position = shape.parent.position.add(delta);
                    stack();
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
                    stack();
                }
            }

            function copyShape(shape) {
                var parent = shape;

                if (shape !== null) {
                    if (shape.className !== 'Group' && shape.parent !== null && shape.parent.className === 'Group') {
                        parent = shape.parent;
                    }

                    parent = parent.clone();
                    shape.selected = false;
                    parent.lastChild.content = canvas.defaultName();

                    parent.bringToFront();

                    return current = parent.firstChild;
                }

                return shape;
            }

            function selectShape(shape) {
                canvas.cancelSelected();

                if (shape) {
                    current = shape;
                    shape.selected = true;
                }

                return shape;
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

                on(doc, 'keydown', /** @param e {KeyboardEvent} */ function (e) {
                    if (e.keyCode === KEY_CODE_SPACE) {
                        controlDrag = true;

                        if (flag_catch) {
                            flag_catch = false;
                            cursor('catch');
                        }
                    }
                });

                on(doc, 'keyup', /** @param e {KeyboardEvent} */  function (e) {
                    if (e.keyCode === KEY_CODE_SPACE) {
                        dragging = false;
                        controlDrag = false;

                        flag_catch = true;
                        cursor();

                        topBar && topBar.operation.clearSelection();
                    }
                });

                on($content, 'mousedown', /** @param e {MouseEvent} */ function (e) {
                    if (e.button === 0 && controlDrag) {
                        cursor('grab');

                        left = float(getComputedStyle($content).left);
                        top = float(getComputedStyle($content).top);

                        point = { x: e.clientX, y: e.clientY };
                        dragging = true;
                    }
                });

                on(doc, 'mousemove', /** @param e {MouseEvent} */ function (e) {
                    dragging && dragmove({ x: e.clientX - point.x, y: e.clientY - point.y });
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
                var $scaleTool = qs('.scale-tool');
                var $zoomIn = qs('.zoom-in', $scaleTool);
                var $zoomOut = qs('.zoom-out', $scaleTool);
                var $original = qs('.original', $scaleTool);

                function getScale(matrix) {
                    return float(matrix.match(/^matrix\(([^,]+),/)[1]);
                }

                function handler(step) {
                    var cs = getComputedStyle($content);

                    scale = getScale(cs.transform) + step;
                    scale = scale < 0.05 ? 0.05 : (scale > 10 ? 10 : scale);

                    if (urlData.mode === DESIGN_TIME) {
                        canvas.adjustShapeFont();
                    }
                    else {
                        canvas.rerenderPoint();
                    }

                    assign(contentStyle, { transform: 'scale(' + scale + ')' });
                }

                function init() {
                    var style = $scaleTool.style;
                    var computedStyle;
                    var right;
                    var top;

                    if (urlData.mode === DESIGN_HITPOINT || urlData.readonly) {
                        addClass(doc.body, 'hitting');
                        assign(style, { top: '20px' });
                    }

                    computedStyle = getComputedStyle($scaleTool);

                    right = float(computedStyle.right);
                    top = float(computedStyle.top);

                    on($zoomIn, 'click', function () {
                        handler(0.05);
                        $original.textContent = Math.round(scale * 100) + '%';
                    });

                    on($zoomOut, 'click', function () {
                        handler(-0.05);
                        $original.textContent = Math.round(scale * 100) + '%';
                    });

                    on($original, 'click', function () {
                        assign(contentStyle, { transform: 'scale(1)' });
                        $original.textContent = '100%';
                    });

                    on(doc, 'scroll', function () {
                        style.right = px(right - win.scrollX);
                        style.top = px(win.scrollY + top);
                    });
                }

                return init();
            }

            function doRotate() {
                function rotate(deg, center) {
                    if (current) {
                        current.parent.firstChild.rotate(deg, center);
                        stack();
                    }
                }

                function init() {
                    on(qs('.rotate-90'), 'click', function () {
                        rotate(90);
                    });

                    on(qs('.rotate-counter-90'), 'click', function () {
                        rotate(-90);
                    });

                    on(qs('.rotate-hor'), 'click', function () {
                        if (current) {
                            current.parent.firstChild.scale(-1, 1);
                            stack();
                        }
                    });

                    on(qs('.rotate-ver'), 'click', function () {
                        if (current) {
                            current.parent.firstChild.scale(1, -1);
                            stack();
                        }
                    });
                }

                return init();
            }

            function stack() {
                stacker.stack(canvas.exportJSON());
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

                if (urlData.mode === DESIGN_TIME && !urlData.readonly) {
                    stack();
                }
            }

            function loadImage() {
                loadCounter += 1;

                on($img, 'load', function () {
                    if (/\.svg$/i.test(urlData.src)) {
                        getSVGSize(urlData.src, function (size) {
                            $img.style.width = size;

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

                var textStyle = $textbox.style;
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
                        $textbox.focus();
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
                            stack();
                        }
                    });


                    on($textbox, 'keydown', function (e) {
                        e.stopPropagation();
                    });

                    on($textbox, 'keyup', /** @param e {KeyboardEvent} */ function (e) {
                        switch (e.keyCode) {
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
                        if (currentText) {
                            currentText.content = $textbox['value'];
                            changeBounds();
                        }
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
                var $container = qs('.container');
                var $pointer = qs('#hit-point');

                var paper = win['paper'];
                var pointerStyle = $pointer.style;
                var pdoc;
                var view;

                var unitStyle = {
                    strokeColor: '#cc3e5ae6',
                    strokeWidth: 2,
                    fillColor: '#ff4d7066'
                };

                var houseStyle = {
                    strokeColor: '#007acccc',
                    strokeWidth: 2,
                    fillColor: '#0098ff4d'
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

                var size = typeof urlData.size === 'number' ? urlData.size || 10 : 10;
                var style = { strokeWidth: 2, fillColor: '#ff4d70', strokeColor: '#cc3e5a' };

                var hitCallbacks = [];

                var unitLayer;
                var houseLayer;

                var drawTool;
                var hitTool;
                var defaultTool;

                function defaultName() {
                    return '未命名' + (pdoc.activateLayer === unitLayer ? '单元' : '户型');
                }

                function adjustShapeFont() {
                    pdoc.layers.forEach(function (layer) {
                        layer.children.forEach(function (item) {
                            if (item.className === 'Group') {
                                var text = item.lastChild;

                                if (scale < 1) {
                                    text.style.fontSize = Math.ceil(16 / scale);
                                }
                                else {
                                    text.style.fontSize = 16;
                                }
                            }
                        });
                    });
                }

                function setActivateLayer(layerId, isNotCancelSelected) {
                    if (!isNotCancelSelected) {
                        cancelSelected();
                    }

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
                    var style = $canvas.style;

                    if (hit && !controlDrag) {
                        if (isText(hit.item)) {
                            style.cursor = 'text';
                        }
                        else if (controlRotate) {
                            style.cursor = 'url(./images/rotate.cur), auto';
                        }
                        else if (hit.type === 'stroke') {
                            style.cursor = 'copy';
                        }
                        else if (hit.type === 'fill') {
                            style.cursor = 'move';
                        }
                        else {
                            style.cursor = 'default';
                        }
                    }
                    else {
                        $canvas.style = '';
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

                function createCheckTimer(timer, callback) {
                    clearInterval(timer);

                    return setInterval(callback, 500);
                }

                function rerenderPoint() {
                    pointerStyle.transform = 'scale(' + (1 / scale) + ')';
                }

                function movePoint(e, info) {
                    assign(pointerStyle, {
                        left: px(e.point.x / scale - size - 1),
                        top: px(e.point.y / scale - size - 1),
                        display: 'block'
                    });

                    fireHit(info);
                }

                function createHitTool() {
                    var tool = new paper.Tool();
                    var hit;
                    var scrolling = false;
                    var oldLeft;
                    var oldTop;
                    var timer;

                    assign(pointerStyle, {
                        backgroundColor: style.fillColor,
                        borderWidth: px(style.strokeWidth),
                        borderStyle: 'solid',
                        borderColor: style.strokeColor,
                        borderRadius: px(size + style.strokeWidth),
                        width: px(size * 2 + style.strokeWidth),
                        height: px(size * 2 + style.strokeWidth)
                    });

                    if (urlData.point) {
                        assign(pointerStyle, {
                            left: px(urlData.point[0] / scale - size - 1),
                            top: px(urlData.point[1] / scale - size - 1),
                            display: 'block'
                        });

                        assign($main, {
                            scrollLeft: urlData.point[0] - float(win.innerWidth) / 2,
                            scrollTop: urlData.point[1] - float(win.innerHeight) / 2
                        });

                        //win.scrollTo(urlData.point[0] - float(win.innerWidth) / 2, urlData.point[1] - float(win.innerHeight) / 2);
                    }

                    if (urlData.readonly) {
                        return tool;
                    }

                    on(win, 'scroll', function () {
                        scrolling = true;
                        oldLeft = $container.scrollLeft;
                        oldTop = $container.scrollTop;

                        timer = createCheckTimer(timer, function () {
                            if ($container.scrollLeft === oldLeft && $container.scrollTop === oldTop) {
                                scrolling = false;
                                clearInterval(timer);
                            }
                        });
                    });

                    view.on('click', function (e) {
                        var info = new paper.Point(e.point).divide(scale);

                        if (controlDrag || controlDraw || scrolling) {
                            return;
                        }

                        hit = pdoc.hitTest(e.point.divide(scale), hitOptions);

                        if (hit) {
                            assign(info, {
                                id: hit.item.parent.data,
                                name: isText(hit.item) ? hit.item.content : hit.item.nextSibling.content,
                                type: (hit.item.parent.parent === unitLayer) ? 1 : 0
                            });

                            if (urlData.scope) {
                                movePoint(e, info);
                            }
                        }
                        else {
                            assign(info, {
                                id: '',
                                name: '公共区域',
                                type: 2
                            });
                        }

                        if (!urlData.scope) {
                            movePoint(e, info);
                        }
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
                    var modify = false;

                    function setCurrentItem(item) {
                        return selectShape(selectItem = item);
                    }

                    function removeSegment(hit) {
                        setCurrentItem(hit.item);

                        if (hit.type === 'segment') {
                            hit.segment.remove();

                            if (selectItem.segments.length < 3) {
                                selectItem.parent.remove();
                            }

                            stack();
                        };
                    }

                    function setRightAnglePointPos(e, segment) {
                        if (e.event.shiftKey) {
                            var prev = segment.previous.point;
                            var next = segment.next.point;
                            var point = segment.point;
                            var raLeft = new paper.Point(prev.x, next.y);
                            var raRight = new paper.Point(next.x, prev.y);

                            if (point.equals(raLeft)) {
                                point.set(raRight);
                            }
                            else if (point.equals(raRight)) {
                                point.set(raLeft);
                            }
                            else {
                                point.set((point.subtract(raLeft).length < point.subtract(raRight).length) ? raLeft : raRight);
                            }
                        }

                        return segment;
                    }

                    function handleHit(e, hit) {
                        setCurrentItem(hit.item);

                        if (hit.type === 'segment') {
                            segment = setRightAnglePointPos(e, hit.segment);
                        }
                        else if (hit.type === 'stroke') {
                            segment = hit.item.insert(hit.location.index + 1, e.point.divide(scale));
                            stack();
                        }
                        else if (hit.type === 'fill' && (e.event.ctrlKey || controlCopy)) {
                            selectItem = copyShape(selectItem);
                        }
                    }

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
                        topBar.operation.hideMenus();

                        if (controlDrag || controlDraw) {
                            return;
                        }

                        segment = selectItem = null;
                        hit = pdoc.activateLayer.hitTest(e.point.divide(scale), hitOptions);

                        if (hit && controlRotate) {
                            setCurrentItem(hit.item);
                            return;
                        }

                        switch (e.event.button) {
                            case 2: hit && removeSegment(hit); break;
                            case 0:
                                if (hit) {
                                    handleHit(e, hit);
                                }
                                else if (!path && !controlDraw) {
                                    path = createPath();
                                    controlDraw = true;
                                }
                        }
                    });

                    tool.on('mousedrag', function (e) {
                        var pos;
                        var dp;
                        var p;

                        if (controlDrag || controlDraw) {
                            return;
                        }

                        p = e.point.divide(scale);
                        dp = e.delta.divide(scale);

                        if (segment) {
                            modify = true;
                            segment.point = p;
                        }
                        else if (selectItem) {
                            if (selectItem.className !== 'PointText') {
                                if (controlRotate) {
                                    modify = true;
                                    pos = selectItem.position;

                                    selectItem.rotate(dp.add(p).subtract(pos).angle - p.subtract(pos).angle);
                                }
                                else {
                                    modify = true;
                                    selectItem.parent.translate(dp);
                                }
                            }
                            else {
                                modify = true;
                                selectItem.translate(dp);
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

                        if (modify) {
                            modify = false;
                            stack();
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
                                            content: defaultName()
                                        }, textStyle))
                                    );

                                    stack();
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
                                topBar.operation.hideMenus();

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
                            case KEY_CODE_UP_ARROW: delta.y = -1; moveShape(current, delta); break;
                            case KEY_CODE_BOTTOM_ARROW: delta.y = 1; moveShape(current, delta); break;
                            case KEY_CODE_LEFT_ARROW: delta.x = -1; moveShape(current, delta); break;
                            case KEY_CODE_RIGHT_ARROW: delta.x = 1; moveShape(current, delta); break;
                            case KEY_CODE_IE_CTRL_Z:
                            case KEY_CODE_CTRL_Z: stacker.undo(); break;
                            case KEY_CODE_IE_CTRL_Y:
                            case KEY_CODE_CTRL_Y: stacker.redo(); break;
                            case KEY_CODE_PAGE_UP: rotateShape(current, -1); break;
                            case KEY_CODE_PAGE_DOWN: rotateShape(current, 1); break;
                        }
                    });

                    return tool;
                }

                function cancelSelected() {
                    pdoc.deselectAll();

                    current = null;
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

                function importJSON(json) {
                    pdoc.clear();
                    pdoc.importJSON(json);

                    unitLayer = pdoc.layers[0];
                    houseLayer = pdoc.layers[1];

                    canvas.setActivateLayer(topBar.getSelectIndex(), !stacker.isHead());
                }

                function exportJSON() {
                    return pdoc.exportJSON();
                }

                function importData(unitData, houseData) {
                    createLayers();

                    unitLayer.addChildren(unitData);
                    houseLayer.addChildren(houseData);

                    houseLayer.bringToFront();

                    var unitStyle = {
                        strokeColor: '#cc3e5ae6',
                        fillColor: '#ff4d7066'
                    };

                    var houseStyle = {
                        strokeColor: '#007acccc',
                        fillColor: '#0098ff4d'
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
                                var path;

                                if (item.className === 'Group') {
                                    if (urlData.scope && item.data !== urlData.scope) {
                                        item.visible = false;
                                    }
                                    else {
                                        path = item.firstChild;
                                        item.selected = false;
                                        item.lastChild.visible = false;

                                        if (path.strokeColor) {
                                            path.strokeColor.alpha = urlData.scope ? 1 : 0.01;
                                        }

                                        if (urlData.scope) {
                                            path.strokeWidth = 4;
                                        }

                                        if (path.fillColor) {
                                            path.fillColor.alpha = 0.01;
                                        }

                                        positionShape(item);
                                    }
                                }
                            });
                        });
                    }
                }

                function positionShape(item) {
                    var center;
                    var mainStyle;
                    var timer;
                    var width;
                    var mainStyle;

                    if (item) {
                        center = item.position;
                        mainStyle = getComputedStyle($main);
                        width = float(mainStyle.width);

                        timer = setInterval(function () {
                            if ($main.scrollWidth - width > 2) {
                                assign($main, {
                                    scrollLeft: center.x - width / 2,
                                    scrollTop: center.y - float(mainStyle.height) / 2
                                });

                                clearInterval(timer);
                            }
                        });
                    }
                }

                function clearHouse() {
                    houseLayer.clear();
                    stack();
                }

                function clearUnit() {
                    unitLayer.clear();
                    stack();
                }

                function clearAll() {
                    pdoc.layers.forEach(function (layer) {
                        layer.clear();
                    });

                    stack();
                }

                function createLayers() {
                    pdoc.clear();

                    houseLayer = new paper.Layer(houseStyle);
                    unitLayer = new paper.Layer(unitStyle);

                    pdoc.addLayer(houseLayer);
                    pdoc.addLayer(unitLayer);
                }

                function draw() {
                    view.draw();
                }

                function init() {
                    $canvas = qs('#view', $canvasWrapper);

                    paper.setup($canvas);

                    pdoc = paper.project;
                    view = paper.view;

                    pdoc.getOptions().handleSize = 8;

                    drawTool = createDrawTool();
                    defaultTool = new paper.Tool();

                    if (urlData.mode === DESIGN_TIME) {
                        if (urlData.readonly) {
                            defaultTool.activate();
                        } else {
                            drawTool.activate();
                            stacker = Revocable();

                            stacker.onaction(function (current) {
                                canvas.importJSON(current.data);
                            });

                            pdoc.view.on('doubleclick', function (e) {
                                var hit;
                                var text;

                                if (controlDraw || controlDrag) {
                                    return;
                                }

                                hit = pdoc.activateLayer.hitTest(e.point.divide(scale), hitOptions);
                                hit && editText(hit.item);
                            });
                        }
                    }
                    else {
                        hitTool = createHitTool();
                        hitTool.activate();
                    }

                    return {
                        setActivateLayer: setActivateLayer,
                        getActivateLayer: getActivateLayer,
                        adjustShapeFont: adjustShapeFont,
                        cancelSelected: cancelSelected,
                        rerenderPoint: rerenderPoint,
                        getTextStyle: getTextStyle,
                        defaultName: defaultName,
                        exportData: exportData,
                        exportJSON: exportJSON,
                        importData: importData,
                        importJSON: importJSON,
                        clearHouse: clearHouse,
                        clearUnit: clearUnit,
                        clearAll: clearAll,
                        editText: editText,
                        isText: isText,
                        onhit: onhit,
                        draw: draw
                    };
                }

                return init();
            }

            function fixedPosition() {
                if (urlData.mode === DESIGN_TIME && !urlData.readonly && !urlData.point) {
                    assign($content.style, {
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

                doScale();

                if (urlData.mode === DESIGN_TIME && !urlData.readonly) {
                    textbox = TextBox();
                    op = topBar.operation;

                    op.onundo(function () {
                        stacker.undo();
                    });

                    op.onredo(function () {
                        stacker.redo();
                    });

                    op.onsave(function () {
                        executeSaveData();
                    });

                    op.ondelete(function () {
                        if (current) {
                            deleteShape(current);
                        }
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

                    op.onrotate(function (isRotate) {
                        controlRotate = isRotate;

                        if (current) {
                            selectShape(current);
                        }
                    });

                    op.oncopy(function (isCopy) {
                        controlCopy = isCopy;
                    });

                    on(qs('.clear-house'), 'click', function () {
                        canvas.clearHouse();
                    });

                    on(qs('.clear-unit'), 'click', function () {
                        canvas.clearUnit();
                    });

                    on(qs('.clear-all'), 'click', function () {
                        canvas.clearAll();
                    });

                    topBar.onchange(function (drawArea) {
                        canvas.setActivateLayer(float(drawArea.getAttribute('data-id')));
                    });

                    doDrag();
                    doRotate();
                }
                else {
                    addClass($main, 'readonly');
                }

                return {
                    importData: importData,
                    loadImage: loadImage,
                    fixedPosition: fixedPosition,
                    initCanvas: initCanvas,
                    draw: function () { canvas.draw(); }
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
                mainView.draw();

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

            var text = svg.substring(0, 1000).match(/<svg(.|\r|\n)*?>/i)[0];
            var width = text.match(/\bwidth\=(?:\'\")(.*?)(?:\'\")/i);

            if (width != null && (height = text.match(/\bheight\=(?:\'\")(.*?)(?:\'\")/i)) != null) {
                return px(float(width[1]));
            }
            else {
                viewBox = text.match(/\bviewBox\=(?:\'|\")(.*?)(?:\'|\")/i);
                return px(float(viewBox != null ? viewBox[1].split(/\,|\s/i)[2] : 0));
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

            // if (urlData.mode === DESIGN_HITPOINT) {
            //     loadDataSuccess(win.parent ? win.parent['planeData'] : { Types: [], Code: 0, Items: [] });
            // }
            // else {
            ajax({
                url: './data/sample.json',
                success: loadDataSuccess,
                fail: function () {
                    loadDataFail();
                }
            });
            // }
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
                u.mode = u.mode < 0 || u.mode > 2 ? 0 : u.mode;
            }
            else {
                u.mode = DESIGN_TIME;
            }

            if (urlData.scope) {
                urlData.scope = trim(urlData.scope);
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
                if (win.parent !== win && typeof win.parent['onpos'] === 'function') {
                    assign(info, {
                        x: Math.round(info.x),
                        y: Math.round(info.y)
                    });

                    win.parent['onpos'](info);
                }
            });
        });
    }

    return init();

})(window, document);