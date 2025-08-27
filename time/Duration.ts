import {isPlainObject, isNumber, capitalize, isString, padNumber} from "../base/Utils.js";
import {TokenFormatter} from "./Formatter.js";

export class TimeUnit {
    static CANONICAL = {};
    static ALL = [];
    static FIXED_DURATION = [];
    static VARIABLE_DURATION = [];

    constructor(name, baseUnit, multiplier, options = {}) {
        this.name = name;
        this.pluralName = name + "s";
        this.baseUnit = baseUnit;
        this.multiplier = multiplier;
        this.milliseconds = (baseUnit?.getMilliseconds() || 1) * multiplier;
        this.variableMultiplier = options.variableMultiplier || false;
        this.variableDuration = this.variableMultiplier || (baseUnit && baseUnit.isVariable());

        let methodSuffix = (name === "year") ? "FullYear" : (name === "day" ? "Date" : capitalize(name));
        this.getterName = "get" + methodSuffix;
        this.setterName = "set" + methodSuffix;
        if (!Date.prototype[this.getterName] && Date.prototype[this.getterName + "s"]) {
            this.getterName += "s";
            this.setterName += "s";
        }
    }

    static toTimeUnit(timeUnit) {
        if (timeUnit instanceof TimeUnit) {
            return timeUnit;
        }
        return this.CANONICAL[timeUnit];
    }

    valueOf() {
        return this.milliseconds;
    }

    getName() {
        return this.name;
    }

    getPluralName() {
        return this.pluralName;
    }

    getFrequencyName() {
        if (this.name.toLowerCase() === "day") {
            return "daily"
        }
        return this.name + "ly";
    }

