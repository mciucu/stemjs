import {isPlainObject, isNumber, capitalize, isString, padNumber} from "../base/Utils";
import {TokenFormatter} from "./Formatter";

type TimeUnitName = "millisecond" | "second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "trimester" | "semester" | "year";
type TimeUnitPluralName = "milliseconds" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "quarters" | "trimesters" | "semesters" | "years";
type TimeUnitKey = TimeUnitName | TimeUnitPluralName;

interface TimeUnitOptions {
    variableMultiplier?: boolean;
    dateMethodSuffix?: string;
}

export type DurationInput = number | Duration | TimeUnit | Date | Record<TimeUnitKey, number>;
export type TimeUnitInput = TimeUnit | TimeUnitKey;

interface DateFormatOptions {
    maxEntries?: number;
    locale?: string | null;
    separator?: string;
    raw?: boolean;
}

export class TimeUnit {
    name: TimeUnitName;
    pluralName: TimeUnitPluralName;
    baseUnit: TimeUnit | null;
    multiplier: number;
    milliseconds: number;
    variableMultiplier: boolean;
    variableDuration: boolean;
    getterName: string;
    setterName: string;
    dateMethodSuffix?: string;

    static CANONICAL: Partial<Record<TimeUnitKey, TimeUnit>> = {};
    static ALL: TimeUnit[] = [];
    static FIXED_DURATION: TimeUnit[] = [];
    static VARIABLE_DURATION: TimeUnit[] = [];

    static MILLISECOND = new TimeUnit("millisecond", null, 1);
    static SECOND = new TimeUnit("second", TimeUnit.MILLISECOND, 1000);
    static MINUTE = new TimeUnit("minute", TimeUnit.SECOND, 60);
    static HOUR = new TimeUnit("hour", TimeUnit.MINUTE, 60);
    static DAY = new TimeUnit("day", TimeUnit.HOUR, 24, {variableMultiplier: true, dateMethodSuffix: "Date"});
    static WEEK = new TimeUnit("week", TimeUnit.DAY, 7);
    static MONTH = new TimeUnit("month", TimeUnit.DAY, 30, {variableMultiplier: true, dateMethodSuffix: "Month"});
    static QUARTER = new TimeUnit("quarter", TimeUnit.MONTH, 3);
    static TRIMESTER = new TimeUnit("trimester", TimeUnit.MONTH, 4);
    static SEMESTER = new TimeUnit("semester", TimeUnit.MONTH, 6);
    static YEAR = new TimeUnit("year", TimeUnit.DAY, 365, {variableMultiplier: true, dateMethodSuffix: "FullYear"});

    constructor(name: TimeUnitName, baseUnit: TimeUnit | null, multiplier: number, options: TimeUnitOptions = {}) {
        this.name = name;
        this.pluralName = (name + "s") as TimeUnitPluralName;
        this.baseUnit = baseUnit;
        this.multiplier = multiplier;
        this.milliseconds = (baseUnit?.getMilliseconds() || 1) * multiplier;
        this.variableMultiplier = options.variableMultiplier || false;
        this.variableDuration = this.variableMultiplier || (baseUnit && baseUnit.isVariable());

        let methodSuffix = (name === "year") ? "FullYear" : (name === "day" ? "Date" : capitalize(name));
        this.getterName = "get" + methodSuffix;
        this.setterName = "set" + methodSuffix;
        if (!(Date.prototype as any)[this.getterName] && (Date.prototype as any)[this.getterName + "s"]) {
            this.getterName += "s";
            this.setterName += "s";
        }

        // TODO Should dateMethodSuffix be deprecated? Looks like the getter and setter names are good enough
        if (options.dateMethodSuffix) {
            this.dateMethodSuffix = options.dateMethodSuffix;
        }
    }

    static toTimeUnit(timeUnit: TimeUnitInput): TimeUnit {
        if (timeUnit instanceof TimeUnit) {
            return timeUnit;
        }
        return this.CANONICAL[timeUnit];
    }

    valueOf(): number {
        return this.milliseconds;
    }

    getName(): string {
        return this.name;
    }

    getPluralName(): string {
        return this.pluralName;
    }

    getFrequencyName(): string {
        if (this.name.toLowerCase() === "day") {
            return "daily"
        }
        return this.name + "ly";
    }

