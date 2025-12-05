import {equal} from "../numerics/StemMath";

interface TransitionOptions {
    func: (t: number, context: any) => void;
    context?: any;
    duration?: number;
    startTime?: number;
    dependsOn?: Transition[];
}

interface ModifierOptions extends TransitionOptions {
    reverseFunc: (context: any) => void;
}

export class Transition {
    func: (t: number, context: any) => void;
    context: any;
    duration: number;
    startTime: number;
    dependsOn: Transition[];
    speedFactor: number;
    stopped?: boolean;
    pauseTime?: number;
    lastT?: number;

    constructor(options: TransitionOptions) {
        this.func = options.func;
        this.context = options.context;
        this.duration = options.duration || 0;
        this.startTime = options.startTime || 0;
        this.dependsOn = options.dependsOn || [];
        this.speedFactor = 1;
    }

    toString(): string {
        return  "{\n"+
                "   context: " + this.context + "\n"+
                "   duration: " + this.duration + "\n"+
                "   startTime: " + this.startTime + "\n"+
                "   dependsOn: " + this.dependsOn + "\n"+
                "   func: " + this.func.toString() + "\n"+
                "}\n";
    }

    hasDependencyOn(t: Transition): boolean {
        for (let transition of this.dependsOn) {
            if (transition === t) {
                return true;
            }
        }
        return false;
    }

    canAdvance(): boolean {
        for (let i = 0; i < this.dependsOn.length; i += 1) {
            if (!this.dependsOn[i].isStopped()) {
                return false;
            }
        }
        return true;
    }

    getFraction(now: number = Date.now()): number {
        return Math.min((now - this.startTime) / this.getLength(), 1);
    }

