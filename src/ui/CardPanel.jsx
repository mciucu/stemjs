import {UI} from "./UIBase";
import {SimpleStyledElement} from "./Bootstrap3";
import {GlobalStyle} from "./GlobalStyle";

class CardPanel extends SimpleStyledElement {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.CardPanel.panel);
        if (this.getLevel()) {
            attr.addClass(GlobalStyle.CardPanel.Level(this.getLevel()));
        }
        if (this.getSize()) {
            attr.addClass(GlobalStyle.CardPanel.Size(this.getSize()).panel);
        }
    }

    getTitle() {
        return this.options.title;
    }

    render() {
        let headingLevel = GlobalStyle.CardPanelHeader.Level(this.getLevel());

        return [
            <div className={`${GlobalStyle.CardPanel.heading} ${headingLevel}`}>{this.getTitle()}</div>,
            <div className={GlobalStyle.CardPanel.body} style={this.options.bodyStyle}>{this.getGivenChildren()}</div>,
        ];
    }
}

export {CardPanel};
