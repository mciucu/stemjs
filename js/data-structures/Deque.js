define(["exports"], function (exports) {
    "use strict";

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

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

    var Deque = function () {
        function Deque() {
            _classCallCheck(this, Deque);

            this._values = new Array(8);
            this._length = 0;
            this._offset = this._values.length / 2 | 0;
        }

        _createClass(Deque, [{
            key: "shouldShrink",
            value: function shouldShrink() {
                return this._values.length > 4 * this._length + 8;
            }
        }, {
            key: "maybeShrink",
            value: function maybeShrink() {
                if (this.shouldShrink()) {
                    this.rebalance(true);
                }
            }
        }, {
            key: "rebalance",
            value: function rebalance(forceResize) {
                var capacity = this._values.length;
                var length = this._length;
                var optimalCapacity = length * 1.618 + 8 | 0;
                var shouldResize = forceResize || capacity < optimalCapacity;

                if (shouldResize) {
                    // Allocate a new array and balance objects around the middle
                    var values = new Array(optimalCapacity);
                    var optimalOffset = optimalCapacity / 2 - length / 2 | 0;
                    for (var i = 0; i < length; i += 1) {
                        values[optimalOffset + i] = this._values[this._offset + i];
                    }
                    this._values = values;
                    this._offset = optimalOffset;
                } else {
                    //Just balance the elements in the middle of the array
                    var _optimalOffset = capacity / 2 - length / 2 | 0;
                    // Move either descending or ascending, to not overwrite values
                    if (_optimalOffset < this._offset) {
                        for (var _i = 0; _i < length; _i += 1) {
                            this._values[_i + _optimalOffset] = this._values[_i + this._offset];
                        }
                    } else {
                        for (var _i2 = length - 1; _i2 >= 0; _i2 -= 1) {
                            this._values[_i2 + _optimalOffset] = this._values[_i2 + this._offset];
                        }
                    }
                    this._offset = _optimalOffset;
                }
            }
        }, {
            key: "pushBack",
            value: function pushBack(value) {
                if (this._offset == 0) {
                    this.rebalance();
                }
                this._values[--this._offset] = value;
                this._length += 1;
            }
        }, {
            key: "popBack",
            value: function popBack() {
                var value = this.peekBack();

                this._values[this._offset++] = undefined;
                this._length -= 1;
                this.maybeShrink();

                return value;
            }
        }, {
            key: "peekBack",
            value: function peekBack() {
                if (this._length == 0) {
                    throw Error("Invalid operation, empty deque");
                }
                return this._values[this._offset];
            }
        }, {
            key: "pushFront",
            value: function pushFront(value) {
                if (this._offset + this._length === this._values.length) {
                    this.rebalance();
                }
                this._values[this._offset + this._length] = value;
                this._length += 1;
            }
        }, {
            key: "popFront",
            value: function popFront() {
                var value = this.peekFront();

                this._length -= 1;
                this._values[this._offset + this._length] = undefined;
                this.maybeShrink();

                return value;
            }
        }, {
            key: "peekFront",
            value: function peekFront() {
                if (this._length == 0) {
                    throw Error("Invalid operation, empty deque");
                }
                return this._values[this._offset + this._length - 1];
            }
        }, {
            key: "get",
            value: function get(index) {
                if (index < 0 || index >= this._length) {
                    throw Error("Invalid index", index);
                }
                return this._values[this._offset + index];
            }
        }, {
            key: "toArray",
            value: function toArray() {
                return this._values.slice(this._offset, this._offset + this._length);
            }
        }, {
            key: "toString",
            value: function toString() {
                return this.toArray().toString();
            }
        }, {
            key: "length",
            get: function get() {
                return this._values.length;
            },
            set: function set(value) {
                throw Error("Can't resize a deque");
            }
        }]);

        return Deque;
    }();

    // Also support the standard javascript method names
    Deque.prototype.pop = Deque.prototype.popBack;
    Deque.prototype.push = Deque.prototype.pushBack;
    Deque.prototype.shift = Deque.prototype.popFront;
    Deque.prototype.unshift = Deque.prototype.pushFront;

    exports.Deque = Deque;
});
