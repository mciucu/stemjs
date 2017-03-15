import {StyleSet, styleRule, keyframesRule} from "../Style";

let padding = "10px";
let navbarHeight = "50px";
let sidebarHeight = "30px";
let sidebarWidthLeft = "250px";
let sidebarWidth = "330px";
let sidebarHideWidth = "335px"; // boxShadowWidth + sidebarWidth
let sidebarTransition = ".3s";
let boxShadowWidth = "5px";

const navbarColors = {
    boxShadow: "#353535",
    sidepanelBackground: "#202e3e",
    sidepanelHover: "#364251",
    navbarBackground: "#1c2937",
    navbarHover: "#323e4b",
    hover: "rgba(255, 255, 255, 0.1)",
    font: "#eee",
};

class NavbarStyle extends StyleSet {
    icon = {
        color: navbarColors.font,
        lineHeight: navbarHeight,
        height: navbarHeight,
        width: "50px",
        display: "inline-block",
        cursor: "pointer",
        textAlign: "center",
        ":hover": {
            backgroundColor: navbarColors.navbarHover,
        }
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
        }
    ];

    @styleRule
    navCollapseElement = {
        color: navbarColors.font,
        marginLeft: "-" + padding,
        textAlign: "initial",
        minWidth: "100%",
        paddingRight: "20px",
        maxHeight: sidebarHeight,
        height: sidebarHeight,
        lineHeight: sidebarHeight,
    };

    @styleRule
    navElementHorizontal = {
        color: navbarColors.font,
        backgroundColor: navbarColors.navbarBackground,
        height: navbarHeight,
        listStyleType: "none",
        cursor: "pointer",
        padding: "0 10px",
        ":hover": {
            backgroundColor: navbarColors.sidepanelHover,
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
    };

    @styleRule
    navElementVertical = {
        color: navbarColors.font,
        cursor: "pointer",
        listStyleType: "none",
        minHeight: sidebarHeight,
        overflow: "hidden",
        position: "relative",
        ">*": {
            paddingLeft: "20px",
        },
    };

    @styleRule
    navElementValueVertical = {
        color: navbarColors.font,
        zIndex: "1",
        position: "relative",
        width: "100%",
        height: sidebarHeight,
        lineHeight: sidebarHeight,
        ":hover": {
            backgroundColor: navbarColors.sidepanelHover,
        },
    };

    @styleRule
    navElementValueHorizontal = {
        width: "100%",
    };

    @styleRule
    navLinkElement = {
        display: "block",
        color: navbarColors.font,
        textDecoration: "none",
        listStyleType: "none",
        ":hover": {
            backgroundColor: navbarColors.sidePanelHover,
            color: navbarColors.font,
            textDecoration: "none",
        },
        ":focus": {
            color: navbarColors.font,
            textDecoration: "none",
        },
        ":active": {
            color: navbarColors.font,
            textDecoration: "none",
        },
        ":visited": {
            color: navbarColors.font,
            textDecoration: "none",
        },
    };

    navElementSubElementsHorizontal = {
        position: "absolute",
        paddingRight: padding,
    };

    navElementSubElementsVertical = {
        transitionDuration: ".2s",
        transitionProperty: "opacity",
    };

    @styleRule
    navElementSectionHorizontal = {
        display: "inline-block",
        paddingLeft: "0",
        height: navbarHeight,
        marginBottom: "0",
    };

    @styleRule
    navElementSectionVertical = {
        paddingLeft: "0",
        marginBottom: "0",
        width: "100%",
    };

    @styleRule
    sidePanelGroup = {
        paddingTop: navbarHeight,
        height: "inherit",
        width: sidebarWidth,
        position: "absolute",
        zIndex: "3",
        transition: ".2s",
    };

    sidePanel = {
        top: "0",
        bottom: "0",
        height: "100%",
        backgroundColor: navbarColors.sidepanelBackground,
        overflow: "hidden",
        position: "fixed",
        zIndex: "3000",
        boxShadow: "0px 0px 10px " + navbarColors.boxShadow,
        width: sidebarWidth,
    };

    @styleRule
    leftSidePanel = [
        this.sidePanel, {
            overflowY: "scroll",
            width: sidebarWidthLeft,
            "-ms-overflow-style": "none",
            overflow: "-moz-scrollbars-none",
            "::-webkit-scrollbar": {
                display: "none"
            }
        }
    ];

    @styleRule
    rightSidePanel = this.sidePanel;

    @styleRule
    navManager = {
        height: navbarHeight,
        lineHeight: navbarHeight,
        width: "100%",
        backgroundColor: navbarColors.navbarBackground,
        boxShadow: "0px 0px 10px #000",
        zIndex: "9999",
        position: "fixed",
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
        borderTop: "2px solid " + navbarColors.sidepanelHover,
    };
}


class NavEffectsStyle extends StyleSet {
    baseEffect = {
        display: "block",
        transition: sidebarTransition,
    };

    @styleRule
    navVerticalLeftHide = [
        this.baseEffect, {
            marginLeft: "-" + sidebarHideWidth,
            overflow: "hidden",
        }
    ];

    @styleRule
    navVerticalRightHide = [
        this.baseEffect, {
            marginRight: "-" + sidebarHideWidth,
            overflow: "hidden",
        }
    ];

    @styleRule
    navVerticalLeftShow = [
        this.baseEffect, {
            marginLeft: "0",
        }
    ];

    @styleRule
    navVerticalRightShow = [
        this.baseEffect, {
            marginRight: "0",
        }
    ];
}


export {NavbarStyle, NavEffectsStyle, navbarColors};
