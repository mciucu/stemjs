import {padNumber, suffixWithOrdinal, isNumber, isString} from "../base/Utils";
import {TimeUnit, Duration, DurationInput} from "./Duration";
import {TokenFormatter} from "./Formatter";
import {Timezone} from "../localization/Timezone";

// By default, StemDate will guess if the value is in milliseconds or seconds.
// Any value less than this is interpreted as a unix time in seconds
// If you want to go around this behavior, you can use the static method .fromUnixMilliseconds()
// To disable, set this value to 0
export let MAX_AUTO_UNIX_TIME: number = Math.pow(2, 32); // Either ~Feb 2106 in unix seconds or ~Feb 1970 in unix milliseconds

type DateFormatter = string | ((date: StemDate) => string);
type DateInput = number | string | Date | StemDate;

let DEFAULT_DATE_FORMAT: DateFormatter = "ISO";

export function SetDefaultDateFormat(dateFormat: DateFormatter): void {
    DEFAULT_DATE_FORMAT = dateFormat;
}

const BaseDate = globalThis.Date;

// @ts-ignore It bitches about overriding now()
export class StemDate extends BaseDate {
    declare timezone?: Timezone;

    // Fucking Typescript, forces me to be explicit for all the constructors
    constructor();
    constructor(value: DateInput);
    constructor(year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number);

    constructor(...args: any[]) {
        super(...(args as ConstructorParameters<typeof Date>));
        if (args.length === 1 && isNumber(args[0]) && (+this) < MAX_AUTO_UNIX_TIME) {
            this.setTime((+this) * 1000);
        }
    }

    static create(value: DateInput): StemDate {
        return new this(value);
    }

    // Return a StemDate from the object, else return value if falsy
    static optionally(value: DateInput | null | undefined): StemDate | null | undefined {
        return (value != null) ? this.create(value) : (value as null);
    }

    static toDate(date: DateInput): StemDate {
        if (date instanceof StemDate) {
            return date;
        } else {
            return new this(date);
        }
    }

    // Contract change: Date.now() returns a time in milliseconds, while we return an actual date
    static now(): StemDate {
        return new this(BaseDate.now());
    }

    toBaseString(): string {
        return super.toString();
    }

    toString(): string {
        if (!DEFAULT_DATE_FORMAT) {
            return this.toBaseString();
        }
        
        if (isString(DEFAULT_DATE_FORMAT)) {
            return this.format(DEFAULT_DATE_FORMAT);
        }

        return DEFAULT_DATE_FORMAT(this);
    }

    static fromUnixMilliseconds(unixMilliseconds: number): StemDate {
        return this.create(new BaseDate(unixMilliseconds));
    }

    static fromUnixSeconds(unixSeconds: number): StemDate {
        return this.fromUnixMilliseconds(unixSeconds * 1000);
    }

    // You don't usually need to call this in most cases, constructor uses MAX_AUX_UNIX_TIME
    static unix(unixTime: number): StemDate {
        return this.fromUnixSeconds(unixTime);
    }

    // Creates a Date object from an instance of DOMHighResTimeStamp, returned by performance.now() for instance
    static fromHighResTimestamp(highResTimestamp: number): StemDate {
        return this.fromUnixMilliseconds(highResTimestamp + globalThis.performance.timing.navigationStart)
    }

    set(date: DateInput) {
        date = (this.constructor as typeof StemDate).toDate(date);
        this.setTime(date.getTime());
        return this;
    }

    clone(): StemDate {
        return new (this.constructor as typeof StemDate)(this.getTime());
    }

    toUnix(): number {
        return this.getTime() / 1000;
    }

    unix(): number {
        return Math.floor(this.toUnix());
    }

    isBefore(date: DateInput) {
        return this.getTime() < StemDate.toDate(date).getTime();
    }

    equals(date: DateInput): boolean {
        return this.getTime() === StemDate.toDate(date).getTime();
    }

    get(timeUnit: TimeUnit): number {
        timeUnit = TimeUnit.toTimeUnit(timeUnit);
        return timeUnit.getDateValue(this);
    }

