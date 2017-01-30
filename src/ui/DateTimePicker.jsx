// Very primitive version of a DateTimePicker, still work in progress, not production ready
import {UI} from "UIBase";
import {StemDate} from "Time";

function getTwoDigitsNumber(value) {
    return value < 10 ? "0" + value : String(value);
}

class DateTimePicker extends UI.Element {
    getDefaultOptions() {
        return {
            format: "D/M/Y H:m",
            defaultDate: new StemDate(2017, 0, 6, 16, 30)
        };
    }

    render() {
        return [
            <div className="form-group">
                <div className="input-group date" ref="picker">
                    <UI.FormTextInput ref="textArea" placeholder={this.options.format}
                                      value={this.getStringFromDate(this.options.format, this.options.defaultDate)}/>
                    <span className="input-group-addon">
                        <span className="glyphicon glyphicon-calendar"/>
                    </span>
                </div>
            </div>
        ];
    }

    onMount() {
        super.onMount();
    }

    getStringFromDate(format, date) {
        let str = "";
        for (let i = 0; i < format.length; i += 1) {
            if (format[i] == "Y") {
                str += date.getFullYear();
            } else if (format[i] == "M") {
                str += getTwoDigitsNumber(date.getMonth() + 1);
            } else if (format[i] == "D") {
                str += getTwoDigitsNumber(date.getDate());
            } else if (format[i] == "H") {
                str += getTwoDigitsNumber(date.getHours());
            } else if (format[i] == "m") {
                str += getTwoDigitsNumber(date.getMinutes());
            } else {
                str += format[i];
            }
        }
        return str;
    }

    getDateFromString(format, str) {
        let year, month, day, hour, minute;
        let i = 0, j = 0;
        while (i < format.length && j < str.length) {
            if ((format[i] >= "a" && format[i] <= "z") ||
                (format[i] >= "A" && format[i] <= "Z")) {
                let value = 0;
                if (str[j] < "0" || str[j] > "9") {
                    return;
                }
                while (j < str.length && str[j] >= "0" && str[j] <= "9") {
                    value = value * 10 + parseInt(str[j]);
                    j += 1;
                }
                if (format[i] == "Y") {
                    year = value;
                } else if (format[i] == "M") {
                    month = value - 1;
                } else if (format[i] == "D") {
                    day = value;
                } else if (format[i] == "H") {
                    hour = value;
                } else if (format[i] == "m") {
                    minute = value;
                } else {
                    return;
                }
                i += 1;
            } else {
                if (format[i] != str[j]) {
                    return;
                }
                i += 1;
                j += 1;
            }
        }
        return new StemDate(year, month, day, hour, minute);
    }

    getDate() {
        return this.getDateFromString(this.options.format, this.textArea.getValue());
    }

    getUnixTime() {
        return this.getDate().getTime() / 1000;
    }

    addChangeListener(action) {
        this.addListener("changeDate", (date) => {
            action(date);
        });
    }
}

export {DateTimePicker};
