import {UI} from "../UIBase";
import {TableStyle} from "./Style";
import {registerStyle} from "../style/Theme";

export class ColumnHandler {
    constructor(options, index) {
        if (Array.isArray(options)) {
            options = {
                headerName: options[0],
                value: options[1],
                ...options[2],
            }
        }
        Object.assign(this, options);
        if (index != null) {
            this.index = index;
        }
    }

    static mapColumns(columns) {
        return columns.map((column, index) => {
            if (column instanceof ColumnHandler) {
                return column;
            }
            return new ColumnHandler(column, index);
        });
    }
}

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
        return <td style={column.cellStyle} key={columnIndex}>{column.value(this.options.entry, this.options.index, columnIndex, this)}</td>;
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
        if (options.columns) {
            this.options.columns = ColumnHandler.mapColumns(options.columns);
        }
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.table); // TODO user container instead of table
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
            key: this.getEntryKey(entry, rowIndex),
        };
    }

    render() {
        return [
            this.renderTableHead(),
            this.renderTableBody(),
        ];
    }

    renderTableHead() {
        const {noHeader, columns} = this.options;

        return !noHeader && <thead ref="thead">
            <tr>
                {columns.map((column, index) => this.renderHeaderCell(column, index))}
            </tr>
        </thead>;
    }

    getEntryKey(entry, index) {
        return (entry && entry.id != null) ? entry.id : index;
    }

    renderRows() {
        const entries = this.getEntries();
        return this.rows = entries.map((entry, index) => this.makeRow(entry, index));
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
