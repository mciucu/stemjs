import {StyleSet, styleRule} from "./Style";

class FullScreenStyle extends StyleSet {
    @styleRule
    fullScreen = {
        width: "100%",
        backgroundColor: "#FFFFFF",
        padding: "10px",
    };
}

export {FullScreenStyle};