define(["./UIBase"], function (_UIBase) {
    "use strict";

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

    _UIBase.UI.Switcher = function (_UI$Element) {
        _inherits(Switcher, _UI$Element);

        function Switcher(options) {
            _classCallCheck(this, Switcher);

            var _this = _possibleConstructorReturn(this, (Switcher.__proto__ || Object.getPrototypeOf(Switcher)).call(this, options));

            _this.childMap = new WeakMap();
            return _this;
        }

        _createClass(Switcher, [{
            key: "copyState",
            value: function copyState(element) {
                var options = Object.assign({}, element.options, {
                    children: this.overwriteElements(this.options.children || [], element.options.children || [])
                });

                this.setOptions(options);

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.options.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var child = _step.value;

                        if (child.options.active) {
                            this.activeChild = child;
                        }
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
        }, {
            key: "renderHTML",
            value: function renderHTML() {
                return this.activeChild || this.options.children[0];
            }
        }, {
            key: "overwriteElements",
            value: function overwriteElements(existingElements, newElements) {
                var keyMap = this.getElementKeyMap(existingElements);
                for (var i = 0; i < newElements.length; i += 1) {
                    var newChild = newElements[i];
                    var newChildKey = newChild.options && newChild.options.key || "autokey" + i;
                    var existingChild = keyMap.get(newChildKey);
                    if (existingChild === newChild) {
                        continue;
                    }
                    if (existingChild && newChild.canOverwrite(existingChild)) {
                        newElements[i] = newChild = this.overwriteChild(existingChild, newChild);
                    }
                }
                return newElements;
            }
        }, {
            key: "redraw",
            value: function redraw() {
                //basic things for our current node
                this.applyDOMAttributes();
                this.applyRef();

                // This renderHTML may be required to update this.options.children
                _UIBase.UI.renderingStack.push(this);
                this.renderHTML();
                _UIBase.UI.renderingStack.pop();

                if (this.options.children.length == 0) {
                    return;
                }

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.options.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var child = _step2.value;

                        if (this.options.lazyRender) {
                            this.getChildProperties(child).isUpToDate = false;
                            child.applyRef();
                        } else {
                            this.updateChild(child);
                        }
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

                this.updateActiveChild(this.activeChild || this.options.children[0]);
            }
        }, {
            key: "getChildProperties",
            value: function getChildProperties(child) {
                if (!this.childMap.has(child)) {
                    this.childMap.set(child, {
                        isUpToDate: false,
                        isMounted: !!child.node
                    });
                }
                return this.childMap.get(child);
            }
        }, {
            key: "updateChild",
            value: function updateChild(child) {
                if (!this.getChildProperties(child).isUpToDate) {
                    if (!child.node) {
                        child.mount(this);
                    } else {
                        child.redraw();
                    }
                    this.getChildProperties(child).isUpToDate = true;
                }
            }
        }, {
            key: "appendChild",
            value: function appendChild(child) {
                var doMount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

                this.options.children.push(child);
                if (doMount) {
                    child.mount(this);
                }
                if (this.options.children.length == 1) {
                    this.setActive(child);
                }
                return child;
            }
        }, {
            key: "getActiveIndex",
            value: function getActiveIndex() {
                return this.getChildIndex(this.activeChild);
            }
        }, {
            key: "getActive",
            value: function getActive() {
                return this.activeChild;
            }
        }, {
            key: "insertChildNodeBefore",
            value: function insertChildNodeBefore(child, nextSibling) {
                var childProperties = this.getChildProperties(child);
                childProperties.isMounted = true;
                childProperties.isUpToDate = true;
            }
        }, {
            key: "updateActiveChild",
            value: function updateActiveChild(element) {
                if (this.activeChild) {
                    this.activeChild.dispatch("setActive", false);
                }

                while (this.node.firstChild) {
                    //TODO: would be useful here to be able to access the matching UI Element
                    this.node.removeChild(this.node.firstChild);
                }

                this.updateChild(element);

                this.node.appendChild(element.node);
                this.children[0] = this.activeChild = element;

                element.dispatch("setActive", true);
            }
        }, {
            key: "setActive",
            value: function setActive(element) {
                if (this.activeChild === element) {
                    return;
                }
                if (this.activeChild) {
                    this.activeChild.dispatch("hide");
                }
                this.updateActiveChild(element);
                this.activeChild.dispatch("show");
            }
        }, {
            key: "hasChild",
            value: function hasChild(element) {
                return this.childMap.has(element);
            }
        }, {
            key: "getChild",
            value: function getChild(index) {
                return this.options.children[index];
            }
        }, {
            key: "getChildIndex",
            value: function getChildIndex(element) {
                return this.options.children.indexOf(element);
            }
        }, {
            key: "onMount",
            value: function onMount() {
                var _this2 = this;

                this.addListener("shouldRedrawChild", function (event) {
                    if (event.child.isInDOM()) {
                        event.child.redraw();
                    } else {
                        _this2.getChildProperties(event.child).isUpToDate = false;
                    }
                });
            }
        }]);

        return Switcher;
    }(_UIBase.UI.Element);
});
