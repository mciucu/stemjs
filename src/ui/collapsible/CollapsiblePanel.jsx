import {UI} from "../UIBase";
import {CollapsibleMixin} from "./CollapsibleMixin";
import {CardPanel} from "../CardPanel";
import {CollapsiblePanelStyle} from "./Style";
import {registerStyle} from "../style/Theme";

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
        this.toggleButton.removeClass(this.styleSheet.collapsedButton);
    }

    collapse() {
        super.collapse(this.contentArea);
        setTimeout(() => {
            this.toggleButton.addClass(this.styleSheet.collapsedButton);
        }, this.getCollapsibleStyleSet().transitionDuration * 700);
    }

    setTitle(title) {
        this.options.title = title;
        this.toggleButton.setChildren(title);
    }

    render() {
        let collapsedPanelClass = "";
        let collapsedHeadingClass = "";
        let hiddenClass = "";
        let contentStyle = {};

        if (this.options.collapsed) {
            collapsedHeadingClass = this.styleSheet.collapsedButton;
            collapsedPanelClass = this.styleSheet.collapsed;
            hiddenClass = "hidden";
        }
        if (!this.options.noPadding) {
            contentStyle = {
                padding: "8px 8px",
            };
        }

        return [<div className={this.styleSheet.heading}>
                    <a ref="toggleButton"  className={`${this.styleSheet.button} ${collapsedHeadingClass}`}
                        onClick={() => this.toggle()}>
                        {this.getTitle()}
                    </a>
                </div>,
                <div style={{overflow: "hidden"}}>
                  <div ref="contentArea" className={`${collapsedPanelClass} ${hiddenClass}`}
                       style={contentStyle}>
                        {this.getGivenChildren()}
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
            this.contentArea.options.children = this.getGivenChildren();
            UI.renderingStack.pop();
            this.contentArea.redraw();
            this.delayedMount();
        }
        super.toggle();
    }

    getGivenChildren() {
        if (!this._haveExpanded) {
            return [];
        }
        return this.getDelayedChildren();
    }
}

export {CollapsiblePanel, DelayedCollapsiblePanel};
