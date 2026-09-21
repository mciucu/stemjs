// A class built inside a function is in that function's declaration space, so the interface that types its
// style sheet has to be written next to it - appended at the end of the file it would declare something else.
// Same rule as for a top-level class, in the only place it can merge.

import {UIElement} from "../../../ui/UIBase";
import {registerStyle, styleRule, styleRuleInherit, StyleSheet} from "../../../ui/Style";

class PopupStyle extends StyleSheet {
    @styleRule
    popup = {
        color: "red",
    };
}

export function makePopup() {
    @registerStyle(PopupStyle)
    class Popup extends UIElement {
        // The rule resolves, and as the class name it holds at runtime
        held(): string {
            return this.styleSheet.popup;
        }

        missing(): string {
            // A rule the sheet doesn't have still reports
            // @ts-expect-error
            return this.styleSheet.drawer;
        }
    }

    return Popup;
}


// The rules of a sheet a function builds are declared in that same inserted interface, so they read as the
// class names they hold rather than as the objects they are written with. Without it a subclass that
// inherits one overrides an object with a class name, and the element reports as an incompatible extend -
// which is what BasicLevelStyleSheet and DownloadButtonStyle did.
export function makeLevelStyle(color: string) {
    class LevelStyle extends StyleSheet {
        @styleRule
        level = {
            color,
        };
    }

    return LevelStyle;
}

const BaseLevelStyle = makeLevelStyle("red");

class DerivedLevelStyle extends BaseLevelStyle {
    @styleRuleInherit
    level = {
        fontWeight: "bold",
    };
}

@registerStyle(BaseLevelStyle)
class Framed extends UIElement {
    framed(): string {
        return this.styleSheet.level;
    }
}

@registerStyle(DerivedLevelStyle)
export class Rebuilt extends Framed {
    rebuilt(): string {
        return this.styleSheet.level;
    }

    missing(): string {
        // @ts-expect-error
        return this.styleSheet.levels;
    }
}
