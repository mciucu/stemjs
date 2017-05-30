import {StyleSet, styleRule} from "./Style";

class ScrollPanelStyle extends StyleSet {
    @styleRule
    panel = {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
    };

    @styleRule
    unloaded = {
        width: "100%",
        height: "2000px",
    };
}

export {ScrollPanelStyle};
