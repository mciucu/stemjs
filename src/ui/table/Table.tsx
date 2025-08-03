import {UI, UIElement, UIElementOptions, UIElementChild, HTMLTagType} from "../UIBase";
import {TableStyle} from "./Style";
import {registerStyle} from "../style/Theme";
import {ColumnHandler, ColumnLike} from "../../base/ColumnHandler.js";

export interface TableRowOptions<BaseType> extends UIElementOptions {
    columns?: ColumnHandler<BaseType>[];
    entry?: any;
    rowIndex?: number;
}

export class TableRow<BaseType> extends UIElement<TableRowOptions<BaseType>, HTMLTableRowElement> {
    getNodeType(): HTMLTagType {
        return "tr";
    }

    getColumns(): ColumnHandler<BaseType>[] {
        return this.options.columns || [];
    }

    render(): UIElementChild {
        const columns = this.getColumns();
        return columns.map((column, index) => this.renderEntryCell(column, index));
    }

    renderEntryCell(column: ColumnHandler<BaseType>, columnIndex: number): UIElement<any, HTMLTableCellElement> {
        // TODO support more complex style options and {...columns.extraOptions(entry)}
        return <td style={column.cellStyle} key={columnIndex}>{column.value(this.options.entry, this.options.rowIndex, columnIndex, this)}</td>;
    }
}

export interface TableOptions<BaseType> extends UIElementOptions {
    entries?: BaseType[];
    columns?: ColumnLike<BaseType>[];
    rowClass?: typeof TableRow<BaseType>;
    noHeader?: boolean;
}

// TODO @types
export interface Table<BaseType> {
    styleSheet: TableStyle;
}

@registerStyle(TableStyle)
export class Table<BaseType> extends UIElement<TableOptions<BaseType>, HTMLTableElement> {
    rows?: TableRow<BaseType>[];

    getNodeType(): HTMLTagType {
        return "table";
    }

    getDefaultOptions(options?: typeof this.options) {
        const entries = this.getDefaultEntries(options);
        const columns = this.getDefaultColumns(options, entries);

        return {
            columns,
            entries,
            rowClass: TableRow,
        }
    }

    getDefaultEntries(options?: typeof this.options): BaseType[] {
        return options?.entries || [];
    }

    getDefaultColumns(options?: typeof this.options, entries?: BaseType[]): ColumnHandler<BaseType>[] {
        // We know these must have been converted already
        return options?.columns as ColumnHandler<BaseType>[] || [] ;
    }

    setOptions(options: typeof this.options): void {
        super.setOptions(options);
        if (this.options.columns) {
            this.options.columns = ColumnHandler.mapColumns(this.options.columns);
        }
    }

    getRowClass(entry?: BaseType, rowIndex?: number): typeof TableRow {
        return this.options.rowClass || TableRow;
    }

    makeRow(entry: BaseType, rowIndex: number): UIElement<any, HTMLTableRowElement | HTMLTableSectionElement> {
        if (entry instanceof UIElement && (entry.getNodeType() === "tr" || entry.getNodeType() === "tbody")) {
            return entry;
        }
        const RowClass = this.getRowClass(entry, rowIndex);
        return <RowClass {...this.getRowOptions(entry, rowIndex)} />
    }

    getRowOptions(entry: BaseType, rowIndex: number): TableRowOptions<BaseType> {
        const {columns} = this.options;
        return {
            entry,
            columns,
            rowIndex,
            parent: this,
            className: this.styleSheet.tableRow as string,
            key: this.getEntryKey(entry, rowIndex),
        };
    }

    getRowByEntry(entry: BaseType): UIElement | null {
        // TODO not nice that this is O(N)
        if (!this.rows) return null;
        for (const row of this.rows) {
            if (row.options.entry === entry) {
                return row;
            }
        }
        return null;
    }

    render(): UIElementChild {
        return [
            this.renderTableHead(),
            this.renderTableBody(),
        ];
    }

    renderTableHead(): UIElement | false {
        const {noHeader, columns} = this.options;

        return !noHeader && <thead ref="thead" className={this.styleSheet.thead}>
            <tr>
                {columns?.map((column, index) => this.renderHeaderCell(column, index))}
            </tr>
        </thead>;
    }

    getEntryKey(entry: BaseType, index: number): string | number {
        return (entry as any)?.id ?? index;
    }

    renderRows(): UIElement[] {
        const entries = this.getEntries();
        this.rows = entries.map((entry, index) => this.makeRow(entry, index));
        return this.rows;
    }

    renderTableBody(): UIElement {
        return <tbody>{this.renderRows()}</tbody>;
    }

    // Renders the whole header cell based on a column
    renderHeaderCell(column: ColumnHandler<BaseType>, index: number): UIElement {
        return <th style={column.headerStyle} ref={"columnHeader" + index}>
                {this.renderColumnHeader(column)}
            </th>;
    }

    // Only renders the content of the header cell
    renderColumnHeader(column: ColumnHandler<BaseType>): string {
        if (typeof column.headerName === "function") {
            return column.headerName();
        }
        return column.headerName;
    }

    getEntries(): BaseType[] {
        return this.options.entries || [];
    }

    setEntries(entries: BaseType[]): void {
        this.updateOptions({entries});
    }
}
