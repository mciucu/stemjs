import {UI} from "UI";
import {StyleSet} from "Style";
import {lazyCSS} from "../decorators/Decorators";

var GlobalStyle = {};

class ButtonStyle extends StyleSet {
    constructor() {
        super({
            parent: document.body,
        });
    }

    @lazyCSS
    EXTRA_SMALL = {
        padding: "1px 5px",
        "font-size": "12px",
        "line-height": "1.5",
        "border-radius": "3px",
    };

    @lazyCSS
    SMALL = {
        padding: "5px 10px",
        "font-size": "12px",
        "line-height": "1.5",
        "border-radius": "3px",
    };

    @lazyCSS
    LARGE = {
        padding: "10px 16px",
        "font-size": "18px",
        "line-height": 4/3 + "",
        "border-radius": "6px",
    };

    Size(size) {
        for (let type of Object.keys(UI.Size)) {
            if (size == UI.Size[type]) {
                return this[type];
            }
        }
    }
}

// TODO: this should be lazy, at the first access
GlobalStyle.Button = new ButtonStyle();

export {GlobalStyle};
