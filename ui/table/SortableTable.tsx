import {UI, UIElement, UIElementChild} from "../UIBase";
import {Table, TableOptions} from "./Table";
import {defaultComparator} from "../../base/Utils";
import {MakeIcon} from "../SimpleElements";
import {styleRule, StyleSheet} from "../Style";
import {NodeAttributes} from "../NodeAttributes";
import {ColumnHandler} from "../../base/ColumnHandler";


export class SortableTableStyle extends StyleSheet {
    @styleRule
    container = {
        [" th:hover ." + this.sortIcon.getClassName()]: {
            visibility: "inherit",
        },
        " th:hover": {
            cursor: "pointer",
        }
    };

    @styleRule
    sortIcon = {
        position: "absolute",
        right: 0,
        bottom: 0,
        visibility: "hidden",
        float: "right",
    };
}

export interface SortableTableOptions<BaseType> extends TableOptions<BaseType> {
    columnSortingOrder?: ColumnHandler<BaseType>[];
}

export function SortableTableInterface<BaseType, T extends typeof Table<BaseType>>(BaseTableClass: T) {
    class SortableTable extends BaseTableClass {
        sortBy?: ColumnHandler<BaseType>;
        sortDescending?: boolean;
        columnSortingOrder: ColumnHandler<BaseType>[] = [];
        getSortableStyleSheet(): SortableTableStyle {
            return SortableTableStyle.getInstance(this.getTheme()); // Make this optional maybe
        }

        extraNodeAttributes(attr: NodeAttributes): void {
            super.extraNodeAttributes(attr);
            attr.addClass(this.getSortableStyleSheet().container);
        }

        setOptions(options: SortableTableOptions<BaseType>): void {
            super.setOptions(options);

            this.columnSortingOrder = options.columnSortingOrder || [];
        }

        renderColumnHeader(column: ColumnHandler<BaseType>): UIElementChild {
            if (column.noSort) {
                return super.renderColumnHeader(column);
            }
            const sortableStyleSheet = this.getSortableStyleSheet(); // TODO: use properly

            let sortIcon = <span style={{opacity: 0.4}}>{MakeIcon("sort")}</span>;
            if (this.sortBy === column) {
                if (this.sortDescending) {
                    sortIcon = MakeIcon("sort-desc");
                } else {
                    sortIcon = MakeIcon("sort-asc");
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

        sortByColumn(column: ColumnHandler<BaseType>): void {
            if (column === this.sortBy) {
                this.sortDescending = (this.sortDescending != true);
            } else {
                this.sortDescending = true;
            }

            this.sortBy = column;

            this.redraw();
        }

        getComparator(): ((a: BaseType, b: BaseType) => number) | null {
            if (!this.sortBy && this.columnSortingOrder.length === 0) {
                return null;
            }

            const colCmp = (a: BaseType, b: BaseType, column: ColumnHandler<BaseType>, sortDescending?: boolean): number => {
                if (!column) {
                    return 0;
                }

                const keyA = column.rawValue ? column.rawValue(a) : column.value(a);
                const keyB = column.rawValue ? column.rawValue(b) : column.value(b);

                const comparator = column.cmp || defaultComparator;
                const result = comparator(keyA, keyB);
                return sortDescending ? -result : result;
            };

            return (a: BaseType, b: BaseType) => {
                if (this.sortBy) {
                    const cmpRes = colCmp(a, b, this.sortBy, this.sortDescending);
                    if (cmpRes) {
                        return cmpRes;
                    }
                }

                for (const column of this.columnSortingOrder) {
                    const cmpRes = colCmp(a, b, column, (column as any).sortDescending);

                    if (cmpRes) {
                        return cmpRes;
                    }
                }
                return 0;
            }
        }

        sortEntries(entries: BaseType[]): BaseType[] {
            let sortedEntries = entries.slice();

            const comparator = this.getComparator();
            if (comparator) {
                sortedEntries.sort(comparator);
            }

            return sortedEntries;
        }

        getEntries(): BaseType[] {
            return this.sortEntries(super.getEntries());
        }
    }
    return SortableTable;
}

export const SortableTable = SortableTableInterface(Table);
