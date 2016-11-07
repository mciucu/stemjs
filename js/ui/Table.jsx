import {UI} from "./UIBase";
import * as Utils from "../base/Utils";

// TODO: the whole table architecture probably needs a rethinking
UI.TableRow = class TableRow extends UI.Element {
    getPrimitiveTag() {
        return "tr";
    }

    renderHTML() {
        let rowCells = [];

        for (let column of this.options.columns) {
            rowCells.push(this.renderEntryCell(column));
        }

        return rowCells;
    }

    renderEntryCell(column) {
        return <td style={column.cellStyle} key={column.id}>{column.value(this.options.entry, this.options.index)}</td>;
    }
};

UI.TableRowInCollapsibleTable = class TableRowInCollapsibleTable extends UI.TableRow {
    getPrimitiveTag() {
        return "tbody";
    }

    renderHTML() {
        return <tr>{super.renderHTML()}</tr>;
    }
};

UI.CollapsibleTableRow = class CollapsibleTableRow extends UI.TableRow {
    constructor(options) {
        super(options);

        if (options.collapsed != null) {
            this.collapsed = options.collapsed;
        } else {
            this.collapsed = true;
        }
    }

    getPrimitiveTag() {
        return "tbody";
    }

    onMount() {
        this.collapseButton.addClickListener((event) => {
            this.collapsed = (this.collapsed != true);
            this.collapseButton.toggleClass("collapsed");
            // TODO (@kira): Find out how to do this
            this.collapsible.element.collapse("toggle");
        });
    }

    redraw() {
        if (!super.redraw()) {
            return false;
        }

        if (this.collapsed) {
            this.collapseButton.addClass("collapsed");
            this.collapsible.removeClass("in");
        } else {
            this.collapseButton.removeClass("collapsed");
            this.collapsible.addClass("in");
        }
        return true;
    }

    renderHTML() {
        let noPaddingHiddenRowStyle = {
            padding: 0,
        };

        let rowCells = super.renderHTML();

        return [
            <tr className="panel-heading">{rowCells}</tr>,
            <tr>
                <td style={noPaddingHiddenRowStyle} colspan={this.options.columns.length}>
                    <div ref="collapsible" className="collapse">
                        {this.renderCollapsible(this.options.entry)}
                    </div>
                </td>
            </tr>
        ];
    }
};

