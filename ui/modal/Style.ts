import {StyleSheet, styleRule} from "../Style";

class FloatingWindowStyle extends StyleSheet {
    @styleRule
    hiddenAnimated = {
        visibility: "hidden",
        opacity: "0",
        transition: "opacity 0.1s linear",
    };

    @styleRule
    visibleAnimated = {
        visibility: "visible",
        opacity: "1",
        transition: "opacity 0.1s linear",
    };
}


class ModalStyle extends FloatingWindowStyle {
    @styleRule
    container = {
        position: "fixed",
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        width: "100%",
        height: "100%",
        zIndex: "9999",
    };

    @styleRule
    background = {
        position: "fixed",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
    };

    @styleRule
    header = {
        padding: "15px",
        borderBottom: "1px solid #e5e5e5",
    };

    @styleRule
    body = {
        position: "relative",
        padding: "15px",
    };

    @styleRule
    footer = {
        padding: "15px",
        textAlign: "right",
        borderTop: "1px solid #e5e5e5",
    };
}

export {FloatingWindowStyle, ModalStyle};
