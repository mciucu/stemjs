import {StyleSheet, styleRule} from "../Style";

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
        position: "absolute",
        height: "100%",
        cursor: "col-resize",
        paddingLeft: this.barThickness + "px !important",
        background: "#DDD",
        backgroundClip: "padding-box",
        borderLeft: `${this.barPadding}px solid transparent`,
        borderRight: `${this.barPadding}px solid transparent`,
        marginLeft: `${-this.barPadding}px`,
    };

    @styleRule
    verticalDivider = {
        position: "absolute",
        cursor: "row-resize",
        width: "100%",
        paddingTop: this.barThickness + "px !important",
        background: "#DDD",
        backgroundClip: "padding-box",
        borderBottom: `${this.barPadding}px solid transparent`,
        borderTop: `${this.barPadding}px solid transparent`,
        marginTop: `${-this.barPadding}px`,
    };

    @styleRule
    horizontalSection = {
        position: "relative",
        whiteSpace: "nowrap",
        ">*": {
            whiteSpace: "initial",
            display: "inline-block",
            verticalAlign: "top",
            paddingLeft: "2px",
            paddingRight: "2px",
            boxSizing: "border-box",
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
            paddingTop: "2px",
            paddingBottom: "2px",
            boxSizing: "border-box",
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

export {AccordionStyle, SectionDividerStyle};
