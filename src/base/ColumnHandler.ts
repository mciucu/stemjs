// Useful for tables or CSV file utils
// Takes in an array ["Name", obj => obj.field, options] or simply an array of options

import {isNotNullOrFalse} from "./Utils";

type ColumnMapper = (obj: any) => any;

type ColumnOptions = {
    headerName?: string;
    value?: ColumnMapper;
    name?: string;
    index?: number;
    [key: string]: any;
};

type ColumnInput = ColumnOptions | [string, ColumnMapper, ColumnOptions?];

export class ColumnHandler {
    headerName?: string;
    value?: ColumnMapper;
    name?: string;
    index?: number;
    [key: string]: any;

    constructor(options: ColumnInput, index?: number) {
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
    static mapColumns(columns: (ColumnInput | ColumnHandler | null | false)[]): ColumnHandler[] {
        const filteredColumns = columns.filter(isNotNullOrFalse);
        return filteredColumns.map((column, index) => {
            if (column instanceof ColumnHandler) {
                return column;
            }
            return new ColumnHandler(column, index);
        });
    }
}
