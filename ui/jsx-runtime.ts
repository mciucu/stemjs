// JSX Runtime for StemJS
import {UI, BaseUIElement, UIElement, type UIElementOptions, type HTMLTagType, type SVGTagType} from "./UIBase";
import {SVGUIElement} from "./svg/SVGBase";

// The new JSX transform expects jsx/jsxs with (type, props, key) signature
export function jsx<K extends HTMLTagType>(type: K, props: any, key?: string | number): UIElement<{}, HTMLElementTagNameMap[K]>;
export function jsx<K extends SVGTagType>(type: K, props: any, key?: string | number): SVGUIElement<{}, SVGElementTagNameMap[K]>;
export function jsx<T extends BaseUIElement>(type: new (options?: any) => T, props: any, key?: string | number): T;
export function jsx(type: any, props: any, key?: string | number): BaseUIElement;
export function jsx(type: any, props: any, key?: string | number): BaseUIElement {
    const {children, ...restProps} = props || {};
    if (children !== undefined) {
        return UI.createElement(type, restProps, children);
    }
    return UI.createElement(type, restProps);
}

export function jsxs<K extends HTMLTagType>(type: K, props: any, key?: string | number): UIElement<{}, HTMLElementTagNameMap[K]>;
export function jsxs<K extends SVGTagType>(type: K, props: any, key?: string | number): SVGUIElement<{}, SVGElementTagNameMap[K]>;
export function jsxs<T extends BaseUIElement>(type: new (options?: any) => T, props: any, key?: string | number): T;
export function jsxs(type: any, props: any, key?: string | number): BaseUIElement;
export function jsxs(type: any, props: any, key?: string | number): BaseUIElement {
    const {children, ...restProps} = props || {};
    if (children !== undefined) {
        return UI.createElement(type, restProps, ...children);
    }
    return UI.createElement(type, restProps);
}

export const Fragment = "fragment";

// Re-export types needed for JSX
export type {BaseUIElement, UIElementOptions, HTMLTagType, SVGTagType};
