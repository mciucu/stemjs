import {UI} from "../UIBase";
import {CollapsibleStyle} from "./Style";
import {GlobalStyle} from "../GlobalStyle";
import {MakeIcon} from "../SimpleElements";

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
