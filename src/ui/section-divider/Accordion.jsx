import {UI} from "../UIBase";
import {registerStyle} from "../UI";
import {getComputedStyle} from "../Utils";
import {unwrapArray} from "../../base/Utils";
import {Device} from "../../base/Device";
import {AccordionStyle} from "./Style";
import {FACollapseIcon} from "../../ui/FontAwesome";
import {Divider} from "./Divider";

@registerStyle(AccordionStyle)
class AccordionDivider extends Divider {
    dragMousedown(event) {
        document.body.classList.add(this.styleSheet.noTextSelection);
        this.addClass(this.styleSheet.grabbing);
    }

    dragMouseup(event) {
        document.body.classList.remove(this.styleSheet.noTextSelection);
        this.removeClass(this.styleSheet.grabbing);
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.grab);
    }

    render() {
        return [<FACollapseIcon ref="collapseIcon" collapsed={false} className={this.styleSheet.collapseIcon}/>, this.options.children];
    }

    setCollapsed(value) {
        this.collapseIcon.setCollapsed(value);
    }

    onMount() {
        super.onMount();
        this.addListener("togglePanel", () => {this.collapseIcon.toggleCollapsed();});
    }
}


@registerStyle(AccordionStyle)
class Accordion extends UI.Element {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.accordion);
    }

    getChildrenToRender() {
        let children = [];
        this.dividers = [];
        this.panels = [];
        for (let child of unwrapArray(this.render())) {
            let title = (child.getTitle ? child.getTitle() : (child.options.title ? child.options.title : ""));
            let divider = <AccordionDivider>{title}</AccordionDivider>;
            this.dividers.push(divider);
            this.panels.push(child);
            children.push(divider);
            children.push(child);
        }
        return children;
    }

    getNextVisibleChild(index) {
        for (let i = index; i < this.panels.length; i += 1) {
            if (!this.panels[i].hasClass("hidden")) {
                return this.panels[i];
            }
        }
        return null;
    }

    getPreviousVisibleChild(index) {
        for (let i = index - 1; i >= 0; i -= 1) {
            if (!this.panels[i].hasClass("hidden")) {
                return this.panels[i];
            }
        }
        return null;
    }

    dividerMousedownFunction(dividerEvent) {
        let dragTriggered, panelsHeight, totalFlex;

        let previousEvent = dividerEvent.domEvent;
        let index = this.dividers.indexOf(dividerEvent.divider);

        let previousPanel = this.getPreviousVisibleChild(index);
        let nextPanel = this.getNextVisibleChild(index);

        panelsHeight = this.getHeight();
        for (let divider of this.dividers) {
            panelsHeight -= divider.getHeight();
        }
        totalFlex = 0;
        for (let panel of this.panels) {
            if (!panel.hasClass("hidden")) {
                totalFlex += parseFloat(getComputedStyle(panel.node, "flex"));
            }
        }

        let mouseMoveListener = this.addListener("dividerMousemove", (event) => {
            dragTriggered = true;
            if (index != -1 && nextPanel && previousPanel) {
                // Calculate the height to transfer from one panel to another
                let delta = (Device.getEventY(event) - Device.getEventY(previousEvent)) * totalFlex / panelsHeight;

                let nextSize = parseFloat(getComputedStyle(nextPanel.node, "flex"));
                let previousSize = parseFloat(getComputedStyle(previousPanel.node, "flex"));

                // Cap the delta value, to at most zero our panels
                delta = Math.sign(delta) * Math.min(Math.abs(delta), (delta > 0 ? nextSize : previousSize));

                nextPanel.setStyle("flex", nextSize - delta);
                previousPanel.setStyle("flex", previousSize + delta);

                previousEvent = event;

                this.dispatch("dragging");
            }
        });

        let mouseUpListener = this.addListener("dividerMouseup", () => {
            if (!dragTriggered) {
                dividerEvent.divider.dispatch("togglePanel");
                this.toggleChild(this.panels[index]);
            }
            mouseMoveListener.remove();
            mouseUpListener.remove();
            this.dispatch("childrenStatusChange");
        });
    }

    toggleChild(child) {
        let totalFlex = 0;
        for (let panel of this.panels) {
            if (!panel.hasClass("hidden")) {
                totalFlex += parseFloat(getComputedStyle(panel.node, "flex"));
            }
        }
        let sign = child.hasClass("hidden") ? 1 : -1;
        totalFlex += sign * parseFloat(getComputedStyle(child, "flex"));
        child.toggleClass("hidden");
        if (totalFlex < 1) {
            for (let panel of this.panels) {
                if (!panel.hasClass("hidden") && parseFloat(getComputedStyle(panel.node, "flex")) < 1) {
                    panel.setStyle("flex", 1);
                }
            }
        }
    }

    getChildrenStatus() {
        let childrenStatus = [];
        for (let panel of this.panels) {
            childrenStatus.push({
                flex: getComputedStyle(panel.node, "flex"),
                collapsed: panel.hasClass("hidden")
            });
        }
        return childrenStatus;
    }

    getDefaultChildrenStatus() {
        let childrenStatus = [];
        for (let panel of this.panels) {
            childrenStatus.push({
                flex: 1,
                collapsed: false
            })
        }
        return childrenStatus;
    }

    setChildrenStatus(childrenStatus) {
        for (let i = 0; i < childrenStatus.length; i += 1) {
            this.panels[i].setStyle("flex", childrenStatus[i].flex);
            let collapsed = childrenStatus[i].collapsed;
            if (collapsed) {
                this.panels[i].addClass("hidden");
            } else {
                this.panels[i].removeClass("hidden");
            }
            this.dividers[i].setCollapsed(collapsed);
        }
    }

    onMount() {
        this.addListener("dividerMousedown", (dividerEvent) => this.dividerMousedownFunction(dividerEvent));
    }
}

export {Accordion};
