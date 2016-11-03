// This whole file needs a refactoring
import {UI} from "UIBase";
import {Device} from "Device";

// options.orientation is the orientation of the divided elements
UI.DividerBar = class DividerBar extends UI.Element {
    constructor(options) {
        super(options);
        this.orientation = this.options.orientation || UI.Orientation.HORIZONTAL;
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        if (this.orientation === UI.Orientation.VERTICAL) {
            attr.addClass("sectionDividerHorizontal");
            attr.setStyle("width", "100%");
        } else if (this.orientation === UI.Orientation.HORIZONTAL) {
            attr.addClass("sectionDividerVertical");
            attr.setStyle("height", "100%");
            attr.setStyle("display", "inline-block");
        }
        return attr;
    }

    renderHTML() {
        if (this.orientation === UI.Orientation.VERTICAL) {
            return [
                <div style={{height: "3px", width: "100%"}}></div>,
                <div style={{height: "2px", width: "100%", background: "#DDD"}}></div>,
                <div style={{height: "3px", width: "100%"}}></div>,
            ];
        } else {
            return [
                <div style={{width: "3px", display:"inline-block"}}></div>,
                <div style={{width: "2px", height: "100%", background: "#DDD", display:"inline-block"}}></div>,
                <div style={{width: "3px", display:"inline-block"}}></div>,
            ];
        }
    }
};

/* Divider class should take in:
    - Vertical or horizontal separation
    - All the children it's dividing
    - An option on how to redivide the sizes of the children
 */
