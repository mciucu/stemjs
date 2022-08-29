export function applyDebugFlags(element) {
    if (self.STEM_DEBUG) {
        element.node.stemElement = element;
    }
}