    formatCount(numTimeUnits: number, omitCountOnSingular?: boolean): string {
        if (numTimeUnits != 1) {
            return numTimeUnits + " " + this.getPluralName();
        } else {
            if (omitCountOnSingular) {
                return this.getName();
            } else {
                return numTimeUnits + " " + this.getName();
            }
        }
    }

    getMilliseconds(): number {
        return this.milliseconds;
    }

    isVariable(): boolean {
        return this.variableDuration;
    }

    hasVariableMultiplier(): boolean {
        return this.variableMultiplier;
    }

    getDateValue(date: Date): number {
        return (date as any)[this.getterName]();
    }

    setDateValue(date: Date, value: number): number {
        return (date as any)[this.setterName](value);
    }
}

export class Duration {
    milliseconds?: number;
    relativeDuration?: boolean;
    [key: string]: any;

    constructor(duration?: DurationInput) {
        if (duration instanceof Date) {
            throw new Error("Can't automatically transform Date to Duration, use date.getTime() if you really want to");
        }
        if (isNumber(duration)) {
            this.milliseconds = duration;
            return;
        }
        if (duration instanceof Duration) {
            Object.assign(this, duration);
            return;
        }
        if (duration instanceof TimeUnit) {
            this.relativeDuration = duration.isVariable();
            if (this.relativeDuration) {
                this[duration.name] = 1;
            } else {
                this.milliseconds = duration.getMilliseconds();
            }
            return;
        }
        if (isPlainObject(duration)) {
            this.milliseconds = 0;
            for (const key of Object.keys(duration)) {
                let timeUnit = TimeUnit.CANONICAL[key];
                if (!timeUnit) {
                    throw new Error(`Unknown time unit: ${key}`);
                }
                // TODO: throw an error if can't parse these values
                if (timeUnit.isVariable()) {
                    this[key] = parseInt(String(duration[key]));
                    this.relativeDuration = true;
                } else {
                    this.milliseconds += parseFloat(String(duration[key])) * timeUnit.milliseconds;
                }
            }
            return;
        }
        if (arguments.length > 0) {
            throw new Error(`Invalid Duration arguments: ${Array.from(arguments).join(', ')}`);
        }
        this.milliseconds = 0;
    }

    static toDuration(duration: DurationInput): Duration {
        if (duration instanceof Duration) {
            return duration;
        }
        return new this(duration);
    }

    static optionally(value: DurationInput | null): Duration | null | undefined {
        return (value != null) ? this.toDuration(value) : (value as null);
    }

    increment(duration: DurationInput): Duration {
        const durationObj = (this.constructor as typeof Duration).toDuration(duration);
        for (const key in durationObj) {
            if (!(key in TimeUnit.CANONICAL)) {
                continue;
            }
            if (this.hasOwnProperty(key)) {
                this[key] += durationObj[key];
            } else {
                this[key] = durationObj[key];
            }
        }
        return this;
    }

    // TODO really decide if we want all these to modify the object or not
    add(duration: DurationInput): Duration {
        return this.clone().increment(duration);
    }

    subtract(duration: DurationInput): Duration {
        const negatedDuration = (this.constructor as typeof Duration).toDuration(duration).negate();
        return this.add(negatedDuration);
    }

    // Returns true if was defined terms of absolute primitives (anything less than a day)
    isAbsolute(): boolean {
        return !this.isVariable();
    }

    isVariable(): boolean {
        return this.relativeDuration || false;
    }

    negate(): Duration {
        let duration = new Duration(this);
        for (const key in duration) {
            if (key in TimeUnit.CANONICAL) {
                duration[key] = -duration[key];
            }
        }
        return duration;
    }

    // Returns a new Duration with a positive length
    abs(): Duration {
        return new Duration(Math.abs(+this));
    }

    clone(): Duration {
        return new Duration(this);
    }

    // The primitive value
    valueOf(): number {
        return this.milliseconds || 0;
    }

    toNanoseconds(): number {
        return Math.floor(+this * 1e6);
    }

    // TODO: for all these units, should have a way to get the float and int value
    // TODO use methods that use TimeUnit
    toMilliseconds(): number {
        return Math.floor(+this);
    }

    getMilliseconds(): number {
        return this.toMilliseconds() % 1000;
    }

    toSeconds(): number {
        return Math.floor(+this / 1000);
    }

    getSeconds(): number {
        return this.toSeconds() % 60;
    }

    toMinutes(): number {
        return Math.floor(+this / (1000 * 60));
    }

