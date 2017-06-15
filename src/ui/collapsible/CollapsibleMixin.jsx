import {CollapsibleStyle} from "./Style";

function CollapsibleMixin(BaseClass, CollapsibleClass = CollapsibleStyle) {
    class CollapsibleElement extends BaseClass {
        getDefaultOptions() {
            return {
                collapsed: true,
            };
        }

        static collapsibleStyleSet = new CollapsibleClass();

        getCollapsibleStyleSet() {
            return this.options.collapsibleStyleSet || this.constructor.collapsibleStyleSet;
        }

        expand(panel) {
            this.options.collapsed = false;
            const collapsibleStyle = this.getCollapsibleStyleSet();
            panel.addClass(collapsibleStyle.collapsing);
            panel.removeClass("hidden");
            setTimeout(() => {
                panel.removeClass(collapsibleStyle.collapsed);
            }, 100);
        }

        collapse(panel) {
            this.options.collapsed = true;
            const collapsibleStyle = this.getCollapsibleStyleSet();
            panel.addClass(collapsibleStyle.collapsing);
            panel.addClass(collapsibleStyle.collapsed);
            let transitionEndFunction = () => {
                if (this.options.collapsed) {
                    panel.addClass("hidden");
                }
            };
            panel.addNodeListener("transitionend", transitionEndFunction);
        }
    }

    return CollapsibleElement;
}


export {CollapsibleMixin};
