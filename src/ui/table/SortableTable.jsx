import {UI} from "../UIBase";
import {SortableTableStyle} from "./Style";
import {FASortIcon} from "../FontAwesome";
import {Table} from "./Table";
import {defaultComparator} from "../../base/Utils";
import {Direction} from "../Constants";

function SortableTableInterface(BaseTableClass, SortIconClass = FASortIcon) {
    class SortableTable extends BaseTableClass {
        getSortableStyleSheet() {
            return SortableTableStyle.getInstance(); // Make this optional maybe
        }

        extraNodeAttributes(attr) {
            super.extraNodeAttributes(attr);
            attr.addClass(this.getSortableStyleSheet().table);
        }

        setOptions(options) {
            super.setOptions(options);

            this.columnSortingOrder = options.columnSortingOrder || [];
        }

        renderColumnHeader(column) {
            const sortableStyleSheet = this.getSortableStyleSheet();
            let sortIcon = <SortIconClass className={sortableStyleSheet.sortIcon}/>;
            if (this.sortBy === column) {
                if (this.sortDescending) {
                    sortIcon = <SortIconClass className={sortableStyleSheet.sortIcon} style={{visibility: "inherit"}} direction={Direction.DOWN}/>;
                } else {
                    sortIcon = <SortIconClass className={sortableStyleSheet.sortIcon} style={{visibility: "inherit"}} direction={Direction.UP}/>;
                }
            }

            const reorderCallback = () => {
                this.sortByColumn(column);
                this.dispatch("reorder");
            }

            return <div style={{position: "relative"}} onClick={reorderCallback}>
                {super.renderColumnHeader(column)} {sortIcon}
            </div>;
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

        getComparator() {
            if (!this.sortBy && this.columnSortingOrder.length === 0) {
                return null;
            }

            const colCmp = (a, b, col) => {
                if (!col) return 0;

                let keyA = col.rawValue ? col.rawValue(a) : col.value(a);
                let keyB = col.rawValue ? col.rawValue(b) : col.value(b);
                return col.cmp(keyA, keyB);
            };

            return (a, b) => {
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
            }
        }

        sortEntries(entries) {
            let sortedEntries = entries.slice();

            const comparator = this.getComparator();
            if (comparator) {
                sortedEntries.sort(comparator);
            }

            return sortedEntries;
        }

        getEntries() {
            return this.sortEntries(super.getEntries());
        }

        // TODO @branch fix this
        columnDefaults(column, index) {
            super.columnDefaults(column, index);

            if (!column.hasOwnProperty("cmp")) {
                column.cmp = defaultComparator;
            }
        }
    }
    return SortableTable;
}

let SortableTable = SortableTableInterface(Table);

export {SortableTable, SortableTableInterface};
