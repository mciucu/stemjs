// This whole file needs a refactoring, it's awfully written
import {UI} from "./UI";
import {StyleInstance, StyleElement} from "./StyleElement"; // TODO: fix this Denis, be my hero!
import {Device} from "../base/Device";
import {StyleSet} from "./Style";
import {styleRule} from "../decorators/Style";

class SectionDividerStyleSet extends StyleSet {
    barThickness = 2;
    barPadding = 3;

    @styleRule
    horizontalDivider = {
        position: "absolute",
        height: "100%",
        cursor: "col-resize",
        paddingLeft: this.barThickness + "px !important",
        background: "#DDD",
        backgroundClip: "padding-box",
        borderLeft: `${this.barPadding}px solid transparent`,
        borderRight: `${this.barPadding}px solid transparent`,
        marginLeft: `${-this.barPadding}px`,
    };

    @styleRule
    verticalDivider = {
        position: "absolute",
        cursor: "row-resize",
        width: "100%",
        paddingTop: this.barThickness + "px !important",
        background: "#DDD",
        backgroundClip: "padding-box",
        borderBottom: `${this.barPadding}px solid transparent`,
        borderTop: `${this.barPadding}px solid transparent`,
        marginTop: `${-this.barPadding}px`,
    };

    @styleRule
    horizontalSection = {
        position: "relative",
        whiteSpace: "nowrap",
        ">*": {
            whiteSpace: "initial",
            display: "inline-block",
            verticalAlign: "top",
            paddingLeft: "2px",
            paddingRight: "2px",
            boxSizing: "border-box",
        },
        ">:first-child": {
            paddingLeft: "0",
        },
        ">:last-child": {
            paddingRight: "0",
        },
        ">:nth-of-type(even)": {
            padding: "0",
        },
    };

    @styleRule
    verticalSection = {
        position: "relative",
        ">*": {
            paddingTop: "2px",
            paddingBottom: "2px",
            boxSizing: "border-box",
        },
        ">:first-child": {
            paddingTop: "0",
        },
        ">:last-child": {
            paddingBottom: "0",
        },
        ">:nth-of-type(even)": {
            padding: "0",
        },
    };
}

let sectionDividerStyle = new SectionDividerStyleSet();

// options.orientation is the orientation of the divided elements
class DividerBar extends UI.Element {
    constructor(options) {
        super(options);
        this.orientation = this.options.orientation || UI.Orientation.HORIZONTAL;
    }

    extraNodeAttributes(attr) {
        if (this.orientation === UI.Orientation.VERTICAL) {
            attr.addClass(sectionDividerStyle.verticalDivider);
        } else if (this.orientation === UI.Orientation.HORIZONTAL) {
            attr.addClass(sectionDividerStyle.horizontalDivider);
        }
    }
};

/* Divider class should take in:
    - Vertical or horizontal separation
    - All the children it's dividing
    - An option on how to redivide the sizes of the children
 */
class SectionDivider extends UI.Element {
    constructor(options) {
        super(options);
        this.uncollapsedSizes = new WeakMap();
    }

    extraNodeAttributes(attr) {
        if (this.getOrientation() === UI.Orientation.VERTICAL) {
            attr.addClass(sectionDividerStyle.verticalSection);
        } else {
            attr.addClass(sectionDividerStyle.horizontalSection);
        }
    }

    getOrientation() {
        return this.options.orientation || UI.Orientation.VERTICAL;
    }

