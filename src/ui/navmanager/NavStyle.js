import {StyleSheet, styleRule} from "../Style";
import {darken, enhance} from "ui/Color";


class NavStyle extends StyleSheet {
    // Custom variables
    getColors() {
        const themeProperties = this.themeProperties;

        const navManagerColor = themeProperties.COLOR_PRIMARY;
        const navBarColor = themeProperties.NAV_MANAGER_COLOR_NAV_BAR || navManagerColor;
        const sidePanelColor = themeProperties.NAV_MANAGER_COLOR_SIDE_PANEL || enhance(navManagerColor, 0.05);

        this.colors = {
            boxShadowNavManager: themeProperties.NAV_MANAGER_BOX_SHADOW_NAVBAR,
            boxShadowSidePanel: themeProperties.NAV_MANAGER_BOX_SHADOW_SIDE_PANEL,
            sidepanelBackground: themeProperties.NAV_MANAGER_SIDE_PANEL_BACKGROUND_COLOR || sidePanelColor,
            sidepanelHover: themeProperties.NAV_MANAGER_SIDE_PANEL_HOVER_COLOR || enhance(sidePanelColor, 0.1),
            navbarBackground: themeProperties.NAV_MANAGER_NAV_BAR_BACKGROUND_COLOR || navBarColor,
            navbarHover: themeProperties.NAV_MANAGER_NAV_BAR_HOVER_COLOR || enhance(navBarColor, 0.1),
            hr: themeProperties.NAV_MANAGER_HR_COLOR || enhance(sidePanelColor, 0.15),
            text: themeProperties.NAV_MANAGER_TEXT_COLOR || enhance(navManagerColor, 1),
        };

        return this.colors;
    }

    dimensions = {
        collapseArrowWidth: "20px",
        navbarHeight: "50px",
        sidepanelElementHeight: "30px",
        sidepanelWidthLeft: "250px",
        sidepanelWidth: "330px",
        sidepanelHideWidth: "335px",
        sidepanelTransitionDuration: ".15s",
        boxShadowWidth: "5px",
        backgroundTransitionDuration: ".2s",
    };

    // Icons
    @styleRule
    icon = {
        color: this.getColors().text,
        lineHeight: this.dimensions.navbarHeight,
        height: this.dimensions.navbarHeight,
        width: this.dimensions.navbarHeight,
        display: "inline-block",
        cursor: "pointer",
        textAlign: "center",
        ":hover": {
            backgroundColor: this.getColors().navbarHover,
        }
    };

    @styleRule
    sideIcon = {
        fontSize: "120%",
    };

    @styleRule
    wrappedIcon = {
        fontSize: "100%",
        flex: "1",
    };

    // Nav manager elements
    navElement = {
        transition: `background-color ${this.dimensions.backgroundTransitionDuration}`,
    };

    @styleRule
    navLinkElement = {
        display: "block",
        color: this.getColors().text,
        textDecoration: "none",
        listStyleType: "none",
        ":hover": {
            backgroundColor: this.getColors().sidepanelHover,
            color: this.getColors().text,
            textDecoration: "none",
        },
        ":focus": {
            color: this.getColors().text,
            textDecoration: "none",
        },
        ":active": {
            color: this.getColors().text,
            textDecoration: "none",
        },
        ":visited": {
            color: this.getColors().text,
            textDecoration: "none",
        },
    };


    // Navbar
    @styleRule
    navManager = {
        display: "flex",
        height: this.dimensions.navbarHeight,
        lineHeight: this.dimensions.navbarHeight,
        width: "100%",
        backgroundColor: this.getColors().navbarBackground,
        boxShadow: this.getColors().boxShadowNavManager,
        zIndex: "9999",
        position: "fixed",
    };


    // Navbar elements
    @styleRule
    navElementHorizontal = {
        color: this.getColors().text,
        backgroundColor: this.getColors().navbarBackground,
        listStyleType: "none",
        cursor: "pointer",
        ">:nth-child(2)": {
            position: "absolute",
        }
    };

    @styleRule
    navElementHorizontalArrow = {
        paddingLeft: ".1em",
        verticalAlign: "middle",
    };

    @styleRule
    navElementValueHorizontal = [
        this.navElement, {
            padding: "0 0.7em",
            color: this.getColors().text,
            width: "100%",
            ":hover": {
                backgroundColor: this.getColors().navbarHover,
            },
        }
    ];

    @styleRule
    navSectionHorizontal = {
        display: "inline-block",
        paddingLeft: "0",
        height: this.dimensions.navbarHeight,
        marginBottom: "0",
    };


    // Sidepanel
    sidePanel = {
        top: "0",
        bottom: "0",
        height: "100%",
        backgroundColor: () => this.getColors().sidepanelBackground,
        overflow: "hidden",
        position: "fixed",
        zIndex: "3000",
        boxShadow: () => this.getColors().boxShadowSidePanel,
        width: () => this.dimensions.sidepanelWidth,
        transitionDuration: () => this.dimensions.sidepanelTransitionDuration,
    };

    @styleRule
    leftSidePanel = [
        this.sidePanel, {
            overflowY: "scroll",
            width: this.dimensions.sidepanelWidthLeft,
            "-ms-overflow-style": "none",
            overflow: "-moz-scrollbars-none",
            "::-webkit-scrollbar": {
                display: "none"
            }
        }
    ];

    @styleRule
    rightSidePanel = this.sidePanel;


    // Sidepanel elements
    @styleRule
    navElementVertical = {
        color: this.getColors().text,
        cursor: "pointer",
        listStyleType: "none",
        minHeight: this.dimensions.sidepanelElementHeight,
        overflow: "hidden",
        position: "relative",
        ">*": {
            paddingLeft: this.dimensions.collapseArrowWidth,
        },
    };

    @styleRule
    navElementVerticalArrow = {
        width: this.dimensions.collapseArrowWidth,
        textAlign: "center",
    };

    @styleRule
    navElementValueVertical = [
        this.navElement, {
            color: this.getColors().text,
            zIndex: "1",
            position: "relative",
            width: "100%",
            height: this.dimensions.sidepanelElementHeight,
            lineHeight: this.dimensions.sidepanelElementHeight,
            ":hover": {
                backgroundColor: this.getColors().sidepanelHover,
            },
        }
    ];

    @styleRule
    navSectionVertical = {
        paddingLeft: "0",
        marginBottom: "0",
        width: "100%",
    };

    @styleRule
    navCollapseElement = {
        color: this.getColors().text,
        textAlign: "initial",
        lineHeight: this.dimensions.sidepanelElementHeight,
    };

    @styleRule
    sidePanelGroup = {
        paddingTop: this.dimensions.navbarHeight,
        height: "inherit",
        width: this.dimensions.sidepanelWidth,
        position: "absolute",
        zIndex: "3",
    };

    @styleRule
    hrStyle = {
        margin: "10px 5%",
        borderTop: () => "2px solid " + this.getColors().hr,
    };


    // Sidepanel transitions
    @styleRule
    navVerticalLeftHide = {
        marginLeft: "-" + this.dimensions.sidepanelHideWidth,
        overflow: "hidden",
    };

    @styleRule
    navVerticalRightHide = {
        marginRight: "-" + this.dimensions.sidepanelHideWidth,
        overflow: "hidden",
    };
}


export {NavStyle};
