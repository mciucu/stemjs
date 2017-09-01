import {CollapsibleStyle} from "./Style";

function CollapsibleMixin(BaseClass, CollapsibleClass = CollapsibleStyle) {
    class CollapsibleElement extends BaseClass {
        getDefaultOptions() {
            return {
                collapsed: true,
            };
        }

        static collapsibleStyleSheet = new CollapsibleClass();

        getCollapsibleStyleSheet() {
            return this.options.collapsibleStyleSheet || this.constructor.collapsibleStyleSheet;
        }

        expand(panel) {
            this.options.collapsed = false;
            this.dispatch("expand");
            const collapsibleStyle = this.getCollapsibleStyleSheet();
            panel.addClass(collapsibleStyle.collapsing);
            panel.removeClass("hidden");
            setTimeout(() => {
                panel.removeClass(collapsibleStyle.collapsed);
            }, 100);
        }

        collapse(panel) {
            this.options.collapsed = true;
            this.dispatch("collapse");
            const collapsibleStyle = this.getCollapsibleStyleSheet();
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
