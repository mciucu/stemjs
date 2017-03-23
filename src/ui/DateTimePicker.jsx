import {UI, TextInput, VolatileFloatingWindow, getOffset, VerticalSlideBar} from "./UI";
import {StemDate, DAY_IN_MILLISECONDS} from "../time/Time";
// import {Button} from "./button/Button";

class DatePickerTable extends UI.Element {

}

class TimePickerWidget extends UI.Element {
    render() {
        let hours = parseInt(this.options.time / (60 * 60 * 1000));
        let minutes = parseInt((this.options.time - 60 * 60 * 1000 * hours) / (60 * 1000));
        let seconds = parseInt((this.options.time - 60 * 60 * 1000 * hours - 60 * 1000 * minutes) / (1000));
        let textSpanStyle = {
            display: "inline-block",
            flex: 1,
            textAlign: "center",
            fontSize: "1.5em",
            fontWeight: "bold",
            padding: "0 5px"
        };
        return [
            <div style={{width: "130px", display: "flex"}}>
                <div style={textSpanStyle} ref="hours" />
                <div style={textSpanStyle}>:</div>
                <div style={textSpanStyle} ref="minutes" />
                <div style={textSpanStyle}>:</div>
                <div style={textSpanStyle} ref="seconds" />
            </div>,
            <div style={{width: "130px", display: "flex"}}>
                <VerticalSlideBar value={hours / 23} ref="hourSlider" height={200} barHeight={5} style={{flex: 1}}/>
                <div style={{flex: 1}}></div>
                <VerticalSlideBar value={minutes / 59} ref="minuteSlider" height={200} barHeight={5} style={{flex: 1}}/>
                <div style={{flex: 1}}></div>
                <VerticalSlideBar value={seconds / 59} ref="secondSlider" height={200} barHeight={5} style={{flex: 1, marginRight: "5px"}}/>
            </div>
        ];
    }

    onMount() {
        let changeCallback = () => {
            let hours = parseInt(this.hourSlider.getValue() * 23);
            let minutes = parseInt(this.minuteSlider.getValue() * 59);
            let seconds = parseInt(this.secondSlider.getValue() * 59);
            this.hours.node.innerHTML = (hours < 10 ? "0" : "") + hours;
            this.minutes.node.innerHTML = (minutes < 10 ? "0" : "") + minutes;
            this.seconds.node.innerHTML = (seconds < 10 ? "0" : "") + seconds;
            let time = (hours * 60 * 60  + minutes * 60 + seconds) * 1000;
            this.dispatch("changeTime", time);
        };
        this.hourSlider.addListener("change", changeCallback);
        this.minuteSlider.addListener("change", changeCallback);
        this.secondSlider.addListener("change", changeCallback);
        changeCallback();
    }
}

class DateTimeWindow extends VolatileFloatingWindow {
    setOptions(options) {
        options.style = Object.assign({
            marginBottom: "5px",
            border: "1px solid #bbb",
            borderRadius: "2px",
            position: "absolute",
            overflow: "auto",
            boxShadow: "0 6px 12px rgba(0,0,0,.175)",
            backgroundColor: "white",
            padding: "10px",
            zIndex: 10000
        }, options.style || {});
        super.setOptions(options);
        this.computeInitial();
    }

    render() {
        return [
            <DatePickerTable ref="datePicker" date={this.date} />,
            <TimePickerWidget ref="timePicker" time={this.time} />
        ];
    }

    computeInitial() {
        let initialDateTime = StemDate.parse(this.formatISO(this.options.initialDateTime)) || StemDate.now();
        this.time = initialDateTime % DAY_IN_MILLISECONDS;
        this.date = parseInt(initialDateTime / DAY_IN_MILLISECONDS);
    }

    formatISO(str) {
        if (!str) {
            return "";
        }
        while (str.indexOf("/") !== -1) {
            str = str.replace("/", " ");
        }
        while (str.indexOf(":") !== -1) {
            str = str.replace(":", " ");
        }
        let tokens = str.split(" ");
        return tokens[2] + "-" + tokens[1] + "-" + tokens[0] + "T" + tokens[3] + ":" + tokens[4] + ":" + tokens[5] + ".000Z";
    }

    getValue() {
        let currentDate = this.time + DAY_IN_MILLISECONDS * this.date;
        currentDate = StemDate.create(currentDate);
        let date = currentDate.toISOString();
        date = date.slice(8, 10) + "/" + date.slice(5, 7) + "/" + date.slice(0, 4);
        return date + " " + currentDate.toTimeString().slice(0, 8);
    }

    onMount() {
        this.options.output.setValue(this.getValue());
        this.datePicker.addListener("changeDate", (date) => {
            this.date = date;
            this.options.output.setValue(this.getValue());
        });
        this.timePicker.addListener("changeTime", (time) => {
            this.time = time;
            this.options.output.setValue(this.getValue());
        });
    }
}

class DateTimePicker extends UI.Element {
    setOptions(options) {
        options.format = options.format || "DD/MM/YYYY HH:mm:ss";
        super.setOptions(options);
        if (this.options.date) {
            this.setDate(this.options.date);
        }
    }

    parseDateFromString(str, format) {
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
            /*<Button ref="calendarSpan" faIcon="calendar"/>*/
        ]
    }

    // onMount() {
    //     this.calendarSpan.addClickListener((event) => {
    //         if (!this.dateTimeWindow) {
    //             let textInputOffset = getOffset(this.textInput);
    //             this.dateTimeWindow = DateTimeWindow.create(document.body, {
    //                 style: {
    //                     top: textInputOffset.top + 5 + this.textInput.getHeight() + "px",
    //                     left: textInputOffset.left + 5 + "px"
    //                 },
    //                 initialDateTime: this.textInput.getValue(),
    //                 output: this.textInput
    //             });
    //         } else {
    //             this.dateTimeWindow.hide();
    //             delete this.dateTimeWindow;
    //         }
    //         event.stopPropagation();
    //     });
    // }
}

export {DateTimePicker};
