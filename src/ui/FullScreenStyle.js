import {StyleSheet, styleRule} from "./Style";

class FullScreenStyle extends StyleSheet {
    @styleRule
    fullScreen = {
        width: "100%",
        backgroundColor: "#FFFFFF",
        padding: "10px",
    };
}

export {FullScreenStyle};