// TODO: this file is in dire need of a rewrite
export class StringStream {
    constructor(string, options) {
        this.string = string;
        this.pointer = 0;
    }

    done() {
        return this.pointer >= this.string.length;
    }

    advance(steps=1) {
        this.pointer += steps;
    }

    char() {
        let ch = this.string.charAt(this.pointer);
        this.pointer += 1;
        return ch;
    }

    whitespace(whitespaceChar=/\s/) {
        let whitespaceStart = this.pointer;

        while (!this.done() && whitespaceChar.test(this.at(0))) {
            this.pointer += 1;
        }

        // Return the actual whitespace in case it is needed
        return this.string.substring(whitespaceStart, this.pointer);
    }

    // Gets first encountered non-whitespace substring
    word(validChars=/\S/, skipWhitespace=true) {
        if (skipWhitespace) {
            this.whitespace();
        }

        let wordStart = this.pointer;
        while (!this.done() && validChars.test(this.at(0))) {
            this.pointer += 1;
        }
        return this.string.substring(wordStart, this.pointer);
    }

    number(skipWhitespace=true) {
        if (skipWhitespace) {
            this.whitespace();
        }

        let nanString = "NaN";
        if (this.startsWith(nanString)) {
            this.advance(nanString.length);
            return NaN;
        }

        let sign = "+";
        if (this.at(0) === "-" || this.at(0) === "+") {
            sign = this.char();
        }

        let infinityString = "Infinity";
        if (this.startsWith(infinityString)) {
            this.advance(infinityString.length);
            return sign === "+" ? Infinity : -Infinity;
        }

        let isDigit = (char) => {
            return (char >= "0" || char <= "9");
        };

        if (this.at(0) === "0" && (this.at(1) === "X" || this.at(1) === "x")) {
            // hexadecimal number
            this.advance(2);

            let isHexDigit = (char) => {
                return isDigit(char) || (char >= "A" && char <= "F") ||(char >= "a" && char <= "f");
            };

            let numberStart = this.pointer;
            while (!this.done() && isHexDigit(this.at(0))) {
                this.pointer += 1;
            }

            return parseInt(sign + this.string.substring(numberStart), 16);
        }

        let numberStart = this.pointer;
        while (!this.done() && isDigit(this.at(1))) {
            this.pointer += 1;
            if (this.peek === ".") {
                this.advance(1);
                while (!this.done() && isDigit(this.at(1))) {
                    this.pointer += 1;
                }
                break;
            }
        }
        return parseFloat(sign + this.string.substring(numberStart, this.pointer));
    }

    // Gets everything up to delimiter, usually end of line, limited to maxLength
    line(delimiter=/\r*\n/, maxLength=Infinity) {
        if (delimiter instanceof RegExp) {
            // Treat regex differently. It will probably be slower.
            let str = this.string.substring(this.pointer);
            let delimiterMatch = str.match(delimiter);

            let delimiterIndex, delimiterLength;
            if (delimiterMatch === null) {
                // End of string encountered
                delimiterIndex = str.length;
                delimiterLength = 0;
            } else {
                delimiterIndex = delimiterMatch.index;
                delimiterLength = delimiterMatch[0].length;
            }

            if (delimiterIndex >= maxLength) {
                this.pointer += maxLength;
                return str.substring(0, maxLength);
            }

            this.advance(delimiterIndex + delimiterLength);
            return str.substring(0, delimiterIndex);
        }

        let delimiterIndex = this.string.indexOf(delimiter, this.pointer);

        if (delimiterIndex === -1) {
            delimiterIndex = this.string.length;
        }

        if (delimiterIndex - this.pointer > maxLength) {
            let result = this.string.substring(this.pointer, this.pointer + maxLength);
            this.advance(maxLength);
            return result;
        }

        let result = this.string.substring(this.pointer, delimiterIndex);
        this.pointer = delimiterIndex + delimiter.length;
        return result;
    }

    // The following methods have no side effects

    // Access char at offset position, relative to current pointer
    at(index) {
        return this.string.charAt(this.pointer + index);
    }

    peek(length=1) {
        return this.string.substring(this.pointer, this.pointer + length);
    }

    startsWith(prefix) {
        if (prefix instanceof RegExp) {
            // we modify the regex to only check for the beginning of the string
            prefix = new RegExp("^" + prefix.toString().slice(1, -1));
            return prefix.test(this.string.substring(this.pointer));
        }
        return this.peek(prefix.length) === prefix;
    }

    // Returns first position of match
    search(pattern) {
        let position;
        if (pattern instanceof RegExp) {
            position = this.string.substring(this.pointer).search(pattern);
        } else {
            position = this.string.indexOf(pattern, this.pointer) - this.pointer;
        }
        return position < 0 ? -1 : position;
    }

    clone() {
        let newStream = new this.constructor(this.string);
        newStream.pointer = this.pointer;
        return newStream;
    }
}

function kmp(input) {
    if (input.length === 0) {
        return [];
    }

    let prefix = [0];
    let prefixLength = 0;

    for (let i = 1; i < input.length; i += 1) {
        while (prefixLength > 0 && input[i] !== input[prefixLength]) {
            prefixLength = prefix[prefixLength];
        }

        if (input[i] === input[prefixLength]) {
            prefixLength += 1;
        }

        prefix.push(prefixLength);
    }
    return prefix;
}

