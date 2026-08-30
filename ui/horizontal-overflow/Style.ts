import {StyleSheet, styleRule, styleRuleInherit} from "../Style";
import {enhance} from "../Color";
import {Device} from "../../base/Device";


export class HorizontalOverflowStyle extends StyleSheet {
    baseColor = () =>  this.themeProps.COLOR_PRIMARY;
    arrowColor = () => enhance(this.baseColor(), .8);
    arrowBackground = () => this.baseColor();
    arrowHoverColor = () => enhance(this.baseColor(), 1);
    arrowHoverBackground = () => enhance(this.baseColor(), -.3);

    transitionTime = 0.15;

    arrow = {
        zIndex: "1",
        alignItems: "center",
        padding: ".3em",
        fontSize: "150% !important",
        height: "100%",
        position: "absolute",
        cursor: "pointer",
        top: 0,
        color: () => this.arrowColor(),
        backgroundColor: () => this.arrowBackground(),
        ":hover": {
            color: () => this.arrowHoverColor(),
            backgroundColor: () => this.arrowHoverBackground(),
        }
    };

    @styleRule
    leftArrow = {
        ...this.arrow,
        left: 0,
        borderRight: () => "2px solid " + this.arrowHoverBackground(),
    };

    @styleRule
    rightArrow = {
        ...this.arrow,
        right: 0,
        borderLeft: () => "2px solid " + this.arrowHoverBackground(),
    };

    @styleRule
    horizontalOverflow = {
        position: "relative",
        width: "100%",
        ">:first-child": {
            display: "flex",
        },
        ">:last-child": {
            display: "flex",
        },
    };

    @styleRule
    childrenContainer = {
        width: "100%",
        overflow: Device.isMobileDevice() ? "auto" : "hidden",
        display: "flex",
    };

    @styleRule
    swipeAnimation = {
        transition: "margin-left " + this.transitionTime + "s ease",
    };

    @styleRule
    hiddenArrow = {
        display: "none !important",
    };

    @styleRule
    pusherContainer = {
        overflow: Device.isMobileDevice() ? "auto" : "hidden",
        position: "relative",
        display: "flex",
        width: "100%",
    }
}


export class PagedHorizontalOverflowStyle extends HorizontalOverflowStyle {
    navigatorHeight = "35px";
    transitionTime = 0.3;

    navigatorColor = () => this.arrowColor();
    navigatorHoverBackground = () => this.arrowHoverBackground();
    navigatorTransition = () => "0s";

    // Every page fills the viewport, so a step is exactly one page
    @styleRuleInherit
    pusherContainer = {
        ">*": {
            width: "100%",
            flexShrink: 0,
        },
    };

    // Paging is driven by the bar, not by the edge arrows
    @styleRuleInherit
    leftArrow = {display: "none !important"};

    @styleRuleInherit
    rightArrow = {display: "none !important"};

    @styleRule
    navigator = {
        width: "100%",
        height: this.navigatorHeight,
        display: "flex",
    };

    @styleRule
    navigatorIcon = {
        color: () => this.navigatorColor(),
        fontSize: "180% !important",
        textAlign: "center",
        cursor: "pointer",
        flex: "1",
        fontWeight: "900 !important",
        lineHeight: this.navigatorHeight + " !important",
        transition: () => "background-color " + this.navigatorTransition(),
        ":hover": {
            backgroundColor: () => this.navigatorHoverBackground(),
        },
    };
}
