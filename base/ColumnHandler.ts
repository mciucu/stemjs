// Useful for tables or CSV file utils
// Takes in an array ["Name", obj => obj.field, options] or simply an array of options

import {isNotNullOrFalse} from "./Utils";

export type ColumnMapper<BaseType, ResultType> = (obj: BaseType) => ResultType;

// TODO @Mihai this might make sense to templatized, depending on the object type for ColumnMapper
export interface ColumnOptions<BaseType, ResultType> {
    headerName?: string;
    value?: ColumnMapper<BaseType, ResultType>;
    name?: string;
    index?: number;
    [key: string]: any;
}

export type ColumnInput<BaseType, ResultType = any> = ColumnOptions<BaseType, ResultType> | [string, ColumnMapper<BaseType, ResultType>, ColumnOptions<BaseType, ResultType>?];
export type ColumnLike<BaseType, ResultType = any> = ColumnHandler<BaseType, any> | ColumnInput<BaseType, any> | null | undefined | false;

export class ColumnHandler<BaseType, ResultType = any> implements ColumnOptions<BaseType, ResultType> {
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
