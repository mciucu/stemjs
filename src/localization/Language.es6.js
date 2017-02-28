class Language extends Dispatchable {
    translationMap = new Map();

    getName() {
        return this.name;
    }

    // Returns the name of the language in its own locale
    getOwnName() {
        return this.ownName;
    }
}
