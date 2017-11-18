// TODO: Too much "hidden"
import {Device} from "../../base/Device";
import {unwrapArray} from "../../base/Utils";
import {Divider} from "./Divider";
import {UI} from "../UIBase";
import {registerStyle} from "../UI";
import {SectionDividerStyle} from "./Style";
import {Orientation} from "../Constants";



// options.orientation is the orientation of the divided elements
@registerStyle(SectionDividerStyle)
export class DividerBar extends Divider {
    getDefaultOptions() {
        return Object.assign({}, super.getDefaultOptions(), {
            orientation: Orientation.HORIZONTAL,
        });
    }

    dragMousedown(event) {
        document.body.classList.add(this.styleSheet.noTextSelection);
    }

    dragMouseup(event) {
        document.body.classList.remove(this.styleSheet.noTextSelection);
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        if (this.options.orientation === Orientation.VERTICAL) {
            attr.addClass(this.styleSheet.verticalDivider);
        } else {
            attr.addClass(this.styleSheet.horizontalDivider);
        }
    }
}


/* SectionDivider class should take in:
    - Vertical or horizontal separation
    - All the children it's dividing
    - An option on how to redivide the sizes of the children
 */
@registerStyle(SectionDividerStyle)
export class SectionDivider extends UI.Element {
    getDefaultOptions() {
        return Object.assign({
            autoCollapse: false,
        }, super.getDefaultOptions())
    }

    constructor(options) {
        super(options);
        this.uncollapsedSizes = new WeakMap();
    }

    getDividerBarClass() {
        return DividerBar;
    }

    extraNodeAttributes(attr) {
        if (this.getOrientation() === Orientation.VERTICAL) {
            attr.addClass(this.styleSheet.verticalSection);
        } else {
            attr.addClass(this.styleSheet.horizontalSection);
        }
    }

    getOrientation() {
        return this.options.orientation || Orientation.VERTICAL;
    }

    getDimension(element) {
        if (this.getOrientation() === Orientation.HORIZONTAL) {
            return element.getWidth();
        } else {
            return element.getHeight();
        }
    }

    setDimension(element, size) {
        if (this.getOrientation() === Orientation.HORIZONTAL) {
            element.setWidth(size);
        } else {
            element.setHeight(size);
        }
    }

    getMinDimension(element) {
        if (this.getOrientation() === Orientation.HORIZONTAL && element.options.hasOwnProperty("minWidth")) {
            return element.options.minWidth;
        } else if (this.getOrientation() === Orientation.VERTICAL && element.options.hasOwnProperty("minHeight")) {
            return element.options.minHeight;
        } else {
            return this.getDimension(this) / this.panels.length / 4;
        }
    }

    getHiddenDivider(index) {
        let divider;
        for (let i = index; i < this.panels.length - 1; i += 1) {
            if (this.dividers[i].hasClass("hidden")) {
                divider = this.dividers[i];
            } else if (!this.dividers[i].hasClass("hidden")) {
                break;
            }
            if (divider && !this.panels[i + 1].hasClass("hidden")) {
                return divider;
            }
        }
        divider = null;
        for(let i = index - 1; i >= 0; i -= 1) {
            if (this.dividers[i].hasClass("hidden")) {
                divider = this.dividers[i];
            } else if (!this.dividers[i].hasClass("hidden")) {
                break;
            }
            if (divider && !this.panels[i].hasClass("hidden")) {
                return divider;
            }
        }
        return null;
    }

    getVisibleDivider(index) {
        for (let i = index; i < this.panels.length - 1; i += 1) {
            if (!this.dividers[i].hasClass("hidden")) {
                return this.dividers[i];
            }
        }
        for (let i = index - 1; i >= 0; i -= 1) {
            if (!this.dividers[i].hasClass("hidden")) {
                return this.dividers[i];
            }
        }
        return null;
    }

    collapseChild(index) {
        let parentSize = this.getDimension(this);
        let child = this.panels[index];
        let childSize = this.getDimension(child);
        this.uncollapsedSizes.set(child, childSize);

        let unCollapsedCount = -1;
        for (let panel of this.panels) {
            if (this.getDimension(panel) && !panel.options.fixed) {
                unCollapsedCount += 1;
            }
        }

        let divider = this.getVisibleDivider(index);
        if (divider) {
            divider.hide();
        }

        this.setDimension(child, "0");
        child.hide();

        for (let panel of this.panels) {
            if (this.getDimension(panel) !== 0 && !panel.options.fixed) {
                this.setDimension(panel, (this.getDimension(panel) + childSize / unCollapsedCount) * 100
                                  / parentSize - 0.5 / this.children.length + "%");
            }
        }

        this.recalculateDimensions();
    }

    expandChild(index) {
        let parentSize = this.getDimension(this);
        let child = this.panels[index];

        let unCollapsedCount = 1;
        for (let panel of this.panels) {
            if (this.getDimension(panel) && !panel.options.fixed) {
                unCollapsedCount += 1;
            }
        }

        let divider = this.getHiddenDivider(index);
        if (divider) {
            divider.show();
        }

        child.show();
        let childSize = this.uncollapsedSizes.get(child);

        for (let panel of this.panels) {
            if (this.getDimension(panel) && !panel.options.fixed) {
                this.setDimension(panel, (this.getDimension(panel) - childSize / (unCollapsedCount - 1)) * 100
                                  / parentSize - this.panels.length / 2 + "%");
            }
        }

        this.setDimension(child, childSize * 100 / parentSize + "%");
        this.recalculateDimensions();
    }

