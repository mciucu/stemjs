// This whole file needs a refactoring, it's awfully written
import {UI, getComputedStyle} from "./UI";
import {StyleInstance, StyleElement} from "./StyleElement";
import {Device} from "../base/Device";
import {StyleSet} from "./Style";
import {styleRule} from "../decorators/Style";

class AccordionStyleSet extends StyleSet {
    mainColor = "black";
    hoverColor = "#333";

    @styleRule
    accordion = {
        backgroundColor: this.mainColor,
        display: "flex",
        flexDirection: "column",
        ">:nth-of-type(even)": {
            flexGrow: "1",
            flexShrink: "1",
            flexBasis: "auto",
            overflow: "auto",
        },
        ">:nth-of-type(odd)": {
            backgroundColor: this.mainColor,
            color: "white",
            fontSize: "130%",
            padding: "2px 10px",
            ":hover": {
                backgroundColor: this.hoverColor,
            }
        }
    };

    @styleRule
    noTextSelection = {
        "-webkit-user-select": "none",
        "-moz-user-select": "none",
        "-ms-user-select": "none",
        "-o-user-select": "none",
        userSelect: "none",
    };

    @styleRule
    grab = {
        cursor: "grab",
        cursor: "-moz-grab",
        cursor: "-webkit-grab",
    };

    @styleRule
    grabbing = {
        cursor: "grabbing",
        cursor: "-moz-grabbing",
        cursor: "-webkit-grabbing",
    };
}


class AccordionDivider extends UI.Element {
    static styleSet = AccordionStyleSet.getInstance();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().grab);
    }

    dividerMousedownFunction(event) {
        this.parent.dispatch("dividerMousedown", {divider: this, domEvent: event});
        this.addClass(this.getStyleSet().grabbing);
        document.body.classList.add(this.getStyleSet().noTextSelection);

        let dragMousemoveFunction = (event) => {
            event.preventDefault(); // for touch devices
            this.parent.dispatch("dividerMousemove", event);
        };

        window.addEventListener("touchmove", dragMousemoveFunction);
        window.addEventListener("mousemove", dragMousemoveFunction);

        let dragMouseupFunction = (event) => {
            this.parent.dispatch("dividerMouseup", event);
            this.removeClass(this.getStyleSet().grabbing);
            document.body.classList.remove(this.getStyleSet().noTextSelection);
            window.removeEventListener("touchmove", dragMousemoveFunction);
            window.removeEventListener("touchend", dragMouseupFunction);
            window.removeEventListener("mousemove", dragMousemoveFunction);
            window.removeEventListener("mouseup", dragMouseupFunction);
        };
        window.addEventListener("touchend", dragMouseupFunction);
        window.addEventListener("mouseup", dragMouseupFunction);
    }

    onMount() {
        this.addNodeListener("touchstart", (event) => this.dividerMousedownFunction(event));
        this.addNodeListener("mousedown", (event) => this.dividerMousedownFunction(event));
    }
}


class Accordion extends UI.Element {
    static styleSet = AccordionStyleSet.getInstance();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().accordion);
    }

    render() {
        let children = [];
        this.dividers = [];
        this.panels = [];
        for (let child of this.getGivenChildren()) {
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
            }
        });

        let mouseUpListener = this.addListener("dividerMouseup", () => {
            if (!dragTriggered) {
                this.toggleChild(this.panels[index]);
            }
            mouseMoveListener.remove();
            mouseUpListener.remove();
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

    onMount() {
        this.addListener("dividerMousedown", (dividerEvent) => this.dividerMousedownFunction(dividerEvent));
    }
}

export {Accordion}
