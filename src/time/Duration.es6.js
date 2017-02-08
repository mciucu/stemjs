import {isPlainObject} from "../base/Utils";

class TimeUnit {
    static ALL = [];

    constructor(name, baseUnit, multiplier, variableMultiplier=false) {
        this.name = name;
        this.baseUnit = baseUnit;
        this.multiplier = multiplier;
        this.milliseconds = ((baseUnit && baseUnit.getMilliseconds()) || 1) * multiplier;
        this.variableMultiplier = variableMultiplier;
        this.variableDuration = variableMultiplier || (baseUnit && baseUnit.isVariable());

        // Add to the list of all time units
        this.constructor.ALL.push(this);
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
}

TimeUnit.MILLISECOND = new TimeUnit("millisecond", null, 1);
TimeUnit.SECOND = new TimeUnit("second", TimeUnit.MILLISECOND, 1000);
TimeUnit.MINUTE = new TimeUnit("minute", TimeUnit.SECOND, 60);
TimeUnit.HOUR = new TimeUnit("hour", TimeUnit.MINUTE, 60);
TimeUnit.DAY = new TimeUnit("day", TimeUnit.HOUR, 24, true);
TimeUnit.WEEK = new TimeUnit("week", TimeUnit.DAY, 7);
TimeUnit.MONTH =  new TimeUnit("month", TimeUnit.DAY, 30, true);
TimeUnit.QUARTER = new TimeUnit("quarter", TimeUnit.MONTH, 3);
TimeUnit.TRIMESTER = new TimeUnit("trimester", TimeUnit.MONTH, 4);
TimeUnit.YEAR = new TimeUnit("year", TimeUnit.MONTH, 12);

export class Duration {
    constructor(duration) {
        if (duration instanceof window.Date) {
            throw new Error("Can't automatically transform Date to Duration, use date.getTime() if you really want to");
        }
        if (duration instanceof Duration) {
            duration = duration.miliseconds;
        }
        if (isPlainObject(duration)) {
            duration = (duration.miliseconds || 0) +
                (duration.seconds || 0) * 1000 +
                (duration.minutes || 0) * 1000 * 60 +
                (duration.hours   || 0) * 1000 * 60 * 60 +
                (duration.days    || 0) * 1000 * 60 * 60 * 24;
        }
        this.miliseconds = duration;
    }

    // initFromPlainObject(obj) {
    //     this.
    //     for (const )
    // }

    static toDuration(duration) {
        if (duration instanceof Duration) {
            return duration;
        }
        return new this(duration);
    }

    add(duration) {
        return this.constructor.toDuration(+this + this.constructor.toDuration(duration));
    }

    subtract(duration) {
        return this.add(-(this.constructor.toDuration(duration)));
    }

    // Returns true if was defined terms of absolute primitives (anything less than a day)
    isAbsolute() {
        return !this.relativeDuration;
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
        return this.miliseconds;
    }

    toNanoseconds() {
        return +this / 1e6;
    }

    // TODO: for all these units, should have a way to get the float and int value
    toMilliseconds() {
        return +this;
    }

    toSeconds() {
        return this.miliseconds / 1000;
    }

    toMinutes() {
        return this.miliseconds / (1000 * 60);
    }

    toHours() {
        return this.miliseconds / (1000 * 60 * 60);
    }

    toString(locale) {
        // Humanize the duration (should work with localization)
    }
}

function canonicalDuration(name) {
    let duration = new Duration({
        [name + "s"]: 1,
    });
    duration.name = name;
    duration.toString = () => name;
    return duration;
}

Duration.MILLISECOND = canonicalDuration("millisecond");
Duration.SECOND = canonicalDuration("second");
Duration.MINUTE = canonicalDuration("minute");
Duration.HOUR   = canonicalDuration("hour");
Duration.DAY    = canonicalDuration("day");
Duration.MONTH  = canonicalDuration("month");
Duration.YEAR   = canonicalDuration("year");
