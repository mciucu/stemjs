import {UI} from "../UIBase";
import {CollapsibleMixin} from "./CollapsibleMixin";
import {CardPanel} from "../CardPanel";
import {CollapsiblePanelStyle} from "./Style";
import {registerStyle} from "../style/Theme";
import {MakeIcon} from "../SimpleElements";

@registerStyle(CollapsiblePanelStyle)
class CollapsiblePanel extends CollapsibleMixin(CardPanel) {
    toggle() {
        if (this.options.collapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    expand() {
        super.expand(this.contentArea);
        this.icon.removeClass(this.styleSheet.iconCollapsed);
    }

    collapse() {
        super.collapse(this.contentArea);
        this.icon.addClass(this.styleSheet.iconCollapsed);
    }

    getChildrenToRender() {
        let contentClassName = this.styleSheet.content;
        let iconClassName = this.styleSheet.icon;

        if (this.options.collapsed) {
            iconClassName += this.styleSheet.iconCollapsed;
            contentClassName += " hidden " + this.styleSheet.collapsed;
        }

        return [
            <div onClick={() => this.toggle()} className={this.styleSheet.heading}>
                <div ref="icon" className={iconClassName}>
                    {MakeIcon("chevron-down")}
                </div>
                <span className={this.styleSheet.title}>{this.getTitle()}</span>
            </div>,
            <div style={{overflow: "hidden"}}>
                <div ref="contentArea" className={contentClassName}>
                    {this.render()}
                </div>
            </div>
        ];
    }
}


class DelayedCollapsiblePanel extends CollapsiblePanel {
    toggle() {
        if (!this._haveExpanded) {
            this._haveExpanded = true;
            UI.renderingStack.push(this);
            this.contentArea.options.children = this.render();
            UI.renderingStack.pop();
            this.contentArea.redraw();
            this.delayedMount();
        }
        super.toggle();
    }

    render() {
        if (!this._haveExpanded) {
            return [];
        }
        return this.getDelayedChildren();
    }
}

export {CollapsiblePanel, DelayedCollapsiblePanel};