    isCollapsed(child) {
        return !this.getDimension(child);
    }

    toggleChild(index) {
        if (this.isCollapsed(this.panels[index])) {
            this.expandChild(index);
        } else {
            this.collapseChild(index);
        }
    }

    recalculateDimensions() {
        if (!this.isInDocument()) {
            return;
        }
        let parentSize = this.getDimension(this);
        let fixedTotalSize = 0;
        let unfixedTotalSize = 0;
        for (let panel of this.panels) {
            if (panel.options.fixed) {
                fixedTotalSize += this.getDimension(panel);
            } else {
                unfixedTotalSize += this.getDimension(panel);
            }
        }
        let ratio = (parentSize - fixedTotalSize) / parentSize;
        for (let panel of this.panels) {
            if (!panel.options.fixed && !panel.hasClass("hidden")) {
                this.setDimension(panel, this.getDimension(panel) * 100 * ratio / unfixedTotalSize + "%");
            }
        }
    }

    getPreviousUnfixedChild(index) {
        for (let i = index; i >= 0 ; i -= 1) {
            let panel = this.panels[i];
            if (!panel.hasClass("hidden") && !panel.options.fixed) {
                return panel;
            }
        }
        return null;
    }

    getNextUnfixedChild(index) {
        for (let i = index + 1; i < this.panels.length; i += 1) {
            let panel = this.panels[i];
            if (!panel.hasClass("hidden") && !panel.options.fixed) {
                return panel;
            }
        }
        return null;
    }

    dividerMouseDownFunction(dividerEvent) {
        let previousEvent = dividerEvent.domEvent;
        const index = this.dividers.indexOf(dividerEvent.divider);

        const previousPanel = this.getPreviousUnfixedChild(index);
        const nextPanel = this.getNextUnfixedChild(index);

        if (previousPanel && nextPanel) {
            const parentSize = this.getDimension(this);
            let panelsSize = parentSize;

            for (let panel of this.panels) {
                if (panel.options.fixed) {
                    panelsSize -= this.getDimension(panel);
                }
            }

            const deltaFunction = (this.getOrientation() === Orientation.HORIZONTAL ?
                                 (event) => Device.getEventX(event) :  (event) => Device.getEventY(event));

            const mouseMoveListener = this.addListener("dividerMousemove", (event) => {
                const delta = deltaFunction(event) - deltaFunction(previousEvent);

                const nextSize = this.getDimension(nextPanel) - delta;
                const previousSize = this.getDimension(previousPanel) + delta;

                if (this.options.autoCollapse) {
                    if ((delta > 0 && nextPanel.collapsed) || (delta < 0 && previousPanel.collapsed)) {
                        return;
                    }

                    if (delta < 0 && nextPanel.collapsed && this.options.autoCollapse) {
                        this.expandChild(index + 1);
                        return;
                    }

                    if (delta > 0 && previousPanel.collapsed) {
                        this.expandChild(index);
                        return;
                    }

                    if (nextSize < this.getMinDimension(nextPanel)) {
                        this.collapseChild(index + 1);
                        return;
                    }

                    if (previousSize < this.getMinDimension(previousPanel)) {
                        this.collapseChild(index);
                        return;
                    }
                } else {
                    if (nextSize < this.getMinDimension(nextPanel) || previousSize < this.getMinDimension(previousPanel)) {
                        return;
                    }
                }

                this.setDimension(nextPanel, nextSize * 100 / parentSize + "%");
                this.setDimension(previousPanel, previousSize * 100 / parentSize + "%");

                previousEvent = event;
            });

            const mouseUpListener = this.addListener("dividerMouseup", () => {
                if (this.clearListeners) {
                    this.clearListeners();
                }
            });

            this.clearListeners = () => {
                mouseMoveListener.remove();
                mouseUpListener.remove();
                this.clearListeners = null;
            }
        }
    }

    onMount() {
        this.addListener("dividerMousedown", (dividerEvent) => this.dividerMouseDownFunction(dividerEvent));
        setTimeout(() => {
            this.recalculateDimensions();
        });
    }

    getChildrenToRender() {
        const children = [];
        this.dividers = [];
        this.panels = [];
        let leftChildVisible = false;
        const DividerBarClass = this.getDividerBarClass();

        for (let child of unwrapArray(this.render())) {
            if (this.panels.length) {
                let hiddenClass = "hidden";
                if (leftChildVisible && !child.hasClass("hidden")) {
                    hiddenClass = "";
                }
                let divider = <DividerBarClass className={hiddenClass} orientation={this.getOrientation()} />;
                children.push(divider);
                this.dividers.push(divider);
            }
            leftChildVisible |= !child.hasClass("hidden");
            children.push(child);
            this.panels.push(child);
        }
        return children;
    }
}