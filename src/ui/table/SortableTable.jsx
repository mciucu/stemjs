import {UI} from "../UIBase";
import {SortableTableStyle} from "./Style";
import {Table} from "./Table";
import {defaultComparator} from "../../base/Utils";
import {MakeIcon} from "../SimpleElements.jsx";

function SortableTableInterface(BaseTableClass) {
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
            if (column.noSort) {
                return super.renderColumnHeader(column);
            }
            const sortableStyleSheet = this.getSortableStyleSheet();
            let sortIcon =<span style={{opacity: 0.4}}>{MakeIcon("sort")}</span>;
            if (this.sortBy === column) {
                if (this.sortDescending) {
                    sortIcon = MakeIcon("sort-desc");
                } else {
                    sortIcon = MakeIcon("sort-asc");
                }
            }
            // sortIcon = <span className={sortableStyleSheet.sortIcon}>{sortIcon}</span>;

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

            const colCmp = (a, b, column, sortDescending) => {
                if (!column) {
                    return 0;
                }

                const keyA = column.rawValue ? column.rawValue(a) : column.value(a);
                const keyB = column.rawValue ? column.rawValue(b) : column.value(b);

                const comparator = column.cmp || defaultComparator;
                const result = comparator(keyA, keyB);
                return sortDescending ? -result : result;
            };

            return (a, b) => {
                if (this.sortBy) {
                    const cmpRes = colCmp(a, b, this.sortBy, this.sortDescending);
                    if (cmpRes) {
                        return cmpRes;
                    }
                }

                for (const column of this.columnSortingOrder) {
                    const cmpRes = colCmp(a, b, column, column.sortDescending);

                    if (cmpRes) {
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
    }
    return SortableTable;
}

let SortableTable = SortableTableInterface(Table);

export {SortableTable, SortableTableInterface};
