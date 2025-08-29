import {UI, UIElementChild, HTMLTagType} from "../UIBase";
import {Table, TableRow, TableOptions, TableRowOptions} from "./Table";
import {CollapsibleMixin} from "../collapsible/CollapsibleMixin";
import {StyleSheet} from "../Style";
import {styleRule} from "../../decorators/Style";
import {registerStyle} from "../style/Theme";
import {GlobalStyle} from "../GlobalStyle";
import {ColumnHandler} from "../../base/ColumnHandler";

// TODO @types just putting here here to ensure it's not stripped for some strange reason
UI.Element;

export class TableRowInCollapsibleTable<BaseType> extends TableRow<BaseType> {
    getNodeType(): HTMLTagType {
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

export interface CollapsibleTableRowOptions<BaseType> extends TableRowOptions<BaseType> {
    collapsed?: boolean;
    renderCollapsible?: (entry: BaseType, row: CollapsibleTableRow<BaseType>) => UIElementChild;
}

// TODO @types
export interface CollapsibleTableRow<BaseType> {
    styleSheet: CollapsibleTableStyle;
}

// TODO: refactor this to support redraw and render override
@registerStyle(CollapsibleTableStyle)
export class CollapsibleTableRow<BaseType> extends CollapsibleMixin(TableRow<BaseType>) {
    getNodeType(): HTMLTagType {
        return "tbody";
    }

    getDefaultOptions(options?: CollapsibleTableRowOptions<BaseType>): Partial<CollapsibleTableRowOptions<BaseType>> {
        return {
            collapsed: true,
        }
    }

    getPreservedOptions(): Partial<CollapsibleTableRowOptions<BaseType>> {
        return {
            collapsed: this.options.collapsed
        }
    }

    renderEntryCell(column: ColumnHandler<BaseType>, columnIndex: number) {
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

    toggle(): void {
        if (!this.options.collapsed) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    getInitialCollapsedContent(): UIElementChild {
        const {renderCollapsible, entry} = this.options;
        if (renderCollapsible) {
            return renderCollapsible(entry, this);
        }
        return this.renderCollapsible(this.options.entry, this);
    }

    renderCollapsible(entry: BaseType, row: CollapsibleTableRow<BaseType>): UIElementChild {
        return [];
    }

    getMainRowContent(): UIElementChild {
        return super.render();
    }

    getMainRow() {
        return <tr className={this.styleSheet.heading}>{this.getMainRowContent()}</tr>;
    }

    getCollapsibleRow() {
        const {collapsed} = this.options;
        return <tr>
            <td style={{padding: 0, overflow: "hidden", height: "auto"}} colspan={this.options.columns?.length}>
                <div ref="contentArea" className={collapsed ? GlobalStyle.hidden : null}>
                    {this.getInitialCollapsedContent()}
                </div>
            </td>
        </tr>
    }

    render(): UIElementChild {
        return [
            this.getMainRow(),
            this.getCollapsibleRow(),
        ];
    }
}

export interface CollapsibleTableOptions<BaseType> extends TableOptions<BaseType> {
    renderCollapsible?: (entry: BaseType, row: CollapsibleTableRow<BaseType>) => UIElementChild;
}

export function CollapsibleTableInterface<BaseType, T extends typeof Table<BaseType>>(BaseTableClass: T) {
    return class CollapsibleTable extends BaseTableClass {
        getDefaultOptions(options?: CollapsibleTableOptions<BaseType>): Partial<CollapsibleTableOptions<BaseType>> {
            return {
                ...super.getDefaultOptions(options),
                rowClass: CollapsibleTableRow,
            }
        }

        setOptions(options: CollapsibleTableOptions<BaseType>): void {
            super.setOptions(options);
            if (!(this.options.columns?.[0] as any)?.isToggleColumn) {
                this.options.columns = [this.getToggleColumn(), ...(this.options.columns || [])];
            }
        }

        getRowOptions(entry: BaseType, rowIndex: number): CollapsibleTableRowOptions<BaseType> {
            const {renderCollapsible} = this.options;
            return {
                ...super.getRowOptions(entry, rowIndex),
                renderCollapsible,
            }
        }

        renderTableBody() {
            return this.renderRows();
        }

        getToggleColumn(): ColumnHandler<BaseType> {
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
