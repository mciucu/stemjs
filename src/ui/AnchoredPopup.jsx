import {UI} from "./UIBase.js";
import {styleRule, StyleSheet} from "./Style.js";
import {registerStyle} from "./style/Theme.js";
import {Router} from "./Router.jsx";
import {Direction} from "./Constants.js";
import {unwrapArray} from "../base/Utils.js";

export class AnchoredPopupStyle extends StyleSheet {
    transitionTime = 200;

    @styleRule
    transition = {
        transition: this.transitionTime + "ms ease",
    }

    @styleRule
    popup = {
        background: this.themeProps.POPUP_BACKGROUND,
        boxShadow: this.themeProps.POPUP_SHADOW,
        border: this.themeProps.POPUP_BORDER,
        borderRadius: this.themeProps.CARD_BORDER_RADIUS,
        // TODO: Create a constants object with all of the floating elements' zIndexes so we have an idea of the overlapping.
        zIndex: 100005,
        transformOrigin: "top",
        position: "fixed",
        transform: "scale(1) translateY(0)",
        opacity: 1,
    }

    @styleRule
    hidden = {
        pointerEvents: "none",
        transform: "scale(.9) translateY(-10px)",
        opacity: 0,
    };
}

// TODO: Fix when it doesn't fit the body. (see the popup in the Reports chart)
@registerStyle(AnchoredPopupStyle)
export class AnchoredPopup extends UI.Element {
    hidden = true;
    destroyed = false;
    interval = null;
    maxHeight = null;
    anchorRect = this.options.anchor.node.getBoundingClientRect();
    bodyRect = document.body.getBoundingClientRect();

    static show(options) {
        const {anchor, toggleOnSameAnchor} = options;
        if (!anchor) {
            console.error("An anchor is required for a popup");
            return null;
        }

        // Only one element can be on the same anchor
        if (this.lastShownModal?.options?.anchor === anchor) {
            this.lastShownModal.hide();
            if (!toggleOnSameAnchor) {
                return null;
            }
        }

        this.lastShownModal = this.create(document.body, options)
        return this.lastShownModal;
    }

    getDefaultOptions(options) {
        return {
            ...super.getDefaultOptions(options),
            anchor: null,
            offset: 0,
            toggleOnSameAnchor: false, // If true, when we're displaying on the same anchor, a show will hide an existing popup
            hideOnMouseLeave: false,
            direction: Direction.DOWN,
        };
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.popup);
        if (this.hidden) {
            attr.addClass(this.styleSheet.hidden);
        } else {
            attr.addClass(this.styleSheet.transition);
        }
        if (!this.getHeight()) {
            attr.setStyle({top: 0, left: 0});
            return;
        }
        const {offset, direction} = this.options;
        const {top, left, width, bottom} = this.anchorRect;
        const deltaX = Math.max(0, left + this.bodyRect.left + this.getWidth() / 2 + width / 2 + window.scrollX - this.bodyRect.right + 20);
        if (direction === Direction.DOWN) {
            const deltaY = Math.max(0, bottom + offset + this.getHeight() - this.bodyRect.bottom - window.scrollY + 20);
            attr.setStyle({
                top: Math.round(bottom + offset - this.bodyRect.top - window.scrollY - deltaY),
                left: Math.round(left - this.bodyRect.left - window.scrollX + width / 2 - deltaX - this.getWidth() / 2),
            });
        }
        if (direction === Direction.UP) {
            const deltaY = Math.min(0, top - offset - this.getHeight() - this.bodyRect.top - window.scrollY - 20);
            attr.setStyle({
                top: Math.round(top - this.getHeight() - offset - this.bodyRect.top - window.scrollY - deltaY),
                left: Math.round(left - this.bodyRect.left - window.scrollX + width / 2 - deltaX - this.getWidth() / 2),
            });
        }
    }

    hide() {
        if (this.constructor.lastShownModal === this) {
            this.constructor.lastShownModal = undefined;
        }

        clearInterval(this.interval);
        this.hidden = true;
        this.redraw();
        this.destroyed = true;

        setTimeout(() => this.destroyNode(), this.styleSheet.transitionTime);
    }

    addAnchorListeners() {
        const {anchor} = this.options;

        const {top, left, width, height} = this.anchorRect;
        this.interval = this.attachInterval(() => {
            if (!anchor.node) {
                this.hide();
                return;
            }
            const rect = anchor.node.getBoundingClientRect();
            if (rect.top !== top || rect.left !== left) {
                this.hide();
            }
        }, 300);
    }

    showPopup() {
        this.hidden = false;
        this.redraw();
        this.addAnchorListeners();
    }

    render() {
        let {content} = this.options;
        if (content) {
            return unwrapArray([content]);
        }
        return super.render();
    }

    onMount() {
        this.redraw(); // This will position it correctly after height is determined but before it is shown.

        this.showPopup();
        if (this.options.hideOnMouseLeave) {
            this.addCleanupJob(this.options.anchor.addNodeListener("mouseleave", () => this.hide()));
        }

        this.attachTimeout(() => {
            if (this.destroyed) {
                return;
            }
            this.attachEventListener(document.body, "click", () => this.hide());
            this.attachEventListener(window, "resize", () => this.hide());
            this.attachListener(Router.Global, "change", () => this.hide());
            this.addClickListener(e => {
                e.stopPropagation();
                e.preventDefault();
            });
        });
    }
}
