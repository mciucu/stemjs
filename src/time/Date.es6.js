import {padNumber, suffixWithOrdinal, extendsNative, instantiateNative, isNumber} from "../base/Utils";
import {TimeUnit, Duration} from "./Duration";

// MAX_UNIX_TIME is either Feb 2106 in unix seconds or Feb 1970 in unix milliseconds
// Any value less than this is interpreted as a unix time in seconds
// If you want to go around this behavious, you can pass in a new Date(value) to your constructor
// Of set this value to 0
export let MAX_AUTO_UNIX_TIME = Math.pow(2, 32);

@extendsNative
class StemDate extends window.Date {
    // Still need to do this mess because of Babel, should be removed when moving to native ES6
    static create(value) {
        // Try to do an educated guess if this date is in unix seconds or milliseconds
        if (arguments.length === 1 && isNumber(value) && value < MAX_AUTO_UNIX_TIME) {
            return instantiateNative(window.Date, StemDate, value * 1000.0);
        } else {
            return instantiateNative(window.Date, StemDate, ...arguments);
        }
    }

    static toDate(date) {
        if (date instanceof StemDate) {
            return date;
        } else {
            return new this(date);
        }
    }

    static toDuration(duration) {
        if (duration instanceof window.Date) {
            return new Duration(duration.getMilliseconds());
        } else {
            return Duration.toDuration(duration);
        }
    }

    // You don't usually need to call this in most cases, constructor uses MAX_AUX_UNIX_TIME
    static unix(unixTime) {
        return new this(unixTime * 1000);
    }

    clone() {
        return new this.constructor(this.getTime());
    }

    toUnix() {
        return this.getTime() / 1000;
    }

    unix() {
        return Math.round(this.toUnix());
    }

    isBefore(date) {
        return this.getTime() < StemDate.toDate(date).getTime();
    }

    equals(date) {
        return this.getTime() === StemDate.toDate(date).getTime();
    }

    isAfter(date) {
        return this.getTime() > StemDate.toDate(date).getTime();
    }

    getWeekDay() {
        return this.getDay();
    }

    addUnit(timeUnit, count = 1) {
        count = parseInt(count);
        timeUnit = TimeUnit.toTimeUnit(timeUnit);
        if (!timeUnit.isVariable()) {
            this.setMilliseconds(this.getMilliseconds() + timeUnit.getMilliseconds());
            return this;
        }
        while (!timeUnit.dateMethodSuffix) {
            count *= timeUnit.multiplier;
            timeUnit = timeUnit.baseUnit;
        }
        const dateMethodSuffix = timeUnit.dateMethodSuffix;
        const currentValue = this["get" + dateMethodSuffix]();
        this["set" + dateMethodSuffix](currentValue + count);
        return this;
    }

    roundUp(timeUnit) {
        timeUnit = TimeUnit.toTimeUnit(timeUnit);
        throw Error("Not implemented");
    }

    rountDown(timeUnit) {
        timeUnit = TimeUnit.toTimeUnit(timeUnit);
        throw Error("Not implemented");
    }

    add(duration) {
        duration = Duration.toDuration(duration);
        if (duration.isAbsolute()) {
            this.setMilliseconds(this.getMilliseconds() + duration.toMilliseconds());
            return this;
        }
        for (const key in duration) {
            const timeUnit = Duration.TIME_UNITS[key];
            if (timeUnit) {
                this.addUnit(timeUnit, duration[key]);
            }
        }
        return this;
    }

    subtract(duration) {
        // We can also subtract a date
        duration = this.constructor.toDuration(duration).negate();
        return this.add(duration);
    }

    difference(date) {
        if (!(date instanceof window.Date)) {
            throw Error("StemDate difference needs to take in a date");
        }
        return this.subtract(date).abs();
    }

    diff(date) {
        return +this.difference(date);
    }

    // Just to keep moment compatibility, until we actually implement locales
    locale(loc) {
        return this;
    }

    static splitToTokens(str) {
        let tokens = [];
        let lastIsLetter = null;
        for (let i = 0; i < str.length; i++) {
            let charCode = str.charCodeAt(i);
            let isLetter = (65 <= charCode && charCode <= 90) || (97 <= charCode && charCode <= 122);
            if (isLetter === lastIsLetter) {
                tokens[tokens.length - 1] += str[i];
            } else {
                tokens.push(str[i]);
            }
            lastIsLetter = isLetter;
        }
        return tokens;
    }

    evalToken(token) {
        let func = this.constructor.tokenFormattersMap.get(token);
        if (!func) {
            return token;
        }
        return func(this);
    }

    format(str="ISO8601") {
        let tokens = this.constructor.splitToTokens(str);
        tokens = tokens.map(token => this.evalToken(token));
        return tokens.join("");
    }

    isValid() {
        return (this.toString() !== "Invalid Date");
    }

    utc() {
        // Temp hack
        return new this.constructor(+this + this.getTimezoneOffset() * 60 * 1000);
    }
}

const miniWeekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const shortWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const longWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const longMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

StemDate.tokenFormattersMap = new Map([
    ["ISO8601", date => date.toString()], // TODO: implement ISO format
    ["Y", date => date.getFullYear()],
    ["YY", date => padNumber(date.getFullYear() % 100, 2)],
    ["YYYY", date => date.getFullYear()],
    ["M", date => (date.getMonth() + 1)],
    ["MM", date => padNumber(date.getMonth() + 1, 2)],
    ["MMM", date => shortMonths[date.getMonth()]],
    ["MMMM", date => longMonths[date.getMonth()]],
    ["D", date => date.getDate()],
    ["Do", date => suffixWithOrdinal(date.getDate())],
    ["DD", date => padNumber(date.getDate(), 2)],

    ["d", date => date.getWeekDay()],
    ["do", date => suffixWithOrdinal(date.getWeekDay())],
    ["dd", date => miniWeekDays[date.getWeekDay()]],
    ["ddd", date => shortWeekDays[date.getWeekDay()]],
    ["dddd", date => longWeekdays[date.getWeekDay()]],
    ["H", date => date.getHours()],
    ["HH", date => padNumber(date.getHours(), 2)],
    ["h", date => date.getHours() % 12],
    ["hh", date => padNumber(date.getHours() % 12, 2)],
    ["m", date => date.getMinutes()],
    ["mm", date => padNumber(date.getMinutes(), 2)],
    ["s", date => date.getSeconds()],
    ["ss", date => padNumber(date.getSeconds(), 2)],

    ["LL", date => date.format("MMMM Do, YYYY")],
]);

let Date = StemDate;

export {Date, StemDate};
