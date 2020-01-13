export function applyDebugFlags(element) {
    if (document.STEM_DEBUG) {
        element.node.stemElement = element;
    }
}
