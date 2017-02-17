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
        ">:nth-of-type(odd)": {
            backgroundColor: this.mainColor,
            cursor: "pointer",
            color: "white",
            fontSize: "130%",
            padding: "2px 10px",
            ":hover": {
                backgroundColor: this.hoverColor,
            }
        },
        ">:nth-of-type(even)": {
            flex: "1",
        },
    };
}

class AccordionBar extends UI.Element {
}


class Accordion extends UI.Element {
    static styleSet = new AccordionStyleSet();

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
            console.warn(child);
            let bar = <AccordionBar>{child.getTitle()}</AccordionBar>;
            this.dividers.push(bar);
            this.panels.push(child);
            children.push(bar);
            children.push(child);
        }
        return children;
    }

    onMount() {
        for (let i = 0; i < this.dividers.length; i += 1) {
            this.dividers[i].addClickListener(() => {
                this.panels[i].toggleClass("hidden");
            });
        }
    }
}

export {Accordion}
