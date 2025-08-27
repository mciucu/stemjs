import {UI} from "../UIBase";
import {TableStyle} from "./Style";
import {registerStyle} from "../style/Theme";
import {ColumnHandler} from "../../base/ColumnHandler.js";

// TODO: the whole table architecture probably needs a rethinking
export class TableRow extends UI.Primitive("tr") {
    getColumns() {
        return this.options.columns;
    }

    render() {
        const columns = this.getColumns();
        return columns.map((column, index) => this.renderEntryCell(column, index));
    }

    renderEntryCell(column, columnIndex) {
        // TODO support more complex style options and {...columns.extraOptions(entry)}
        return <td style={column.cellStyle} key={columnIndex}>{column.value(this.options.entry, this.options.rowIndex, columnIndex, this)}</td>;
    }
}

@registerStyle(TableStyle)
export class Table extends UI.Primitive("table") {
    getDefaultOptions(options) {
        const entries = this.getDefaultEntries(options);
        const columns = this.getDefaultColumns(options, entries);

        return {
            columns,
            entries,
            rowClass: TableRow,
        }
    }

    getDefaultEntries(options) {
        return options.entries || [];
    }

    getDefaultColumns(options, entries) {
        return options.columns || [];
    }

    setOptions(options) {
        super.setOptions(options);
        if (this.options.columns) {
            this.options.columns = ColumnHandler.mapColumns(this.options.columns);
        }
    }

    getRowClass() {
        return this.options.rowClass;
    }

    makeRow(entry, rowIndex) {
        if (entry instanceof UI.Element && (entry.getNodeType() === "tr" || entry.getNodeType() === "tbody")) {
            return entry;
        }
        const RowClass = this.getRowClass(entry, rowIndex);
        return <RowClass {...this.getRowOptions(entry, rowIndex)} />
    }

    getRowOptions(entry, rowIndex) {
        const {columns} = this.options;
        return {
            entry,
            columns,
            rowIndex,
            parent: this,
            className: this.styleSheet.tableRow,
            key: this.getEntryKey(entry, rowIndex),
        };
    }

    getRowByEntry(entry) {
        // TODO not nice that this is O(N)
        for (const row of this.rows) {
            if (row.options.entry === entry) {
                return row;
            }
        }
        return null;
    }

    render() {
        return [
            this.renderTableHead(),
            this.renderTableBody(),
        ];
    }

    renderTableHead() {
        const {noHeader, columns} = this.options;

        return !noHeader && <thead ref="thead" className={this.styleSheet.thead}>
            <tr>
                {columns.map((column, index) => this.renderHeaderCell(column, index))}
            </tr>
        </thead>;
    }

    getEntryKey(entry, index) {
        return entry?.id ?? index;
    }

    renderRows() {
        const entries = this.getEntries();
        this.rows = entries.map((entry, index) => this.makeRow(entry, index));
        return this.rows;
    }

    renderTableBody() {
        return <tbody>{this.renderRows()}</tbody>;
    }

    // Renders the whole header cell based on a column
    renderHeaderCell(column, index) {
        return <th style={column.headerStyle} ref={"columnHeader" + index}>
                {this.renderColumnHeader(column)}
            </th>;
    }

    // Only renders the content of the header cell
    renderColumnHeader(column) {
        if (typeof column.headerName === "function") {
            return column.headerName();
        }
        return column.headerName;
    }

    getEntries() {
        return this.options.entries || [];
    }

    setEntries(entries) {
        this.updateOptions({entries});
    }
}
