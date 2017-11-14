import {enhance} from "Color";
import {StyleSheet} from "../Style";
import {styleRule, styleRuleInherit} from "../../decorators/Style";

class BaseTabAreaStyle extends StyleSheet {
    @styleRule
    tab = {
        userSelect: "none",
        display: "inline-block",
        position: "relative",
    };

    @styleRule
    activeTab = {};

    @styleRule
    nav = {
        listStyle: "none",
    };

    @styleRule
    switcher = {
        flex: "1",
        overflow: "auto",
    };

    @styleRule
    tabArea = {
        display: "flex",
        flexDirection: "column",
    }
}

class DefaultTabAreaStyle extends BaseTabAreaStyle {
    @styleRuleInherit
    tab = {
        marginBottom: "-1px",
        textDecoration: "none !important",
        marginRight: "2px",
        lineHeight: "1.42857143",
        border: "1px solid transparent",
        borderRadius: "4px 4px 0 0",
        padding: "8px",
        paddingLeft: "10px",
        paddingRight: "10px",
        ":hover": {
            cursor: "pointer",
            backgroundColor: "#eee",
            color: "#555",
            border: "1px solid #ddd",
            borderBottomColor: "transparent",
        },
    };

    @styleRuleInherit
    activeTab = {
        color: "#555 !important",
        cursor: "default !important",
        backgroundColor: "#fff !important",
        border: "1px solid #ddd !important",
        borderBottomColor: "transparent !important",
    };

    @styleRuleInherit
    nav = {
        borderBottom: "1px solid #ddd",
        paddingLeft: "0",
        marginBottom: "0",
    };
}

class MinimalistTabAreaStyle extends BaseTabAreaStyle {
    @styleRuleInherit
    tab = {
        textDecoration: "none !important",
        lineHeight: "1.42857143",
        paddingTop: "6px",
        paddingLeft: "8px",
        paddingRight: "8px",
        paddingBottom: "4px",
        color: "#666",
        borderBottom: "2px solid transparent",
        ":hover": {
            cursor: "pointer",
            color: "rgba(51,122,183,1)",
        },
    };

    @styleRuleInherit
    activeTab = {
        fontWeight: "bold",
        color: "rgba(51,122,183,1)",
        cursor: "default !important",
        borderBottom: "2px solid rgba(51,122,183,1) !important",
    };

    @styleRuleInherit
    nav = {
        position: "relative",
        borderBottom: "1px solid #aaa",
    };
}

class FlatTabAreaStyle extends BaseTabAreaStyle {
    defaultColor = enhance(this.themeProperties.COLOR_FOREGROUND_BODY, 0.4);
    hoverOrActiveColor = enhance(this.themeProperties.COLOR_FOREGROUND_BODY, 0.6);

    @styleRuleInherit
    tab = {
        height: this.themeProperties.FLAT_TAB_AREA_LINE_HEIGHT,
        lineHeight: this.themeProperties.FLAT_TAB_AREA_LINE_HEIGHT,

        textDecoration: "none !important",

        paddingLeft: this.themeProperties.FLAT_TAB_AREA_PADDING_SIDES,
        paddingRight: this.themeProperties.FLAT_TAB_AREA_PADDING_SIDES,

        letterSpacing: "0.3px",
        color: this.defaultColor + "!important",
        fontWeight: "bold",

        ":hover": {
            cursor: "pointer",
            color: this.hoverOrActiveColor + "!important",
        },
    };

    @styleRuleInherit
    activeTab = {
        color: this.hoverOrActiveColor + "!important",
        cursor: "default !important",
    };

    @styleRuleInherit
    nav = {
        position: "relative",
        height: 30,
        backgroundColor: this.themeProperties.COLOR_FOREGROUND_BODY,
    };

    @styleRule
    activeTabBorder = {
        height: 2,
        backgroundColor: this.themeProperties.COLOR_DANGER,
        position: "absolute",
        left: 0,
    }
}

export {BaseTabAreaStyle, DefaultTabAreaStyle, MinimalistTabAreaStyle, FlatTabAreaStyle};
