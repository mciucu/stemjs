import {isString} from "../base/Utils";

type TokenFormatterFunction = (value: any) => string | number;
type TokenEntry = [string, TokenFormatterFunction];

export class TokenFormatter {
    private tokenMap: Map<string, TokenFormatterFunction>;

    constructor(tokens: TokenEntry[]) {
        this.tokenMap = new Map<string, TokenFormatterFunction>();
        for (const [token, formatter] of tokens) {
            this.tokenMap.set(token, formatter);
        }
    }

    // TODO This is very old code, meh
    splitToTokens(str: string): string[] {
        // TODO: "[HH]HH" will be split to ["HH", "HH"], so the escape does not solve the problem
        let tokens: string[] = [];
        let lastIsLetter: boolean | null = null;
        let escapeByCurlyBracket = false;
        let escapeBySquareBracket = false;
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            if (charCode === 125 && escapeByCurlyBracket) { // '}' ending the escape
                escapeByCurlyBracket = false;
                lastIsLetter = null;
            } else if (charCode === 93 && escapeBySquareBracket) { // ']' ending the escape
                escapeBySquareBracket = false;
                lastIsLetter = null;
            } else if (escapeByCurlyBracket || escapeBySquareBracket) { // The character is escaped no matter what it is
                tokens[tokens.length - 1] += str[i];
            } else if (charCode === 123) { // '{' starts a new escape
                escapeByCurlyBracket = true;
                tokens.push("");
            } else if (charCode === 91) { // '[' starts a new escape
                escapeBySquareBracket = true;
                tokens.push("");
            } else {
                const isLetter = (65 <= charCode && charCode <= 90) || (97 <= charCode && charCode <= 122);
                if (isLetter === lastIsLetter) {
                    tokens[tokens.length - 1] += str[i];
                } else {
                    tokens.push(str[i]);
                }
                lastIsLetter = isLetter;
            }
        }
        if (escapeByCurlyBracket || escapeBySquareBracket) {
            console.warn("Unfinished escaped sequence!");
        }
        return tokens;
    }

    evalToken(value: any, token: string): string {
        const func = this.tokenMap.get(token);
        if (!func) {
            return token;
        }
        const result = func(value);
        if (!isString(result)) {
            return String(result);
        }
        return result;
    }

    format(value: any, str: string): string {
        let tokens = this.splitToTokens(str);
        tokens = tokens.map((token: string) => this.evalToken(value, token));
        return tokens.join("");
    }
}