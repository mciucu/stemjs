export const NON_BREAKING_SPACE = String.fromCharCode(160); // Looks like a space, but never breaks when wrapping lines

// Format a number between 0.0 and 100.0 as a percent string
export function formatPercent(percent, numDigits = 2) {
    // TODO: when localizing, we might want the percent sign in front:
    //  https://en.wikipedia.org/wiki/Percent_sign#Form_and_spacing
    return percent.toFixed(numDigits) + NON_BREAKING_SPACE + "%";
}

// Will always return a number
export function ratioToPercent(a, b) {
    if (a == null || isNaN(a)) {
        a = 0;
    }
    if (!b) {
        return 0.0;
    }
    return 100.0 * a / b;
}

export function formatPercentFromRatio(a, b, numDigits = 2) {
    return formatPercent(ratioToPercent(a, b), numDigits);
}