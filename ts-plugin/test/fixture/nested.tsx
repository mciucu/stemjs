// A class built inside a function is in that function's declaration space, so the interface that types its
// style sheet has to be written next to it - appended at the end of the file it would declare something else.
// Same rule as for a top-level class, in the only place it can merge.

import {UIElement} from "../../../ui/UIBase";
import {registerStyle, styleRule, StyleSheet} from "../../../ui/Style";

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
