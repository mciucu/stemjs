import {padNumber, suffixWithOrdinal, isNumber, isString} from "../base/Utils";
import {TimeUnit, Duration} from "./Duration";
import {TokenFormatter} from "./Formatter.js";

// By default, StemDate will guess if the value is in milliseconds or seconds.
// Any value less than this is interpreted as a unix time in seconds
// If you want to go around this behavior, you can use the static method .fromUnixMilliseconds()
// To disable, set this value to 0
export let MAX_AUTO_UNIX_TIME = Math.pow(2, 32); // Either ~Feb 2106 in unix seconds or ~Feb 1970 in unix milliseconds

let DEFAULT_DATE_FORMAT = "ISO";

export function SetDefaultDateFormat(dateFormat) {
    DEFAULT_DATE_FORMAT = dateFormat;
}

const BaseDate = self.Date;

class StemDate extends BaseDate {
    // This is only to let the IDE know that this class can receive arguments.
    constructor(...args) {
        super(...args);
        if (args.length === 1 && isNumber(args[0]) && this.valueOf() < MAX_AUTO_UNIX_TIME) {
            this.setTime(this.valueOf() * 1000);
        }
    }

    static create(value) {
        return new this(value);
    }

    // Return a StemDate from the object, else return value if falsy
    static optionally(value) {
        return (value != null) ? this.create(value) : value;
    }

    static toDate(date) {
        if (date instanceof StemDate) {
            return date;
        } else {
            return new this(date);
        }
    }

    // Contract change: Date.now() returns a time in milliseconds, while we return an actual date
    static now() {
        return new this(BaseDate.now());
    }

    toBaseString() {
        return super.toString();
    }

    toString() {
        if (!DEFAULT_DATE_FORMAT) {
            return this.toBaseString();
        }
        
        if (isString(DEFAULT_DATE_FORMAT)) {
            return this.format(DEFAULT_DATE_FORMAT);
        }

        return DEFAULT_DATE_FORMAT(this);
    }

    static fromUnixMilliseconds(unixMilliseconds) {
        return this.create(new BaseDate(unixMilliseconds));
    }

    static fromUnixSeconds(unixSeconds) {
        return this.fromUnixMilliseconds(unixSeconds * 1000);
    }

    // You don't usually need to call this in most cases, constructor uses MAX_AUX_UNIX_TIME
    static unix(unixTime) {
        return this.fromUnixSeconds(unixTime);
    }

    // Creates a Date object from an instance of DOMHighResTimeStamp, returned by performance.now() for instance
    static fromHighResTimestamp(highResTimestamp) {
        return this.fromUnixMilliseconds(highResTimestamp + self.performance.timing.navigationStart)
    }

    set(date) {
        date = this.constructor.toDate(date);
        this.setTime(date.getTime());
        return this;
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
        if (diff >= 2 * timeUnit) {
            // If the distance between the two dates is more than 2 standard lengths of the time unit
            // This would be wrong if you would have time unit that can sometimes last more than twice their canonical duration
            // Works correctly for all implemented time units
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
            timeUnit.setDateValue(this, 0);
        }
        return this;
    }

    roundUp(timeUnit) {
        const roundDown = this.clone().roundDown(timeUnit);
        if (this.equals(roundDown)) {
            return this.set(roundDown);
        }
        this.addUnit(timeUnit);
        return this.roundDown(timeUnit);
    }

    round(timeUnit) {
        let roundUp = this.clone().roundUp(timeUnit);
        let roundDown = this.clone().roundDown(timeUnit);
        // On a tie we round up, as that's where time is flowing towards in our human perception of "reality"
        if (this.diff(roundUp) <= this.diff(roundDown)) {
            this.setTime(roundUp.getTime());
        } else {
            this.setTime(roundDown.getTime());
        }
        return this;
    }

    // TODO @branch have all of these return a new objects and have dates immutable
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

    // TODO deprecate this
    diffDuration(date) {
        return new Duration(this.diff(date));
    }

    // The different in absolute value
    diff(date, inAbsolute= true) {
        date = this.constructor.toDate(date);
        let diffMilliseconds = +this - date;
        if (inAbsolute) {
            diffMilliseconds = Math.abs(diffMilliseconds);
        }
        return new Duration(diffMilliseconds);
    }

    // Just to keep moment compatibility, until we actually implement locales
    locale(loc) {
        return this;
    }

    format(str = DEFAULT_DATE_FORMAT) {
        return this.constructor.formatter.format(this, str);
    }

    static format(date, str) {
        return StemDate.toDate(date).format(str);
    }

    isValid() {
        return super.toString() != "Invalid Date";
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
        // The 0th day of the next months is actually the last day in the current month
        let lastDayInMonth = new BaseDate(this.getFullYear(), this.getMonth() + 1, 0);
        return lastDayInMonth.getDate();
    }

    getDaysCountPerMonth(index) {
        const months = [31, 28 + this.isLeapYear(), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        return months[index];
    }

    getDayInYear() {
        const month = this.getMonth();
        let totalDays = 0;
        for (let i = 0; i < month; i += 1) {
            totalDays += this.getDaysCountPerMonth(i);
        }
        return totalDays + this.getDate() - 1;
    }

    getWeekInYear() {
        return (this.getDayInYear() - this.getWeekDay()) / 7;
    }

    getStartOfDay() {
        return new StemDate(this.getFullYear(), this.getMonth(), this.getDate());
    }

    getEndOfDay() {
        return this.getStartOfDay().add(TimeUnit.DAY).subtract(TimeUnit.MILLISECOND);
    }

    getStartOfMonth() {
        return new StemDate(this.getFullYear(), this.getMonth(), 1);
    }

    getEndOfMonth() {
        return this.getStartOfMonth().add(TimeUnit.MONTH).subtract(TimeUnit.MILLISECOND);
    }

    getStartOfYear() {
        return new StemDate(this.getFullYear(), 0, 1);
    }

    getEndOfYear() {
        return this.getStartOfYear().add(TimeUnit.YEAR).subtract(TimeUnit.MILLISECOND);
    }
}

// TODO Maybe rename these
export const miniWeekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export const shortWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const longWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const longMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

StemDate.formatter = new TokenFormatter([
    ["ISO", date => date.toISOString()],

    ["Y", date => date.getFullYear()],
    ["YY", date => padNumber(date.getFullYear() % 100, 2)],
    ["YYYY", date => date.getFullYear()],

    ["M", date => (date.getMonth() + 1)],
    ["MM", date => padNumber(date.getMonth() + 1, 2)],
    ["MMM", date => shortMonthNames[date.getMonth()]],
    ["MMMM", date => longMonthNames[date.getMonth()]],

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
    ["h", date => date.getHours() % 12 ? date.getHours() % 12 : 12],
    ["hh", date => padNumber(date.getHours() % 12 ? date.getHours() % 12 : 12, 2)],

    ["m", date => date.getMinutes()],
    ["mm", date => padNumber(date.getMinutes(), 2)],

    ["s", date => date.getSeconds()],
    ["ss", date => padNumber(date.getSeconds(), 2)],

    ["S", date => Math.floor(date.getMilliseconds() / 100)],
    ["SS", date => padNumber(Math.floor(date.getMilliseconds() / 10), 2)],
    ["SSS", date => padNumber(date.getMilliseconds(), 3)],
    ["ms", date => padNumber(date.getMilliseconds(), 3)],

    ["aa", date => date.getHours() > 12 ? "pm" : "am"],
    ["AA", date => date.getHours() > 12 ? "PM" : "AM"],

    ["LL", date => date.format("MMMM Do, YYYY")],
]);

export {StemDate};
