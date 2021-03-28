import {StyleSheet, styleRule} from "../Style";

class InputStyle extends StyleSheet {
    @styleRule
    inputElement = {
        backgroundColor: "#FFF",
        transition: "border-color ease-in-out .15s, box-shadow ease-in-out .15s",
        padding: "0.4em 0.54em",
        border: "1px solid " + (this.themeProps.INPUT_BORDER_COLOR || "#CCC"),
        borderRadius: this.themeProps.INPUT_BORDER_RADIUS || 4,
        fontSize: 14,  // TODO: theme input size
        ":focus": {
            outline: "0",
            borderColor: "#66afe9",
            boxShadow: "inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102,175,233,.6)",
        },
    };

    @styleRule
    checkboxInput = {
        display: "inline-block",
    };

    @styleRule
    select = {
        height: "2.12em",
    };
}

export {InputStyle};