class ModifierAutomation {
    // build automaton from string
    constructor(options) {
        this.options = options;
        this.steps = 0;
        this.startNode = {
            value: null,
            startNode: true,
        };
        this.node = this.startNode;

        let lastNode = this.startNode;

        let char = options.pattern.charAt(0);
        let startPatternNode = {
            value: char,
            startNode: true,
        };

        let patternPrefix = kmp(options.pattern);
        let patternNode = [startPatternNode];

        if (options.leftWhitespace) {
            // We don't want to match if the first char is not preceeded by whitespace
            let whitespaceNode = {
                value: " ",
                whitespaceNode: true,
            };
            whitespaceNode.next = (input) => {
                if (input === char) return startPatternNode;
                return (/\s/).test(input) ? whitespaceNode : this.startNode;
            };
            lastNode.next = (input) => {
                return (/\s/).test(input) ? whitespaceNode : this.startNode;
            };
            this.node = whitespaceNode;
        } else {
            lastNode.next = (input) => {
                return input === char ? startPatternNode : this.startNode;
            }
        }
        lastNode = startPatternNode;

        for (let i = 1; i < options.pattern.length; i += 1) {
            let char = options.pattern[i];
            let newNode = {
                value: char,
            };
            patternNode.push(newNode);

            let backNode = (patternPrefix[i - 1] === 0) ? this.startNode : patternNode[patternPrefix[i - 1] - 1];

            lastNode.next = (input) => {
                if (input === char) {
                    return newNode;
                }

                return backNode.next(input);
            };
            lastNode = newNode;
        }
        lastNode.patternLastNode = true;

        if (options.captureContent) {
            this.capture = [];
            let captureNode = {
                value: "",
                captureNode: true,
            };

            // We treat the first character separately in order to support empty capture
            let char = options.endPattern.charAt(0);
            let endCaptureNode = {
                value: char
            };

            let endPatternPrefix = kmp(options.endPattern);
            let endPatternNodes = [endCaptureNode];

            lastNode.next = captureNode.next = (input) => {
                return input === char ? endCaptureNode : captureNode;
            };

            lastNode = endCaptureNode;
            for (let i = 1; i < options.endPattern.length; i += 1) {
                let char = options.endPattern[i];
                let newNode = {
                    value: char,
                };
                endPatternNodes.push(newNode);

                let backNode = (endPatternPrefix[i - 1] === 0) ? captureNode : endPatternNodes[endPatternPrefix[i - 1] - 1];

                lastNode.next = (input) => {
                    if (input === char) {
                        return newNode;
                    }
                    return backNode.next(input);
                };
                lastNode = newNode;
            }

            lastNode.endPatternLastNode = true;
        }

        lastNode.endNode = true;
        lastNode.next = (input) => {
            return this.startNode.next(input);
        };
    }

    nextState(input) {
        this.steps += 1;

        this.node = this.node.next(input);

        if (this.node.startNode) {
            this.steps = 0;
            delete this.patternStep;
            delete this.endPatternStep;
        }

        if (this.node.patternLastNode) {
            this.patternStep = this.steps - this.options.pattern.length + 1;
        }
        if (this.node.endPatternLastNode) {
            // TODO(@all): Shouldn't it be this.options.endPattern.length instead of this.options.pattern.length?
            this.endPatternStep = this.steps - this.options.pattern.length + 1;
        }

        return this.node;
    }

    done() {
        return this.node.endNode;
    }
}

class Modifier {
    constructor(options) {
    }

    modify(currentArray, originalString) {
        let matcher = new ModifierAutomation({
            pattern: this.pattern,
            captureContent: this.captureContent, // TODO: some elements should not wrap
            endPattern: this.endPattern,
            leftWhitespace: this.leftWhitespace,
        });

        let arrayLocation = 0;
        let currentElement = currentArray[arrayLocation];
        let newArray = [];

        for (let i = 0; i < originalString.length; i += 1) {
            let char = originalString[i];

            if (i >= currentElement.end) {
                newArray.push(currentElement);

                arrayLocation += 1;
                currentElement = currentArray[arrayLocation];
            }

            if (currentElement.isJSX) {
                matcher.nextState("\\" + char); // prevent char from advancing automata
                continue;
            }

            matcher.nextState(char);

            if (matcher.done()) {
                let modifierStart = i - (matcher.steps - matcher.patternStep);
                let modifierEnd = i - (matcher.steps - matcher.endPatternStep) + this.endPattern.length;

                let modifierCapture = [];

                while (newArray.length > 0 && modifierStart <= newArray[newArray.length - 1].start) {
                    let element = newArray.pop();

                    modifierCapture.push(element);
                }

                if (newArray.length > 0 && modifierStart < newArray[newArray.length - 1].end) {
                    let element = newArray.pop();
                    newArray.push({
                        isString: true,
                        start: element.start,
                        end: modifierStart,
                    });
                    modifierCapture.push({
                        isString: true,
                        start: modifierStart,
                        end: element.end,
                    });
                }

                if (currentElement.start < modifierStart) {
                    newArray.push({
                        isString: true,
                        start: currentElement.start,
                        end: modifierStart,
                    });
                }
                modifierCapture.reverse();

                // this is the end of the capture
                modifierCapture.push({
                    isString: true,
                    start: Math.max(currentElement.start, modifierStart),
                    end: modifierEnd,
                });

                newArray.push({
                    content: this.wrap(this.processChildren(modifierCapture, originalString)),
                    start: modifierStart,
                    end: modifierEnd,
                });

                // We split the current element to in two(one will be captured, one replaces the current element
                currentElement = {
                    isString: true,
                    start: modifierEnd,
                    end: currentElement.end,
                };
            }
        }

        if (currentElement.start < originalString.length) {
            newArray.push(currentElement);
        }

        return newArray;
    }

