import {padNumber, suffixWithOrdinal, extendsNative, instantiateNative, isNumber} from "../base/Utils";
import {TimeUnit, Duration} from "./Duration";

// MAX_UNIX_TIME is either Feb 2106 in unix seconds or Feb 1970 in unix milliseconds
// Any value less than this is interpreted as a unix time in seconds
// If you want to go around this behavious, you can pass in a new Date(value) to your constructor
// Of set this value to 0
export let MAX_AUTO_UNIX_TIME = Math.pow(2, 32);

const BaseDate = self.Date;

@extendsNative
class StemDate extends BaseDate {
    // Still need to do this mess because of Babel, should be removed when moving to native ES6
    static create(value) {
        // Try to do an educated guess if this date is in unix seconds or milliseconds
        if (arguments.length === 1 && isNumber(value) && value < MAX_AUTO_UNIX_TIME) {
            return instantiateNative(BaseDate, StemDate, value * 1000.0);
        } else {
            return instantiateNative(BaseDate, StemDate, ...arguments);
        }
    }

    static toDate(date) {
        if (date instanceof StemDate) {
            return date;
        } else {
            return new this(date);
        }
    }

    toDate() {
        return this;
    }

    static fromUnixMilliseconds(unixMilliseconds) {
        return this.create(new BaseDate(unixMilliseconds));
    }

    static fromUnixSeconds(unixSecons) {
        return this.fromUnixMilliseconds(unixSecons * 1000);
    }

    // You don't usually need to call this in most cases, constructor uses MAX_AUX_UNIX_TIME
    static unix(unixTime) {
        return this.fromUnixSeconds(unixTime);
    }

    set(date) {
        date = this.constructor.toDate(date);
        this.setTime(date.setTime());
    }

    clone() {
        return new this.constructor(this.getTime());
    }

    toUnix() {
        return this.getTime() / 1000;
    }

    unix() {
        return Math.floor(this.toUnix());
    }

    isBefore(date) {
        return this.getTime() < StemDate.toDate(date).getTime();
    }

    equals(date) {
        return this.getTime() === StemDate.toDate(date).getTime();
    }

    get(timeUnit) {
        timeUnit = TimeUnit.toTimeUnit(timeUnit);
        return timeUnit.getDateValue(this);
    }

    isSame(date, timeUnit) {
        if (!timeUnit) {
            return this.equals(date);
        }

        timeUnit = TimeUnit.toTimeUnit(timeUnit);
        date = this.constructor.toDate(date);
        let diff = this.diff(date);
        if (timeUnit.isAbsolute() && diff > +timeUnit) {
            return false;
        }
        return this.get(timeUnit) == date.get(timeUnit);
    }

    isAfter(date) {
        return this.getTime() > StemDate.toDate(date).getTime();
    }

    isSameOrBefore(date) {
        return this.isBefore(date) || this.equals(date);
    }

    isSameOrAfter(date) {
        return this.isAfter(date) || this.equals(date);
    }

    isBetween(a, b) {
        return this.isSameOrAfter(a) && this.isSameOrBefore(b);
    }

    getWeekDay() {
        return this.getDay();
    }

    addUnit(timeUnit, count = 1) {
        timeUnit = TimeUnit.toTimeUnit(timeUnit);
        count = parseInt(count);

        if (!timeUnit.isVariable()) {
            this.setTime(this.getTime() + timeUnit.getMilliseconds() * count);
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

    static min() {
        // TODO: simplify and remove code duplication
        let result = this.constructor.toDate(arguments[0]);
        for (let index = 1; index < arguments.length; index++) {
            let candidate = this.constructor.toDate(arguments[index]);
            if (candidate.isBefore(result)) {
                result = candidate;
            }
        }
        return result;
    }

    static max() {
        let result = this.constructor.toDate(arguments[0]);
        for (let index = 1; index < arguments.length; index++) {
            let candidate = this.constructor.toDate(arguments[index]);
            if (candidate.isAfter(result)) {
                result = candidate;
            }
        }
        return result;
    }

    // Assign the given date if current value if greater than it
    capUp(date) {
        date = this.constructor.toDate(date);
        if (this.isAfter(date)) {
            this.set(date);
        }
    }

    // Assign the given date if current value if less than it
    capDown(date) {
        date = this.constructor.toDate(date);
        if (this.isBefore(date)) {
            this.set(date);
        }
    }

    roundDown(timeUnit) {
        timeUnit = TimeUnit.toTimeUnit(timeUnit);
        // TODO: this is wrong for semester, etc, should be different then
        while (timeUnit = timeUnit.baseUnit) {
            this["set" + timeUnit.dateMethodSuffix](0);
        }
        return this;
    }

    roundUp(timeUnit) {
        const roundDown = this.clone().roundDown(timeUnit);
        if (this.equals(roundDown)) {
            this.set(roundDown);
            return this;
        }
        this.addUnit(timeUnit);
        return this.roundDown(timeUnit);
    }


    round(timeUnit) {
        let roundUp = this.clone().roundUp(timeUnit);
        let roundDown = this.clone().roundDown(timeUnit);
        // At a tie, preffer to round up, that's where time's going
        if (this.diff(roundUp) <= this.diff(roundDown)) {
            this.setTime(roundUp.getTime());
        } else {
            this.setTime(roundDown.getTime());
        }
        return this;
    }

    add(duration) {
        duration = Duration.toDuration(duration);
        if (duration.isAbsolute()) {
            this.setTime(this.getTime() + duration.toMilliseconds());
            return this;
        }
        for (const key in duration) {
            const timeUnit = TimeUnit.CANONICAL[key];
            if (timeUnit) {
                this.addUnit(timeUnit, duration[key]);
            }
        }
        return this;
    }

    subtract(duration) {
        duration = Duration.toDuration(duration).negate();
        return this.add(duration);
    }

    diffDuration(date) {
        return new Duration(this.diff(date));
    }

    diff(date) {
        date = this.constructor.toDate(date);
        return Math.abs(+this - date);
    }

    // Just to keep moment compatibility, until we actually implement locales
    locale(loc) {
        return this;
    }

    static splitToTokens(str) {
        // TODO: Support [ and ]
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
        return this.constructor.fromUnixMilliseconds(+this + this.getTimezoneOffset() * 60 * 1000);
    }

    isLeapYear() {
        let year = this.getFullYear();
        return (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0));
    }

    daysInMonth() {
        let lastDayInMonth = new BaseDate(this.getFullYear(), this.getMonth() + 1, 0);
        return lastDayInMonth.getDate();
    }
}

const miniWeekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const shortWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const longWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const longMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

class DateLocale {
    constructor(obj={}) {
        Object.assign(this, obj);
        this.formats = this.formats || {};
    }

    getFormat(longDate) {
        return this.formats[longDate];
    }

    setFormat(pattern, func) {
        this.formats[pattern] = func;
    }

    format(date, pattern) {
        return date.format(pattern);
    }

    getRelativeTime() {
        throw Error("Not implemented");
    }
}

StemDate.tokenFormattersMap = new Map([
    ["ISO8601", date => date.toISOString()],

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

    ["S", date => Math.floor(date.getMilliseconds() / 100)],
    ["SS", date => padNumber(Math.floor(date.getMilliseconds() / 10), 2)],
    ["SSS", date => padNumber(date.getMilliseconds(), 3)],
    ["ms", date => padNumber(date.getMilliseconds(), 3)],

    ["LL", date => date.format("MMMM Do, YYYY")],
]);

let Date = StemDate;

export {Date, StemDate};