    formatCount(numTimeUnits, omitCountOnSingular) {
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

    getMilliseconds() {
        return this.milliseconds;
    }

    isVariable() {
        return this.variableDuration;
    }

    hasVariableMultiplier() {
        return this.variableMultiplier;
    }

    getDateValue(date) {
        return date[this.getterName]();
    }

    setDateValue(date, value) {
        return date[this.setterName](value);
    }
}

TimeUnit.MILLISECOND = new TimeUnit("millisecond", null, 1);
TimeUnit.SECOND = new TimeUnit("second", TimeUnit.MILLISECOND, 1000);
TimeUnit.MINUTE = new TimeUnit("minute", TimeUnit.SECOND, 60);
TimeUnit.HOUR = new TimeUnit("hour", TimeUnit.MINUTE, 60);
TimeUnit.DAY = new TimeUnit("day", TimeUnit.HOUR, 24, {variableMultiplier: true});
TimeUnit.WEEK = new TimeUnit("week", TimeUnit.DAY, 7);
TimeUnit.MONTH =  new TimeUnit("month", TimeUnit.DAY, 30, {variableMultiplier: true});
TimeUnit.QUARTER = new TimeUnit("quarter", TimeUnit.MONTH, 3);
TimeUnit.TRIMESTER = new TimeUnit("trimester", TimeUnit.MONTH, 4);
TimeUnit.SEMESTER = new TimeUnit("semester", TimeUnit.MONTH, 6);
TimeUnit.YEAR = new TimeUnit("year", TimeUnit.DAY, 365, {variableMultiplier: true});

TimeUnit.DAY.dateMethodSuffix = "Date";
TimeUnit.MONTH.dateMethodSuffix = "Month";
TimeUnit.YEAR.dateMethodSuffix = "FullYear";

export class Duration {
    constructor(duration) {
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
                    throw Error("Unknown time unit:", key);
                }
                // TODO: throw an error if can't parse these values
                if (timeUnit.isVariable()) {
                    this[key] = parseInt(duration[key]);
                    this.relativeDuration = true;
                } else {
                    this.milliseconds += parseFloat(duration[key]) * timeUnit.milliseconds;
                }
            }
            return;
        }
        if (arguments.length > 0) {
            throw Error("Invalid Duration arguments: ", ...arguments);
        }
        this.milliseconds = 0;
    }

    static toDuration(duration) {
        if (duration instanceof Duration) {
            return duration;
        }
        return new this(duration);
    }

    static optionally(value) {
        return (value != null) ? this.toDuration(value) : value;
    }

    increment(duration) {
        duration = this.constructor.toDuration(duration);
        for (const key in duration) {
            if (!(key in TimeUnit.CANONICAL)) {
                continue;
            }
            if (this.hasOwnProperty(key)) {
                this[key] += duration[key];
            } else {
                this[key] = duration[key];
            }
        }
        return this;
    }

    // TODO really decide if we want all these to modify the object or not
    add(duration) {
        return this.clone().increment(duration);
    }

    subtract(duration) {
        duration = this.constructor.toDuration(duration).negate();
        return this.add(duration);
    }

    // Returns true if was defined terms of absolute primitives (anything less than a day)
    isAbsolute() {
        return !this.isVariable();
    }

    isVariable() {
        return this.relativeDuration;
    }

    negate() {
        let duration = new Duration(this);
        for (const key in duration) {
            if (key in TimeUnit.CANONICAL) {
                duration[key] = -duration[key];
            }
        }
        return duration;
    }

    // Returns a new Duration with a positive length
    abs() {
        return new Duration(Math.abs(+this));
    }

    clone() {
        return new Duration(this);
    }

    // The primitive value
    valueOf() {
        return this.milliseconds;
    }

    toNanoseconds() {
        return Math.floor(+this * 1e6);
    }

    // TODO: for all these units, should have a way to get the float and int value
    // TODO use methods that use TimeUnit
    toMilliseconds() {
        return Math.floor(+this);
    }

    getMilliseconds() {
        return this.toMilliseconds() % 1000;
    }

    toSeconds() {
        return Math.floor(+this / 1000);
    }

    getSeconds() {
        return this.toSeconds() % 60;
    }

    toMinutes() {
        return Math.floor(+this / (1000 * 60));
    }

    getMinutes() {
        return this.toMinutes() % 60;
    }

    toHours() {
        return Math.floor(+this / (1000 * 60 * 60));
    }

    getHours() {
        return this.toHours() % 24;
    }

    toDays() {
        return Math.floor(+this / (1000 * 60 * 60 * 24));
    }

    toMonths() {
        return Math.floor(+this / (1000 * 60 * 60 * 24 * 30));
    }

    toYears() {
        return Math.floor(+this / (1000 * 60 * 60 * 24 * 365));
    }

    toTimeUnit(timeUnit) {
        return Math.floor(+this / timeUnit.getMilliseconds());
    }

    // Split the duration in absolute value into component parts
    // Will skip zero parts
    // TODO this doesn't yet handle cases with variable length fields
    splitInParts(maxParts, minTimeUnit) {
        let duration = this.abs();
        let timeUnit = TimeUnit.YEAR;
        let parts = [];
        let numPartsIncludingSkipped = 0; // Use a separate counter to include skipped zero entries
        while (true) {
            const numWholeTimeUnits = duration.toTimeUnit(timeUnit);
            if (numWholeTimeUnits) {
                duration = duration.subtract(numWholeTimeUnits * timeUnit);
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
            if (nextUnit == null || (minTimeUnit && nextUnit < minTimeUnit)) {
                break;
            }
            timeUnit = nextUnit;
        }

        return {parts, timeUnit, duration};
    }

    // If you pass in a string like "hh:mm:ss", this will trigger a special case
    format({maxEntries = 2, locale = null, separator=", ", raw=false} = {}) {
        if (isString(arguments[0])) {
            const pattern = String(arguments[0]).toLowerCase();
            return this.constructor.formatter.format(this, pattern);
        }

        const {parts} = this.splitInParts(maxEntries);
        return parts.map(part => part.timeUnit.formatCount(part.numUnits)).join(separator);
    }

    toString(...args) {
        return this.format(...args);
    }

    static formatter = new TokenFormatter([
        ["h", date => date.getHours()],
        ["hh", date => padNumber(date.getHours(), 2)],

        ["m", date => date.getMinutes()],
        ["mm", date => padNumber(date.getMinutes(), 2)],

        ["s", date => date.getSeconds()],
        ["ss", date => padNumber(date.getSeconds(), 2)],

        ["ts", date => Math.floor(date.getMilliseconds() / 100)],
        ["hs", date => padNumber(Math.floor(date.getMilliseconds() / 10), 2)],
        ["ms", date => padNumber(date.getMilliseconds(), 3)],
    ]);
}

export function addCanonicalTimeUnit(key, timeUnit) {
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

    const timeUnitsName = timeUnit.pluralName;

    // TODO: not sure about this anymore
    Duration[key] = new Duration({
        [timeUnitsName]: 1,
    });
}

export function addCanonicalTimeUnits() {
    for (const key in TimeUnit) {
        const timeUnit = TimeUnit[key];
        if (timeUnit instanceof TimeUnit) {
            addCanonicalTimeUnit(key, timeUnit);
        }
    }
}

addCanonicalTimeUnits();