    processChildren(capture, originalString) {
        return capture.map((element) => {
            return this.processChild(element, originalString);
        });
    }

    processChild(element, originalString) {
        if (element.isDummy) {
            return "";
        } if (element.isString) {
            return originalString.substring(element.start, element.end);
        } else {
            return element.content;
        }
    }
}

function InlineModifierMixin(BaseModifierClass) {
    return class InlineModifier extends BaseModifierClass {
        constructor(options) {
            super(options);

            this.captureContent = true;
        }

        wrap(content) {
            if (content.length > 0) {
                content[0] = content[0].substring(content[0].indexOf(this.pattern) + this.pattern.length);

                let lastElement = content.pop();
                lastElement = lastElement.substring(0, lastElement.lastIndexOf(this.endPattern));
                content.push(lastElement);

                return {
                    tag: this.tag,
                    children: content
                };
            }
        }
    }
}

function LineStartModifierMixin(BaseModifierClass) {
    return class LineStartModifier extends BaseModifierClass {
        constructor(options) {
            super(options);

            this.groupConsecutive = false;
        }

        isValidElement(element) {
            return element.content &&
                element.content.tag === "p" &&
                element.content.children.length > 0 &&
                !element.content.children[0].tag && // child is text string
                element.content.children[0].startsWith(this.pattern);
        }

        modify(currentArray, originalString) {
            let newArray = [];

            for (let i = 0; i < currentArray.length; i += 1) {
                let element = currentArray[i];
                if (this.isValidElement(element)) {
                    if (this.groupConsecutive) {
                        let elements = [];

                        let start, end;
                        start = currentArray[i].start;
                        while (i < currentArray.length && this.isValidElement(currentArray[i])) {
                            elements.push(this.wrapItem(currentArray[i].content.children));

                            i += 1;
                        }
                        // we make sure no elements are skipped
                        i -= 1;

                        end = currentArray[i].end;

                        newArray.push({
                            start: start,
                            end: end,
                            content: this.wrap(elements)
                        });
                    } else {
                        // We use object assign here to keep the start and end properties. (Maybe along with others)
                        let newElement = Object.assign({}, element, {
                            content: this.wrap(element.content.children)
                        });
                        newArray.push(newElement);
                    }

                } else {
                    newArray.push(element);
                }
            }
            return newArray;
        }

        wrapItem(content) {
            let firstChild = content[0];

            let patternIndex = firstChild.indexOf(this.pattern);
            let patternEnd = patternIndex + this.pattern.length;

            content[0] = firstChild.substring(patternEnd);

            return {
                tag: this.itemTag,
                children: content,
            }
        }

        wrap(content) {
            return {
                tag: this.tag,
                children: content,
            }
        }
    }
}

function RawContentModifierMixin(BaseModifierClass) {
    return class RawContentModifier extends BaseModifierClass {
        processChildren(children, originalString) {
            if (children.length === 0) {
                return [];
            }

            return [originalString.substring(children[0].start, children[children.length - 1].end)];
        }
    }
}

export class BlockCodeModifier extends Modifier {
    constructor(options) {
        super(options);

        this.pattern = "```";
        this.endPattern = "\n```";
        this.leftWhitespace = true;
        this.captureContent = true;
    }

    processChildren(capture, originalString) {
        this.codeOptions = null;
        if (capture.length > 0) {
            let codeBlock = originalString.substring(capture[0].start, capture[capture.length - 1].end);

            codeBlock = codeBlock.substring(codeBlock.indexOf(this.pattern) + this.pattern.length);
            codeBlock = codeBlock.substring(0, codeBlock.lastIndexOf(this.endPattern));

            let firstLineEnd = codeBlock.indexOf("\n") + 1;
            let firstLine = codeBlock.substring(0, firstLineEnd).trim();
            codeBlock = codeBlock.substring(firstLineEnd);

            if (firstLine.length > 0) {
                this.codeOptions = {};
                let lineStream = new StringStream(firstLine);
                this.codeOptions.aceMode = lineStream.word();

                Object.assign(this.codeOptions, MarkupParser.parseOptions(lineStream));
            }

            return codeBlock;
        }
        return "";
    }

    getElement(content) {
        return {
            tag: this.constructor.tag || "pre",
            children: [content],
        }
    }

    wrap(content, options) {
        let codeHighlighter = this.getElement(content);

        // TODO: this code should not be here
        let codeOptions = {
            aceMode: "c_cpp",
            maxLines: 32,
        };

        if (this.codeOptions) {
            Object.assign(codeOptions, this.codeOptions);
            delete this.codeOptions;
        }

        Object.assign(codeOptions, codeHighlighter);
        return codeOptions;
    }
}

class HeaderModifier extends LineStartModifierMixin(Modifier) {
    constructor(options) {
        super(options);

        this.pattern = "#";
    }

