export function applyDebugFlags(element) {
    if (document.STEM_DEBUG) {
        element.node.stemElement = element;
        setTimeout(() => {
            if (element.node.setAttribute) {
                if (element.constructor.name !== "UIElement") {
                    element.node.setAttribute("_", element.constructor.name);
                }
            }
        }, 0);
    }
}
