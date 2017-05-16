import {StyleSet, styleRule} from "./Style";

class ScrollPanelStyle extends StyleSet {
    @styleRule
    panel = {
        height: "600px",
        width: "100%",
        overflow: "auto",
        position: "absolute",
    };

    @styleRule
    unloaded = {
        width: "100%",
    };
}

export {ScrollPanelStyle};
