import {FileSaver} from "./FileSaver";

const DEFAULT_FILE_NAME = "data.csv";

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
