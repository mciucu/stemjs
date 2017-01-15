import {equal} from "../math";

class Transition {
    constructor(options) {
        this.func = options.func;
        this.context = options.context;
        this.duration = options.duration || 0;
        this.startTime = options.startTime || 0;
        this.dependsOn = options.dependsOn || [];
        this.speedFactor = 1;
    }

    toString() {
        return  "{\n"+
                "   context: " + this.context + "\n"+
                "   duration: " + this.duration + "\n"+
                "   startTime: " + this.startTime + "\n"+
                "   dependsOn: " + this.dependsOn + "\n"+
                "   func: " + this.func.toString() + "\n"+
                "}\n";
    }

    hasDependencyOn(t) {
        for (let transition of this.dependsOn) {
            if (transition === t) {
                return true;
            }
        }
        return false;
    }

    canAdvance() {
        for (let i = 0; i < this.dependsOn.length; i += 1) {
            if (!this.dependsOn[i].isStopped()) {
                return false;
            }
        }
        return true;
    }

    getFraction(now=Date.now()) {
        return Math.min((now - this.startTime) / this.getLength(), 1);
    }

    start(now=Date.now()) {
        if (this.stopped) {
            delete this.stopped;
        }
        this.setStartTime(now);

        let functionWrapper = () => {
            if (this.stopped) {
                return;
            }
            if (!this.pauseTime) {
                this.nextStep();
            }
            requestAnimationFrame(functionWrapper);
        };
        requestAnimationFrame(functionWrapper);
        return this;
    }

    getLength() {
        return this.getEndTime() - this.startTime;
    }

    setStartTime(time) {
        this.startTime = time;
        return this;
    }

    setSpeedFactor(speedFactor, now=Date.now()) {
        let ratio = speedFactor / this.speedFactor;
        this.startTime = (this.startTime - now) / ratio + now;
        if (this.pauseTime) {
            this.pauseTime = (this.pauseTime - now) / ratio + now;
        }
        this.speedFactor = speedFactor;
        return this;
    }

    pause(now=Date.now()) {
        if (!this.pauseTime) {
            this.pauseTime = now;
        }
        return this;
    }

    resume(now=Date.now()) {
        if (this.pauseTime) {
            this.startTime += (now - this.pauseTime);
            this.pauseTime = 0;
        }
        return this;
    }

    forceStart() {
        this.restart();
        this.func(0.0, this.context);
        return this;
    }

    forceFinish() {
        this.func(1.0, this.context);
        this.stop();
        return this;
    }

    stop() {
        this.stopped = true;
    }

    restart() {
        delete this.stopped;
        return this;
    }

    isStopped() {
        return this.stopped === true;
    }

    nextStep(now=Date.now()) {
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

    getEndTime() {
        return this.startTime + this.duration / this.speedFactor;
    }
}

class Modifier extends Transition {
    constructor(options) {
        super(options);
        this.reverseFunc = options.reverseFunc;
        this.context = options.context;
    }

    // WTF, so basically JSON.stringify??
    toString() {
        return  "{\n"+
                "   context: " + this.context + "\n"+
                "   duration: " + this.duration + "\n"+
                "   startTime: " + this.startTime + "\n"+
                "   dependsOn: " + this.dependsOn + "\n"+
                "   func: " + this.func.toString() + "\n"+
                "   reverseFunc: " + this.reverseFunc.toString() + "\n"+
                "}\n";
    }

    forceStart() {
        this.restart();
        this.reverseFunc(this.context);
        return this;
    }

    forceFinish() {
        this.func(this.context);
        this.stop();
        return this;
    }

    nextStep(now=Date.now()) {
        if (this.isStopped()) {
            return this;
        }
        if (now >= this.startTime) {
            this.func(this.context);
            this.stop();
        }
        return this;
    }

    getEndTime() {
        return this.startTime;
    }
}

class TransitionList {
    constructor(startTime=0) {
        this.startTime = startTime;
        this.speedFactor = 1;
        this.transitions = [];
        this.dependsOn = [];
    }

    toString() {
        return  "{\n"+
                "   context: " + this.context + "\n"+
                "   duration: " + this.duration + "\n"+
                "   startTime: " + this.startTime + "\n"+
                "   dependsOn: " + this.dependsOn + "\n"+
                "   transitions: [" + (this.transitions.length ? this.transitions[0].toString() : "") + " ...]\n"+
                "}\n";
    }

    add(transition, forceFinish=true) {
        for (let i = 0; i < transition.dependsOn.length; i += 1) {
            if (transition.dependsOn[i].getEndTime() > transition.startTime) {
                console.error(transition.toString() + "\ndepends on\n" + transition.dependsOn[i].toString() + "\n" + "which ends after its start!");
            }
        }
        if (forceFinish) {
            transition.forceFinish();
        }
        this.transitions.push(transition);
        return this;
    }

