import {StyleSet, styleRule} from "./Style";

class ScrollPanelStyle extends StyleSet {
    @styleRule
    panel = {
        height: "600px",
        width: "800px",
        overflow: "auto",
    };

    @styleRule
    unloaded = {
        width: "100%",
    };

    @styleRule
    mock = {
        border: "1px solid black",
        width: "100%",
        display: "block",
    };
}

export {ScrollPanelStyle};
