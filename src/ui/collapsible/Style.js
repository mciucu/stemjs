import {StyleSheet, styleRule, styleRuleInherit} from "../Style";
import {CardPanelStyle} from "../CardPanel";

class CollapsibleStyle extends StyleSheet {
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


class CollapsiblePanelStyle extends CardPanelStyle {
    @styleRuleInherit
    panel = {
        boxShadow: null,
        borderWidth: "1px",
        borderColor: "#ccc !important",
        borderRadius: "3px",
    };

    @styleRule
    heading = {
        padding: "10px 15px",
        borderBottom: "1px solid transparent",
        borderTopLeftRadius: "3px",
        borderTopRightRadius: "3px",
        backgroundColor: "#fefefe",
        ":hover": {
            backgroundColor: "#f3f3f3",
        }
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
            transition: "transform .2s linear",
            fontFamily: "'FontAwesome'",
            content: "\"\\f107\"",
            color: "grey",
            display: "inline-block",
            lineHeight: "0.7em",
            width: "0.7em",
            fontSize: "150%",
            verticalAlign: "bottom",
            height: "0.7em",
            textAlign: "center",
            transform: "rotate(0deg)",
            marginRight: ".2em",
        }
    };

    @styleRule
    collapsedButton = {
        ":before": {
            transform: "rotate(-90deg) !important",
        },
    };
}

export {CollapsibleStyle, CollapsiblePanelStyle};
