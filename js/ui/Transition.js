import { equal } from "../math";

var Transition = function () {
    function Transition(options) {
        babelHelpers.classCallCheck(this, Transition);

        this.func = options.func;
        this.context = options.context;
        this.duration = options.duration || 0;
        this.startTime = options.startTime || 0;
        this.dependsOn = options.dependsOn || [];
        this.speedFactor = 1;
    }

    babelHelpers.createClass(Transition, [{
        key: "hasDependencyOn",
        value: function hasDependencyOn(t) {
            for (var transition in this.dependsOn) {
                if (transition === t) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: "canAdvance",
        value: function canAdvance() {
            for (var i = 0; i < this.dependsOn.length; i += 1) {
                if (!this.dependsOn[i].isStopped()) {
                    return false;
                }
            }
            return true;
        }
    }, {
        key: "getFraction",
        value: function getFraction() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            return Math.min((now - this.startTime) / this.getLength(), 1);
        }
    }, {
        key: "start",
        value: function start() {
            var _this = this;

            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (this.stopped) {
                delete this.stopped;
            }
            this.setStartTime(now);

            var functionWrapper = function functionWrapper() {
                if (_this.stopped) {
                    return;
                }
                if (!_this.pauseTime) {
                    _this.nextStep();
                }
                requestAnimationFrame(functionWrapper);
            };
            requestAnimationFrame(functionWrapper);
            return this;
        }
    }, {
        key: "getLength",
        value: function getLength() {
            return this.getEndTime() - this.startTime;
        }
    }, {
        key: "setStartTime",
        value: function setStartTime(time) {
            this.startTime = time;
            return this;
        }
    }, {
        key: "setSpeedFactor",
        value: function setSpeedFactor(speedFactor) {
            var now = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Date.now();

            var ratio = speedFactor / this.speedFactor;
            this.startTime = (this.startTime - now) / ratio + now;
            if (this.pauseTime) {
                this.pauseTime = (this.pauseTime - now) / ratio + now;
            }
            this.speedFactor = speedFactor;
            return this;
        }
    }, {
        key: "pause",
        value: function pause() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (!this.pauseTime) {
                this.pauseTime = now;
            }
            return this;
        }
    }, {
        key: "resume",
        value: function resume() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (this.pauseTime) {
                this.startTime += now - this.pauseTime;
                this.pauseTime = 0;
            }
            return this;
        }
    }, {
        key: "forceStart",
        value: function forceStart() {
            this.restart();
            this.func(0.0, this.context);
            return this;
        }
    }, {
        key: "forceFinish",
        value: function forceFinish() {
            this.func(1.0, this.context);
            this.stop();
            return this;
        }
    }, {
        key: "stop",
        value: function stop() {
            this.stopped = true;
        }
    }, {
        key: "restart",
        value: function restart() {
            delete this.stopped;
            return this;
        }
    }, {
        key: "isStopped",
        value: function isStopped() {
            return this.stopped === true;
        }
    }, {
        key: "nextStep",
        value: function nextStep() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            // Return if transition is stopped
            if (this.isStopped()) {
                return this;
            }
            this.lastT = this.getFraction(now);
            // Return if transitions not started yet
            if (this.lastT < 0) {
                return this;
            }
            // Call the animation function
            this.func(this.lastT, this.context);
            // Stop the animation if it's the last step
            if (this.lastT === 1) {
                this.stop();
            }
            return this;
        }
    }, {
        key: "getEndTime",
        value: function getEndTime() {
            return this.startTime + this.duration / this.speedFactor;
        }
    }]);
    return Transition;
}();

var Modifier = function (_Transition) {
    babelHelpers.inherits(Modifier, _Transition);

    function Modifier(options) {
        babelHelpers.classCallCheck(this, Modifier);

        var _this2 = babelHelpers.possibleConstructorReturn(this, (Modifier.__proto__ || Object.getPrototypeOf(Modifier)).call(this, options));

        _this2.reverseFunc = options.reverseFunc;
        _this2.context = options.context;
        return _this2;
    }

    babelHelpers.createClass(Modifier, [{
        key: "forceStart",
        value: function forceStart() {
            this.restart();
            this.reverseFunc(this.context);
            return this;
        }
    }, {
        key: "forceFinish",
        value: function forceFinish() {
            this.func(this.context);
            this.stop();
            return this;
        }
    }, {
        key: "nextStep",
        value: function nextStep() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (this.isStopped()) {
                return this;
            }
            if (now >= this.startTime) {
                this.func(this.context);
                this.stop();
            }
            return this;
        }
    }, {
        key: "getEndTime",
        value: function getEndTime() {
            return this.startTime;
        }
    }]);
    return Modifier;
}(Transition);

