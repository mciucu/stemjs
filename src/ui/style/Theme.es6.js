import {Dispatchable} from "../../base/Dispatcher";
import {UI} from "../UIBase";

function getInstance(styleSheet) {
    if (typeof styleSheet === "function") {
        if (typeof styleSheet.getInstance === "function") {
            styleSheet = styleSheet.getInstance();
        } else {
            styleSheet = styleSheet();
        }
    }
    return styleSheet;
}

function getInstanceForObject(obj) {
    if (!obj) {
        return null;
    }
    let styleSheet = obj.styleSheet || obj.styleSet;
    return getInstance(styleSheet);
}

// TODO: the Theme class still need considering
class Theme extends Dispatchable {
    register(cls, styleSheet) {
        // TODO: keep a set of classes in this Theme?
        cls.styleSheet = styleSheet;
        cls.theme = this;
    }

    static register(cls, styleSheet) {
        return this.Global.register(...arguments);
    }
}

Theme.Global = new Theme();

// We're going to add some methods to UI.Element, to be able to access their style sheets
function styleSheetGetter() {
    return getInstanceForObject(this.options) || getInstanceForObject(this.constructor);
    // TODO: also add a listener here when the styleSheet changes?
}

// TODO: should fixate on a single nomenclature, just use StyleSheet everywhere
UI.Element.prototype.getStyleSheet = UI.Element.prototype.getStyleSet = styleSheetGetter;

// TODO: not sure if I like the getter pattern
Object.defineProperty(UI.Element.prototype, "styleSheet", {
    get: styleSheetGetter,
    set: function (value) {
        throw Error("Don't change the styleSheet of a UI Element, change this attribute in this.options");
    }
});

// TODO: create a getter, .styleSheet??

export {Theme};
