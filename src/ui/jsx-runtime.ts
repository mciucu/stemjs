// JSX Runtime for StemJS - BROKEN FOR NOW!!!
import {UI, BaseUIElement, UIElementOptions, HTMLTagType} from "./UIBase";

// The new JSX transform expects jsx/jsxs with (type, props, key) signature
export function jsx(type: any, props: any, key?: string): BaseUIElement {
    const {children, ...restProps} = props || {};
    if (children !== undefined) {
        return UI.createElement(type, restProps, children);
    }
    return UI.createElement(type, restProps);
}

export function jsxs(type: any, props: any, key?: string): BaseUIElement {
    const {children, ...restProps} = props || {};
    if (children !== undefined) {
        return UI.createElement(type, restProps, ...children);
    }
    return UI.createElement(type, restProps);
}

export const Fragment = "fragment";

// Re-export types needed for JSX
export type {BaseUIElement, UIElementOptions, HTMLTagType};
