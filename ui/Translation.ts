import {TextUIElement, UI} from "./UIBase";
import {evaluateSprintf, isString} from "../base/Utils";

// Type definitions for translation functionality
interface TranslationMap {
    get(key: string): string | undefined;
}

// TODO @types use the proper LanguageStoreClass and other proper types
interface LanguageStore {
    getLocale(): Locale | null;
    addListener(event: string, callback: (language: Locale) => void): void;
}

interface Locale {
    buildTranslation(callback: (translationMap: TranslationMap) => void): void;
}


// This is the object that will be used to translate text
let translationMap: TranslationMap | null = null;

// Keep a set of all UI Element that need to be updated when the language changes
// Can't use a weak set here unfortunately because we need iteration
// That's why we must make sure to remove all nodes from the set when destroying them
export const TranslationElements = new Set<TranslationTextElement>();


export class TranslationTextElement extends TextUIElement {
    declare value: string | any[]; // Typescript is idiotic in overriding fields

    constructor(value: string | any[]) {
        if (arguments.length === 1) {
            super(value as string);
        } else {
            super("");
            this.setValue(...arguments);
        }
    }

    setValue(value: string | any[]): void {
        if (arguments.length > 1) {
            this.value = Array.from(arguments);
        } else {
            this.value = value;
        }
        if (this.node) {
            this.redraw();
        }
    }

    evaluate(strings: string | string[], ...values: any[]): string {
        if (!Array.isArray(strings)) {
            strings = translationMap?.get(strings) || strings;
            return evaluateSprintf(strings, ...values);
            // This means strings is a string with the sprintf pattern
        } else {
            // Using template literals https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals
            if (arguments.length !== strings.length) {
                console.error("Invalid arguments to evaluate ", Array.from(arguments));
            }
            let result = strings[0];
            for (let i = 1; i < arguments.length; i++) {
                result += arguments[i];
                result += strings[i];
            }
            return result;
        }
    }

    getValue(): string {
        let {value} = this;
        if (Array.isArray(value)) {
            value = this.evaluate(...value);
        } else {
            value = (translationMap && translationMap.get(value)) ?? value;
        }
        return value;
    }

    toString(): string {
        return this.getValue();
    }

    redraw(): void {
        if (!this.node) {
            this.node = this.createNode();
        }
        super.redraw();
    }

    onMount(): void {
        TranslationElements.add(this);
    }

    onUnmount(): void {
        TranslationElements.delete(this);
    }
}

// This method is a shorthand notation to create a new translatable text element
// TODO: should also support being used as a string template
UI.T = (str: string): TranslationTextElement => {
    return new TranslationTextElement(str);
};

// TODO @mciucu this should be wrapped in a way that previous requests that arrive later don't get processed
// TODO: should this be done with promises?
// Function to be called with a translation map
// The translationMap object needs to implement .get(value) to return the translation for value
function setTranslationMap(_translationMap: TranslationMap): void {
    if (translationMap === _translationMap) {
        return;
    }
    translationMap = _translationMap;
    for (let textElement of TranslationElements.values()) {
        textElement.redraw();
    }
}

let languageStore: LanguageStore | null = null;

// This function should be called to set the language store to watch for changes
// The languageStore argumenent needs to implement .getLocale(), addListener("localChange", (language) =>{})
// The language objects need to implement .buildTranslation(callback), where callback should be called with a translationMap
export function setLanguageStore(_languageStore: LanguageStore): void {
    languageStore = _languageStore;

    let currentLocale = languageStore.getLocale();
    // If there's a default language already set, build the translation table for it
    if (currentLocale) {
        currentLocale.buildTranslation(setTranslationMap);
    }

    // Add a listener for whenever the language changes
    languageStore.addListener("localeChange", (language: Locale) => {
        language.buildTranslation(setTranslationMap);
    });
}

export function getTranslationMap(): TranslationMap | null {
    return translationMap;
}

// TODO @types move this from there
declare global {
    interface Document {
        startViewTransition(callback: () => void): void;
    }
}

if (!document.startViewTransition) {
    document.startViewTransition = (callback: () => void) => callback();
}