UI.SectionDivider = class SectionDivider extends UI.Element {
    constructor(options) {
        super(options);
        this.orientation = this.options.orientation || UI.Orientation.VERTICAL;
        this.childrenSize = 0;
        this.uncollapsedSizes = new WeakMap();
    }

    hideBars() {
        for (let i = 0; i < this.dividers; i += 1) {
            this["divider" + i].addClass("hidden");
        }
    }

    showBars() {
        for (let i = 0; i < this.dividers; i += 1) {
            this["divider" + i].removeClass("hidden");
        }
    }

    reverse() {
        this.options.children.reverse();
        for (let i = 0; i < this.children.length - 1; i += 1) {
            this.node.insertBefore(this.children[i].node, this.node.firstChild);
        }
        this.children.reverse();
    }

    getDimension(element) {
        if (this.orientation === UI.Orientation.HORIZONTAL) {
            return element.getWidth();
        } else {
            return element.getHeight();
        }
    }

    setDimension(element, size) {
        if (this.orientation === UI.Orientation.HORIZONTAL) {
            element.setWidth(size);
        } else {
            element.setHeight(size);
        }
    }

    getMinDimension(element) {
        if (this.orientation === UI.Orientation.HORIZONTAL && element.options.hasOwnProperty("minWidth")) {
            return element.options.minWidth;
        } else if (this.orientation === UI.Orientation.VERTICAL && element.options.hasOwnProperty("minHeight")) {
            return element.options.minHeight;
        } else {
            return 100.0 / (this.children.length - 1) / 4;
        }
    }

    collapseChild(index) {
        let parentSize = this.getDimension(this);
        let child = this.children[index * 2];
        let childSize = this.getDimension(child);
        this.uncollapsedSizes.set(child, childSize);
        let unCollapsedCount = 0;
        if (childSize === 0) {
            return;
        }
        for (let i = 0; i < this.children.length - 1; i += 2) {
            if (this.getDimension(this.children[i]) !== 0 && !this.children[i].hasOwnProperty("fixed")) {
                unCollapsedCount += 1;
            }
        }
        unCollapsedCount -= 1;
        this.setDimension(child, "0%");
        child.options.collapsed = true;
        child.hide();
        for (let i = 0; i < this.children.length - 1; i += 2) {
            if (this.getDimension(this.children[i]) !== 0 && !this.children[i].hasOwnProperty("fixed")) {
                this.setDimension(this.children[i], (this.getDimension(this.children[i]) + childSize / unCollapsedCount) * 100 / parentSize + "%");
                this.children[i].dispatch("resize");
            }
        }
    }

    expandChild(index) {
        let parentSize = this.getDimension(this);
        let child = this.children[index * 2];
        let childSize = this.getDimension(child);
        let unCollapsedCount = 0;
        let totalSize = parentSize;
        if (childSize !== 0) {
            return;
        }
        for (let i = 0; i < this.children.length - 1; i += 2) {
            if (this.getDimension(this.children[i]) !== 0 && !this.children[i].hasOwnProperty("fixed")) {
                unCollapsedCount += 1;
            }
        }
        unCollapsedCount += 1;
        childSize = this.uncollapsedSizes.get(child);
        child.options.collapsed = false;
        child.show();
        for (let i = 0; i < this.children.length - 1; i += 2) {
            if (this.getDimension(this.children[i]) !== 0 && !this.children[i].hasOwnProperty("fixed")) {
                this.setDimension(this.children[i], (this.getDimension(this.children[i]) - childSize / (unCollapsedCount - 1)) * 100 / parentSize + "%");
                this.children[i].dispatch("resize");
            }
        }
        this.setDimension(child, childSize * 100 / parentSize + "%");
    }

    toggleChild(index) {
        let size = this.getDimension(this.children[index * 2]);
        if (!size) {
            this.expandChild(index);
        } else {
            this.collapseChild(index);
        }
    }

    recalculateDimensions() {
        let parentSize = this.getDimension(this);
        let dividersTotalSize = 0;
        let sectionsTotalSize = 0;
        let ratio;
        for (let i = 0; i < this.children.length - 1; i += 2) {
            if (i + 1 < this.children.length - 1) {
                dividersTotalSize += this.getDimension(this.children[i + 1]);
            }
            sectionsTotalSize += this.getDimension(this.children[i]);
        }
        // The children occupied space must be slightly less than the available because of ceils and overflow
        sectionsTotalSize += 1;
        ratio = (parentSize - dividersTotalSize) / parentSize;
        for (let i = 0; i < this.children.length - 1; i += 2) {
            let newDimension = this.getDimension(this.children[i]) * 100 * ratio / sectionsTotalSize +  "%";
            this.setDimension(this.children[i], newDimension);
        }
    }

    onMount() {
        if (!this.options.noDividers) {
            for (let i = 0; i < this.dividers; i += 1) {
                let mousedownFunc = (event) => {
                    //TODO: right now section divider only works on UIElements
                    let p = 2 * i;
                    let previous = this.children[p];
                    while (p && (previous.options.fixed || previous.options.collapsed)) {
                        p -= 2;
                        previous = this.children[p];
                    }
                    let n = 2 * i + 2;
                    let next = this.children[n];
                    while (n + 2 < this.children.length - 1 && (next.options.fixed || next.options.collapsed)) {
                        n += 2;
                        next = this.children[n];
                    }
                    //TODO @kira This is not perfect yet.
                    previous.show();
                    next.show();

                    previous.dispatch("resize");
                    next.dispatch("resize");

                    let parentSize = this.getDimension(this);
                    let previousSize = this.getDimension(previous) * 100 / this.getDimension(this);
                    let nextSize = this.getDimension(next) * 100 / this.getDimension(this);
                    let minPreviousSize = this.getMinDimension(previous);
                    let minNextSize = this.getMinDimension(next);
                    let currentX = Device.getEventX(event);
                    let currentY = Device.getEventY(event);

                    //TODO: we should restore whatever the text selection was before
                    let textSelection = (value) => {
                        document.body.style["-webkit-user-select"] = value;
                        document.body.style["-moz-user-select"] = value;
                        document.body.style["-ms-user-select"] = value;
                        document.body.style["-o-user-select"] = value;
                        document.body.style["user-select"] = value;
                    };

                    let updateDimension = (event) => {
                        let delta;

                        if (this.orientation === UI.Orientation.HORIZONTAL) {
                            delta = Device.getEventX(event) - currentX;
                        } else if (this.orientation === UI.Orientation.VERTICAL) {
                            delta = Device.getEventY(event) - currentY;
                        }

                        if (nextSize - delta * 100 / parentSize < minNextSize || previousSize + delta * 100 / parentSize < minPreviousSize) {
                            return;
                        }

                        nextSize -= delta * 100 / parentSize;
                        previousSize += delta * 100 / parentSize;
                        this.setDimension(next, nextSize + "%");
                        this.setDimension(previous, previousSize + "%");

                        next.dispatch("resize", {width: next.getWidth(), height: next.getHeight()});
                        previous.dispatch("resize", {width: previous.getWidth(), height: previous.getWidth()});

                        currentX = Device.getEventX(event);
                        currentY = Device.getEventY(event);
                    };

                    textSelection("none");
                    let dragMousemove = (event) => {
                        updateDimension(event);
                    };
                    let dragMousemoveTouch = (event) => {
                        event.preventDefault();
                        dragMousemove(event);
                    };
                    let dragMouseup = () => {
                        textSelection("text");
                        document.body.removeEventListener("touchmove", dragMousemoveTouch);
                        document.body.removeEventListener("touchend", dragMouseup);
                        document.body.removeEventListener("mousemove", dragMousemove);
                        document.body.removeEventListener("mouseup", dragMouseup);
                    };
                    document.body.addEventListener("touchmove", dragMousemoveTouch);
                    document.body.addEventListener("touchend", dragMouseup);
                    document.body.addEventListener("mousemove", dragMousemove);
                    document.body.addEventListener("mouseup", dragMouseup);
                };
                this["divider" + i].addDOMListener("touchstart", mousedownFunc);
                this["divider" + i].addDOMListener("mousedown", mousedownFunc);
            }
        } else {
            for (let i = 0; i < this.dividers; i += 1) {
                this.setDimension(this["divider" + i], 0);
            }
        }
        setTimeout(() => {
            this.recalculateDimensions();
        });
        window.addEventListener("resize", () => {
            this.recalculateDimensions();
        });
    }

    renderHTML() {
        return [this.dividedChildren(),
            <UI.StyleElement>
                <UI.StyleInstance selector=".sectionDividerHorizontal:hover" attributes={{"cursor": "row-resize"}} />
                <UI.StyleInstance selector=".sectionDividerVertical:hover" attributes={{"cursor": "col-resize"}} />
            </UI.StyleElement>];
    }

    redraw() {
        super.redraw();
        // Safari bug fix
        if (this.orientation === UI.Orientation.HORIZONTAL) {
            for (let i = 0; i < this.children.length - 1; i += 2) {
                this.children[i].setStyle("vertical-align", "top");
            }
        }
    }

    dividedChildren() {
        let children = [];
        this.dividers = 0;
        for (let child of this.options.children) {
            if (children.length > 0) {
                children.push(<UI.DividerBar ref={"divider" + this.dividers} orientation={this.orientation}/>);
                this.dividers += 1;
            }
            children.push(child);
        }
        return children;
    }
};
