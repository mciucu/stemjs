const SINGLE_CLICK_EVENT = "SingleClick";
const DOUBLE_CLICK_EVENT = "DoubleClick";

// Type definitions for double clickable functionality
type ClickCallback = (...args: any[]) => void;

interface DoubleClickableOptions {
    doubleClickTimeout?: number;
    [key: string]: any;
}

export const DoubleClickable = <T extends new (...args: any[]) => any>(BaseClass: T) => class DoubleClickable extends BaseClass {
    uniqueClickListener: any = null;
    singleClickTimeout: ReturnType<typeof setTimeout> | null = null;
    singleClickedAt: number | null = null;
    declare options: DoubleClickableOptions;

    clearSingleClickTimeout(): void {
        if (this.singleClickTimeout) {
            clearTimeout(this.singleClickTimeout);
        }
        this.singleClickTimeout = null;
        this.singleClickedAt = null;
    }

    ensureClickListener(): void {
        this.uniqueClickListener = this.uniqueClickListener || super.addClickListener((...args: any[]) => {
            const haveDoubleClickListeners = this.getDispatcher(DOUBLE_CLICK_EVENT, false)?.listeners?.length > 0;
            const doubleClickTimeout = haveDoubleClickListeners ? (this.options.doubleClickTimeout || 250) : 0;
            const currentTime = Date.now();

            if (this.singleClickTimeout && (currentTime - this.singleClickedAt < doubleClickTimeout)) {
                this.clearSingleClickTimeout();
                this.dispatch(DOUBLE_CLICK_EVENT, ...args);
                return;
            }

            this.clearSingleClickTimeout(); // Could it actually happen that a timeout would have remained unexecuted?

            this.singleClickedAt = Date.now();
            this.singleClickTimeout = setTimeout((): void => {
                this.clearSingleClickTimeout();
                this.dispatch(SINGLE_CLICK_EVENT, ...args);
            }, doubleClickTimeout);
        });
    }

    addClickListener(callback: ClickCallback): any {
        this.ensureClickListener();
        return this.addListener(SINGLE_CLICK_EVENT, callback);
    }

    removeClickListener(callback: ClickCallback): void {
        this.removeListener(SINGLE_CLICK_EVENT, callback);
    }

    addDoubleClickListener(callback: ClickCallback): any {
        this.addListener(DOUBLE_CLICK_EVENT, callback);
    }

    removeDoubleClickListener(callback: ClickCallback): void {
        this.removeListener(DOUBLE_CLICK_EVENT, callback);
    }
};