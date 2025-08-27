import {StyleSheet} from "../Style";
import {styleRule} from "../../decorators/Style";

export class TableStyle extends StyleSheet {
    cellStyle = {
        padding: 8,
        lineHeight: "1.42857143",
        verticalAlign: "top",
        borderTop: "1px solid #ddd",
    };

    @styleRule
    thead = {
        borderBottom: "2px solid #ddd",
        borderTop: 0,
    }

    @styleRule
    container = {
        width: "100%",
        maxWidth: "100%",
        marginBottom: 20,
        borderSpacing: 0,
        borderCollapse: "collapse",
        ">*>*>td,th": this.cellStyle,
    };

    @styleRule
    tableStripped = {
        ">tbody>tr:nth-of-type(odd)": {
            backgroundColor: "#f5f5f5",
        }
    };

    @styleRule
    tableRow = {
        // Available for overwriting
    }
}