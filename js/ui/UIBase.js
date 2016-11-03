define(["exports", "Utils", "NodeWrapper", "DOMAttributes"], function (exports, _Utils, _NodeWrapper2, _DOMAttributes) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.ATTRIBUTE_NAMES_MAP = exports.UI = exports.UIElement = undefined;

    var Utils = _interopRequireWildcard(_Utils);

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};

            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                }
            }

            newObj.default = obj;
            return newObj;
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    var _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
            var parent = Object.getPrototypeOf(object);

            if (parent === null) {
                return undefined;
            } else {
                return get(parent, property, receiver);
            }
        } else if ("value" in desc) {
            return desc.value;
        } else {
            var getter = desc.get;

            if (getter === undefined) {
                return undefined;
            }

            return getter.call(receiver);
        }
    };

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var UI = {
        renderingStack: [] };

    UI.TextElement = function () {
        function UITextElement(options) {
            _classCallCheck(this, UITextElement);

            var value = "";
            if (typeof options === "string" || options instanceof String || typeof options === "number" || options instanceof Number) {
                value = String(options);
                options = null;
            } else {
                value = options.value || value;
            }
            this.setValue(value);
            if (options) {
                this.options = options;
            }
        }

        _createClass(UITextElement, [{
            key: "mount",
            value: function mount(parent, nextSibling) {
                this.parent = parent;
                if (!this.node) {
                    this.createNode();
                }
                this.redraw();
                parent.node.insertBefore(this.node, nextSibling);
            }
        }, {
            key: "canOverwrite",
            value: function canOverwrite(existingChild) {
                return existingChild.constructor === this.constructor;
            }
        }, {
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                return Node.TEXT_NODE;
            }
        }, {
            key: "cleanup",
            value: function cleanup() {}
        }, {
            key: "copyState",
            value: function copyState(element) {
                this.setValue(element.getValue());
            }
        }, {
            key: "createNode",
            value: function createNode() {
                this.node = document.createTextNode(this.value);
                return this.node;
            }
        }, {
            key: "setValue",
            value: function setValue(value) {
                this.value = String(value);
                if (this.node) {
                    this.redraw();
                }
            }
        }, {
            key: "getValue",
            value: function getValue() {
                return this.value;
            }
        }, {
            key: "redraw",
            value: function redraw() {
                if (this.node) {
                    var newValue = this.getValue();
                    if (this.node.nodeValue !== newValue) {
                        this.node.nodeValue = newValue;
                    }
                }
                //TODO: make common with UI.Element
                if (this.options && this.options.ref) {
                    var obj = this.options.ref.parent;
                    var name = this.options.ref.name;
                    obj[name] = this;
                }
            }
        }]);

        return UITextElement;
    }();

    //Some changes to the basic API for UI.Element need to be mirrored in UI.TextElement

    var UIElement = function (_NodeWrapper) {
        _inherits(UIElement, _NodeWrapper);

        function UIElement(options) {
            _classCallCheck(this, UIElement);

            options = options || {};

            var _this = _possibleConstructorReturn(this, (UIElement.__proto__ || Object.getPrototypeOf(UIElement)).call(this, null, options, true));

            _this.children = [];
            _this.setOptions(options);
            return _this;
        }

        _createClass(UIElement, [{
            key: "setOptions",
            value: function setOptions(options) {
                this.options = options || {};
                this.options.children = this.options.children || [];

                if (options.hasOwnProperty("class")) {
                    console.error("Invalid UIElement attribute: class. Did you mean className?");
                }
            }
        }, {
            key: "updateOptions",
            value: function updateOptions(options) {
                var updatedOptions = Object.assign(this.options, options);
                this.setOptions(updatedOptions);
            }
        }, {
            key: "copyState",
            value: function copyState(element) {
                this.setOptions(element.options);
            }
        }, {
            key: "getPrimitiveTag",
            value: function getPrimitiveTag() {
                if (this.options && this.options.hasOwnProperty("primitiveTag")) {
                    return this.options.primitiveTag;
                }
                return "div";
            }
        }, {
            key: "getGivenChildren",
            value: function getGivenChildren() {
                return this.options.children || [];
            }
        }, {
            key: "getTitle",
            value: function getTitle() {
                return this.options.title || "";
            }
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                return this.options.children;
            }
        }, {
            key: "createNode",
            value: function createNode() {
                this.node = document.createElement(this.getPrimitiveTag());
                return this.node;
            }
        }, {
            key: "addCleanupTask",
            value: function addCleanupTask(task) {
                // TODO: this field should be an instance of CleanupJobs
                if (!this.cleanupTasks) {
                    this.cleanupTasks = [];
                }
                this.cleanupTasks.push(task);
            }
        }, {
            key: "destroyNode",
            value: function destroyNode() {
                this.cleanup();
                this.node.remove();
                this.node = undefined;
            }
        }, {
            key: "runCleanupTasks",
            value: function runCleanupTasks() {
                if (this.cleanupTasks) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _iterator = this.cleanupTasks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var task = _step.value;

                            task.cleanup();
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }
            }
        }, {
            key: "cleanup",
            value: function cleanup() {
                this.runCleanupTasks();
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var child = _step2.value;

                        child.cleanup();
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                this.clearNode();
                _get(UIElement.prototype.__proto__ || Object.getPrototypeOf(UIElement.prototype), "cleanup", this).call(this);
            }
        }, {
            key: "applyRef",
            value: function applyRef() {
                // TODO: remove old field names
                if (this.options.ref) {
                    var obj = this.options.ref.parent;
                    var name = this.options.ref.name;
                    obj[name] = this;
                }
            }
        }, {
            key: "canOverwrite",
            value: function canOverwrite(existingChild) {
                return this.constructor === existingChild.constructor && this.getPrimitiveTag() === existingChild.getPrimitiveTag();
            }
        }, {
            key: "overwriteChild",
            value: function overwriteChild(existingChild, newChild) {
                existingChild.copyState(newChild);
                return existingChild;
            }
        }, {
            key: "getElementKeyMap",
            value: function getElementKeyMap(elements) {
                var childrenKeyMap = new Map();

                for (var i = 0; i < elements.length; i += 1) {
                    var childKey = elements[i].options && elements[i].options.key || "autokey" + i;

                    childrenKeyMap.set(childKey, elements[i]);
                }

                return childrenKeyMap;
            }
        }, {
            key: "redraw",
            value: function redraw() {
                if (!this.node) {
                    console.warn("Element not yet mounted. Redraw aborted!", this);
                    return false;
                }

                UI.renderingStack.push(this);
                var newChildren = Utils.unwrapArray(this.renderHTML());
                UI.renderingStack.pop();

                if (newChildren === this.children) {
                    for (var i = 0; i < newChildren.length; i += 1) {
                        newChildren[i].redraw();
                    }
                    //TODO: also handle ref stuff here
                    this.applyDOMAttributes();
                    return;
                }

                var domNode = this.node;
                var childrenKeyMap = this.getElementKeyMap(this.children);

                for (var _i = 0; _i < newChildren.length; _i++) {
                    var newChild = newChildren[_i];
                    var prevChildNode = _i > 0 ? newChildren[_i - 1].node : null;
                    var currentChildNode = prevChildNode ? prevChildNode.nextSibling : domNode.firstChild;

                    // Not an UIElement, to be converted to a TextElement
                    if (!newChild.getPrimitiveTag) {
                        newChild = newChildren[_i] = new UI.TextElement(newChild);
                    }

                    // this means we are an UIElement
                    var newChildKey = newChild.options && newChild.options.key || "autokey" + _i;
                    var existingChild = childrenKeyMap.get(newChildKey);

                    if (existingChild && newChildren[_i].canOverwrite(existingChild)) {
                        // We're replacing an existing child element, it might be the very same object
                        if (existingChild !== newChildren[_i]) {
                            newChildren[_i] = this.overwriteChild(existingChild, newChildren[_i]);
                        }
                        newChildren[_i].redraw();
                        if (newChildren[_i].node !== currentChildNode) {
                            domNode.insertBefore(newChildren[_i].node, currentChildNode);
                        }
                    } else {
                        // Getting here means we are not replacing anything, should just render
                        newChild.mount(this, currentChildNode);
                    }
                }

                var newChildrenNodes = new Set();
                for (var _i2 = 0; _i2 < newChildren.length; _i2 += 1) {
                    newChildrenNodes.add(newChildren[_i2].node);
                }

                for (var _i3 = 0; _i3 < this.children.length; _i3 += 1) {
                    if (!newChildrenNodes.has(this.children[_i3].node)) {
                        //TODO: should call this.children[i].destroyNode()
                        this.children[_i3].cleanup();
                        domNode.removeChild(this.children[_i3].node);
                    }
                }

                this.children = newChildren;

                this.applyDOMAttributes();

                this.applyRef();

                return true;
            }
        }, {
            key: "applyDOMAttributes",
            value: function applyDOMAttributes() {
                this.domAttributes = this.getDOMAttributes();
                this.domAttributes.apply(this.node);
            }
        }, {
            key: "setAttribute",
            value: function setAttribute(key, value) {
                // TODO: what to do about preserving this on the next redraw
                this.domAttributes.setAttribute(key, value, this.node);
            }
        }, {
            key: "setStyle",
            value: function setStyle(attributeName, value) {
                this.options.style = this.options.style || {};
                this.options.style[attributeName] = value;

                this.domAttributes.setStyle(attributeName, value, this.node);
            }
        }, {
            key: "addClass",
            value: function addClass(className) {
                this.domAttributes.addClass(String(className), this.node);
            }
        }, {
            key: "removeClass",
            value: function removeClass(className) {
                this.domAttributes.removeClass(String(className), this.node);
            }
        }, {
            key: "hasClass",
            value: function hasClass(className) {
                return this.node && this.node.classList.contains(className);
            }
        }, {
            key: "toggleClass",
            value: function toggleClass(className) {
                if (!this.hasClass(className)) {
                    this.addClass(className);
                } else {
                    this.removeClass(className);
                }
            }
        }, {
            key: "getDOMAttributes",
            value: function getDOMAttributes() {
                if (this.constructor.extraDOMAttributes) {
                    var domAttributes = _get(UIElement.prototype.__proto__ || Object.getPrototypeOf(UIElement.prototype), "getDOMAttributes", this).call(this);
                    this.extraDOMAttributes(domAttributes);
                    return domAttributes;
                } else {
                    return new _DOMAttributes.DOMAttributes(this.options, this.constructor.domAttributesMap);
                }
            }
        }, {
            key: "refLink",
            value: function refLink(name) {
                return { parent: this, name: name };
            }
        }, {
            key: "refLinkArray",
            value: function refLinkArray(arrayName, index) {
                if (!this.hasOwnProperty(arrayName)) {
                    this[arrayName] = [];
                }

                while (index >= this[arrayName].length) {
                    this[arrayName].push(null);
                }

                return { parent: this[arrayName], name: index };
            }
        }, {
            key: "mount",
            value: function mount(parent, nextSiblingNode) {
                var _this2 = this;

                if (!parent.node) {
                    parent = new _NodeWrapper2.NodeWrapper(parent);
                }
                this.parent = parent;
                if (!this.node) {
                    this.createNode();
                }
                this.redraw();

                parent.insertChildNodeBefore(this, nextSiblingNode);

                // TODO: this should be cleaned up
                if (this.options.onClick) {
                    this.onClickHandler = function (event) {
                        UI.event = event;
                        if (_this2.options.onClick) {
                            _this2.options.onClick(_this2);
                        }
                    };
                    this.addClickListener(this.onClickHandler);
                    //TODO: THIS NEEDS TO BE REMOVED
                }
                this.onMount();
            }
        }, {
            key: "onMount",
            value: function onMount() {}
        }, {
            key: "appendChild",
            value: function appendChild(child) {
                if (this.children !== this.options.children) {
                    throw "Can't properly handle appendChild, you need to implement it for " + this.constructor;
                }
                this.options.children.push(child);
                child.mount(this, null);
                return child;
            }
        }, {
            key: "insertChild",
            value: function insertChild(child, position) {
                if (this.children !== this.options.children) {
                    throw "Can't properly handle insertChild, you need to implement it for " + this.constructor;
                }
                position = position || 0;

                this.options.children.splice(position, 0, child);

                child.mount(this, position + 1 < this.options.children.length ? this.children[position + 1].node : null);

                return child;
            }
        }, {
            key: "eraseChild",
            value: function eraseChild(child) {
                var destroy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                var index = this.options.children.indexOf(child);

                if (index < 0) {
                    // child not found
                    return null;
                }
                return this.eraseChildAtIndex(index, destroy);
            }
        }, {
            key: "eraseChildAtIndex",
            value: function eraseChildAtIndex(index) {
                var destroy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

                if (index < 0 || index >= this.options.children.length) {
                    console.error("Erasing child at invalid index ", index, this.options.children.length);
                    return;
                }
                if (this.children !== this.options.children) {
                    throw "Can't properly handle eraseChild, you need to implement it for " + this.constructor;
                }
                var erasedChild = this.options.children.splice(index, 1)[0];
                if (destroy) {
                    erasedChild.destroyNode();
                } else {
                    this.node.removeChild(erasedChild.node);
                }
                return erasedChild;
            }
        }, {
            key: "eraseAllChildren",
            value: function eraseAllChildren() {
                while (this.children.length > 0) {
                    this.eraseChildAtIndex(this.children.length - 1);
                }
            }
        }, {
            key: "show",
            value: function show() {
                this.removeClass("hidden");
            }
        }, {
            key: "hide",
            value: function hide() {
                this.addClass("hidden");
            }
        }], [{
            key: "create",
            value: function create(parentNode, options) {
                var uiElement = new this(options);
                uiElement.mount(parentNode, null);
                return uiElement;
            }
        }]);

        return UIElement;
    }(_NodeWrapper2.NodeWrapper);

    UIElement.domAttributesMap = _DOMAttributes.ATTRIBUTE_NAMES_MAP;

    UI.createElement = function (tag, options) {
        if (!tag) {
            console.error("Create element needs a valid object tag, did you mistype a class name?");
            return;
        }

        options = options || {};

        options.children = [];

        for (var i = 2; i < arguments.length; i += 1) {
            options.children.push(arguments[i]);
        }

        options.children = Utils.unwrapArray(options.children);

        if (options.ref) {
            if (typeof options.ref === "string") {
                if (UI.renderingStack.length > 0) {
                    options.ref = {
                        parent: UI.renderingStack[UI.renderingStack.length - 1],
                        name: options.ref
                    };
                } else {
                    throw Error("Failed to link ref, there needs to be an element in the rendering stack");
                }
            }

            if (options.key) {
                console.error("Warning! UI Element cannot have both a key and a ref fieldname. Key will be overriden.\n" + "Are you using the options from another object?", options);
            }

            options.key = "_ref" + options.ref.name;
        }

        if (typeof tag === "string") {
            options.primitiveTag = tag;
            tag = UIElement;
        }

        return new tag(options);
    };

    UI.Element = UIElement;

    UI.str = function (value) {
        return new UI.TextElement({ value: value });
    };

    // TODO: code shouldn't use UIElement directly, but through UI.Element
    exports.UIElement = UIElement;
    exports.UI = UI;
    exports.ATTRIBUTE_NAMES_MAP = _DOMAttributes.ATTRIBUTE_NAMES_MAP;
});
