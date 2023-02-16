// Useful for tables of CSV file utils
// Takes in an array ["Name", obj => obj.field, options] or simply an array of options
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
        columns = columns.filter(x => x); // Remove null or false columns
        return columns.map((column, index) => {
            if (column instanceof ColumnHandler) {
                return column;
            }
            return new ColumnHandler(column, index);
        });
    }

    get name() {
        return this.headerName;
    }
}
