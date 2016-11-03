define(["exports", "Dispatcher"], function (exports, _Dispatcher) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.NodeWrapper = undefined;

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

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

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

    var NodeWrapper = function (_Dispatchable) {
        _inherits(NodeWrapper, _Dispatchable);

        function NodeWrapper(domNode, options) {
            _classCallCheck(this, NodeWrapper);

            var _this = _possibleConstructorReturn(this, (NodeWrapper.__proto__ || Object.getPrototypeOf(NodeWrapper)).call(this));

            _this.node = domNode;
            _this.options = options || {};
            return _this;
        }

        _createClass(NodeWrapper, [{
            key: "insertChildNodeBefore",
            value: function insertChildNodeBefore(childElement, nextSiblingNode) {
                this.node.insertBefore(childElement.node, nextSiblingNode);
            }
        }, {
            key: "clearNode",
            value: function clearNode() {
                while (this.node && this.node.lastChild) {
                    this.node.removeChild(this.node.lastChild);
                }
            }
        }, {
            key: "uniqueId",
            value: function uniqueId() {
                if (!this.hasOwnProperty("uniqueIdStr")) {
                    // TODO: should this be global?
                    if (!this.constructor.hasOwnProperty("objectCount")) {
                        this.constructor.objectCount = 0;
                    }
                    this.constructor.objectCount += 1;
                    this.uniqueIdStr = this.constructor.objectCount + "-" + Math.random().toString(36).substr(2);
                }
                return this.uniqueIdStr;
            }
        }, {
            key: "getOffset",
            value: function getOffset() {
                var node = this.node;
                if (!node) {
                    return { left: 0, top: 0 };
                }
                var nodePosition = node.style ? node.style.position : null;
                var left = 0;
                var top = 0;
                while (node) {
                    var nodeStyle = node.style || {};
                    if (nodePosition === "absolute" && nodeStyle.position === "relative") {
                        return { left: left, top: top };
                    }
                    left += node.offsetLeft;
                    top += node.offsetTop;
                    node = node.offsetParent;
                }
                return { left: left, top: top };
            }
        }, {
            key: "getStyle",
            value: function getStyle(attribute) {
                return window.getComputedStyle(this.node, null).getPropertyValue(attribute);
            }
        }, {
            key: "isInDOM",
            value: function isInDOM() {
                return document.body.contains(this.node);
            }
        }, {
            key: "getWidthOrHeight",
            value: function getWidthOrHeight(parameter) {
                var node = this.node;
                if (!node) {
                    return 0;
                }
                var value = parseFloat(parameter === "width" ? node.offsetWidth : node.offsetHeight);
                // If for unknown reasons this happens, maybe this will work
                if (value == null) {
                    value = parseFloat(this.getStyle(parameter));
                }
                if (isNaN(value)) {
                    value = 0;
                }
                if (this.getStyle("box-sizing") === "border-box") {
                    var attributes = ["padding-", "border-"];
                    var directions = {
                        width: ["left", "right"],
                        height: ["top", "bottom"]
                    };
                    for (var i = 0; i < 2; i += 1) {
                        for (var j = 0; j < 2; j += 1) {
                            value -= parseFloat(this.getStyle(attributes[i] + directions[parameter][j]));
                        }
                    }
                }
                return value;
            }
        }, {
            key: "getHeight",
            value: function getHeight() {
                return this.getWidthOrHeight("height");
            }
        }, {
            key: "getWidth",
            value: function getWidth() {
                return this.getWidthOrHeight("width");
            }
        }, {
            key: "setHeight",
            value: function setHeight(value) {
                if (typeof value === "number") {
                    value += "px";
                }
                this.setStyle("height", value);
                this.dispatch("resize");
            }
        }, {
            key: "setWidth",
            value: function setWidth(value) {
                if (typeof value === "number") {
                    value += "px";
                }
                this.setStyle("width", value);
                this.dispatch("resize");
            }
        }, {
            key: "addDOMListener",
            value: function addDOMListener(name, callback) {
                this.node.addEventListener(name, callback);
            }
        }, {
            key: "removeDOMListener",
            value: function removeDOMListener(name, callback) {
                this.node.removeEventListener(name, callback);
            }
        }, {
            key: "addClickListener",
            value: function addClickListener(callback) {
                this.addDOMListener("click", callback);
            }
        }, {
            key: "setClickListener",
            value: function setClickListener(callback) {
                // TODO: remove old click listener
                this.addClickListener(callback);
            }
        }, {
            key: "removeClickListener",
            value: function removeClickListener(callback) {
                this.removeDOMListener("click", callback);
            }
        }, {
            key: "addDoubleClickListener",
            value: function addDoubleClickListener(callback) {
                this.addDOMListener("dblclick", callback);
            }
        }, {
            key: "removeDoubleClickListener",
            value: function removeDoubleClickListener(callback) {
                this.removeDOMListener("dblclick", callback);
            }
        }, {
            key: "onChange",
            value: function onChange(callback) {
                this.addDOMListener("change", callback);
            }
        }, {
            key: "ensureFieldExists",
            value: function ensureFieldExists(name, value) {
                if (!this.hasOwnProperty(name)) {
                    this[name] = value(this);
                }
                return this[name];
            }
        }, {
            key: "element",
            get: function get() {
                if (!this._element) {
                    this._element = $(this.node);
                }
                return this._element;
            }
        }]);

        return NodeWrapper;
    }(_Dispatcher.Dispatchable);

    exports.NodeWrapper = NodeWrapper;
});
