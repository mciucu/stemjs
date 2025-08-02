import {FileSaver} from "./FileSaver";
import {UNICODE_BOM_CHARACTER} from "./Utils";
import {ColumnHandler, ColumnInput} from "./ColumnHandler";

const DEFAULT_FILE_NAME = "data.csv";

// Type definitions
type CSVRow = string[];

interface CSVReaderOptions {
    delimiter?: string;
    multilineInsideQuotes?: boolean;
    autotrim?: boolean;
    skipBom?: boolean;
    validate?: boolean;
}

interface CSVColumn {
    index: number;
    key: string;
    originalName: string;
    required?: boolean;
    loader?: (value: string) => any;
    [key: string]: any;
}

type CSVColumnInput = [string | string[], Record<string, any>?];

// TODO: this should be a CSV writer, right?
export class CSVBuilder<BaseType> {
    private columns: ColumnHandler<BaseType>[];

    constructor(columns: (ColumnInput<BaseType> | ColumnHandler<BaseType> | null | false)[]) {
        this.setColumns(columns);
    }

    setColumns(columns: (ColumnInput<BaseType> | ColumnHandler<BaseType> | null | false)[]): void {
        this.columns = ColumnHandler.mapColumns(columns);
    }

    static escapeEntry(str: any): string {
        str = String(str);
        if (str.includes(",")) {
            // TODO: this doesn't support \n or \r in the string
            str = '"' + str.replace('"', '""') + '"';
        }
        return str;
    }

    getHeaderLine(): string {
        let str = "";
        for (let index = 0; index < this.columns.length; index++) {
            const column = this.columns[index];
            if (index) {
                str += ",";
            }
            str += (this.constructor as typeof CSVBuilder).escapeEntry(column.name);
        }
        return str;
    }

    getEntryLine(entry: BaseType): string {
        let str = "";
        for (let index = 0; index < this.columns.length; index++) {
            const column = this.columns[index];
            if (index) {
                str += ",";
            }
            str += (this.constructor as typeof CSVBuilder).escapeEntry(column.value(entry));
        }
        return str;
    }

    getText(entries: BaseType[]): string {
        let text = this.getHeaderLine();
        for (const entry of entries) {
            text += "\n" + this.getEntryLine(entry);
        }
        return text;
    }

    saveFile(entries: BaseType[], fileName: string = DEFAULT_FILE_NAME): FileSaver {
        const text = this.getText(entries);
        return FileSaver.saveAs(text, fileName);
    }

    static saveFile<BaseType>(columns: (ColumnInput<BaseType> | ColumnHandler<BaseType> | null | false)[], entries: BaseType[], fileName: string = DEFAULT_FILE_NAME): FileSaver {
        let builder = new this(columns);
        return builder.saveFile(entries, fileName);
    }
}

export class CSVReader {
    static readonly DELIMITER_AUTO = "auto"; // TODO this needs to be implemented
    static readonly DELIMITER_COMMA = ","; // The only 2 supported delimiters
    static readonly DELIMITER_TAB = "\t";

    private allowQuotes: boolean;
    private delimiter: string;
    private multilineInsideQuotes: boolean;
    private autotrim: boolean;
    private skipBom: boolean;
    private validate: boolean;

    constructor({delimiter = CSVReader.DELIMITER_COMMA, multilineInsideQuotes = true, autotrim = true, skipBom = true, validate = true}: CSVReaderOptions = {}) {
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
    readInput(input: string, delimiter: string = this.delimiter): CSVRow[] {
        let currentIndex = 0;
        let insideQuote = false;

        let currentColumn = "";
        let currentRow: string[] = [];
        let rows: CSVRow[] = [];

        const finishColumn = (): void => {
            if (this.autotrim) {
                currentColumn = currentColumn.trim();
            }
            currentRow.push(currentColumn);
            currentColumn = "";
        };

        const finishRow = (): void => {
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
        };

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
                if (row.length !== rows[0].length) {
                    throw new Error("Row detected with a different number of columns than the header");
                }
            }
        }

        return rows;
    }
}

export class CSVColumnMapper {
    columns: CSVColumn[] = [];
    private headerRow: string[];

    constructor(headerRow: string[], selectedColumns?: CSVColumnInput[]) {
        this.headerRow = headerRow;
        selectedColumns = selectedColumns || headerRow.map(x => [x]);
        for (const col of selectedColumns) {
            const mappedColumn = this.makeColumn(headerRow, col);
            if (mappedColumn) {
                this.columns.push(mappedColumn);
            }
        }
    }

    numColumns(): number {
        return this.columns.length;
    }

    numOriginalColumns(): number {
        return this.headerRow.length;
    }

    makeColumn(headerRow: string[], column: CSVColumnInput): CSVColumn | null {
        const nameVariations = Array.isArray(column[0]) ? column[0] : [column[0]];
        const key = nameVariations[0];
        const extraOptions = {
            ...column[1],
        };
        for (let index = 0; index < headerRow.length; index++) {
            for (const name of nameVariations) {
                if (headerRow[index].toLowerCase() === name.toLowerCase()) {
                    return {
                        index,
                        key,
                        originalName: headerRow[index],
                        ...extraOptions,
                    };
                }
            }
        }
        if (extraOptions.required) {
            let errorMessage = `The file needs to have a column labeled ${key}.`;
            errorMessage += ` Accepted variations (case insensitive): ${nameVariations.join(", ")}`;
            throw new Error(errorMessage);
        }
        return null;
    }

    // Select only the columns we care about
    toRow(row: string[]): string[] {
        return this.columns.map(col => row[col.index]);
    }

    toObject(row: string[]): Record<string, any> {
        let obj: Record<string, any> = {};
        for (const col of this.columns) {
            const value = row[col.index];
            obj[col.key] = col.loader ? col.loader(value) : value;
        }
        return obj;
    }
}