var TransitionList = function () {
    function TransitionList() {
        var startTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        babelHelpers.classCallCheck(this, TransitionList);

        this.startTime = startTime;
        this.speedFactor = 1;
        this.transitions = [];
        this.dependsOn = [];
    }

    babelHelpers.createClass(TransitionList, [{
        key: "add",
        value: function add(transition) {
            var forceFinish = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            for (var i = 0; i < transition.dependsOn.length; i += 1) {
                if (transition.dependsOn[i].getEndTime() > transition.startTime) {
                    console.error("A transition depends on one that ends after its start!");
                }
            }
            if (forceFinish) {
                transition.forceFinish();
            }
            this.transitions.push(transition);
            return this;
        }
    }, {
        key: "push",
        value: function push(transition) {
            var forceFinish = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            transition.setStartTime(this.getLength());
            for (var i = 0; i < transition.dependsOn.length; i += 1) {
                if (transition.dependsOn[i].getEndTime() > transition.startTime) {
                    console.error("A transition depends on one that ends after its start!");
                }
            }
            if (forceFinish) {
                transition.forceFinish();
            }
            this.transitions.push(transition);
            return this;
        }
    }, {
        key: "getFraction",
        value: function getFraction() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            return Math.min((now - this.startTime) / this.getLength(), 1);
        }
    }, {
        key: "setStartTime",
        value: function setStartTime(startTime) {
            var timeDelta = startTime - this.startTime;
            this.startTime = startTime;
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                transition.setStartTime(transition.startTime + timeDelta);
            }
        }
    }, {
        key: "start",
        value: function start() {
            var _this3 = this;

            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (this.stopped) {
                delete this.stopped;
            }
            this.setStartTime(now);
            var functionWrapper = function functionWrapper() {
                if (_this3.stopped) {
                    return;
                }
                if (!_this3.pauseTime) {
                    _this3.nextStep();
                }
                requestAnimationFrame(functionWrapper);
            };
            requestAnimationFrame(functionWrapper);
            return this;
        }
    }, {
        key: "stop",
        value: function stop() {
            this.stopped = true;
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                transition.stop();
            }
        }
    }, {
        key: "isStopped",
        value: function isStopped() {
            return this.stopped === true;
        }
    }, {
        key: "pause",
        value: function pause() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (!this.pauseTime) {
                this.pauseTime = now;
                for (var i = 0; i < this.transitions.length; i += 1) {
                    this.transitions[i].pause(now);
                }
            }
            return this;
        }
    }, {
        key: "resume",
        value: function resume() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            if (this.pauseTime) {
                this.startTime += now - this.pauseTime;
                for (var i = 0; i < this.transitions.length; i += 1) {
                    this.transitions[i].resume(now);
                }
                this.pauseTime = 0;
            }
            return this;
        }
    }, {
        key: "nextStep",
        value: function nextStep() {
            // Return if transition list is stopped
            if (this.isStopped()) {
                return;
            }

            if (this.onNewFrame) {
                this.onNewFrame(this.getFraction());
            }

            var finished = true;
            var stk = [];
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                if (!transition.isStopped()) {
                    if (transition.canAdvance()) {
                        transition.nextStep();
                        while (stk.length !== 0 && this.transitions[stk[stk.length - 1]].canAdvance()) {
                            this.transitions[stk[stk.length - 1]].nextStep();
                            stk.pop();
                        }
                    } else {
                        stk.push(i);
                    }
                    finished = false;
                }
            }
            if (finished) {
                this.stop();
            }
            return this;
        }
    }, {
        key: "setSpeedFactor",
        value: function setSpeedFactor(speedFactor) {
            var now = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Date.now();

            var ratio = speedFactor / this.speedFactor;
            this.startTime = (this.startTime - now) / ratio + now;
            if (this.pauseTime) {
                this.pauseTime = (this.pauseTime - now) / ratio + now;
            }
            this.speedFactor = speedFactor;
            for (var i = 0; i < this.transitions.length; i += 1) {
                this.transitions[i].setSpeedFactor(speedFactor, now);
            }
            return this;
        }
    }, {
        key: "restart",
        value: function restart() {
            delete this.stopped;
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                transition.restart();
            }
            this.sortByEndTime();
            return this;
        }
    }, {
        key: "getLength",
        value: function getLength() {
            return this.getEndTime() - this.startTime;
        }
    }, {
        key: "getEndTime",
        value: function getEndTime() {
            var endTime = 0;
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transitionEndTime = this.transitions[i].getEndTime();
                if (transitionEndTime > endTime) {
                    endTime = transitionEndTime;
                }
            }
            return endTime;
        }
    }, {
        key: "hasDependencyOn",
        value: function hasDependencyOn(t) {
            for (var transition in this.dependsOn) {
                if (transition === t) {
                    return true;
                }
            }
            return false;
        }
    }, {
        key: "canAdvance",
        value: function canAdvance() {
            for (var i = 0; i < this.dependsOn.length; i += 1) {
                if (!this.dependsOn[i].isStopped()) {
                    return false;
                }
            }
            return true;
        }
    }, {
        key: "sortByStartTime",
        value: function sortByStartTime() {
            this.transitions.sort(function (a, b) {
                if (!equal(a.startTime, b.startTime, 0.001)) {
                    return b.startTime - a.startTime;
                }
                //not a hack, works in all conflict cases
                if (!equal(a.getEndTime(), b.getEndTime(), 0.001)) {
                    return b.getEndTime() - a.getEndTime();
                }
                if (a.hasDependencyOn(b)) {
                    return 1;
                }
                if (b.hasDependencyOn(a)) {
                    return -1;
                }
                return 0;
            });
        }
    }, {
        key: "sortByEndTime",
        value: function sortByEndTime() {
            this.transitions.sort(function (a, b) {
                if (!equal(a.getEndTime(), b.getEndTime(), 0.001)) {
                    return a.getEndTime() - b.getEndTime();
                }
                //not a hack, works in all conflict cases
                if (!equal(a.startTime, b.startTime, 0.001)) {
                    return a.startTime - b.startTime;
                }
                if (a.hasDependencyOn(b)) {
                    return -1;
                }
                if (b.hasDependencyOn(a)) {
                    return 1;
                }
                return 0;
            });
        }
    }, {
        key: "forceStart",
        value: function forceStart() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();

            this.sortByStartTime();
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                if (transition.startTime <= now) {
                    transition.forceStart(now);
                }
            }
            return this;
        }
    }, {
        key: "forceFinish",
        value: function forceFinish() {
            var now = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : Date.now();
            var startTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

            this.sortByEndTime();
            for (var i = 0; i < this.transitions.length; i += 1) {
                var transition = this.transitions[i];
                if (transition.getEndTime() >= startTime) {
                    if (transition instanceof TransitionList) {
                        transition.forceFinish(now, startTime);
                    } else {
                        if (typeof now === "undefined" || transition.getEndTime() < now) {
                            transition.forceFinish();
                        }
                    }
                }
            }
            return this;
        }
    }, {
        key: "startAtPercent",
        value: function startAtPercent(startPercent) {
            var _this4 = this;

            var now = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Date.now();

            cancelAnimationFrame(this.animationFrameId);
            this.restart();
            // TODO(@wefgef): Buggy
            var paused = this.pauseTime;
            if (paused) {
                this.resume();
            }
            this.forceStart(now);
            this.setStartTime(now - startPercent * this.getLength());
            this.forceFinish(now);
            // TODO(@wefgef): Huge hack to deal with force transition
            this.nextStep();
            this.nextStep();
            if (paused) {
                this.pause();
            }

            var functionWrapper = function functionWrapper() {
                if (_this4.isStopped()) {
                    return;
                }
                if (!_this4.pauseTime) {
                    _this4.nextStep();
                }
                _this4.animationFrameId = requestAnimationFrame(functionWrapper);
            };
            this.animationFrameId = requestAnimationFrame(functionWrapper);
        }
    }]);
    return TransitionList;
}();

export { Transition, Modifier, TransitionList };
