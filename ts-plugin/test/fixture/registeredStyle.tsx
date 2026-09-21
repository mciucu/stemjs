// registerStyle replaces the sheet a class reads rather than extending the one its base registered, so a
// subclass that registers its own is not an incompatible override. A sheet built on the base's is one, and
// the mismatch it catches is left to report.

import {styleRule, StyleSheet} from "../../../ui/Style";
import {registerStyle} from "../../../ui/style/Theme";
import {UIElement} from "../../../ui/UIBase";

class FramedStyle extends StyleSheet {
    @styleRule
    frame = {
        color: "red",
    };
}

@registerStyle(FramedStyle)
class Framed extends UIElement {
    framed(): string {
        return this.styleSheet.frame;
    }
}

class PlainStyle extends StyleSheet {
    @styleRule
    plain = {
        color: "blue",
    };
}

// Nothing of the base's sheet survives, which is what the decorator is for
@registerStyle(PlainStyle)
export class Plain extends Framed {
    plainest(): string {
        return this.styleSheet.plain;
    }
}

// A rule redeclared with the object it is written with, rather than with what it becomes
class RebuiltStyle extends FramedStyle {
    frame = {};
}

@registerStyle(RebuiltStyle)
// @ts-expect-error
export class Rebuilt extends Framed {}
