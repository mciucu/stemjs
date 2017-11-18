import {StyleSheet, styleRule} from "../Style";
import {enhance} from "../Color";
import {Device} from "../../base/Device";



export class HorizontalOverflowStyle extends StyleSheet {
    baseColor = () =>  this.themeProperties.COLOR_PRIMARY;
    arrowColor = () => enhance(this.baseColor(), .8);
    arrowBackground = () => this.baseColor();
    arrowHoverColor = () => enhance(this.baseColor(), 1);
    arrowHoverBackground = () => enhance(this.baseColor(), -.3);

    transitionTime = .15;

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
    leftArrow = Object.assign({}, this.arrow, {
        left: 0,
        borderRight: () => "2px solid " + this.arrowHoverBackground(),
    });

    @styleRule
    rightArrow = Object.assign({}, this.arrow, {
        right: 0,
        borderLeft: () => "2px solid " + this.arrowHoverBackground(),
    });

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
