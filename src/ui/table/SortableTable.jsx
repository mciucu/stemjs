import {UI} from "../UIBase";
import {Table} from "./Table";
import {defaultComparator} from "../../base/Utils";

UI.SortableTableInterface = function(BaseTableClass) {
    return class SortableTable extends BaseTableClass {
        setOptions(options) {
            super.setOptions(options);

            this.columnSortingOrder = options.columnSortingOrder || [];
        }

        extraNodeAttributes(attr) {
            // TODO: use StyleSheet
            attr.addClass("ui-sortable-table");
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
                column.cmp = defaultComparator;
            }
        }
    };
};

UI.SortableTable = UI.SortableTableInterface(Table);