UI.Table = class Table extends UI.Element {
    setOptions(options) {
        super.setOptions(options);

        this.setColumns(options.columns || []);
        this.entries = options.entries || [];
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();

        attr.addClass("ui-table table table-stripped");

        return attr;
    }

    getPrimitiveTag() {
        return "table";
    }

    getRowClass() {
        return UI.TableRow;
    }

    getRowOptions(entry) {
        return {
            entry: entry,
            columns: this.columns,
        };
    }

    renderHTML() {
        return [
            <thead>
                {this.renderTableHead()}
            </thead>,
            <tbody>
                {this.renderTableBody()}
            </tbody>
        ];
    }

    renderTableHead() {
        return <tr>{this.columns.map(this.renderHeaderCell, this)}</tr>
    }

    getEntryKey(entry, index) {
        return entry.id || index;
    }

    renderTableBody() {
        this.rows = [];

        let entries = this.getEntries();
        for (let i = 0; i < entries.length; i += 1) {
            let entry = entries[i];
            let RowClass = this.getRowClass(entry);
            this.rows.push(<RowClass key={this.getEntryKey(entry, i)} index={i} {...this.getRowOptions(entry)} parent={this}/>);
        }
        return this.rows;
    }

    // Renders the whole header cell based on a column
    renderHeaderCell(column) {
        return <th style={column.headerStyle} ref={"columnHeader" + column.id}>
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

    // Original entries should not be modified. Overwrite this function to appy any modification in a new array.
    getEntries() {
        return this.entries || [];
    }

    columnDefaults(column, index) {
        column.id = index;
    }

    setColumns(columns) {
        this.columns = columns;
        for (let i = 0; i < this.columns.length; i += 1) {
            this.columnDefaults(this.columns[i], i);
        }
    }
};

UI.SortableTableInterface = function(BaseTableClass) {
    return class SortableTable extends BaseTableClass {
        setOptions(options) {
            super.setOptions(options);

            this.columnSortingOrder = options.columnSortingOrder || [];
        }

        getDOMAttributes() {
            let attr = super.getDOMAttributes();

            attr.addClass("ui-sortable-table");

            return attr;
        }

        onMount() {
            super.onMount();

            // TODO: fix multiple clicks registered here
            // Sort table by clicked column
            for (let column of this.columns) {
                this["columnHeader" + column.id].addClickListener(() => {
                    this.sortByColumn(column);
                });
            }
        }

        renderColumnHeader(column) {
            let iconStyle = {position: "absolute", right: "0px", bottom: "0px"};
            let sortIcon = <i className="sort-icon fa fa-sort" style={iconStyle}></i>;
            if (this.sortBy === column) {
                if (this.sortDescending) {
                    sortIcon = <i className="sort-icon fa fa-sort-desc" style={iconStyle}></i>;
                } else {
                    sortIcon = <i className="sort-icon fa fa-sort-asc" style={iconStyle}></i>;
                }
            }

            return <div style={{position: "relative"}}>{super.renderColumnHeader(column)} {sortIcon}</div>;
        }

        sortByColumn(column) {
            if (column === this.sortBy) {
                this.sortDescending = (this.sortDescending != true);
            } else {
                this.sortDescending = true;
            }

            this.sortBy = column;

            this.redraw();
        }

        sortEntries(entries) {
            if (!this.sortBy && this.columnSortingOrder.length === 0) {
                return entries;
            }

            let colCmp = (a, b, col) => {
                if (!col) return 0;

                let keyA = col.rawValue ? col.rawValue(a) : col.value(a);
                let keyB = col.rawValue ? col.rawValue(b) : col.value(b);
                return col.cmp(keyA, keyB);
            };

            let sortedEntries = entries.slice();

            sortedEntries.sort((a, b) => {
                let cmpRes;

                if (this.sortBy) {
                    cmpRes = colCmp(a, b, this.sortBy);
                    if (cmpRes !== 0) {
                        return (this.sortDescending ? -cmpRes : cmpRes);
                    }
                }

                for (let i = 0; i < this.columnSortingOrder.length; i += 1) {
                    cmpRes = colCmp(a, b, this.columnSortingOrder[i]);
                    if (this.columnSortingOrder[i].sortDescending) {
                        cmpRes = -cmpRes;
                    }

                    if (cmpRes !== 0) {
                        return cmpRes;
                    }
                }
                return 0;
            });
            return sortedEntries;
        }

        getEntries() {
            return this.sortEntries(super.getEntries());
        }

        columnDefaults(column, index) {
            super.columnDefaults(column, index);

            if (!column.hasOwnProperty("cmp")) {
                column.cmp = Utils.defaultComparator;
            }
        }
    };
};

UI.SortableTable = UI.SortableTableInterface(UI.Table);

UI.CollapsibleTableInterface = function(BaseTableClass) {
    return class CollapsibleTable extends BaseTableClass {
        setOptions(options) {
            super.setOptions(options);

            if (options.renderCollapsible) {
                this.renderCollapsible = options.renderCollapsible;
            }
        }

        renderHTML() {
            return [
                <thead>
                    {this.renderTableHead()}
                </thead>,
                this.renderTableBody()
            ];
        }

        getRowClass() {
            return UI.CollapsibleTableRow;
        }

        getDOMAttributes() {
            let attr = super.getDOMAttributes();
            attr.addClass("ui-collapsible-table");
            return attr;
        }

        setColumns(columns) {
            let collapseColumn = {
                value: (entry) => {
                    let rowClass = this.getRowClass(entry);
                    // TODO: Fix it lad!
                    if (rowClass === UI.CollapsibleTableRow || rowClass.prototype instanceof UI.CollapsibleTableRow) {
                        return <a ref="collapseButton" className="rowCollapseButton collapsed"/>;
                    }
                    return <a ref="collapseButton"/>;
                },
                cellStyle: {
                    width: "1%",
                    "whiteSpace": "nowrap",
                }
            };

            super.setColumns([collapseColumn].concat(columns));
        }
    };
};

UI.CollapsibleTable = UI.CollapsibleTableInterface(UI.Table);
