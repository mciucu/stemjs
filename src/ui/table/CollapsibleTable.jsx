import {UI} from "../UIBase";
import {ColumnHandler, Table, TableRow} from "./Table";
import {CollapsibleMixin} from "../collapsible/CollapsibleMixin";
import {StyleSheet} from "../Style";
import {styleRule} from "../../decorators/Style";
import {registerStyle} from "../style/Theme";
import {GlobalStyle} from "../GlobalStyle";

export class TableRowInCollapsibleTable extends TableRow {
    getNodeType() {
        return "tbody";
    }

    render() {
        return <tr>{super.render()}</tr>;
    }
}

class CollapsibleTableStyle extends StyleSheet {
    @styleRule
    heading = {
        padding: "10px 15px",
        backgroundColor: "initial !important",
    };
}

// TODO: refactor this to support redraw and render override
@registerStyle(CollapsibleTableStyle)
export class CollapsibleTableRow extends CollapsibleMixin(TableRow) {
    getNodeType() {
        return "tbody";
    }

    getDefaultOptions() {
        return {
            collapsed: true,
        }
    }

    renderEntryCell(column, columnIndex) {
        if (columnIndex === 0) {
            return <td
                onClick={() => this.toggle()}
                className={this.getCollapsibleStyleSheet().toggleButton}
                style={column.cellStyle}
                key={columnIndex}>
                {this.getToggleIcon()}
            </td>
        }
        return super.renderEntryCell(column, columnIndex);
    }

    toggle() {
        if (!this.options.collapsed) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    getInitialCollapsedContent() {
        const {renderCollapsible, entry} = this.options;
        if (renderCollapsible) {
            return renderCollapsible(entry, this);
        }
        return this.renderCollapsible(this.options.entry, this);
    }

    renderCollapsible() {
        return [];
    }

    getMainRowContent() {
        return super.render();
    }

    getMainRow() {
        return <tr className={this.styleSheet.heading}>{this.getMainRowContent()}</tr>;
    }

    getCollapsibleRow() {
        const {collapsed} = this.options;
        return <tr>
            <td style={{padding: 0, overflow: "hidden", height: "auto"}} colspan={this.options.columns.length}>
                <div ref="contentArea" className={collapsed ? GlobalStyle.hidden : null}>
                    {this.getInitialCollapsedContent()}
                </div>
            </td>
        </tr>
    }

    render() {
        return [
            this.getMainRow(),
            this.getCollapsibleRow(),
        ];
    }
}

export function CollapsibleTableInterface(BaseTableClass) {
    return class CollapsibleTable extends BaseTableClass {
        getDefaultOptions(options) {
            return {
                ...super.getDefaultOptions(options),
                rowClass: CollapsibleTableRow,
            }
        }

        setOptions(options) {
            super.setOptions(options);
            if (!this.options.columns[0]?.isToggleColumn) {
                this.options.columns = [this.getToggleColumn(), ...this.options.columns];
            }
        }

        getRowOptions(entry) {
            const {renderCollapsible} = this.options;
            return {
                ...super.getRowOptions(entry),
                renderCollapsible,
            }
        }

        renderTableBody() {
            return this.renderRows();
        }

        getToggleColumn() {
            return new ColumnHandler({
                isToggleColumn: true,
                cellStyle: {
                    width: "1%",
                    whiteSpace: "nowrap",
                }
            });
        }
    };
}

export const CollapsibleTable = CollapsibleTableInterface(Table);
