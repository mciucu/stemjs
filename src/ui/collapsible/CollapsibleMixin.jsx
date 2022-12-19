import {UI} from "../UIBase";
import {CollapsibleStyle} from "./Style";
import {GlobalStyle} from "../GlobalStyle";
import {MakeIcon} from "../SimpleElements";
import {registerStyle} from "../style/Theme.js";
import {isFunction} from "../../base/Utils.js";


@registerStyle(CollapsibleStyle)
export class CollapsibleControllerIcon extends UI.Element {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.toggleIcon);
    }

    getTarget() {
        const {target} = this.options;
        return isFunction(target) ? target() : target;
    }

    expand() {
        const panel = this.getTarget();
        if (!panel) {
            return;
        }
        const {styleSheet} = this;
        this.options.collapsed = false;

        panel.removeClass(GlobalStyle.hidden);
        panel.addClass(styleSheet.collapsing);
        setTimeout(() => {
            panel.removeClass(styleSheet.collapsed);
        }, 100); // TODO take this from this.themeProps

        this.removeClass(styleSheet.toggleIconCollapsed);
    }

    collapse() {
        const panel = this.getTarget();
        if (!panel) {
            return;
        }
        const {styleSheet} = this;
        this.options.collapsed = true;

        panel.addClass(styleSheet.collapsing);
        panel.addClass(styleSheet.collapsed);
        // TODO(@mihai): Implement a pattern for this
        panel.addNodeListener("transitionend", () => {
            if (this.options.collapsed) {
                panel.addClass(GlobalStyle.hidden);
            }
        });

        this.addClass(styleSheet.toggleIconCollapsed);
    }

    toggle() {
        if (this.options.collapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    render() {
        return MakeIcon("chevron-down");
    }

    onMount() {
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
