import {StyleSheet, styleRule} from "./Style";

export class FullScreenStyle extends StyleSheet {
    @styleRule
    fullScreen = {
        width: "100%",
        height: "100%",
        backgroundColor: "#FFFFFF",
    };
}