// This file is not usable yet, just a stub

export class Duration {
    constructor(miliseconds) {
        // TODO: can take in a plain object, a value in miliseconds, or another Duration object
        if (miliseconds instanceof Duration) {
            miliseconds = miliseconds.miliseconds;
        }
        // if (isPlainObject(miliseconds)) {
            // can have the fields "year", "months", etc...
        // }
        this.miliseconds = miliseconds;
    }

    clone() {
        return new Duration(this);
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

    toLocalizable() {
    }
}
