import {UI} from "../UIBase";
import {Table, TableRow} from "./Table";
import {CollapsibleMixin} from "../collapsible/CollapsibleMixin";
import {StyleSheet} from "../Style";
import {styleRule} from "../../decorators/Style";
import {registerStyle} from "../style/Theme";
import {GlobalStyle} from "../GlobalStyle";
import {ColumnHandler} from "../../base/ColumnHandler.js";

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

    getDefaultOptions(options) {
        return {
            collapsed: true,
        }
    }

    getPreservedOptions() {
        return {
            collapsed: this.options.collapsed
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

        getRowOptions(entry, rowIndex) {
            const {renderCollapsible} = this.options;
            return {
                ...super.getRowOptions(entry, rowIndex),
                renderCollapsible,
            }
        }

        renderTableBody() {
            return this.renderRows();
        }

        getToggleColumn() {
            return new ColumnHandler({
                isToggleColumn: true,
                value: () => null,
                cellStyle: {
                    width: "1%",
                    whiteSpace: "nowrap",
                },
                headerStyle: {
                    width: 30, // TODO not flexible to hardcode this here
                }
            });
        }
    };
}

export const CollapsibleTable = CollapsibleTableInterface(Table);
