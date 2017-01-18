// TODO: this file existed to hold generic classes in a period of fast prototyping, has a lot of old code
import {UI} from "./UIBase";
import {Device} from "../base/Device";
import {Draggable} from "./Draggable";
import {Dispatchable} from "../base/Dispatcher";
import {getOffset} from "./Utils";

UI.Orientation = {
    HORIZONTAL: 1,
    VERTICAL: 2,
};

UI.Direction = {
    UP: "up",
    LEFT: "left",
    DOWN: "down",
    RIGHT: "right",
};

// TODO: move to Bootstrap file
UI.Level = {
    NONE: null,
    DEFAULT: "default",
    INFO: "info",
    PRIMARY: "primary",
    SUCCESS: "success",
    WARNING: "warning",
    DANGER: "danger",
    ERROR: "danger",
};

UI.Size = {
    NONE: null,
    EXTRA_SMALL: "xs",
    SMALL: "sm",
    DEFAULT: "default",
    LARGE: "lg",
    EXTRA_LARGE: "xl",
};

// TODO: why is this here?
UI.VoteStatus = {
    NONE: null,
    LIKE: 1,
    DISLIKE: -1
};

UI.ActionStatus = {
    DEFAULT: 1,
    RUNNING: 2,
    SUCCESS: 3,
    FAILED: 4,
};

// A very simple class, all this does is implement the `getTitle()` method
class Panel extends UI.Element {
    getTitle() {
        return this.options.title;
    }
}

class SlideBar extends Draggable(UI.Element) {
    constructor(options) {
        super(options);
    }

    getNodeAttributes() {
        let attributes = super.getNodeAttributes();
        attributes.setStyle("display", "inline-block");
        attributes.setStyle("position", "relative");
        attributes.setStyle("cursor", "pointer");
        return attributes;
    }

    getSliderLeft() {
        return this.options.value * this.options.width - (this.options.barWidth / 2);
    }

    render() {
        return [
            <UI.ProgressBar ref="progressBar" active="true" value={this.options.value} disableTransition={true}
                            style={{
                                height: "5px",
                                width: this.options.width + "px",
                                position: "relative",
                                top: "15px",
                            }}
            />,
            <div ref="slider" style={{
                                width: this.options.barWidth + "px",
                                height: "20px",
                                "background-color": "black",
                                position: "absolute",
                                left: this.getSliderLeft() + "px",
                                top: "7.5px"
                            }}>
            </div>
        ];
    }

    setValue(value) {
        value = Math.max(value, 0);
        value = Math.min(value, 1);

        this.options.value = value;
        this.progressBar.set(this.options.value);
        this.slider.setStyle("left", this.getSliderLeft() + "px");

        if (this.onSetValue) {
            this.onSetValue(this.options.value);
        }
    }

    getValue() {
        return this.options.value;
    }

    onMount() {
        this.addDragListener({
            onStart: (event) => {
                this.setValue((Device.getEventX(event) - getOffset(this.progressBar).left) / this.options.width);
            },
            onDrag: (deltaX, deltaY) => {
                this.setValue(this.options.value + deltaX / this.options.width);
            },
        });
    }
};

class Link extends UI.Primitive("a") {
    extraNodeAttributes(attr) {
        attr.setStyle("cursor", "pointer");
    }

    getDefaultOptions() {
        return {
            newTab: true,
        }
    }

    setOptions(options) {
        super.setOptions(options);

        if (this.options.newTab) {
            this.options.target = "_blank";
        }

        return options;
    }

    render() {
        return [this.options.value];
    }
}

class Image extends UI.Primitive("img") {
}

// Beware coder: If you ever use this class, you should have a well documented reason
class RawHTML extends UI.Element {
    getInnerHTML() {
        return this.options.innerHTML || this.options.__innerHTML;
    }

    redraw() {
        this.node.innerHTML = this.getInnerHTML();
        this.applyNodeAttributes();
        this.applyRef();
    }
}

class TemporaryMessageArea extends UI.Primitive("span") {
    getDefaultOptions() {
        return {
            margin: 10
        };
    }

    render() {
        return [<UI.TextElement ref="textElement" value={this.options.value || ""}/>];
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        // TODO: nope, not like this
        attr.setStyle("marginLeft", this.options.margin + "px");
        attr.setStyle("marginRight", this.options.margin + "px");
        return attr;
    }

    setValue(value) {
        this.options.value = value;
        this.textElement.setValue(value);
    }

    setColor(color) {
        this.setStyle("color", color);
    }

    showMessage(message, color="black", displayDuration=2000) {
        this.setColor(color);
        this.clear();
        this.setValue(message);
        if (displayDuration) {
            this.clearValueTimeout = setTimeout(() => this.clear(), displayDuration);
        }
    }

    clear() {
        this.setValue("");
        if (this.clearValueTimeout) {
            clearTimeout(this.clearValueTimeout);
            this.clearValueTimeout = null;
        }
    }
}

// Just putting in a lot of methods, to try to think of an interface
class ScrollableMixin extends UI.Element {
    getDesiredExcessHeightTop() {
        return 600;
    }

    getDesiredExcessHeightBottom() {
        return 600;
    }

    getHeightScrollPercent() {
        let scrollHeight = this.node.scrollHeight;
        let height = this.node.clientHeight;
        if (scrollHeight === height) {
            return 0;
        }
        return this.node.scrollTop / (scrollHeight - height);
    }

    getExcessTop() {
        return this.node.scrollTop;
    }

    getExcessBottom() {
        let scrollHeight = this.node.scrollHeight;
        let height = this.node.clientHeight;
        return scrollHeight - height - this.node.scrollTop;
    }

