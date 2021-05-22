import {FileSaver} from "./FileSaver";
import {UNICODE_BOM_CHARACTER} from "./Utils";

const DEFAULT_FILE_NAME = "data.csv";

// TODO: this should be a CSV writer, right?
export class CSVBuilder {
    constructor(columns) {
        this.setColumns(columns);
    }

    setColumns(columns) {
        this.columns = columns;
    }

    static escapeEntry(str) {
        str = String(str);
        if (str.includes(",")) {
            // TODO: this doesn't support \n or \r in the string
            str = '"' + str.replace('"', '""') + '"';
        }
        return str;
    }

    getHeaderLine() {
        let str = "";
        for (let index = 0; index < this.columns.length; index++) {
            const column = this.columns[index];
            if (index) {
                str += ",";
            }
            str += this.constructor.escapeEntry(column.name);
        }
        return str;
    }

    getEntryLine(entry) {
        let str = "";
        for (let index = 0; index < this.columns.length; index++) {
            const column = this.columns[index];
            if (index) {
                str += ",";
            }
            str += this.constructor.escapeEntry(column.value(entry));
        }
        return str;
    }

    getText(entries) {
        let text = this.getHeaderLine();
        for (const entry of entries) {
            text += "\n" + this.getEntryLine(entry);
        }
        return text;
    }

    saveFile(entries, fileName=DEFAULT_FILE_NAME) {
        const text = this.getText(entries);
        return FileSaver.saveAs(text, fileName);
    }

    static saveFile(columns, entries, fileName=DEFAULT_FILE_NAME) {
        let builder = new this(columns);
        return builder.saveFile(entries, fileName);
    }
}

export class CSVReader {
    static DELIMITER_AUTO = "auto"; // TODO this needs to be implemented
    static DELIMITER_COMMA = ","; // The only 2 supported delimiters
    static DELIMITER_TAB = "\t";

    constructor({delimiter=CSVReader.DELIMITER_COMMA, multilineInsideQuotes = true, autotrim = true, skipBom=true, validate=true} = {}) {
        this.allowQuotes = true;
        this.delimiter = delimiter;
        this.multilineInsideQuotes = multilineInsideQuotes;
        this.autotrim = autotrim;
        this.skipBom = skipBom;
        this.validate = validate;
    }

    // Run a state machine here
    // The whole input must be provided for now
    // TODO support an input stream, and returning rows to a generator
    readInput(input, delimiter=this.delimiter) {
        let currentIndex = 0;
        let insideQuote = false;

        let currentColumn = "";
        let currentRow = [];
        let rows = [];

        const finishColumn = () => {
            if (this.autotrim) {
                currentColumn = currentColumn.trim();
            }
            currentRow.push(currentColumn);
            currentColumn = "";
        }

        const finishRow = () => {
            if (currentColumn.length === 0 && currentRow.length === 0) {
                // This is an empty row, skipping it
                return;
            }

            if (insideQuote) {
                console.error("Breaking a line inside a quote, wanna enable multilineInsideQuotes?");
                // TODO: throw an error here if enabled
            }

            insideQuote = false;

            finishColumn();
            rows.push(currentRow);
            currentRow = [];
        }

        if (this.skipBom) {
            if (input.charCodeAt(0) === UNICODE_BOM_CHARACTER) {
                currentIndex++;
            }
        }

        for (; currentIndex < input.length; currentIndex++) {
            const currentChar = input[currentIndex];
            const charIsCR = (currentChar === "\r");
            const charIsLF = (currentChar === "\n");
            const charIsQuote = (currentChar === '"');

            if (charIsCR || charIsLF) {
                if (!this.multilineInsideQuotes || !insideQuote) {
                    finishRow();
                    continue;
                }
            }

            if (insideQuote) {
                if (charIsQuote) {
                    if (currentIndex + 1 < input.length && input[currentIndex + 1] === '"') {
                        // Double escaped quotes
                        currentColumn += '"';
                        currentIndex++;
                    } else {
                        insideQuote = false;
                    }
                } else {
                    currentColumn += currentChar;
                }
            } else {
                if (currentChar === delimiter) {
                    currentRow.push(currentColumn);
                    currentColumn = "";
                } else if (charIsQuote && this.allowQuotes) {
                    if (currentColumn.length) {
                        currentColumn += currentChar;
                    } else {
                        insideQuote = true;
                    }
                } else {
                    currentColumn += currentChar;
                }
            }
        }

        finishRow(); // Flush the last row

        if (this.validate) {
            for (const row of rows) {
                if (row.length != rows[0].length) {
                    throw "Row detected with a different number of columns than the header";
                }
            }
        }

        return rows;
    }
}

export class CSVColumnMapper {
    columns = [];

    constructor(headerRow, selectedColumns) {
        selectedColumns = selectedColumns || headerRow.map(x => [x]);
        for (const col of selectedColumns) {
            const mappedColumn = this.makeColumn(headerRow, col);
            if (mappedColumn) {
                this.columns.push(mappedColumn);
            }
        }
    }

    makeColumn(headerRow, column) {
        const key = column[0];
        const alternateNames = column[1] || [key];
        const extraOptions = {
            ...column[2],
        }
        for (let index = 0; index < headerRow.length; index++) {
            for (const name of alternateNames) {
                if (headerRow[index].toLowerCase() === name.toLowerCase()) {
                    return {
                        index,
                        key,
                        ...extraOptions,
                    };
                }
            }
        }
        if (extraOptions.required) {
            throw `Missing column ${extraOptions.key}. Accepted variations (case insensitive): ${alternateNames.join(", ")}`;
        }
        return null;
    }

    // Select only the columns we care about
    toRow(row) {
        this.columns.map(col => row[col.index]);
    }

    toObject(row) {
        let obj = {};
        for (const col of this.columns) {
            const value = row[col.index];
            obj[col.key] = col.loader? col.loader(value) :  value;
        }
        return obj;
    }
}
