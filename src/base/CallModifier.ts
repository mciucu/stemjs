import {NOOP_FUNCTION} from "./Utils";

export class CallModifier {
    wrap(func: Function): Function {
        throw new Error("Implement wrap method");
    }

    call(func: Function): any {
        return this.wrap(func)();
    }

    toFunction(): Function {
        return (func: Function) => this.wrap(func);
    }
}

/*
CallThrottler acts both as a throttler and a debouncer, allowing you to combine both types of functionality.
Available options:
    - debounce (ms): delays the function call by x ms, each call extending the delay
    - throttle (ms): keeps calls from happening with at most x ms between them. If debounce is also set, will make sure to
    fire a debounced even if over x ms have passed. If equal to CallTimer.ON_ANIMATION_FRAME, means that we want to use
    requestAnimationFrame instead of setTimeout, to execute before next frame redraw()
    - dropThrottled (boolean, default false): any throttled function call is not delayed, but dropped
 */
export class CallThrottler extends CallModifier {
    static ON_ANIMATION_FRAME = Symbol();
    static AUTOMATIC = Symbol();

    lastCallTime = 0;
    pendingCall: any = null;
    pendingCallArgs: any[] = [];
    pendingCallExpectedTime = 0;
    numCalls = 0;
    totalCallDuration = 0;
    
    debounce?: number;
    throttle?: number | symbol;
    dropThrottled?: boolean;

    constructor(options: any = {}) {
        super();
        Object.assign(this, options);
    }

    isThrottleOnAnimationFrame(): boolean {
        return this.throttle === (this.constructor as any).ON_ANIMATION_FRAME;
    }

    clearPendingCall(): void {
        this.pendingCall = null;
        this.pendingCallArgs = [];
        this.pendingCallExpectedTime = 0;
    }

    cancel(): void {
        this.pendingCall && this.pendingCall.cancel();
        this.clearPendingCall();
    }

    flush(): void {
        this.pendingCall && this.pendingCall.flush();
        this.clearPendingCall();
    }

    // API compatibility with cleanup jobs
    cleanup(): void {
        this.cancel();
    }

    computeExecutionDelay(timeNow: number): number | null {
        let executionDelay: number | null = null;
        if (this.throttle != null && typeof this.throttle === 'number') {
            executionDelay = Math.max(this.lastCallTime + this.throttle - timeNow, 0);
        }
        if (this.debounce != null) {
            executionDelay = Math.min(executionDelay != null ? executionDelay : this.debounce, this.debounce);
        }
        return executionDelay;
    }

    replacePendingCall(wrappedFunc: any, funcCall: Function, funcCallArgs: any[]): void {
        this.cancel();
        if (this.isThrottleOnAnimationFrame()) {
            const cancelHandler = requestAnimationFrame(funcCall as FrameRequestCallback);
            wrappedFunc.cancel = () => cancelAnimationFrame(cancelHandler);
            return;
        }

        const timeNow = Date.now();
        const executionDelay = this.computeExecutionDelay(timeNow);

        if (this.dropThrottled) {
            return executionDelay === 0 && funcCall();
        }

        const cancelHandler = setTimeout(funcCall, executionDelay || 0);
        wrappedFunc.cancel = () => clearTimeout(cancelHandler);
        this.pendingCall = wrappedFunc;
        this.pendingCallArgs = funcCallArgs;
        this.pendingCallExpectedTime = timeNow + executionDelay;
    }

    updatePendingCall(args: any[]): void {
        this.pendingCallArgs = args;
        if (!this.isThrottleOnAnimationFrame()) {
            const timeNow = Date.now();
            this.pendingCallExpectedTime = timeNow + this.computeExecutionDelay(timeNow);
        }
    }

    wrap(func: Function): Function {
        const funcCall = () => {
            const timeNow = Date.now();
            // The expected time when the function should be executed next might have been changed
            // Check if that's the case, while allowing a 1ms error for time measurement
            if (!this.isThrottleOnAnimationFrame() &&
                timeNow + 1 < this.pendingCallExpectedTime) {
                this.replacePendingCall(wrappedFunc, funcCall, this.pendingCallArgs);
            } else {
                this.lastCallTime = timeNow;
                this.clearPendingCall();
                func(...this.pendingCallArgs);
            }
        };

        const wrappedFunc = (...args: any[]) => {
            // Check if it's our function, and update the arguments and next execution time only
            if (this.pendingCall && func === this.pendingCall.originalFunc) {
                // We only need to update the arguments, and maybe mark that we want to executed later than scheduled
                // It's an optimization to not invoke too many setTimeout/clearTimeout pairs
                return this.updatePendingCall(args);
            }
            return this.replacePendingCall(wrappedFunc, funcCall, args);
        };

        wrappedFunc.originalFunc = func;
        wrappedFunc.cancel = NOOP_FUNCTION;
        wrappedFunc.flush = () => {
            if (wrappedFunc === this.pendingCall) {
                this.cancel();
                wrappedFunc();
            }
        };
        return wrappedFunc;
    }
}

// export function benchmarkThrottle(options={}) {
//     const startTime = performance.now();
//     const calls = options.calls || 100000;
//
//     const throttler = new CallThrottler({throttle: options.throttle || 300, debounce: options.debounce || 100});
//
//     const func = options.func || NOOP_FUNCTION;
//
//     const wrappedFunc = throttler.wrap(func);
//
//     for (let i = 0; i < calls; i += 1) {
//         wrappedFunc();
//     }
//     console.warn("Throttle benchmark:", performance.now() - startTime, "for", calls, "calls");
// }
