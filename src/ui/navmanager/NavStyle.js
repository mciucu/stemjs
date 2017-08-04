import {StyleSet, styleRule} from "../Style";


class NavStyle extends StyleSet {
    // Custom variables
    colors = {
        boxShadow: "#353535",
        sidepanelBackground: "#202e3e",
        sidepanelHover: "#364251",
        navbarBackground: "#1c2937",
        navbarHover: "#323e4b",
        hr: "#364251",
        text: "#eee",
    };

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
    icon = {
        color: () => this.colors.text,
        lineHeight: () => this.dimensions.navbarHeight,
        height: () => this.dimensions.navbarHeight,
        width: () => this.dimensions.navbarHeight,
        display: "inline-block",
        cursor: "pointer",
        textAlign: "center",
        ":hover": {
            backgroundColor: () => this.colors.navbarHover,
        }
    };

    sideIcon = Object.assign({}, this.icon, {
        fontSize: "120%",
    });

    wrappedIcon = Object.assign({}, this.icon, {
        fontSize: "100%",
        flex: "1",
    });


    // Nav manager elements
    navElement = {
        transition: `background-color ${this.dimensions.backgroundTransitionDuration}`,
    };

    @styleRule
    navLinkElement = {
        display: "block",
        color: this.colors.text,
        textDecoration: "none",
        listStyleType: "none",
        ":hover": {
            backgroundColor: this.colors.sidepanelHover,
            color: this.colors.text,
            textDecoration: "none",
        },
        ":focus": {
            color: this.colors.text,
            textDecoration: "none",
        },
        ":active": {
            color: this.colors.text,
            textDecoration: "none",
        },
        ":visited": {
            color: this.colors.text,
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
        backgroundColor: this.colors.navbarBackground,
        boxShadow: "0px 0px 10px #000",
        zIndex: "9999",
        position: "fixed",
    };


    // Navbar elements
    @styleRule
    navElementHorizontal = {
        color: this.colors.text,
        backgroundColor: this.colors.navbarBackground,
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
            color: this.colors.text,
            width: "100%",
            ":hover": {
                backgroundColor: this.colors.navbarHover,
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
        backgroundColor: () => this.colors.sidepanelBackground,
        overflow: "hidden",
        position: "fixed",
        zIndex: "3000",
        boxShadow: () => "0px 0px 10px " + this.colors.boxShadow,
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
        color: this.colors.text,
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
            color: this.colors.text,
            zIndex: "1",
            position: "relative",
            width: "100%",
            height: this.dimensions.sidepanelElementHeight,
            lineHeight: this.dimensions.sidepanelElementHeight,
            ":hover": {
                backgroundColor: this.colors.sidepanelHover,
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
        color: this.colors.text,
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
        borderTop: () => "2px solid " + this.colors.hr,
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