    wrap(content) {
        let firstChild = content[0];

        let hashtagIndex = firstChild.indexOf("#");
        let hashtagEnd = hashtagIndex + 1;
        let headerLevel = 1;

        let nextChar = firstChild.charAt(hashtagEnd);
        if (nextChar >= "1" && nextChar <= "6") {
            headerLevel = parseInt(nextChar);
            hashtagEnd += 1;
        } else if (nextChar === "#") {
            while (headerLevel < 6 && firstChild.charAt(hashtagEnd) === "#") {
                headerLevel += 1;
                hashtagEnd += 1;
            }
        }

        content[0] = firstChild.substring(hashtagEnd);
        return {
            tag: "h" + headerLevel,
            children: content,
        };
    }
}

class HorizontalRuleModifier extends LineStartModifierMixin(Modifier) {
    constructor(options) {
        super(options);

        this.pattern = "---";
    }

    wrap(content) {
        return {
            tag: "hr"
        };
    }
}

class UnorderedListModifier extends LineStartModifierMixin(Modifier) {
    constructor(options) {
        super(options);

        this.tag = "ul";
        this.itemTag = "li";
        this.pattern = "- ";
        this.groupConsecutive = true;
    }
}

class OrderedListModifier extends LineStartModifierMixin(Modifier) {
    constructor(options) {
        super(options);

        this.tag = "ol";
        this.itemTag = "li";
        this.pattern = "1. ";
        this.groupConsecutive = true;
    }
}

class ParagraphModifier extends Modifier {
    modify(currentArray, originalString) {
        let newArray = [];
        let capturedContent = [];
        let arrayLocation = 0;
        let currentElement = currentArray[arrayLocation];
        let lineStart = 0;

        for (let i = 0; i < originalString.length; i += 1) {
            if (i >= currentElement.end) {
                capturedContent.push(currentElement);
                arrayLocation += 1;
                currentElement = currentArray[arrayLocation];
            }

            if (currentElement.isJSX) {
                continue;
            }

            if (originalString[i] === "\n") {
                if (currentElement.start < i) {
                    capturedContent.push({
                        isString: true,
                        start: currentElement.start,
                        end: i,
                    });
                }

                newArray.push({
                    content: this.wrap(this.processChildren(capturedContent, originalString)),
                    start: lineStart,
                    end: i + 1,
                });
                capturedContent = [];
                lineStart = i + 1;

                if (originalString[i + 1] === "\n") {
                    let start, end;
                    start = i;

                    while (i + 1 < originalString.length && originalString[i + 1] === "\n") {
                        i += 1;
                    }
                    end = i + 1;

                    newArray.push({
                        content: {
                            tag: "br",
                        },
                        start: start,
                        end: end,
                    });

                    lineStart = i + 1;
                } else {
                    // TODO: these dummies break code. Refactor!
                    // newArray.push({
                    //     isDummy: true,
                    //     start: i,
                    //     end: i + 1,
                    // });
                }

                currentElement = {
                    isString: true,
                    start: lineStart,
                    end: currentElement.end,
                };
            }
        }

        if (currentElement.start < originalString.length) {
            capturedContent.push(currentElement);
        }
        if (capturedContent.length > 0) {
            newArray.push({
                content: this.wrap(this.processChildren(capturedContent, originalString)),
                start: lineStart,
                end: originalString.length,
            })
        }
        return newArray;
    }

    wrap(capture) {
        return {
            tag: "p",
            children: capture,
        }
    }
}

class StrongModifier extends InlineModifierMixin(Modifier) {
    constructor(options) {
        super(options);

        this.leftWhitespace = true;
        this.pattern = "*";
        this.endPattern = "*";
        this.tag = "strong";
    }
}

class ItalicModifier extends InlineModifierMixin(Modifier) {
    constructor(options) {
        super(options);

        this.leftWhitespace = true;
        this.pattern = "/";
        this.endPattern = "/";
        this.tag = "em";
    }
}

class InlineCodeModifier extends RawContentModifierMixin(InlineModifierMixin(Modifier)) {
    constructor(options) {
        super(options);

        this.pattern = "`";
        this.endPattern = "`";
        this.tag = "code";
    }

    processChildren(children, originalString) {
        if (children.length === 0) {
            return [];
        }

        return [originalString.substring(children[0].start, children[children.length - 1].end)];
    }
}

class InlineVarModifier extends RawContentModifierMixin(InlineModifierMixin(Modifier)) {
    constructor(options) {
        super(options);

        this.pattern = "$";
        this.endPattern = "$";
        this.tag = "var";
    }
}

class InlineLatexModifier extends RawContentModifierMixin(InlineModifierMixin(Modifier)) {
    constructor(options) {
        super(options);

        this.pattern = "$$";
        this.endPattern = "$$";
        this.tag = "Latex";
    }
}

class LinkModifier extends Modifier {

    static isCorrectUrl(str) {
        if (str.startsWith("http://") || str.startsWith("https://")) {
            return true;
        }
    }
    static trimProtocol(str) {
        if (str[4] === 's') {
            return str.substring(8, str.length);
        }
        return str.substring(7, str.length);
    }

