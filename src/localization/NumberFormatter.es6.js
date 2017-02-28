// Work in progress
// Check out https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat

export class NumberFormatter {
    constructor(digitGroupSize = 3, digitGroupSeparator = ",", unitSeparator = ".") {
        this.digitGroupSize = digitGroupSize;
        this.digitGroupSeparator = digitGroupSeparator;
        this.unitSeparator = unitSeparator;
    }

    format(number) {
    }
}

NumberFormatter.PLAIN = new NumberFormatter(0, null, null);
NumberFormatter.US = new NumberFormatter(3, ",", ".");
NumberFormatter.EUROPEAN = new NumberFormatter(3, ".", ",");
