import {StyleSheet, styleRule} from "../Style";

class InputStyle extends StyleSheet {
    @styleRule
    inputElement = {
        fontSize: 14,  // TODO: theme input size
        backgroundColor: this.themeProps.INPUT_BACKGROUND_COLOR || "#FFF",
        transition: "border-color ease-in-out .15s, box-shadow ease-in-out .15s",
        padding: "0.4em 0.54em",
        border: "1px solid " + (this.themeProps.INPUT_BORDER_COLOR || "#CCC"),
        borderRadius: this.themeProps.INPUT_BORDER_RADIUS || 4,
        ":focus": {
            outline: "0",
            borderColor: "#66afe9",
        },
    };

    @styleRule
    checkboxInput = {
        display: "inline-block",
    };

    @styleRule
    select = {
    };
}

export {InputStyle};
