import {UI} from "./UIBase";
import {SimpleStyledElement} from "./Bootstrap3";
import {BasicLevelStyleSheet, GlobalStyle} from "./GlobalStyle";
import {registerStyle} from "./style/Theme";
import {buildColors} from "./Color";
import {styleRule} from "../decorators/Style";

export function cardPanelColorToStyle(color) {
    let colors = buildColors(color);
    return {
        borderColor: colors[4],
    };
}

export class CardPanelStyle extends BasicLevelStyleSheet(cardPanelColorToStyle) {
    @styleRule
    heading = [{
        padding: "0.8em 1.2em",
        borderBottomWidth: "0.08em",
        borderBottomStyle: "solid",
    },
        cardPanelHeaderColorToStyle(this.themeProperties.COLOR_PLAIN)
    ];

    @styleRule
    body = {
    };

    @styleRule
    panel = [{
        borderWidth: "0.08em",
        borderRadius: this.themeProperties.BASE_BORDER_RADIUS,
        borderStyle: "solid",
        backgroundColor: "#ffffff",
    },
        cardPanelColorToStyle(this.themeProperties.COLOR_PLAIN)
    ];
}

function cardPanelHeaderColorToStyle(color){
    let colors = buildColors(color);
    return {
        color: colors[6],
        backgroundColor: colors[1],
        borderBottomColor: colors[4],
    };
}

export const CardPanelHeaderStyle = BasicLevelStyleSheet(cardPanelHeaderColorToStyle);


@registerStyle(CardPanelStyle)
class CardPanel extends SimpleStyledElement {
    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.panel);
        if (this.getLevel()) {
            attr.addClass(this.styleSheet.Level(this.getLevel()));
        }
        if (this.getSize()) {
            attr.addClass(this.styleSheet.Size(this.getSize()).panel);
        }
    }

    getTitle() {
        return this.options.title;
    }

    getHeaderStyleSheet() {
        return CardPanelHeaderStyle.getInstance();
    }

    render() {
        let headingLevel = this.getHeaderStyleSheet().Level(this.getLevel());

        return [
            <div className={`${this.styleSheet.heading} ${headingLevel}`}>{this.getTitle()}</div>,
            <div className={this.styleSheet.body} style={this.options.bodyStyle}>{this.getGivenChildren()}</div>,
        ];
    }
}

// TODO: delete references to these
GlobalStyle.CardPanel = CardPanelStyle.getInstance();
GlobalStyle.CardPanelHeader = CardPanelHeaderStyle.getInstance();

export {CardPanel};
