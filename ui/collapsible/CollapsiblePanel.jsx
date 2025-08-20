import {RenderStack, UI} from "../UIBase.js";
import {CollapsibleMixin} from "./CollapsibleMixin.jsx";
import {CardPanel} from "../CardPanel.jsx";
import {CollapsiblePanelStyle} from "./Style.js";
import {registerStyle} from "../style/Theme.js";
import {GlobalStyle} from "../GlobalStyle.js";

@registerStyle(CollapsiblePanelStyle)
class CollapsiblePanel extends CollapsibleMixin(CardPanel) {
    getPreservedOptions() {
        return {
            collapsed: this.options.collapsed, // TODO: rename to defaultCollapsed?
        }
    }

    getChildrenToRender() {
        let contentClassName = this.styleSheet.content;

        if (this.options.collapsed) {
            contentClassName += GlobalStyle.hidden;
        }

        return [
            <div onClick={() => this.toggle()} className={this.styleSheet.heading}>
                {this.getToggleIcon()}
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
            RenderStack.push(this);
            this.contentArea.options.children = this.render();
            RenderStack.pop();
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
