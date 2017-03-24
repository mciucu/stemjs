import {StyleSet, styleRule} from "../Style";

class CollapsibleStyle extends StyleSet {
    transitionDuration = 0.4;

    @styleRule
    collapsing = {
        marginTop: "0",
        transitionTimingFunction: "ease",
        transitionDuration: `${this.transitionDuration}s`,
        transitionProperty: "margin-top",
        transitionDelay: "-0.15s",
    };

    @styleRule
    collapsed = {
        marginTop: "-100% !important",
        transitionDelay: "0s !important",
    };
}


class CollapsiblePanelStyle extends StyleSet {
    @styleRule
    heading = {
        padding: "10px 15px",
        borderBottom: "1px solid transparent",
        borderTopLeftRadius: "3px",
        borderTopRightRadius: "3px",
        backgroundColor: "#f5f5f5",
    };

    @styleRule
    button = {
        marginTop: "0",
        marginBottom: "0",
        fontSize: "16px",
        color: "inherit",
        cursor: "pointer",
        ":hover": {
            color: "inherit",
        },
        ":before": {
            fontFamily: "'Glyphicons Halflings'",
            content: "\"\\e114\"",
            color: "grey",
            float: "left",
        }
    };

    @styleRule
    collapsedButton = {
        ":before": {
            content: "\"\\e080\" !important",
        },
    };
}

export {CollapsibleStyle, CollapsiblePanelStyle};
