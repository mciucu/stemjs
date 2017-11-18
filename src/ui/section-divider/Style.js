import {StyleSheet, styleRule, styleRuleInherit} from "../Style";

class DividerStyle extends StyleSheet {
    @styleRule
    noTextSelection = {
        "-webkit-user-select": "none",
        "-moz-user-select": "none",
        "-ms-user-select": "none",
        "-o-user-select": "none",
        userSelect: "none",
    };
}

class AccordionStyle extends DividerStyle {
    @styleRule
    accordion = {
        display: "flex",
        flexDirection: "column",
        ">:nth-of-type(even)": {
            flexGrow: "1",
            flexShrink: "1",
            flexBasis: "auto",
            overflow: "auto",
            position: "relative",
        },
        ">:nth-of-type(odd)": {
            fontSize: "1em",
            textTransform: "uppercase",
            padding: "8px 8px",
        }
    };

    @styleRule
    grab = {
        cursor: "grab",
        cursor: "-moz-grab",
        cursor: "-webkit-grab",
    };

    @styleRule
    grabbing = {
        cursor: "grabbing",
        cursor: "-moz-grabbing",
        cursor: "-webkit-grabbing",
    };

    @styleRule
    collapseIcon = {
        width: "0.7em",
        fontSize: "120% !important",
        fontWeight: "900 !important",
        textAlign: "center",
        marginRight: "0.2em",
    };
}


class SectionDividerStyle extends DividerStyle {
    barThickness = 2;
    barPadding = 3;
    dividerColor = () => "#DDD";

    @styleRule
    horizontalDivider = {
        zIndex: "10",
        position: "absolute",
        height: "100%",
        cursor: "col-resize",
        width: this.barThickness + 2 * this.barPadding + "px",
        background: () => this.dividerColor(),
        backgroundClip: "padding-box",
        borderLeft: `${this.barPadding}px solid transparent`,
        borderRight: `${this.barPadding}px solid transparent`,
        marginLeft: `${-this.barThickness / 2 - this.barPadding}px`,
        marginRight: `${-this.barThickness / 2}px`,
        display: "inline-block",
    };

    @styleRule
    verticalDivider = {
        zIndex: "10",
        position: "absolute",
        cursor: "row-resize",
        width: "100%",
        height: this.barThickness + 2 * this.barPadding +  "px",
        background: () => this.dividerColor(),
        backgroundClip: "padding-box",
        borderBottom: `${this.barPadding}px solid transparent`,
        borderTop: `${this.barPadding}px solid transparent`,
        marginBottom: `${-this.barThickness / 2  - this.barPadding}px`,
        marginTop: `${-this.barThickness / 2 - this.barPadding}px`,
    };

    @styleRule
    horizontalSection = {
        position: "relative",
        whiteSpace: "nowrap",
        ">*": {
            whiteSpace: "initial",
            verticalAlign: "top",
            paddingLeft: `${this.barThickness / 2 + this.barPadding}px`,
            paddingRight: `${this.barThickness / 2 + this.barPadding}px`,
        },
        ">:first-child": {
            paddingLeft: "0",
        },
        ">:last-child": {
            paddingRight: "0",
        },
        ">:nth-of-type(even)": {
            padding: "0",
        },
        ">:nth-of-type(odd)": {
            display: "inline-block",
        }
    };

    @styleRule
    verticalSection = {
        position: "relative",
        ">*": {
            paddingTop: `${this.barThickness / 2 + this.barPadding}px`,
            paddingBottom: `${this.barThickness / 2 + this.barPadding}px`,
        },
        ">:first-child": {
            paddingTop: "0",
        },
        ">:last-child": {
            paddingBottom: "0",
        },
        ">:nth-of-type(even)": {
            padding: "0",
        },
    };
}

class TitledDividerStyle extends SectionDividerStyle {
    barThickness = 16;
    barPadding = 1;
    transitionTime = .3;

    dividerStyle = {
        backgroundColor: "white",
        borderColor: "#DDD !important",
    };

    @styleRuleInherit
    horizontalDivider = Object.assign(this.dividerStyle, {
        display: "inline-flex",
        alignItems: "center",
        flexDirection: "column",
        ">*": {
            flex: "1",
            display: "flex",
            color: "rgba(0,0,0, .4)",
        },
        ">:first-child": {
            alignItems: "flex-end",
        },
        ">:last-child": {
            alignItems: "flex-start",
        },
        ">:nth-child(2)": {
            flex: ".2",
            alignItems: "center",
        }
    });

    @styleRule
    horizontalDots = {
        transform: "rotate(90deg) scaleX(5)",
    };

    @styleRuleInherit
    verticalDivider = Object.assign(this.dividerStyle, {
        display: "flex",
        alignItems: "center",
    });

    @styleRule
    verticalDots = {
        flex: "1",
        fontSize: "70% !important",
        height: 0,
        textAlign: "center",
        transform: "scaleX(10) translateY(-.4em)",
    };

    @styleRule
    arrowButton = {
        fontSize: "230% !important",
        padding: "1em .2em",
        color: "rgba(0,0,0, .4)",
        cursor: "pointer",
        ":hover": {
            color: "black",
        }
    };

    @styleRule
    buttonsDisabled = {
        ">:first-child": {
            pointerEvents: "none",
        },
        ">:last-child": {
            pointerEvents: "none",
        },
    };

    @styleRule
    barCollapsePanel = {
        position: "relative",
        ">:first-child": {
            width: "100%",
            height: "100%",
        },
        ">:nth-child(2)": {
            display: "none",
            opacity: "0",
            transition: "opacity " + this.transitionTime + "s ease",
        },
    };

    @styleRule
    hiddenContent = {
        ">:first-child": {
            display: "none",
        },
        ">:nth-child(2)": {
            opacity: "1",
        },
    };

    @styleRule
    collapsedBarTitle = {
        cursor: "pointer",
        borderLeft: "1px solid #ccc",
        borderRight: "1px solid #ccc",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        flexDirection: "column",
        zIndex: 5,
        position: "absolute",
        top: 0,
        left: 0,
        ":hover": {
            backgroundColor: "#f3f3f3",
        },
        ">:nth-child(2)": {
            flex: "1",
            transform: "rotate(90deg)",
        },
        ">:nth-child(2)>:first-child": {
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: "130%",
            whiteSpace: "nowrap",
            marginTop: "-.4em",
            transform: "translateY(10%)",
        },
        ">*": {
            display: "flex",
            alignItems: "center",
        },
        ">:first-child": {
            flex: ".5",
            fontSize: "180%",
        },
        ">:last-child": {
            flex: ".5",
            fontSize: "180%",
        },
    };

    @styleRule
    animatedSectionDivider = {
        ">*": {
            transition: this.transitionTime + "s height ease, " + this.transitionTime + "s width ease",
        }
    };

    @styleRule
    paddingRemoved = {
        ">*": {
            padding: "0 !important",
            overflow: "hidden",
        },
        ">:nth-of-type(even)": {
            display: "none !important",
        }
    };
}

export {AccordionStyle, SectionDividerStyle, TitledDividerStyle};
