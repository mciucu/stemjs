import {UI} from "./UIBase";

export function getOffset(node) {
    if (node instanceof UI.Element) {
        node = node.node;
    }
    if (!node) {
        return {left: 0, top: 0};
    }
    let nodePosition = node.style && node.style.position;
    let left = 0;
    let top = 0;
    while (node) {
        let nodeStyle = node.style || {};
        if (nodePosition === "absolute" && nodeStyle.position === "relative") {
            return {left: left, top: top};
        }
        left += node.offsetLeft;
        top += node.offsetTop;
        node = node.offsetParent;
    }
    return {left: left, top: top};
}

export function getComputedStyle(node, attribute) {
    if (node instanceof UI.Element) {
        node = node.node;
    }
    let computedStyle = window.getComputedStyle(node, null);
    return (attribute) ? computedStyle.getPropertyValue(attribute) : computedStyle;
}

export function changeParent(element, newParent) {
    const currentParent = element.parent;
    currentParent.eraseChild(element, false);
    newParent.appendChild(element);
}
