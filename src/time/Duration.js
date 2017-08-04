import {isPlainObject, isNumber} from "../base/Utils";

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
        this.milliseconds = ((baseUnit && baseUnit.getMilliseconds()) || 1) * multiplier;
        this.variableMultiplier = options.variableMultiplier || false;
        this.variableDuration = this.variableMultiplier || (baseUnit && baseUnit.isVariable());
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

    }

    setDateValue(date, value) {
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
        if (duration instanceof self.Date) {
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

    add(duration) {
        return this.clone().increm(duration);
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

    toString(locale) {
        // Humanize the duration (should work with localization)
    }
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
