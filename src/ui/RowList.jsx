import {UI, registerStyle} from "UI";
import {StyleSheet, styleRule} from "Style";
import {Size} from "./Constants";
import {SimpleStyledElement} from "./Bootstrap3";
import {BasicLevelSizeStyleSheet} from "./GlobalStyle";


class RowListStyle extends BasicLevelSizeStyleSheet {
    @styleRule
    rowList = {
        width: "100%",
    };

    @styleRule
    DEFAULT = {
        display: "flex",
        alignItems: "center",
        width: "100%",

        minHeight: this.themeProperties.ROW_LIST_ROW_HEIGHT,
        paddingLeft: this.themeProperties.ROW_LIST_ROW_PADDING,
        paddingRight: this.themeProperties.ROW_LIST_ROW_PADDING,

        backgroundColor: this.themeProperties.COLOR_BACKGROUND,
    };

    @styleRule
    LARGE = {
        minHeight: this.themeProperties.ROW_LIST_ROW_HEIGHT_LARGE,
        paddingLeft: this.themeProperties.ROW_LIST_ROW_PADDING_LARGE,
        paddingRight: this.themeProperties.ROW_LIST_ROW_PADDING_LARGE,
    };

    @styleRule
    alternativeColorsOddRow = {
        backgroundColor: this.themeProperties.COLOR_BACKGROUND_ALTERNATIVE,
    };

    @styleRule
    noAlternativeColors = {
        borderTopWidth: this.themeProperties.ROW_LIST_ROW_BORDER_WIDTH,
        borderTopStyle: this.themeProperties.BASE_BORDER_STYLE,
        borderTopColor: this.themeProperties.BASE_BORDER_COLOR,
    };
}


@registerStyle(RowListStyle)
export class RowList extends SimpleStyledElement {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.rowList);
    }

    getDefaultOptions(options) {
        return {
            alternateColors: true,
        }
    }

    getRowClasses(index) {
        let rowClasses = this.styleSheet.DEFAULT;
        if (this.getSize()) {
            rowClasses = rowClasses + this.styleSheet.Size(this.getSize());
        }

        const {alternateColors} = this.options;

        if (alternateColors && index % 2 === 1) {
            rowClasses = rowClasses + this.styleSheet.alternativeColorsOddRow;
        } else if (!alternateColors && index > 0) {
            rowClasses = rowClasses + this.styleSheet.noAlternativeColors;
        }

        return rowClasses;
    }

    render() {
        const {rows, rowParser} = this.options;

        return rows.map((row, index) => {
            return <div className={this.getRowClasses(index)}>
                {rowParser(row)}
            </div>
        });
    }
}