    haveExcessTop() {
        return this.getExcessTop() > this.getDesiredExcessHeightTop();
    }

    haveExcessBottom() {
        return this.getExcessBottom() > this.getDesiredExcessHeightBottom();
    }

    popChildTop() {
        this.eraseChildAtIndex(0);
    }

    popChildBottom() {
        this.eraseChildAtIndex(this.children.length - 1);
    }

    removeExcessTop() {
        while (this.haveExcessTop()) {
            this.popChildTop();
        }
    }

    removeExcessBottom() {
        while (this.haveExcessBottom()) {
            this.popChildBottom();
        }
    }

    pushChildTop(element, removeExcessBottom=true) {
        if (removeExcessBottom) {
            this.removeExcessBottom();
        }
        this.insertChild(element, 0);
    }

    pushChildBottom(element, removeExcessTop=true) {
        if (removeExcessTop) {
            this.removeExcessTop();
        }
        this.appendChild(element);
        this.appendChild(element);
    }

    saveScrollPosition() {
        // If at top or bottom, save that
        // If anywhere in the middle, save the offset of the first child with a positive offset, and keep that constant
        this.options.scrollTop = this.node.scrollTop;
        let maxScrollTop = this.node.scrollHeight - this.node.clientHeight;
        this.options.scrollInfo = {
            scrollAtTop: (this.options.scrollTop === 0),
            scrollAtBottom: (this.options.scrollTop === maxScrollTop),
            // visibleChildrenOffsets: {}
        };
    }

    applyScrollPosition() {
        this.node.scrollTop = this.options.scrollTop || this.node.scrollTop;
    }

    scrollToHeight(height) {
        this.node.scrollTop = height;
    }

    scrollToTop() {
        this.scrollToHeight(0);
    }

    scrollToBottom() {
        this.scrollToHeight(this.node.scrollHeight);
    }
};

//TODO: this class would need some binary searches
class InfiniteScrollable extends ScrollableMixin {
    setOptions(options) {
        options = Object.assign({
            entries: [],
            entryComparator: (a, b) => {
                return a.id - b.id;
            },
            firstRenderedEntry: 0,
            lastRenderedEntry: -1,
        }, options);
        super.setOptions(options);
        // TODO: TEMP for testing
        this.options.children = [];
        if (this.options.staticTop) {
            this.options.children.push(this.options.staticTop);
        }
        for (let entry of this.options.entries) {
            this.options.children.push(this.renderEntry(entry));
        }
    }

    getFirstVisibleIndex() {
    }

    getLastVisibleIndex() {
    }

    renderEntry(entry) {
        if (this.options.entryRenderer) {
            return this.options.entryRenderer(entry);
        } else {
            console.error("You need to pass option entryRenderer or overwrite the renderEntry method");
        }
    }

    pushEntry(entry) {
        this.insertEntry(entry, this.options.entries.length);
    }

    insertEntry(entry, index) {
        let entries = this.options.entries;
        if (index == null) {
            index = 0;
            while (index < entries.length &&
                this.options.entryComparator(entries[index], entry) <= 0) {
                index++;
            }
        }
        entries.splice(index, 0, entry);

        // Adjust to the children
        if (this.options.staticTop) {
            index += 1;
        }

        // TODO: only if in the rendered range, insert in options.children;
        let uiElement = this.renderEntry(entry);
        this.insertChild(uiElement, index);
    }
}

class TimePassedSpan extends UI.Primitive("span") {
    render() {
        return this.getTimeDeltaDisplay(this.options.timeStamp);
    }

    getDefaultOptions() {
        return {
            style: {
                color: "#aaa"
            }
        }
    }

    getTimeDeltaDisplay(timeStamp) {
        let timeNow = Date.now();
        let timeDelta = parseInt((timeNow - timeStamp * 1000) / 1000);
        let timeUnitsInSeconds = [31556926, 2629743, 604800, 86400, 3600, 60];
        let timeUnits = ["year", "month", "week", "day", "hour", "minute"];
        if (timeDelta < 0) {
            timeDelta = 0;
        }
        for (let i = 0; i < timeUnits.length; i += 1) {
            let value = parseInt(timeDelta / timeUnitsInSeconds[i]);
            if (timeUnitsInSeconds[i] <= timeDelta) {
                return value + " " + timeUnits[i] + (value > 1 ? "s" : "") + " ago";
            }
        }
        return "Few seconds ago";
    }

    static addIntervalListener(callback) {
        if (!this.updateFunction) {
            this.TIME_DISPATCHER = new Dispatchable();
            this.updateFunction = setInterval(() => {
                this.TIME_DISPATCHER.dispatch("updateTimeValue");
            }, 5000);
        }
        return this.TIME_DISPATCHER.addListener("updateTimeValue", callback);
    }

    onMount() {
        this._updateListener = this.constructor.addIntervalListener(() => {
            this.redraw();
        })
    }

    onUnmount() {
        this._updateListener && this._updateListener.remove();
    }
};

// TODO: deprecate this, to use lazyInit decorators
export function ConstructorInitMixin(BaseClass) {
    class ConstructorInitMixin extends BaseClass {
        static ensureInit() {
            if (!this._haveInit) {
                this._haveInit = true;
                if (typeof this.init === "function") {
                    this.init();
                }
            }
        }

        createNode() {
            this.constructor.ensureInit();
            return super.createNode();
        }
    };

    return ConstructorInitMixin;
};


export {Link, Panel, Image, RawHTML, TimePassedSpan, TemporaryMessageArea, SlideBar, ScrollableMixin, InfiniteScrollable};