// Useful for tables or CSV file utils
// Takes in an array ["Name", obj => obj.field, options] or simply an array of options

import {isNotNullOrFalse} from "./Utils";
import {type StyleObject, type UIChild, type UIElement} from "../ui/UIBase";

// Table.renderEntryCell hands a mapper all four: the entry, where it sits, and the row rendering it
export type ColumnMapper<BaseType, ResultType> =
    (obj: BaseType, rowIndex?: number, columnIndex?: number, row?: UIElement) => ResultType;

// TODO @Mihai this might make sense to templatized, depending on the object type for ColumnMapper
export interface ColumnOptions<BaseType, ResultType = unknown> {
    isToggleColumn?: boolean; // Set by the collapsible table on the column it prepends
    headerName?: UIChild | (() => UIChild);
    value?: ColumnMapper<BaseType, ResultType>;
    name?: string;
    index?: number;
    cellStyle?: string | StyleObject;
    headerStyle?: string | StyleObject;
    noSort?: boolean;
    sortDescending?: boolean;
    // What the sort compares instead of the rendered value, when that is a label rather than the thing itself
    rawValue?: ColumnMapper<BaseType, ResultType>;
    cmp?: (a: ResultType, b: ResultType) => number;
    // Still open: MarkupTable's fieldName and a scoreboard header that carries its own toString both ride here
    [key: string]: any;
}

// The header is whatever the options field takes, not just a string: the constructor assigns it straight over
export type ColumnTuple<BaseType, ResultType = unknown> =
    [ColumnOptions<BaseType, ResultType>["headerName"], ColumnMapper<BaseType, ResultType>, ColumnOptions<BaseType, ResultType>?];
export type ColumnInput<BaseType, ResultType = unknown> = ColumnOptions<BaseType, ResultType> | ColumnTuple<BaseType, ResultType>;
export type ColumnLike<BaseType, ResultType = unknown> = ColumnHandler<BaseType, ResultType> | ColumnInput<BaseType, ResultType> | null | undefined | false;

export class ColumnHandler<BaseType, ResultType = unknown> implements ColumnOptions<BaseType, ResultType> {
    [key: string]: any;

    constructor(options: ColumnInput<BaseType, ResultType>, index?: number) {
        if (Array.isArray(options)) {
            const [headerName, value, additionalOptions] = options;
            options = {
                headerName,
                value,
                ...(additionalOptions || {}),
            };
        }
        Object.assign(this, options);
        if (index != null) {
            this.index = index;
        }
        this.name = this.name || this.headerName;
    }

    // Asked here because a column is written in several forms and only some of them carry the flag
    static isToggleColumn(column: ColumnLike<any>): boolean {
        return Boolean((column as ColumnOptions<any>)?.isToggleColumn);
    }

    // If an entry already as a ColumnHandler, it's left as-is
    static mapColumns<BaseType>(columns: ColumnLike<BaseType>[]): ColumnHandler<BaseType>[] {
        const filteredColumns = columns.filter(isNotNullOrFalse);
        return filteredColumns.map((column, index) => {
            if (column instanceof ColumnHandler) {
                return column;
            }
            return new ColumnHandler(column, index);
        });
    }
}
