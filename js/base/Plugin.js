define(["exports", "Dispatcher"], function (exports, _Dispatcher) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.Pluginable = exports.Plugin = undefined;

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

    var Plugin = function (_Dispatchable) {
        _inherits(Plugin, _Dispatchable);

        function Plugin(parent) {
            _classCallCheck(this, Plugin);

            var _this = _possibleConstructorReturn(this, (Plugin.__proto__ || Object.getPrototypeOf(Plugin)).call(this));

            _this.linkToParent(parent);
            return _this;
        }

        _createClass(Plugin, [{
            key: "linkToParent",
            value: function linkToParent(parent) {
                this.parent = parent;
            }
        }, {
            key: "name",
            value: function name() {
                return this.constructor.pluginName();
            }
        }], [{
            key: "pluginName",
            value: function pluginName() {
                return this.name;
            }
        }]);

        return Plugin;
    }(_Dispatcher.Dispatchable);

    // TODO: rename this to use Mixin in title
    var Pluginable = function Pluginable(BaseClass) {
        return function (_BaseClass) {
            _inherits(Pluginable, _BaseClass);

            function Pluginable() {
                _classCallCheck(this, Pluginable);

                return _possibleConstructorReturn(this, (Pluginable.__proto__ || Object.getPrototypeOf(Pluginable)).apply(this, arguments));
            }

            _createClass(Pluginable, [{
                key: "registerPlugin",
                value: function registerPlugin(PluginClass) {
                    if (!this.hasOwnProperty("plugins")) {
                        this.plugins = new Map();
                    }
                    // TODO: figure out plugin dependencies
                    var plugin = new PluginClass(this);
                    var pluginName = plugin.name();

                    if (this.plugins.has(pluginName)) {
                        console.error("You are overwriting an existing plugin: ", pluginName, " for object ", this);
                    }

                    this.plugins.set(pluginName, plugin);
                }
            }, {
                key: "removePlugin",
                value: function removePlugin(pluginName) {
                    var plugin = this.getPlugin(pluginName);
                    if (plugin) {
                        plugin.remove(this);
                        this.plugins.delete(plugin.name());
                    } else {
                        console.error("Can't remove plugin ", pluginName);
                    }
                }
            }, {
                key: "getPlugin",
                value: function getPlugin(pluginName) {
                    if (!(typeof pluginName === "string")) {
                        pluginName = pluginName.pluginName();
                    }
                    if (this.plugins) {
                        return this.plugins.get(pluginName);
                    } else {
                        return null;
                    }
                }
            }]);

            return Pluginable;
        }(BaseClass);
    };

    exports.Plugin = Plugin;
    exports.Pluginable = Pluginable;
});
