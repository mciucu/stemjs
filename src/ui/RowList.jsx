import {UI} from "./UIBase";
import {styleRule} from "./Style";
import {registerStyle} from "./style/Theme"
import {SimpleStyledElement} from "./SimpleElements";
import {BasicLevelSizeStyleSheet} from "./GlobalStyle";


class RowListStyle extends BasicLevelSizeStyleSheet {
    @styleRule
    container = {
        width: "100%",
    };

    @styleRule
    rowListEntry = {
        display: "flex",
        alignItems: "center",
        width: "100%",

        minHeight: this.themeProps.ROW_LIST_ROW_HEIGHT,
        paddingLeft: this.themeProps.ROW_LIST_ROW_PADDING,
        paddingRight: this.themeProps.ROW_LIST_ROW_PADDING,

        backgroundColor: this.themeProps.COLOR_BACKGROUND,
    };

    @styleRule
    LARGE = {
        minHeight: this.themeProps.ROW_LIST_ROW_HEIGHT_LARGE,
        paddingLeft: this.themeProps.ROW_LIST_ROW_PADDING_LARGE,
        paddingRight: this.themeProps.ROW_LIST_ROW_PADDING_LARGE,
    };

    @styleRule
    alternativeColorsOddRow = {
        backgroundColor: this.themeProps.COLOR_BACKGROUND_ALTERNATIVE,
    };

    @styleRule
    noAlternativeColors = {
        borderTopWidth: this.themeProps.ROW_LIST_ROW_BORDER_WIDTH,
        borderTopStyle: this.themeProps.BASE_BORDER_STYLE,
        borderTopColor: this.themeProps.BASE_BORDER_COLOR,
    };
}


//TODO @cleanup just delete this?
@registerStyle(RowListStyle)
export class RowList extends SimpleStyledElement {
    getDefaultOptions(options) {
        return {
            alternateColors: true,
        }
    }

    getRowClasses(index) {
        let rowClasses = this.styleSheet.rowListEntry;
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