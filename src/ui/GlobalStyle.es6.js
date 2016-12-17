import {UI} from "UI";
import {StyleSet} from "Style";

var GlobalStyle = {};

class BaseStyleClass {
}

class ButtonStyle extends BaseStyleClass {
    constructor() {
        super();
        let styles = this.css = new StyleSet({
            name: this.constructor.name,
            updateOnResize: true,
        });

        styles.size = {};
        styles.size[UI.Size.EXTRA_SMALL] = styles.css({
            padding: "1px 5px",
            "font-size": "12px",
            "line-height": "1.5",
            "border-radius": "3px",
        });
        styles.size[UI.Size.SMALL] = styles.css({
            padding: "5px 10px",
            "font-size": "12px",
            "line-height": "1.5",
            "border-radius": "3px",
        });
        styles.size[UI.Size.LARGE] = styles.css({
            padding: "10px 16px",
            "font-size": "18px",
            "line-height": 4/3 + "",
            "border-radius": "6px",
        });
    }

    Size(size) {
        return this.css.size[size];
    }
}
GlobalStyle.Button = new ButtonStyle();

export {GlobalStyle};
