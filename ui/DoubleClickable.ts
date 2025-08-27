const SINGLE_CLICK_EVENT = "SingleClick";
const DOUBLE_CLICK_EVENT = "DoubleClick";

export const DoubleClickable = (BaseClass) => class DoubleClickable extends BaseClass {
    uniqueClickListener = null;
    singleClickTimeout = null;
    singleClickedAt = null;

    clearSingleClickTimeout() {
        clearTimeout(this.singleClickTimeout);
        this.singleClickTimeout = null;
        this.singleClickedAt = null;
    }

    ensureClickListener() {
        this.uniqueClickListener = this.uniqueClickListener || super.addClickListener((...args) => {
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
            this.singleClickTimeout = setTimeout(() => {
                this.clearSingleClickTimeout();
                this.dispatch(SINGLE_CLICK_EVENT, ...args);
            }, doubleClickTimeout);
        });
    }

    addClickListener(callback) {
        this.ensureClickListener();
        return this.addListener(SINGLE_CLICK_EVENT, callback);
    }

    removeClickListener(callback) {
        this.removeListener(SINGLE_CLICK_EVENT, callback);
    }

    addDoubleClickListener(callback) {
        this.addListener(DOUBLE_CLICK_EVENT, callback);
    }

    removeDoubleClickListener(callback) {
        this.removeListener(DOUBLE_CLICK_EVENT, callback);
    }
};
