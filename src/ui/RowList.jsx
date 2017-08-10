import {UI, registerStyle} from "UI";
import {StyleSheet, styleRule} from "Style";


class RowListStyle extends StyleSheet {
    @styleRule
    rowList = {
        width: "100%",
    };

    @styleRule
    row = {
        display: "flex",
        alignItems: "center",
        width: "100%",

        height: this.themeProperties.ROW_LIST_ROW_HEIGHT,
        paddingLeft: this.themeProperties.ROW_LIST_ROW_PADDING,
        paddingRight: this.themeProperties.ROW_LIST_ROW_PADDING,

        backgroundColor: this.themeProperties.COLOR_PLAIN,
    };

    @styleRule
    oddRow = {
        backgroundColor: this.themeProperties.COLOR_PLAIN_ALTERNATIVE,
    };
}


@registerStyle(RowListStyle)
export class RowList extends UI.Element {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.rowList);
    }

    getDefaultOptions(options) {
        return {
            alternateColors: true,
        }
    }

    render() {
        let {rows, rowParser, alternateColors} = this.options;

        return rows.map((row, index) => {
            let parityClass = "";
            if (alternateColors && index % 2 === 1) {
                parityClass = this.styleSheet.oddRow;
            }

            return <div className={this.styleSheet.row + parityClass}>
                {rowParser(row)}
            </div>
        });
    }
}