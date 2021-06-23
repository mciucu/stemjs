import {UI} from "../UIBase";
import {Table, TableRow} from "./Table";
import {CollapsibleMixin} from "../collapsible/CollapsibleMixin";
import {StyleSheet} from "../Style";
import {styleRule} from "../../decorators/Style";
import {registerStyle} from "../style/Theme";
import {GlobalStyle} from "../GlobalStyle";

class TableRowInCollapsibleTable extends TableRow {
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
class CollapsibleTableRow extends CollapsibleMixin(TableRow) {
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
        return this.options.renderCollapsible(this.options.entry);
    }

    render() {
        const {collapsed} = this.options;

        return [
            <tr className={this.styleSheet.heading}>{super.render()}</tr>,
            <tr>
                <td style={{padding: 0, overflow: "hidden", height: "auto", border: 0}} colspan={this.options.columns.length}>
                    <div ref="contentArea" className={collapsed ? GlobalStyle.hidden : null}>
                        {this.getInitialCollapsedContent()}
                    </div>
                </td>
            </tr>
        ];
    }
}

class DelayedCollapsibleTableRow extends CollapsibleTableRow {
    toggle() {
        if (!this._haveExpanded) {
            this._haveExpanded = true;
            this.redrawCollapsible();
        }
        super.toggle();
    }

    redrawCollapsible() {
        UI.renderingStack.push(this);
        this.contentArea.options.children = super.getInitialCollapsedContent();
        UI.renderingStack.pop();
        this.contentArea.redraw();
    }

    getInitialCollapsedContent() {
        return [];
    }
}

function CollapsibleTableInterface(BaseTableClass) {
    return class CollapsibleTable extends BaseTableClass {
        getDefaultOptions(options) {
            return {
                ...super.getDefaultOptions(options),
                rowClass: CollapsibleTableRow,
            }
        }

        setOptions(options) {
            super.setOptions(options);
            if (options.columns) {
                this.options.columns = [this.getToggleColumn(), ...options.columns];
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
            return {
                cellStyle: {
                    width: "1%",
                    "whiteSpace": "nowrap",
                }
            }
        }
    };
}

const CollapsibleTable = CollapsibleTableInterface(Table);

export {CollapsibleTable, CollapsibleTableInterface, CollapsibleTableRow, DelayedCollapsibleTableRow,
        TableRowInCollapsibleTable};
