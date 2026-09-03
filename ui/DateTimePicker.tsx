// TODO deprecate
import {UI} from "./UIBase";
import {TextInput} from "./input/Input";
import {StemDate} from "../time/Time";

interface DateTimePickerOptions {
    format?: string;
    date?: StemDate;
    dateString?: string;
}

export class DateTimePicker extends UI.Element<DateTimePickerOptions> {
    declare textInput?: TextInput;

    setOptions(options: typeof this.options) {
        options.format = options.format || "DD/MM/YYYY HH:mm:ss";
        super.setOptions(options);
        if (this.options.date) {
            this.setDate(this.options.date);
        }
    }

    parseDateFromString(str: string, format) {
        if (format !== "DD/MM/YYYY HH:mm:ss") {
            throw Error("Format not supported!");
        }
        // Just parsing DD/MM/YYYY HH:mm:ss for now
        while (str.indexOf('/') !== -1) {
            str = str.replace('/', ' ');
        }
        while (str.indexOf(':') !== -1) {
            str = str.replace(':', ' ');
        }
        let tokens = str.split(' ');
        let integerTokens = [];
        for (let token of tokens) {
            let number = parseFloat(token);
            if (!isNaN(number)) {
                integerTokens.push(number);
            }
        }
        let years = (integerTokens.length >= 3 ? integerTokens[2] : 0);
        let months = (integerTokens.length >= 2 ? integerTokens[1] - 1 : 0);
        let days = (integerTokens.length >= 1 ? integerTokens[0] : 0);
        let hours = (integerTokens.length >= 4 ? integerTokens[3] : 0);
        let minutes = (integerTokens.length >= 5 ? integerTokens[4] : 0);
        let seconds = (integerTokens.length >= 6 ? integerTokens[5] : 0);
        let date = new StemDate(years, months, days, hours, minutes, seconds);
        if (!date.getTime()) {
            return null;
        }
        return date;
    }

    getDate() {
        let str = this.textInput.getValue();
        if (!str) {
            return null;
        }
        let format = this.options.format;
        return this.parseDateFromString(str, format);
    }

    setDate(date) {
        this.options.date = date;
        this.options.dateString = date.format(this.options.format);
        if (this.textInput) {
            this.textInput.setValue(this.options.dateString);
        }
    }

    render() {
        return [
            <TextInput ref="textInput" placeholder={this.options.format} value={this.options.dateString || ""} />,
        ]
    }
}
