import {BaseUIElement} from "./UIBase";

export function applyDebugFlags(element: BaseUIElement): void {
    if (globalThis.STEM_DEBUG) {
        element.node.stemElement = element;
    }
}
