// This file is not usable yet, just a stub
import {StemDate} from "./Date";

let tokenMap = new Map();

function registerToken(token, decoder) {
    tokenMap.set(token, decoder);
}

// registerToken("DD", parserFunction)

class DateParser {
    constructor(pattern) {
        //Pattern can be DD/MM/YY, or HH:mm, etc
    }

    parse(str) {
        // return a Date object from the str
    }

    format(date) {
        // format a date to our pattern, the reverse operation
    }

    static parse(pattern, str) {
        let parser = new this(pattern);
        return parser.parse(str);
    }
}

export {DateParser}
