import {UI, UIElement} from "./UIBase";

interface Offset {
    left: number;
    top: number;
}

type NodeLike = UIElement | HTMLElement;

export function getNode(node: NodeLike): HTMLElement {
    return (node instanceof HTMLElement) ? node : node.node;
}

export function getOffset(element: NodeLike): Offset {
    if (!element) {
        return {left: 0, top: 0};
    }
    let node = getNode(element);
    const nodePosition = node.style?.position;
    let left = 0;
    let top = 0;
    while (node) {
        const nodeStyle = node.style || {};
        if (nodePosition === "absolute" && (nodeStyle as any).position === "relative") {
            return {left, top};
        }
        left += node.offsetLeft;
        top += node.offsetTop;
        node = node.offsetParent as HTMLElement;
    }
    return {left, top};
}

export function getComputedStyle(node: NodeLike, attribute?: string): string | CSSStyleDeclaration {
    node = getNode(node);
    let computedStyle = window.getComputedStyle(node, null);
    return (attribute) ? computedStyle.getPropertyValue(attribute) : computedStyle;
}

export function changeParent(element: UIElement, newParent: UIElement): void {
    const currentParent = element.parent;
    currentParent?.eraseChild(element, false);
    newParent.appendChild(element);
}

export function isElementInView(element: NodeLike): boolean {
    const node = getNode(element);

    const {top, bottom} = node.getBoundingClientRect();
    // @ts-ignore
    for (let pathNode = node; pathNode && pathNode !== document; pathNode = pathNode.parentNode) {
        if (window.getComputedStyle(pathNode).overflowY === "auto" && pathNode.scrollHeight !== pathNode.offsetHeight) {
            const rect = pathNode.getBoundingClientRect();
            return (top >= rect.top && top <= rect.bottom && bottom >= rect.top && bottom <= rect.bottom);
        }
    }
    return true;
}