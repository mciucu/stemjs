import {StyleSheet, styleRule} from "../Style";

class FormStyle extends StyleSheet {
    @styleRule
    form = {
        margin: "0 auto",
    };

    @styleRule
    formGroup = {
        marginBottom: "10px",
    };

    @styleRule
    formField = {
        ">label": {
            width: "100%",
        },
        display: "block",
        padding: "6px 0px",
        lineHeight: "1.42857143",
        color: "#555",
        maxWidth: "600px",
        margin: "0 auto",
        "[disabled]": {
            opacity: "1",
            cursor: "not-allowed",
        },
        "[readonly]": {
            opacity: "1",
        },
    };

    @styleRule
    sameLine = {
        ">label>*:nth-child(1)": {
            display: "inline-block",
            textAlign: "right",
            paddingRight: "1em",
            width: "30%",
            verticalAlign: "middle",
        },
        ">label>*:nth-child(2)": {
            display: "inline-block",
            width: "70%",
            verticalAlign: "middle",
        },
    };

    separatedLineInputStyle = {
        marginRight: "0.5em",
        width: "100%",
        height: "2.4em",
    };

    @styleRule
    separatedLine = {
        padding: "6px 10px",
        ">label>*:nth-child(1)": {
            verticalAlign: "sub",
        },
        ">label>input": this.separatedLineInputStyle,
        ">label>select": this.separatedLineInputStyle,
        ">label>textarea": this.separatedLineInputStyle,
        ">label>input[type='checkbox']": {
            marginLeft: "10px",
            verticalAlign: "middle",
        }
    };

    @styleRule
    hasError = {
        color: "#a94442",
    };
}

export {FormStyle};