    start(now: number = Date.now()): this {
        if (this.stopped) {
            delete this.stopped;
        }
        this.setStartTime(now);

        const functionWrapper = (): void => {
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

    getLength(): number {
        return this.getEndTime() - this.startTime;
    }

    setStartTime(time: number): this {
        this.startTime = time;
        return this;
    }

    setSpeedFactor(speedFactor: number, now: number = Date.now()): this {
        const ratio = speedFactor / this.speedFactor;
        this.startTime = (this.startTime - now) / ratio + now;
        if (this.pauseTime) {
            this.pauseTime = (this.pauseTime - now) / ratio + now;
        }
        this.speedFactor = speedFactor;
        return this;
    }

    pause(now: number = Date.now()): this {
        if (!this.pauseTime) {
            this.pauseTime = now;
        }
        return this;
    }

    resume(now: number = Date.now()): this {
        if (this.pauseTime) {
            this.startTime += (now - this.pauseTime);
            this.pauseTime = 0;
        }
        return this;
    }

    forceStart(): this {
        this.restart();
        this.func(0.0, this.context);
        return this;
    }

    forceFinish(): this {
        this.func(1.0, this.context);
        this.stop();
        return this;
    }

    stop(): void {
        this.stopped = true;
    }

    restart(): this {
        delete this.stopped;
        return this;
    }

    isStopped(): boolean {
        return this.stopped === true;
    }

    nextStep(now: number = Date.now()): this {
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

    getEndTime(): number {
        return this.startTime + this.duration / this.speedFactor;
    }
}

export class Modifier extends Transition {
    reverseFunc: (context: any) => void;

    constructor(options: ModifierOptions) {
        super(options);
        this.reverseFunc = options.reverseFunc;
        this.context = options.context;
    }

    toString(): string {
        return  "{\n"+
                "   context: " + this.context + "\n"+
                "   duration: " + this.duration + "\n"+
                "   startTime: " + this.startTime + "\n"+
                "   dependsOn: " + this.dependsOn + "\n"+
                "   func: " + this.func.toString() + "\n"+
                "   reverseFunc: " + this.reverseFunc.toString() + "\n"+
                "}\n";
    }

    forceStart(): this {
        this.restart();
        this.reverseFunc(this.context);
        return this;
    }

    forceFinish(): this {
        this.func(1.0, this.context);
        this.stop();
        return this;
    }

    nextStep(now: number = Date.now()): this {
        if (this.isStopped()) {
            return this;
        }
        if (now >= this.startTime) {
            const t = this.getFraction(now);
            this.func(t, this.context);
            this.stop();
        }
        return this;
    }

    getEndTime(): number {
        return this.startTime;
    }
}

export class TransitionList {
    startTime: number;
    speedFactor: number;
    transitions: Transition[];
    dependsOn: Transition[];
    stopped?: boolean;
    pauseTime?: number;
    onNewFrame?: (fraction: number) => void;
    animationFrameId?: number;
    context?: any;
    duration?: number;

    constructor(startTime: number = 0) {
        this.startTime = startTime;
        this.speedFactor = 1;
        this.transitions = [];
        this.dependsOn = [];
    }

    toString(): string {
        return  "{\n"+
                "   context: " + this.context + "\n"+
                "   duration: " + this.duration + "\n"+
                "   startTime: " + this.startTime + "\n"+
                "   dependsOn: " + this.dependsOn + "\n"+
                "   transitions: [" + (this.transitions.length ? this.transitions[0].toString() : "") + " ...]\n"+
                "}\n";
    }

    add(transition: Transition, forceFinish: boolean = true): this {
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

    push(transition: Transition, forceFinish: boolean = true): this {
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

    getFraction(now: number = Date.now()): number {
        return Math.min((now - this.startTime) / this.getLength(), 1);
    }

    setStartTime(startTime: number): void {
        const timeDelta = startTime - this.startTime;
        this.startTime = startTime;
        for (let i = 0; i < this.transitions.length; i += 1) {
            const transition = this.transitions[i];
            transition.setStartTime(transition.startTime + timeDelta);
        }
    }

    start(now: number = Date.now()): this {
        if (this.stopped) {
            delete this.stopped;
        }
        this.setStartTime(now);
        const functionWrapper = (): void => {
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

    stop(): void {
        this.stopped = true;
        for (let i = 0; i < this.transitions.length; i += 1) {
            const transition = this.transitions[i];
            transition.stop();
        }
    }

    isStopped(): boolean {
        return this.stopped === true;
    }

    pause(now: number = Date.now()): this {
        if (!this.pauseTime) {
            this.pauseTime = now;
            for (let i = 0; i < this.transitions.length; i += 1) {
                this.transitions[i].pause(now);
            }
        }
        return this;
    }

    resume(now: number = Date.now()): this {
        if (this.pauseTime) {
            this.startTime += now - this.pauseTime;
            for (let i = 0; i < this.transitions.length; i += 1) {
                this.transitions[i].resume(now);
            }
            this.pauseTime = 0;
        }
        return this;
    }

    nextStep(): this {
        // Return if transition list is stopped
        if (this.isStopped()) {
            return this;
        }

        if (this.onNewFrame) {
            this.onNewFrame(this.getFraction());
        }

        let finished = true;
        const stk: number[] = [];
        for (let i = 0; i < this.transitions.length; i += 1) {
            const transition = this.transitions[i];
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

    setSpeedFactor(speedFactor: number, now: number = Date.now()): this {
        const ratio = speedFactor / this.speedFactor;
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

    restart(): this {
        delete this.stopped;
        for (let i = 0; i < this.transitions.length; i += 1) {
            const transition = this.transitions[i];
            transition.restart();
        }
        this.sortByEndTime();
        return this;
    }

    getLength(): number {
        return this.getEndTime() - this.startTime;
    }

    getEndTime(): number {
        let endTime = 0;
        for (let i = 0; i < this.transitions.length; i += 1) {
            const transitionEndTime = this.transitions[i].getEndTime();
            if (transitionEndTime > endTime) {
                endTime = transitionEndTime;
            }
        }
        return endTime;
    }

    hasDependencyOn(t: Transition): boolean {
        for (let transition of this.dependsOn) {
            if (transition === t) {
                return true;
            }
        }
        return false;
    }

    canAdvance(): boolean {
        for (let i = 0; i < this.dependsOn.length; i += 1) {
            if (!this.dependsOn[i].isStopped()) {
                return false;
            }
        }
        return true;
    }

    sortByStartTime(): void {
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

    sortByEndTime(): void {
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

    forceStart(now: number = Date.now()): this {
        this.sortByStartTime();
        for (let i = 0; i < this.transitions.length; i += 1) {
            const transition = this.transitions[i];
            if (transition.startTime <= now) {
                transition.forceStart();
            }
        }
        return this;
    }

    forceFinish(now: number = Date.now(), startTime: number = -1): this {
        this.sortByEndTime();
        for (let i = 0; i < this.transitions.length; i += 1) {
            const transition = this.transitions[i];
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

    startAtPercent(startPercent: number, now: number = Date.now()): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.restart();
        // TODO(@wefgef): Buggy
        const paused = this.pauseTime;
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

        const functionWrapper = (): void => {
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