    getDimension(element) {
        if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
            return element.getWidth();
        } else {
            return element.getHeight();
        }
    }

    setDimension(element, size) {
        if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
            element.setWidth(size);
        } else {
            element.setHeight(size);
        }
    }

    getMinDimension(element) {
        if (this.getOrientation() === UI.Orientation.HORIZONTAL && element.options.hasOwnProperty("minWidth")) {
            return element.options.minWidth;
        } else if (this.getOrientation() === UI.Orientation.VERTICAL && element.options.hasOwnProperty("minHeight")) {
            return element.options.minHeight;
        } else {
            return 100 / this.children.length / 4;
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
        for (let i = 0; i < this.children.length; i += 2) {
            if (this.getDimension(this.children[i]) !== 0 && !this.children[i].options.fixed) {
                unCollapsedCount += 1;
            }
        }
        unCollapsedCount -= 1;
        this.setDimension(child, "0%");
        child.hide();
        let correspondingDivider;
        for(let i = index * 2 - 1; i >= 0; i -= 2) {
            if (!this.children[i].hasClass("hidden")) {
                correspondingDivider = this.children[i];
                break;
            }
        }
        for (let i = index * 2 + 1; i < this.children.length; i += 2) {
            if (!this.children[i].hasClass("hidden")) {
                correspondingDivider = this.children[i];
                break;
            }
        }
        if (correspondingDivider) {
            correspondingDivider.hide();
        }
        for (let i = 0; i < this.children.length; i += 2) {
            if (this.getDimension(this.children[i]) !== 0 && !this.children[i].options.fixed) {
                this.setDimension(this.children[i], (this.getDimension(this.children[i]) + childSize / unCollapsedCount) * 100
                                                     / parentSize - 0.5 / this.children.length + "%");
            }
        }
        this.recalculateDimensions();
    }

    expandChild(index) {
        let parentSize = this.getDimension(this);
        let child = this.children[index * 2];
        let childSize = this.getDimension(child);
        let unCollapsedCount = 0;
        if (childSize !== 0) {
            return;
        }
        for (let i = 0; i < this.children.length; i += 2) {
            if (this.getDimension(this.children[i]) !== 0 && !this.children[i].options.fixed) {
                unCollapsedCount += 1;
            }
        }
        unCollapsedCount += 1;
        childSize = this.uncollapsedSizes.get(child);
        child.show();
        let divider;
        let neighborChild;
        for(let i = index * 2 - 1; i >= 0; i -= 1) {
            if (i % 2) {
                if (this.children[i].hasClass("hidden")) {
                    divider = this.children[i];
                } else if (!this.children[i].hasClass("hidden")) {
                    break;
                }
            } else {
                if (divider && !this.children[i].hasClass("hidden")) {
                    neighborChild = this.children[i];
                    break;
                }
            }
        }
        if (divider && neighborChild) {
            divider.show();
        }
        divider = neighborChild = null;
        for (let i = index * 2 + 1; i < this.children.length; i += 1) {
            if (i % 2) {
                if (this.children[i].hasClass("hidden")) {
                    divider = this.children[i];
                } else if (!this.children[i].hasClass("hidden")) {
                    break;
                }
            } else {
                if (divider && !this.children[i].hasClass("hidden")) {
                    neighborChild = this.children[i];
                    break;
                }
            }
        }
        if (divider && neighborChild) {
            divider.show();
        }
        for (let i = 0; i < this.children.length; i += 2) {
            if (this.getDimension(this.children[i]) !== 0 && !this.children[i].options.fixed) {
                this.setDimension(this.children[i], (this.getDimension(this.children[i]) - childSize / (unCollapsedCount - 1)) * 100
                                                     / parentSize - 0.5 / this.children.length + "%");
            }
        }
        this.setDimension(child, childSize * 100 / parentSize + "%");
        this.recalculateDimensions();
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
        let fixedTotalSize = 0;
        let unfixedTotalSize = 0;
        for (let i = 0; i < this.children.length; i += 2) {
            if (this.children[i].options.fixed) {
                fixedTotalSize += this.getDimension(this.children[i]);
            } else {
                unfixedTotalSize += this.getDimension(this.children[i]);
            }
        }
        let ratio = (parentSize - fixedTotalSize) / parentSize;
        for (let i = 0; i < this.children.length; i += 2) {
            if (!this.children[i].options.fixed && !this.children[i].hasClass("hidden")) {
                let newDimension = this.getDimension(this.children[i]) * 100 * ratio / unfixedTotalSize -
                    0.5 / this.children.length + "%";
                this .setDimension(this.children[i], newDimension);
            }
        }
    }

    onMount() {
        for (let i = 0; i < this.dividers; i += 1) {
            let mousedownFunc = (event) => {
                //TODO: right now section divider only works on UIElements
                let p = 2 * i;
                let previous = this.children[p];
                while (p && (previous.options.fixed || previous.hasClass("hidden"))) {
                    p -= 2;
                    previous = this.children[p];
                }
                let n = 2 * i + 2;
                let next = this.children[n];
                while (n + 2 < this.children.length && (next.options.fixed || next.hasClass("hidden"))) {
                    n += 2;
                    next = this.children[n];
                }

                previous.dispatch("resize");
                next.dispatch("resize");

                let parentSize = this.getDimension(this);
                let previousSize = this.getDimension(previous) * 100 / this.getDimension(this);
                let nextSize = this.getDimension(next) * 100 / this.getDimension(this);
                let minPreviousSize = this.getMinDimension(previous);
                let minNextSize = this.getMinDimension(next);
                let currentX = Device.getEventX(event);
                let currentY = Device.getEventY(event);
                let unfixedSize = parentSize;
                for (let j = 0; j < this.children.length; j += 1) {
                    if (this.children[j].options.fixed) {
                        unfixedSize -= this.getDimension(this.children[j]);
                    }
                }

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

                    if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
                        delta = Device.getEventX(event) - currentX;
                    } else if (this.getOrientation() === UI.Orientation.VERTICAL) {
                        delta = Device.getEventY(event) - currentY;
                    }

                    if (nextSize - delta * 100 / unfixedSize < minNextSize ||
                        previousSize + delta * 100 / unfixedSize < minPreviousSize) {
                        return;
                    }

                    nextSize -= delta * 100 / unfixedSize;
                    previousSize += delta * 100 / unfixedSize;
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
            this["divider" + i].addNodeListener("touchstart", mousedownFunc);
            this["divider" + i].addNodeListener("mousedown", mousedownFunc);
        }
        setTimeout(() => this.recalculateDimensions());
    }

    render() {
        let children = [];
        this.dividers = 0;
        let leftChildVisible = false;
        for (let child of this.getGivenChildren()) {
            if (children.length > 0) {
                let hiddenClass;
                if (leftChildVisible) {
                    if (!child.hasClass("hidden")) {
                        hiddenClass = "";
                    } else {
                        hiddenClass = "hidden";
                    }
                } else {
                    if (!child.hasClass("hidden")) {
                        leftChildVisible = true;
                    }
                    hiddenClass = "hidden";
                }
                children.push(<DividerBar className={hiddenClass} ref={"divider" + this.dividers} orientation={this.getOrientation()}/>);
                this.dividers += 1;
            }
            children.push(child);
            if (!child.hasClass("hidden")) {
                leftChildVisible = true;
            }
        }
        return children;
    }
}

export {SectionDivider}
