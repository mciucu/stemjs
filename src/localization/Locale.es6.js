import {Dispatchable} from "../base/Dispatcher";

/* The Locale class should be a wrapper object meant to hold:
* - The language that should be used for translation
* - Date/time formatting
* - Number formatting
* - Currency formatting patterns
* - Measurement units
* - etc...
*/
class Locale extends Dispatchable {
    constructor(options = {}) {
        Object.assign(this, options);
    }

    // Set the current global locale object
    static setInstance(locale) {
    }

    // Return the current Locale object
    static getInstance() {
    }

    getLanguage() {
        return this.language;
    }

    getTimeFormatter() {
        return null;
    }

    getNumberFormatter() {
        return null;
    }

    getPhoneNumberFormatter() {
        return null;
    }
}

export {Locale};
