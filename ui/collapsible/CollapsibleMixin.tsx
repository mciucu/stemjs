import {UI, UIElement} from "../UIBase";
import {CollapsibleStyle} from "./Style";
import {GlobalStyle} from "../GlobalStyle";
import {MakeIcon} from "../SimpleElements";
import {registerStyle} from "../style/Theme";
import {Constructor, isFunction} from "../../base/Utils";
import {BaseInputElement} from "../input/BaseInputElement";
import {StyleRules, styleRule, StyleSheet} from "../Style";


export interface CollapsibleOptions {
    collapsed?: boolean;
    collapsibleStyleSheet?: StyleRules<CollapsibleStyle>;
}

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


interface CollapsibleControllerInputOptions {
    // The panel to collapse, given directly or resolved lazily
    target?: UIElement | (() => UIElement);
}

// If value is true, it means we're collapsed
@registerStyle(SimpleCollapsibleStyle)
export class CollapsibleControllerInput extends BaseInputElement<boolean, CollapsibleControllerInputOptions> {
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

function CollapsibleMixin<BaseClassType extends Constructor<UIElement<any>>>(BaseClass: BaseClassType, CollapsibleClass: typeof CollapsibleStyle = CollapsibleStyle) {
    class CollapsibleElement extends BaseClass {
        // Declared inside a function, so ts-plugin can't append a merged interface for it
        declare ["constructor"]: UIElement<any>["constructor"] & {collapsibleStyleSheet: StyleRules<CollapsibleStyle>};

        static collapsibleStyleSheet = CollapsibleClass.getInstance();

        declare contentArea: UIElement;
        declare toggleIcon?: UIElement;

        getDefaultOptions(): Partial<CollapsibleOptions> {
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
