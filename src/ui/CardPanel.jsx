import {UI} from "./UIBase";
import {SimpleStyledElement} from "./Bootstrap3";
import {GlobalStyle} from "./GlobalStyle";

class CardPanel extends SimpleStyledElement {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.CardPanel.DEFAULT.panel);
        if (this.getLevel()) {
            attr.addClass(GlobalStyle.CardPanel.Level(this.getLevel()).panel);
        }
        if (this.getSize()) {
            attr.addClass(GlobalStyle.CardPanel.Size(this.getSize()).panel);
        }
    }

    getTitle() {
        return this.options.title;
    }

    render() {
        let headingLevel = (this.getLevel() ? GlobalStyle.CardPanel.Level(this.getLevel()).heading : "");

        return [
            <div className={`${GlobalStyle.CardPanel.DEFAULT.heading} ${headingLevel}`}>{this.getTitle()}</div>,
            <div className={GlobalStyle.CardPanel.DEFAULT.body} style={this.options.bodyStyle}>{this.getGivenChildren()}</div>,
        ];
    }
}

export {CardPanel};
