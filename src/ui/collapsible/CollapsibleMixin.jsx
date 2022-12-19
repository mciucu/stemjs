import {UI} from "../UIBase";
import {CollapsibleStyle} from "./Style";
import {GlobalStyle} from "../GlobalStyle";
import {MakeIcon} from "../SimpleElements";
import {registerStyle} from "../style/Theme.js";
import {isFunction} from "../../base/Utils.js";
import {BaseInputElement} from "../input/BaseInputElement.js";
import {styleRule, StyleSheet} from "../Style.js";


class SimpleCollapsibleStyle extends StyleSheet {
    @styleRule
    container = {
        transition: "all 0.3s ease",
        display: "inline-block",
    }

    @styleRule
    iconCollapsed = {
        transform: "rotate(-90deg) !important",
    }

    @styleRule
    collapsed = {
        // transition: "all 0.3s ease",
        transform: "scaleY(0)",
        maxHeight: 0,
    }
}


// If value is true, it means we're collapsed
@registerStyle(SimpleCollapsibleStyle)
export class CollapsibleControllerInput extends BaseInputElement {
    getTarget() {
        const {target} = this.options;
        return isFunction(target) ? target() : target;
    }

    expand() {
        this.setValue(false);

        const panel = this.getTarget();
        if (!panel) {
            return;
        }
        const {styleSheet} = this;

        panel.removeClass(styleSheet.collapsed);

        this.removeClass(styleSheet.iconCollapsed);
    }

    collapse() {
        this.setValue(true);

        const panel = this.getTarget();
        if (!panel) {
            return;
        }
        const {styleSheet} = this;

        panel.addClass(styleSheet.collapsed);
        // // TODO(@mihai): Implement a pattern for this
        // panel.addNodeListener("transitionend", () => {
        //     if (this.getValue()) {
        //         panel.addClass(GlobalStyle.hidden);
        //     }
        // });

        this.addClass(styleSheet.iconCollapsed);
    }

    toggle() {
        if (this.getValue()) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    applyCollapsedState() {
        if (this.getValue()) {
            this.collapse();
        } else {
            this.expand();
        }
    }

    render() {
        return MakeIcon("chevron-down");
    }

    onMount() {
        super.onMount();

        this.addClickListener(() => {
            this.toggle();
        });
    }
}

function CollapsibleMixin(BaseClass, CollapsibleClass = CollapsibleStyle) {
    class CollapsibleElement extends BaseClass {
        static collapsibleStyleSheet = CollapsibleClass.getInstance();

        getDefaultOptions() {
            return {
                collapsed: true,
            };
        }

        getCollapsibleStyleSheet() {
            return this.options.collapsibleStyleSheet || this.constructor.collapsibleStyleSheet;
        }

        getToggleIcon() {
            const collapsibleStyle = this.getCollapsibleStyleSheet();
            let iconClassName = collapsibleStyle.toggleIcon;
            if (this.options.collapsed) {
                iconClassName += collapsibleStyle.toggleIconCollapsed;
            }
            return <div ref="toggleIcon" className={iconClassName}>
                {MakeIcon("chevron-down")}
            </div>
        }

        expand(panel = this.contentArea) {
            const collapsibleStyle = this.getCollapsibleStyleSheet();
            this.options.collapsed = false;

            panel.removeClass(GlobalStyle.hidden);
            panel.addClass(collapsibleStyle.collapsing);
            setTimeout(() => {
                panel.removeClass(collapsibleStyle.collapsed);
            }, 100); // TODO @branch take this from this.themeProps

            this.toggleIcon?.removeClass(this.getCollapsibleStyleSheet().toggleIconCollapsed);
        }

        collapse(panel = this.contentArea) {
            const collapsibleStyle = this.getCollapsibleStyleSheet();
            this.options.collapsed = true;

            panel.addClass(collapsibleStyle.collapsing);
            panel.addClass(collapsibleStyle.collapsed);
            // TODO(@mihai): Implement a pattern for this
            panel.addNodeListener("transitionend", () => {
                if (this.options.collapsed) {
                    panel.addClass(GlobalStyle.hidden);
                }
            });

            this.toggleIcon?.addClass(this.getCollapsibleStyleSheet().toggleIconCollapsed);
        }

        toggle() {
            if (this.options.collapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    }

    return CollapsibleElement;
}


export {CollapsibleMixin};