    getMinutes(): number {
        return this.toMinutes() % 60;
    }

    toHours(): number {
        return Math.floor(+this / (1000 * 60 * 60));
    }

    getHours(): number {
        return this.toHours() % 24;
    }

    toDays(): number {
        return Math.floor(+this / (1000 * 60 * 60 * 24));
    }

    toMonths(): number {
        return Math.floor(+this / (1000 * 60 * 60 * 24 * 30));
    }

    toYears(): number {
        return Math.floor(+this / (1000 * 60 * 60 * 24 * 365));
    }

    toTimeUnit(timeUnit: TimeUnit): number {
        return Math.floor(+this / timeUnit.getMilliseconds());
    }

    // Split the duration in absolute value into component parts
    // Will skip zero parts
    // TODO this doesn't yet handle cases with variable length fields
    splitInParts(maxParts: number, minTimeUnit?: TimeUnit): {parts: Array<{numUnits: number, timeUnit: TimeUnit}>, timeUnit: TimeUnit, duration: Duration} {
        let duration = this.abs();
        let timeUnit = TimeUnit.YEAR;
        let parts: Array<{numUnits: number, timeUnit: TimeUnit}> = [];
        let numPartsIncludingSkipped = 0; // Use a separate counter to include skipped zero entries
        while (true) {
            const numWholeTimeUnits = duration.toTimeUnit(timeUnit);
            if (numWholeTimeUnits) {
                duration = duration.subtract(new Duration(numWholeTimeUnits * timeUnit.getMilliseconds()));
                parts.push({numUnits: numWholeTimeUnits, timeUnit});
            }
            if (parts.length > 0) {
                numPartsIncludingSkipped += 1;
                if (numPartsIncludingSkipped >= maxParts) {
                    break;
                }
            }
            const nextUnit = timeUnit.baseUnit;
            // Either stop at milliseconds or when we're too low
            // Don't modify timeUnit just we have it in the response
            if (nextUnit == null || (minTimeUnit && nextUnit.valueOf() < minTimeUnit.valueOf())) {
                break;
            }
            timeUnit = nextUnit;
        }

        return {parts, timeUnit, duration};
    }

    // If you pass in a string like "hh:mm:ss", this will trigger a special case
    format(optionsOrPattern: DateFormatOptions | string = {}): string {
        if (isString(optionsOrPattern)) {
            const pattern = String(optionsOrPattern).toLowerCase();
            return (this.constructor as typeof Duration).formatter.format(this, pattern);
        }

        const {maxEntries = 2, separator = ", "} = optionsOrPattern;
        const {parts} = this.splitInParts(maxEntries);
        return parts.map(part => part.timeUnit.formatCount(part.numUnits)).join(separator);
    }

    toString(...args: any[]): string {
        return this.format(...args);
    }

    static formatter = new TokenFormatter([
        ["h", (date: Duration) => date.getHours()],
        ["hh", (date: Duration) => padNumber(date.getHours(), 2)],

        ["m", (date: Duration) => date.getMinutes()],
        ["mm", (date: Duration) => padNumber(date.getMinutes(), 2)],

        ["s", (date: Duration) => date.getSeconds()],
        ["ss", (date: Duration) => padNumber(date.getSeconds(), 2)],

        ["ts", (date: Duration) => Math.floor(date.getMilliseconds() / 100)],
        ["hs", (date: Duration) => padNumber(Math.floor(date.getMilliseconds() / 10), 2)],
        ["ms", (date: Duration) => padNumber(date.getMilliseconds(), 3)],
    ]);
}

export function addCanonicalTimeUnit(timeUnit: TimeUnit): void {
    TimeUnit.ALL.push(timeUnit);
    if (timeUnit.isVariable()) {
        TimeUnit.VARIABLE_DURATION.push(timeUnit);
    } else {
        TimeUnit.FIXED_DURATION.push(timeUnit);
    }

    TimeUnit.CANONICAL[timeUnit.name] = timeUnit;
    if (timeUnit.pluralName) {
        TimeUnit.CANONICAL[timeUnit.pluralName] = timeUnit;
    }
}

export function addCanonicalTimeUnits(): void {
    for (const key in TimeUnit) {
        const timeUnit = (TimeUnit as any)[key];
        if (timeUnit instanceof TimeUnit) {
            addCanonicalTimeUnit(timeUnit);
        }
    }
}

addCanonicalTimeUnits();