    push(transition, forceFinish=true) {
        transition.setStartTime(this.getLength());
        for (let i = 0; i < transition.dependsOn.length; i += 1) {
            if (transition.dependsOn[i].getEndTime() > transition.startTime) {
                console.error(transition.toString() + "\ndepends on\n" + transition.dependsOn[i].toString() + "\n" + "which ends after its start!");
            }
        }
        if (forceFinish) {
            transition.forceFinish();
        }
        this.transitions.push(transition);
        return this;
    }

    getFraction(now=Date.now()) {
        return Math.min((now - this.startTime) / this.getLength(), 1);
    }

    setStartTime(startTime) {
        let timeDelta = startTime - this.startTime;
        this.startTime = startTime;
        for (let i = 0; i < this.transitions.length; i += 1) {
            let transition = this.transitions[i];
            transition.setStartTime(transition.startTime + timeDelta);
        }
    }

    start(now=Date.now()) {
        if (this.stopped) {
            delete this.stopped;
        }
        this.setStartTime(now);
        let functionWrapper = () => {
            if (this.stopped) {
                return;
            }
            if (!this.pauseTime) {
                this.nextStep();
            }
            requestAnimationFrame(functionWrapper);
        };
        requestAnimationFrame(functionWrapper);
        return this;
    }

    stop() {
        this.stopped = true;
        for (let i = 0; i < this.transitions.length; i += 1) {
            let transition = this.transitions[i];
            transition.stop();
        }
    }

    isStopped() {
        return this.stopped === true;
    }

    pause(now=Date.now()) {
        if (!this.pauseTime) {
            this.pauseTime = now;
            for (let i = 0; i < this.transitions.length; i += 1) {
                this.transitions[i].pause(now);
            }
        }
        return this;
    }

    resume(now=Date.now()) {
        if (this.pauseTime) {
            this.startTime += now - this.pauseTime;
            for (let i = 0; i < this.transitions.length; i += 1) {
                this.transitions[i].resume(now);
            }
            this.pauseTime = 0;
        }
        return this;
    }

    nextStep() {
        // Return if transition list is stopped
        if (this.isStopped()) {
            return;
        }

        if (this.onNewFrame) {
            this.onNewFrame(this.getFraction());
        }

        let finished = true;
        let stk = [];
        for (let i = 0; i < this.transitions.length; i += 1) {
            let transition = this.transitions[i];
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

    setSpeedFactor(speedFactor, now=Date.now()) {
        let ratio = speedFactor / this.speedFactor;
        this.startTime = (this.startTime - now) / ratio + now;
        if (this.pauseTime) {
            this.pauseTime = (this.pauseTime - now) / ratio + now;
        }
        this.speedFactor = speedFactor;
        for (let i = 0; i < this.transitions.length; i += 1) {
            this.transitions[i].setSpeedFactor(speedFactor, now);
        }
        return this;
    }

    restart() {
        delete this.stopped;
        for (let i = 0; i < this.transitions.length; i += 1) {
            let transition = this.transitions[i];
            transition.restart();
        }
        this.sortByEndTime();
        return this;
    }

    getLength() {
        return this.getEndTime() - this.startTime;
    }

    getEndTime() {
        let endTime = 0;
        for (let i = 0; i < this.transitions.length; i += 1) {
            let transitionEndTime = this.transitions[i].getEndTime();
            if (transitionEndTime > endTime) {
                endTime = transitionEndTime;
            }
        }
        return endTime;
    }

    hasDependencyOn(t) {
        for (let transition in this.dependsOn) {
            if (transition === t) {
                return true;
            }
        }
        return false;
    }

    canAdvance() {
        for (let i = 0; i < this.dependsOn.length; i += 1) {
            if (!this.dependsOn[i].isStopped()) {
                return false;
            }
        }
        return true;
    }

    sortByStartTime() {
        // TODO: this comparator should be global
        this.transitions.sort((a, b) => {
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
    sortByEndTime() {
        this.transitions.sort((a, b) => {
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

    forceStart(now=Date.now()) {
        this.sortByStartTime();
        for (let i = 0; i < this.transitions.length; i += 1) {
            let transition = this.transitions[i];
            if (transition.startTime <= now) {
                transition.forceStart(now);
            }
        }
        return this;
    }

    forceFinish(now=Date.now(), startTime=-1) {
        this.sortByEndTime();
        for (let i = 0; i < this.transitions.length; i += 1) {
            let transition = this.transitions[i];
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

    startAtPercent(startPercent, now=Date.now()) {
        cancelAnimationFrame(this.animationFrameId);
        this.restart();
        // TODO(@wefgef): Buggy
        let paused = this.pauseTime;
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

        let functionWrapper = () => {
            if (this.isStopped()) {
                return;
            }
            if (!this.pauseTime) {
                this.nextStep();
            }
            this.animationFrameId = requestAnimationFrame(functionWrapper);
        };
        this.animationFrameId = requestAnimationFrame(functionWrapper);
    }
}

export {Transition, Modifier, TransitionList};