    modify(currentArray, originalString) {
        let newArray = [];
        let arrayLocation = 0;
        let currentElement = currentArray[arrayLocation];
        let lineStart = 0;

        let checkAndAddUrl = (start, end) => {
            let substr = originalString.substring(start, end);
            if (this.constructor.isCorrectUrl(substr)) {
                if (currentElement.start < start) {
                    newArray.push({
                        isString: true,
                        start: currentElement.start,
                        end: start,
                    });
                }

                newArray.push({
                    isJSX: true,
                    content: {
                        tag: "a",
                        href: substr,
                        children: [this.constructor.trimProtocol(substr)],
                        target: "_blank"
                    },
                    start: start,
                    end: end,
                });

                currentElement = {
                    isString: true,
                    start: end,
                    end: currentElement.end,
                };
            }
        };

        for (let i = 0; i < originalString.length; i += 1) {
            if (i >= currentElement.end) {
                newArray.push(currentElement);
                arrayLocation += 1;
                currentElement = currentArray[arrayLocation];
            }

            if (currentElement.isJSX) {
                continue;
            }

            if ((/\s/).test(originalString[i])) {
                checkAndAddUrl(lineStart, i);
                lineStart = i + 1;
            }
        }
        if (lineStart < originalString.length) {
            checkAndAddUrl(lineStart, originalString.length);
        }
        if (currentElement.start < originalString.length) {
            newArray.push(currentElement);
        }
        return newArray;
    }
}

let MarkupModifier = Modifier;

export {MarkupModifier, HeaderModifier, ParagraphModifier, InlineCodeModifier, InlineLatexModifier, StrongModifier, LinkModifier};

class MarkupParser {
    constructor(options) {
        options = options || {};

        this.modifiers = options.modifiers || this.constructor.modifiers;
        this.uiElements = options.uiElements || new Map();
    }

    parse(content) {
        if (!content) return [];

        let result = [];

        let arr = this.parseUIElements(content);

        for (let i = this.modifiers.length - 1; i >= 0; i -= 1) {
            let modifier = this.modifiers[i];

            arr = modifier.modify(arr, content);
        }

        for (let el of arr) {
            if (el.isDummy) {
                // just skip it
            } else if (el.isString) {
                result.push(content.substring(el.start, el.end));
            } else {
                result.push(el.content);
            }
        }
        return result;
    }

    parseUIElements(content) {
        let stream = new StringStream(content);

        let result = [];
        let textStart = 0;

        while (!stream.done()) {
            let char = stream.char();

            if (char === "<" && (/[a-zA-Z]/).test(stream.at(0))) {
                stream.pointer -= 1; //step back to beginning of ui element
                let elementStart = stream.pointer;
                let uiElement;
                try {
                    uiElement = this.parseUIElement(stream);
                } catch (e) {
                    // failed to parse jsx element
                    continue;
                }

                if (this.uiElements.has(uiElement.tag)) {
                    result.push({
                        isString: true,
                        start: textStart,
                        end: elementStart,
                    });

                    result.push({
                        content: uiElement,
                        isJSX: true,
                        start: elementStart,
                        end: stream.pointer,
                    });
                    textStart = stream.pointer;
                }
            }
        }

        if (textStart < content.length) {
            result.push({
                isString: true,
                start: textStart,
                end: content.length,
            });
        }

        return result;
    }

    parseUIElement(stream, delimiter=(/\/?>/)) {
        // content should be of type <ClassName option1="string" option2={{jsonObject: true}} />
        // TODO: support nested elements like <ClassName><NestedClass /></ClassName>

        stream.whitespace();
        if (stream.done()) {
            return null;
        }

        if (stream.at(0) !== "<") {
            throw Error("Invalid UIElement declaration.");
        }

        let result = {};

        stream.char(); // skip the '<'

        result.tag = stream.word();
        stream.whitespace();

        Object.assign(result, this.parseOptions(stream, delimiter));
        stream.line(delimiter);

        return result;
    }
    
    parseOptions(stream, optionsEnd) {
        return this.constructor.parseOptions(stream, optionsEnd);
    }

    // optionsEnd cannot include whitespace or start with '='
    static parseOptions(stream, optionsEnd) {
        let options = {};

        stream.whitespace();

        while (!stream.done()) {
            // argument name is anything that comes before whitespace or '='
            stream.whitespace();

            let validOptionName = /[\w$]/;
            let optionName;
            if (validOptionName.test(stream.at(0))) {
                optionName = stream.word(validOptionName);
            }

            stream.whitespace();

            if (optionsEnd && stream.search(optionsEnd) === 0) {
                options[optionName] = true;
                break;
            }
            if (!optionName) {
                throw Error("Invalid option name");
            }

            if (stream.peek() === "=") {
                stream.char();
                stream.whitespace();

                if (stream.done()) {
                    throw Error("No argument given for option: " + optionName);
                }

                if (stream.peek() === '"') {
                    // We have a string here
                    let optionString = "";
                    let foundStringEnd = false;

                    stream.char();
                    while (!stream.done()) {
                        let char = stream.char();
                        if (char === '"') {
                            foundStringEnd = true;
                            break;
                        }
                        optionString += char;
                    }

                    if (!foundStringEnd) {
                        // You did not close that string
                        throw Error("Argument string not closed: " + optionString);
                    }
                    options[optionName] = optionString;
                } else if (stream.peek() === '{') {
                    // Once you pop, the fun don't stop
                    let bracketCount = 0;

                    let validJSON = false;
                    let jsonString = "";
                    stream.char();

                    while (!stream.done()) {
                        let char = stream.char();
                        if (char === '{') {
                            bracketCount += 1;
                        } else if (char === '}') {
                            if (bracketCount > 0) {
                                bracketCount -= 1;
                            } else {
                                // JSON ends here
                                options[optionName] = jsonString.length > 0 ? this.parseJSON5(jsonString) : undefined;
                                validJSON = true;
                                break;
                            }
                        }
                        jsonString += char;
                    }
                    if (!validJSON) {
                        throw Error("Invalid JSON argument for option: " + optionName + ". Input: " + jsonString);
                    }
                } else {
                    throw Error("Invalid argument for option: " + optionName + ". Need string or JSON.");
                }
            } else {
                options[optionName] = true;
            }
            stream.whitespace();
        }

        return options;
    }

