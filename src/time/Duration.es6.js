import {isPlainObject} from "../base/Utils";

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
        return this.miliseconds / 1e6;
    }

    // TODO: for all these units, should have a way to get the float and int value
    toMiliseconds() {
        return this.miliseconds;
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
    return duration;
}

Duration.SECOND = canonicalDuration("second");
Duration.MINUTE = canonicalDuration("minute");
Duration.HOUR   = canonicalDuration("hour");
Duration.DAY    = canonicalDuration("day");