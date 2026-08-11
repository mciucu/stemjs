// Minimal checker - each suite reports through one of these.
function createChecker() {
    const failures = [];

    const check = (name, actual, expected) => {
        const ok = String(actual) === String(expected);
        console.log(`  ${ok ? "ok  " : "FAIL"} ${name}`);
        if (!ok) {
            console.log(`         expected: ${expected}`);
            console.log(`         actual:   ${actual}`);
            failures.push(name);
        }
    };

    return {check, failures};
}

module.exports = {createChecker};
