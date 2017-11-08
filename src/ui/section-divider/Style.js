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

    @styleRule
    horizontalDivider = {
        zIndex: "10",
        position: "absolute",
        height: "100%",
        cursor: "col-resize",
        paddingLeft: this.barThickness / 2 + "px !important",
        paddingRight: this.barThickness / 2 + "px !important",
        background: "#DDD",
        backgroundClip: "padding-box",
        borderLeft: `${this.barPadding}px solid transparent`,
        borderRight: `${this.barPadding}px solid transparent`,
        marginLeft: `${-this.barThickness / 2 - this.barPadding}px`,
        marginRight: `${-this.barThickness / 2}px`,
    };

    @styleRule
    verticalDivider = {
        zIndex: "10",
        position: "absolute",
        cursor: "row-resize",
        width: "100%",
        paddingTop: this.barThickness / 2 + "px !important",
        paddingBottom: this.barThickness / 2 + "px !important",
        background: "#DDD",
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
            display: "inline-block",
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
    barThickness = 12;
    barPadding = 3;

    dividerStyle = {
        backgroundColor: "white",
        borderColor: "#DDD !important",
    };

    @styleRuleInherit
    horizontalDivider = Object.assign(this.dividerStyle, {
        display: "inline-flex !important",
        alignItems: "center",
    });

    @styleRule
    horizontalDots = {
        fontSize: "70% !important",
        width: 0,
        color: "rgba(0,0,0, .4)",
        transform: "scaleY(10) translateX(-.1em)",
    };

    @styleRuleInherit
    verticalDivider = Object.assign(this.dividerStyle, {
        display: "flex !important",
        alignItems: "center",
    });

    @styleRule
    verticalDots = {
        flex: "1",
        fontSize: "70% !important",
        height: 0,
        color: "rgba(0,0,0, .4)",
        textAlign: "center",
        transform: "scaleX(10) translateY(-.4em)",
    };

    @styleRule
    barCollapsePanel = {
        ">:first-child": {
            width: "100%",
            height: "100%",
        }
    };

    @styleRule
    collapsedBarTitle = {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        backgroundColor: "#fff",
        zIndex: 5,
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        ":hover": {
            backgroundColor: "#f3f3f3",
        },
        ">:first-child": {
            display: "flex",
            alignItems: "center",
            transform: "rotate(90deg)",
            height: "0",
            width: "0",
        },
        ">:first-child>:first-child": {
            textTransform: "uppercase",
            fontWeight: "bold",
            fontSize: "130%",
            whiteSpace: "nowrap",
            marginLeft: "-.4em",
            transform: "translate(-50%, -70%)",
        }
    };

    @styleRule
    hiddenBar = {
        display: "none !important",
    };

    @styleRule
    hiddenContent = {
        ">:first-child": {
            display: "none",
        }
    }
}

export {AccordionStyle, SectionDividerStyle, TitledDividerStyle};
