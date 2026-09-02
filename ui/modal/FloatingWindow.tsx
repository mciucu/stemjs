import {type PartialOptions, UI} from "../UIBase";
import {FloatingWindowStyle} from "./Style";
import {registerStyle} from "../style/Theme";

export interface FloatingWindowOptions {
    // Where the window mounts, since it escapes its parent's subtree
    parentNode?: HTMLElement;
    transitionTime?: number;
    notVisible?: boolean;
}

@registerStyle(FloatingWindowStyle)
export class FloatingWindow<ExtraOptions extends FloatingWindowOptions = FloatingWindowOptions> extends UI.Element<ExtraOptions> {
    getDefaultOptions(): PartialOptions<FloatingWindow> {
        return {
            transitionTime: 0,
            style: {
                zIndex: 2016,
            }
        };
    }

    fadeOut() {
        this.removeClass(this.styleSheet.visibleAnimated);
        this.addClass(this.styleSheet.hiddenAnimated);
    }

    fadeIn() {
        this.removeClass(this.styleSheet.hiddenAnimated);
        this.addClass(this.styleSheet.visibleAnimated);
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


export class VolatileFloatingWindow<ExtraOptions extends FloatingWindowOptions = FloatingWindowOptions> extends FloatingWindow<ExtraOptions> {
    declare hideListener?: () => void;

    bindWindowListeners() {
        this.hideListener = this.hideListener || (() => {this.hide();});
        window.addEventListener("click", this.hideListener);
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
            super.hide();
        }
    }

    onUnmount() {
        super.onUnmount();
        window.removeEventListener("click", this.hideListener);
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