    isSame(date: DateInput, timeUnit: TimeUnit) {
        if (!timeUnit) {
            return this.equals(date);
        }

        timeUnit = TimeUnit.toTimeUnit(timeUnit);
        const stemDate = (this.constructor as typeof StemDate).toDate(date);
        let diff = this.diff(stemDate);
        if (diff.valueOf() >= 2 * timeUnit.valueOf()) {
            // If the distance between the two dates is more than 2 standard lengths of the time unit
            // This would be wrong if you would have time unit that can sometimes last more than twice their canonical duration
            // Works correctly for all implemented time units
            return false;
        }
        return this.get(timeUnit) == stemDate.get(timeUnit);
    }

    isAfter(date: DateInput) {
        return this.getTime() > StemDate.toDate(date).getTime();
    }

    isSameOrBefore(date: DateInput) {
        return this.isBefore(date) || this.equals(date);
    }

    isSameOrAfter(date: DateInput) {
        return this.isAfter(date) || this.equals(date);
    }

    isBetween(a: DateInput, b: DateInput) {
        return this.isSameOrAfter(a) && this.isSameOrBefore(b);
    }

    getWeekDay() {
        return this.getDay();
    }

    addUnit(timeUnit: TimeUnit, count: number = 1) {
        timeUnit = TimeUnit.toTimeUnit(timeUnit);

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

    static min(...dates: DateInput[]): StemDate {
        // TODO: simplify and remove code duplication
        let result = this.toDate(dates[0]);
        for (let index = 1; index < dates.length; index++) {
            let candidate = this.toDate(dates[index]);
            if (candidate.isBefore(result)) {
                result = candidate;
            }
        }
        return result;
    }

    static max(...dates: DateInput[]): StemDate {
        let result = this.toDate(dates[0]);
        for (let index = 1; index < dates.length; index++) {
            let candidate = this.toDate(dates[index]);
            if (candidate.isAfter(result)) {
                result = candidate;
            }
        }
        return result;
    }

    // Assign the given date if current value if greater than it
    capUp(date: DateInput) {
        date = (this.constructor as typeof StemDate).toDate(date);
        if (this.isAfter(date)) {
            this.set(date);
        }
    }

    // Assign the given date if current value if less than it
    capDown(date: DateInput) {
        date = (this.constructor as typeof StemDate).toDate(date);
        if (this.isBefore(date)) {
            this.set(date);
        }
    }

    roundDown(timeUnit: TimeUnit) {
        timeUnit = TimeUnit.toTimeUnit(timeUnit);
        // TODO: this is wrong for semester, etc, should be different then
        while (timeUnit = timeUnit.baseUnit) {
            timeUnit.setDateValue(this, 0);
        }
        return this;
    }

    roundUp(timeUnit: TimeUnit) {
        const roundDown = this.clone().roundDown(timeUnit);
        if (this.equals(roundDown)) {
            return this.set(roundDown);
        }
        this.addUnit(timeUnit);
        return this.roundDown(timeUnit);
    }

    round(timeUnit: TimeUnit) {
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
    add(duration: DurationInput) {
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

    subtract(duration: DurationInput) {
        duration = Duration.toDuration(duration).negate();
        return this.add(duration);
    }

    // TODO deprecate this
    diffDuration(date: DateInput) {
        return new Duration(this.diff(date));
    }

    // The different in absolute value
    diff(date: DateInput, inAbsolute: boolean = true) {
        date = StemDate.toDate(date);
        let diffMilliseconds = (+this) - (+date);
        if (inAbsolute) {
            diffMilliseconds = Math.abs(diffMilliseconds);
        }
        return new Duration(diffMilliseconds);
    }

    // Just to keep moment compatibility, until we actually implement locales
    locale(loc: any) {
        return this;
    }

    format(str: string = "ISO") {
        return StemDate.formatter.format(this, str);
    }

    static format(date: DateInput, str: string) {
        return StemDate.toDate(date).format(str);
    }

    isValid() {
        return super.toString() != "Invalid Date";
    }

    utc(): StemDate {
        // Temp hack
        return StemDate.fromUnixMilliseconds(+this + this.getTimezoneOffset() * 60 * 1000);
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

    getDaysCountPerMonth(index: number) {
        const months = [31, 28 + (this.isLeapYear() ? 1 : 0), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
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

    static formatter: TokenFormatter = new TokenFormatter([
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
}

// TODO Maybe rename these
export const miniWeekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
export const shortWeekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const longWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const longMonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