    parseTextLine(stream) {
        let lastModifier = new Map();

        let capturedContent = [];

        // This will always be set to the last closed modifier
        let capturedEnd = -1;

        let textStart = stream.pointer;
        let contentStart = stream.pointer;

        while (!stream.done()) {
            if (stream.startsWith(/\s+\r*\n/)) {
                // end of line, stop here
                break;
            }

            if (stream.at(0) === "<") {
                capturedContent.push({
                    content: stream.string.substring(contentStart, stream.pointer),
                    start: contentStart,
                    end: stream.pointer
                });
                let uiElementStart = stream.pointer;
                let uiElement = this.parseUIElement(stream, (/\/*>/));
                capturedContent.push({
                    content: uiElement,
                    start: uiElementStart,
                    end: stream.pointer,
                });
                contentStart = stream.pointer;
                continue;
            }

            let char = stream.char();

            if (char === "\\") {
                // escape next character
                char += stream.char();
            }
        }

        let remainingContent = stream.string.substring(textStart, stream.pointer);
        if (remainingContent.length > 0) {
            capturedContent.push(remainingContent);
        }
        stream.line(); // delete line endings

        return capturedContent;
    }
}

MarkupParser.modifiers = [
    new BlockCodeModifier(),
    new HeaderModifier(),
    new HorizontalRuleModifier(),
    new UnorderedListModifier(),
    new OrderedListModifier(),
    new ParagraphModifier(),
    new InlineCodeModifier(),
    new InlineLatexModifier(),
    new InlineVarModifier(),
    new StrongModifier(),
    new ItalicModifier(),
    new LinkModifier()
];

// json5.js
// This file is based directly off of Douglas Crockford's json_parse.js:
// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js
MarkupParser.parseJSON5 = (function() {
    // This is a function that can parse a JSON5 text, producing a JavaScript
    // data structure. It is a simple, recursive descent parser. It does not use
    // eval or regular expressions, so it can be used as a model for implementing
    // a JSON5 parser in other languages.

    // We are defining the function inside of another function to avoid creating
    // global variables.

    let at,           // The index of the current character
        lineNumber,   // The current line number
        columnNumber, // The current column number
        ch;           // The current character
    let escapee = {
        "'": "'",
        '"': '"',
        '\\': '\\',
        '/': '/',
        '\n': '',       // Replace escaped newlines in strings w/ empty string
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t'
    };
    let text;

    let renderChar = (chr) => {
        return chr === '' ? 'EOF' : "'" + chr + "'";
    };

    let error = (m) => {
        // Call error when something is wrong.

        let error = new SyntaxError();
        // beginning of message suffix to agree with that provided by Gecko - see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
        error.message = m + " at line " + lineNumber + " column " + columnNumber + " of the JSON5 data. Still to read: " + JSON.stringify(text.substring(at - 1, at + 19));
        error.at = at;
        // These two property names have been chosen to agree with the ones in Gecko, the only popular
        // environment which seems to supply this info on JSON.parse
        error.lineNumber = lineNumber;
        error.columnNumber = columnNumber;
        throw error;
    };

    let next = (c) => {
        // If a c parameter is provided, verify that it matches the current character.

        if (c && c !== ch) {
            error("Expected " + renderChar(c) + " instead of " + renderChar(ch));
        }

        // Get the next character. When there are no more characters,
        // return the empty string.

        ch = text.charAt(at);
        at++;
        columnNumber++;
        if (ch === '\n' || ch === '\r' && peek() !== '\n') {
            lineNumber++;
            columnNumber = 0;
        }
        return ch;
    };

    let peek = () => {
        // Get the next character without consuming it or
        // assigning it to the ch varaible.

        return text.charAt(at);
    };

    let identifier = () => {
        // Parse an identifier. Normally, reserved words are disallowed here, but we
        // only use this for unquoted object keys, where reserved words are allowed,
        // so we don't check for those here. References:
        // - http://es5.github.com/#x7.6
        // - https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables
        // - http://docstore.mik.ua/orelly/webprog/jscript/ch02_07.htm
        // TODO Identifiers can have Unicode "letters" in them; add support for those.
        let key = ch;

        // Identifiers must start with a letter, _ or $.
        if ((ch !== '_' && ch !== '$') &&
            (ch < 'a' || ch > 'z') &&
            (ch < 'A' || ch > 'Z')) {
                error("Bad identifier as unquoted key");
        }

        // Subsequent characters can contain digits.
        while (next() && (
            ch === '_' || ch === '$' ||
            (ch >= 'a' && ch <= 'z') ||
            (ch >= 'A' && ch <= 'Z') ||
            (ch >= '0' && ch <= '9'))) {
                key += ch;
        }

        return key;
    };

    let number = () => {
        // Parse a number value.
        var number, sign = '', string = '', base = 10;

        if (ch === '-' || ch === '+') {
            sign = ch;
            next(ch);
        }

        // support for Infinity (could tweak to allow other words):
        if (ch === 'I') {
            number = word();
            if (typeof number !== 'number' || isNaN(number)) {
                error('Unexpected word for number');
            }
            return (sign === '-') ? -number : number;
        }

        // support for NaN
        if (ch === 'N') {
            number = word();
            if (!isNaN(number)) {
                error('expected word to be NaN');
            }
            // ignore sign as -NaN also is NaN
            return number;
        }

        if (ch === '0') {
            string += ch;
            next();
            if (ch === 'x' || ch === 'X') {
                string += ch;
                next();
                base = 16;
            } else if (ch >= '0' && ch <= '9') {
                error('Octal literal');
            }
        }

        switch (base) {
            case 10:
                while (ch >= '0' && ch <= '9') {
                    string += ch;
                    next();
                }
                if (ch === '.') {
                    string += '.';
                    while (next() && ch >= '0' && ch <= '9') {
                        string += ch;
                    }
                }
                if (ch === 'e' || ch === 'E') {
                    string += ch;
                    next();
                    if (ch === '-' || ch === '+') {
                        string += ch;
                        next();
                    }
                    while (ch >= '0' && ch <= '9') {
                        string += ch;
                        next();
                    }
                }
                break;
            case 16:
                while (ch >= '0' && ch <= '9' || ch >= 'A' && ch <= 'F' || ch >= 'a' && ch <= 'f') {
                    string += ch;
                    next();
                }
                break;
        }

        if (sign === '-') {
            number = -string;
        } else {
            number = +string;
        }

        if (!isFinite(number)) {
            error("Bad number");
        } else {
            return number;
        }
    };

    let string = () => {
        // Parse a string value.
        let hex, i, string = '', uffff;
        let delim; // double quote or single quote

        // When parsing for string values, we must look for ' or " and \ characters.

        if (ch === '"' || ch === "'") {
            delim = ch;
            while (next()) {
                if (ch === delim) {
                    next();
                    return string;
                } else if (ch === '\\') {
                    next();
                    if (ch === 'u') {
                        uffff = 0;
                        for (i = 0; i < 4; i += 1) {
                            hex = parseInt(next(), 16);
                            if (!isFinite(hex)) {
                                break;
                            }
                            uffff = uffff * 16 + hex;
                        }
                        string += String.fromCharCode(uffff);
                    } else if (ch === '\r') {
                        if (peek() === '\n') {
                            next();
                        }
                    } else if (typeof escapee[ch] === 'string') {
                        string += escapee[ch];
                    } else {
                        break;
                    }
                } else if (ch === '\n') {
                    // unescaped newlines are invalid; see:
                    // https://github.com/aseemk/json5/issues/24
                    // TODO this feels special-cased; are there other
                    // invalid unescaped chars?
                    break;
                } else {
                    string += ch;
                }
            }
        }
        error("Bad string");
    };

    let inlineComment = () => {
        // Skip an inline comment, assuming this is one. The current character should
        // be the second / character in the // pair that begins this inline comment.
        // To finish the inline comment, we look for a newline or the end of the text.

        if (ch !== '/') {
            error("Not an inline comment");
        }

        do {
            next();
            if (ch === '\n' || ch === '\r') {
                next();
                return;
            }
        } while (ch);
    };

    let blockComment = () => {
        // Skip a block comment, assuming this is one. The current character should be
        // the * character in the /* pair that begins this block comment.
        // To finish the block comment, we look for an ending */ pair of characters,
        // but we also watch for the end of text before the comment is terminated.

        if (ch !== '*') {
            error("Not a block comment");
        }

        do {
            next();
            while (ch === '*') {
                next('*');
                if (ch === '/') {
                    next('/');
                    return;
                }
            }
        } while (ch);

        error("Unterminated block comment");
    };

    let comment = () => {
        // Skip a comment, whether inline or block-level, assuming this is one.
        // Comments always begin with a / character.

        if (ch !== '/') {
            error("Not a comment");
        }

        next('/');

        if (ch === '/') {
            inlineComment();
        } else if (ch === '*') {
            blockComment();
        } else {
            error("Unrecognized comment");
        }
    };

    let white = () => {
        // Skip whitespace and comments.
        // Note that we're detecting comments by only a single / character.
        // This works since regular expressions are not valid JSON(5), but this will
        // break if there are other valid values that begin with a / character!

        while (ch) {
            if (ch === '/') {
                comment();
            } else if (/\s/.test(ch)) {
                next();
            } else {
                return;
            }
        }
    };

    let word = () => {
        // true, false, or null.

        switch (ch) {
            case 't':
                next('t');
                next('r');
                next('u');
                next('e');
                return true;
            case 'f':
                next('f');
                next('a');
                next('l');
                next('s');
                next('e');
                return false;
            case 'n':
                next('n');
                next('u');
                next('l');
                next('l');
                return null;
            case 'I':
                next('I');
                next('n');
                next('f');
                next('i');
                next('n');
                next('i');
                next('t');
                next('y');
                return Infinity;
            case 'N':
                next('N');
                next('a');
                next('N');
                return NaN;
        }
        error("Unexpected " + renderChar(ch));
    };

    let value;

    let array = () => {
        // Parse an array value.
        let array = [];

        if (ch === '[') {
            next('[');
            white();
            while (ch) {
                if (ch === ']') {
                    next(']');
                    return array;   // Potentially empty array
                }
                // ES5 allows omitting elements in arrays, e.g. [,] and
                // [,null]. We don't allow this in JSON5.
                if (ch === ',') {
                    error("Missing array element");
                } else {
                    array.push(value());
                }
                white();
                // If there's no comma after this value, this needs to
                // be the end of the array.
                if (ch !== ',') {
                    next(']');
                    return array;
                }
                next(',');
                white();
            }
        }
        error("Bad array");
    };

    let object = () => {
        // Parse an object value.

        var key,
            object = {};

        if (ch === '{') {
            next('{');
            white();
            while (ch) {
                if (ch === '}') {
                    next('}');
                    return object;   // Potentially empty object
                }

                // Keys can be unquoted. If they are, they need to be
                // valid JS identifiers.
                if (ch === '"' || ch === "'") {
                    key = string();
                } else {
                    key = identifier();
                }

                white();
                next(':');
                object[key] = value();
                white();
                // If there's no comma after this pair, this needs to be
                // the end of the object.
                if (ch !== ',') {
                    next('}');
                    return object;
                }
                next(',');
                white();
            }
        }
        error("Bad object");
    };

    value = () => {
        // Parse a JSON value. It could be an object, an array, a string, a number,
        // or a word.

        white();
        switch (ch) {
        case '{':
            return object();
        case '[':
            return array();
        case '"':
        case "'":
            return string();
        case '-':
        case '+':
        case '.':
            return number();
        default:
            return ch >= '0' && ch <= '9' ? number() : word();
        }
    };

    // Return the json_parse function. It will have access to all of the above
    // functions and variables.

    return function (source, reviver) {
        var result;

        text = String(source);
        at = 0;
        lineNumber = 1;
        columnNumber = 1;
        ch = ' ';
        result = value();
        white();
        if (ch) {
            error("Syntax error");
        }

        // If there is a reviver function, we recursively walk the new structure,
        // passing each name/value pair to the reviver function for possible
        // transformation, starting with a temporary root object that holds the result
        // in an empty key. If there is not a reviver function, we simply return the
        // result.

        return typeof reviver === 'function' ? (function walk(holder, key) {
            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }({'': result}, '')) : result;
    };
})();

export {MarkupParser};


// TODO: these should be in a unit test file, not here
export function TestStringStream() {
    let tests = [];

    tests.push(() => {
        let ss = new StringStream("Ala bala    portocala");

        let temp;

        temp = ss.char();
        if (temp !== "A") {
            throw Error("char seems to fail. Expected: 'A' , got '" + temp + "'");
        }

        temp = ss.word();
        if (temp !== "la") {
            throw Error("word seems to fail. Expected: 'la' , got '" + temp + "'");
        }

        temp = ss.word();
        if (temp !== "bala") {
            throw Error("word seems to fail. Expected: 'bala' , got '" + temp + "'");
        }

        temp = ss.word();
        if (temp !== "portocala") {
            throw Error("word seems to fail. Expected: 'portocala' , got '" + temp + "'");
        }
    });

    tests.push(() => {
        let ss = new StringStream("Ala bala    portocala");

        let temp;

        temp = ss.word();
        if (temp !== "Ala") {
            throw Error("word seems to fail. Expected: 'Ala' , got '" + temp + "'");
        }

        temp = ss.char();
        if (temp !== " ") {
            throw Error("word seems to fail. Expected: ' ' , got '" + temp + "'");
        }

        temp = ss.line();
        if (temp !== "bala    portocala") {
            throw Error("line seems to fail. Expected: 'bala    portocala' , got '" + temp + "'");
        }
    });

    tests.push(() => {
        let ss = new StringStream("Buna bate toba\n Bunica bate tare\nBunica bate tobaaa \nCu maciuca-n casa mare!");

        let temp;

        temp = ss.line();
        if (temp !== "Buna bate toba") {
            throw Error("line seems to fail. Expected: 'Buna bate toba' , got '" + temp + "'");
        }

        temp = ss.word();
        if (temp !== "Bunica") {
            throw Error("word seems to fail. Expected: 'Bunica' , got '" + temp + "'");
        }

        temp = ss.line("\n");
        if (temp !== " bate tare") {
            throw Error("line seems to fail. Expected: ' bate tare' , got '" + temp + "'");
        }

        temp = ss.line("\n", 11);
        if (temp !== "Bunica bate") {
            throw Error("line seems to fail. Expected: 'Bunica bate' , got '" + temp + "'");
        }

        temp = ss.word();
        if (temp !== "tobaaa") {
            throw Error("line seems to fail. Expected: 'tobaaa' , got '" + temp + "'");
        }

        ss.char();
        temp = ss.line();
        if (temp !== "") {
            throw Error("line seems to fail. Expected: '' , got '" + temp + "'");
        }

        temp = ss.line('\n', 100);
        if (temp !== "Cu maciuca-n casa mare!") {
            throw Error("line seems to fail. Expected: 'Cu maciuca-n casa mare!' , got '" + temp + "'");
        }
    });



    let numFailed = 0;
    for (let i = 0; i < tests.length; i += 1) {
        try {
            tests[i]();
            console.log("Test ", i, " ran successfully.");
        } catch (e) {
            numFailed += 1;
            console.log("Failed StringStream test ", i, "! Reason: ", e);
        }
    }

    console.log("Finished running all tests. Failed: ", numFailed);
}
