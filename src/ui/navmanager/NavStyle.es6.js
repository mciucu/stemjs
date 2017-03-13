import {StyleSet} from "Style";
import {styleRule, keyframesRule} from "decorators/Style";
import {CSAStyle} from "CSAStyle";

let padding = "10px";
let navbarHeight = "50px";
let sidebarHeight = "30px";
let sidebarWidthLeft = "250px";
let sidebarWidth = "330px";
let sidebarHideWidth = "335px"; // boxShadowWidth + sidebarWidth
let sidebarTransition = ".3s";
let boxShadowWidth = "5px";
let boxShadowColor = "#353535";

class NavbarStyle extends StyleSet {
    fontFamily = "lato, open sans";

    icon = {
        lineHeight: navbarHeight,
        height: navbarHeight,
        width: "50px",
        display: "inline-block",
        cursor: "pointer",
        textAlign: "center",
    };

    leftSideIcon = Object.assign({}, this.icon, {
        fontSize: "120%",
        float: "left",
    });

    rightSideIcon = Object.assign({}, this.icon, {
        fontSize: "120%",
        float: "right",
    });

    envelope = Object.assign({}, this.icon, {
        fontSize: "100%",
        float: "right",
    });

    @styleRule
    wrappedIcon = [
        this.icon, {
            fontSize: "100%",
            float: "left",
            ":hover": {
                backgroundColor: "#323539",
            },
        }
    ];

    @styleRule
    navCollapseElement = {
        backgroundColor: "#1c1f24",
        marginLeft: "-" + padding,
        textAlign: "initial",
        minWidth: "100%",
        paddingRight: "20px",
        fontFamily: this.fontFamily,
        // lineHeight: "20px",
        maxHeight: sidebarHeight,
        height: sidebarHeight,
        lineHeight: sidebarHeight,
        ":hover": {
            backgroundColor: "#323539",
        },
    };

    @styleRule
    navElementHorizontal = {
        height: navbarHeight,
        // minHeight: navbarHeight,
        // textAlign: "center",
        color: "#eee",
        listStyleType: "none",
        cursor: "pointer",
        padding: "0 10px",
        fontFamily: this.fontFamily,
        ":hover": {
            backgroundColor: "#323539",
        },
    };

    @styleRule
    navElementVerticalArrow = {
        width: "20px",
        textAlign: "center",
    };

    @styleRule
    navElementHorizontalArrow = {
        paddingLeft: "5px",
        fontFamily: this.fontFamily,
    };

    @styleRule
    navElementVertical = {
        cursor: "pointer",
        listStyleType: "none",
        minHeight: sidebarHeight,
        color: "#eee",
        backgroundColor: CSAStyle.color.BLUE,
        overflow: "hidden",
        position: "relative",
        fontFamily: this.fontFamily,
        ">*": {
            paddingLeft: "20px",
        },
    };

    @styleRule
    navElementValueVertical = {
        zIndex: "1",
        position: "relative",
        width: "100%",
        height: sidebarHeight,
        lineHeight: sidebarHeight,
        fontFamily: this.fontFamily,
        ":hover": {
            backgroundColor: CSAStyle.color.HOVER_BLUE,
        },
    };

    @styleRule
    navElementVerticalHover = {
        ":hover": {
            backgroundColor: CSAStyle.color.HOVER_BLUE,
        },
    };

    @styleRule
    navElementValueHorizontal = {
        width: "100%",
        // height: sidebarHeight,
        // lineHeight: sidebarHeight,
        fontFamily: this.fontFamily,
    };

    @styleRule
    navLinkElement = {
        display: "block",
        color: "#eee",
        textDecoration: "none",
        listStyleType: "none",
        fontFamily: this.fontFamily,
        ":hover": {
            backgroundColor: CSAStyle.color.HOVER_BLUE,
            color: "#eee",
            textDecoration: "none",
        },
        ":focus": {
            color: "#eee",
            textDecoration: "none",
        },
        ":active": {
            color: "#eee",
            textDecoration: "none",
        },
        ":visited": {
            color: "#eee",
            textDecoration: "none",
        },
    };

    navElementSubElementsHorizontal = {
        position: "absolute",
        paddingRight: padding,
        fontFamily: this.fontFamily,
    };

    navElementSubElementsVertical = {
        transitionDuration: ".2s",
        transitionProperty: "opacity",
        display: "none",
        opacity: "0",
        fontFamily: this.fontFamily,
    };

    @styleRule
    navElementSectionHorizontal = {
        display: "inline-block",
        paddingLeft: "0",
        height: navbarHeight,
        marginBottom: "0",
        fontFamily: this.fontFamily,
    };

    @styleRule
    navElementSectionVertical = {
        paddingLeft: "0",
        marginBottom: "0",
        width: "100%",
        fontFamily: this.fontFamily,
    };

    @styleRule
    sidePanelGroup = {
        paddingTop: navbarHeight,
        height: "inherit",
        width: sidebarWidth,
        position: "absolute",
        zIndex: "3",
        transition: ".2s",
        fontFamily: this.fontFamily,
    };

    @styleRule
    leftSidePanel = {
        top: "0",
        bottom: "0",
        height: "100%",
        backgroundColor: CSAStyle.color.BLUE,
        overflow: "hidden",
        overflowY: "scroll",
        width: sidebarWidthLeft,
        position: "fixed",
        zIndex: "3000",
        "-ms-overflow-style": "none",
        overflow: "-moz-scrollbars-none",
        "::-webkit-scrollbar": {
            display: "none"
        },
        boxShadow: "0px 0px 10px " + boxShadowColor,
        fontFamily: this.fontFamily,
    };

    @styleRule
    rightSidePanel = {
        top: "0",
        bottom: "0",
        backgroundColor: CSAStyle.color.BLUE,
        height: "100%",
        overflow: "hidden",
        width: sidebarWidth,
        position: "fixed",
        zIndex: "3000",
        boxShadow: "0px 0px 10px " + boxShadowColor,
        fontFamily: this.fontFamily,
    };

    @styleRule
    navManager = {
        height: navbarHeight,
        lineHeight: navbarHeight,
        width: "100%",
        backgroundColor: CSAStyle.color.BLACK,
        boxShadow: "0px 0px 10px #000",
        color: "#f2f2f2",
        zIndex: "9999",
        position: "fixed",
        fontFamily: this.fontFamily,
        // position: "absolute",
        // boxShadow: "0px 0px 1px 1px black",
    };

    hideNavElement = {
        display: "none",
        opacity: "0",
    };

    showNavElement = {
        display: "block",
        opacity: "1",
    };

    @styleRule
    hrStyle = {
        margin: "10px 5%",
        borderTop: "2px solid " + CSAStyle.color.HOVER_BLUE,
    };
}


class NavEffectsStyle extends StyleSet {
    @styleRule
    navVerticalLeftHide = {
        marginLeft: "-" + sidebarHideWidth,
        transition: sidebarTransition,
        display: "block",
        overflow: "hidden",
    };

    @styleRule
    navVerticalRightHide = {
        marginRight: "-" + sidebarHideWidth,
        transition: sidebarTransition,
        display: "block",
        overflow: "hidden",
    };

    @styleRule
    navVerticalLeftShow = {
        marginLeft: "0",
        transition: sidebarTransition,
        display: "block",
    };

    @styleRule
    navVerticalRightShow = {
        marginRight: "0",
        transition: sidebarTransition,
        display: "block",
    };
}


export {NavbarStyle, NavEffectsStyle};
