import {StyleSheet, styleRule, styleRuleInherit} from "../Style";
import {CardPanelStyle} from "../CardPanel";
import {enhance} from "../Color";

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
        borderWidth: 1,
        borderColor: "#ccc !important",
        borderRadius: this.themeProps.BUTTON_BORDER_RADIUS,
    };

    @styleRule
    heading = {
        padding: 10,
        cursor: "pointer",
        fontSize: 16,
        color: this.themeProps.CARD_HEADER_TEXT_COLOR,
        backgroundColor: this.themeProps.CARD_HEADER_BACKGROUND_COLOR,
        ":hover": {
            backgroundColor: enhance(this.themeProps.CARD_HEADER_BACKGROUND_COLOR, 0.1),
        }
    };

    @styleRule
    title = {
        padding: 4,
    }

    @styleRule
    content = {
        padding: 8,
    }

    @styleRule
    icon = {
        transition: "0.3s ease",
        display: "inline-block",
    };

    @styleRule
    iconCollapsed = {
        transform: "rotate(-90deg) !important",
    };
}

export {CollapsibleStyle, CollapsiblePanelStyle};
