import {StyleSheet, styleRule} from "./Style";

class RangePanelStyle extends StyleSheet {
    rowHeight = 52;

    @styleRule
    default = {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "auto",
        overflowY: "hidden",
    };

    @styleRule
    tableContainer = {
        flex: "1",
        height: "100%",
        width: "100%",
        position: "relative",
    };

    @styleRule
    scrollablePanel = {
        overflow: "auto",
        height: "calc(100% - 30px)",
        width: "100%",
    };

    @styleRule
    fakePanel = {
        width: "100%",
    };

    @styleRule
    footer = {
        fontWeight: "bold",
        textAlign: "center",
        position: "absolute",
        bottom: "0px",
        width: "100%",
        whiteSpace: "nowrap",
        paddingBottom: "15px",
        paddingTop: "3px",
    };

    @styleRule
    jumpToButton = {
        marginLeft: "5px",
        padding: "2.3px 10px",
        verticalAlign: "bottom",
    };

    @styleRule
    table = {
        width: "calc(100% - 15px)",
        marginBottom: "0px",
        top: "0px",
        position: "absolute",
        pointerEvents: "none",
        ">tbody>tr>td": {
            height: `${this.rowHeight}px !important`,
            whiteSpace: "nowrap !important",
        }
    };
}

export {RangePanelStyle};
