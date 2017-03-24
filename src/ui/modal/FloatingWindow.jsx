import {UI} from "../UIBase";
import {FloatingWindowStyle} from "./Style";

class FloatingWindow extends UI.Element {
    static styleSet = FloatingWindowStyle.getInstance();

    getDefaultOptions() {
        return {
            transitionTime: 0
        };
    }

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle("z-index", "2016");
    }

    fadeOut() {
        this.removeClass(this.getStyleSet().visibleAnimated);
        this.addClass(this.getStyleSet().hiddenAnimated);
    }

    fadeIn() {
        this.removeClass(this.getStyleSet().hiddenAnimated);
        this.addClass(this.getStyleSet().visibleAnimated);
    }

    show() {
        // TODO: refactor this to use this.parent and UI.Element appendChild
        if (!this.isInDocument()) {
            this.parentNode.appendChild(this.node);
            this.redraw();
            setTimeout(() => {
                this.fadeIn();
            }, 0);
        }
    }

    setParentNode(parentNode) {
        this.options.parentNode = parentNode;
    }

    get parentNode() {
        if (!this.options.parentNode) {
            if (this.parent) {
                if (this.parent instanceof HTMLElement) {
                    this.options.parentNode = this.parent;
                } else {
                    this.options.parentNode = this.parent.node;
                }
            } else {
                this.options.parentNode = document.body;
            }
        }
        return this.options.parentNode;
    }

    hide() {
        // TODO: refactor this to use this.parent and UI.Element removeChild
        if (this.isInDocument()) {
            this.fadeOut();
            setTimeout(() => {
                if (this.isInDocument()) {
                    this.parentNode.removeChild(this.node);
                }
            }, this.options.transitionTime);
        }
    }
}


class VolatileFloatingWindow extends FloatingWindow {
    bindWindowListeners() {
        this.hideListener = this.hideListener || (() => {this.hide();});
        window.addEventListener("click", this.hideListener);
    }

    unbindWindowListeners() {
        window.removeEventListener("click", this.hideListener);
    }

    toggle() {
        if (!this.isInDocument()) {
            this.show();
        } else {
            this.hide();
        }
    }

    show() {
        if (!this.isInDocument()) {
            this.bindWindowListeners();
            super.show();
        }
    }

    hide() {
        if (this.isInDocument()) {
            this.unbindWindowListeners();
            super.hide();
        }
    }

    onMount() {
        if (!this.options.notVisible) {
            this.bindWindowListeners();
        } else {
            setTimeout(() => {
                this.hide();
            });
        }

        this.addClickListener((event) => {
            event.stopPropagation();
        });
    }
}

export {FloatingWindow, VolatileFloatingWindow};
