import {UI} from "./UIBase";
import {SimpleStyledElement} from "./Bootstrap3";
import {BasicLevelStyleSheet, GlobalStyle} from "./GlobalStyle";
import {registerStyle} from "./style/Theme";
import {buildColors} from "./Color";
import {styleRule} from "../decorators/Style";
import {Level} from "ui/Constants";

export function cardPanelColorToStyle(color) {
    let colors = buildColors(color);
    return {
        borderColor: colors[4],
    };
}

export class CardPanelStyle extends BasicLevelStyleSheet(cardPanelColorToStyle) {
    @styleRule
    heading = [{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: this.themeProperties.BASE_HEADER_HEIGHT,
        textTransform: this.themeProperties.BASE_HEADER_TEXT_TRANSFORM,
        // padding: "0.8em 1.2em",
        // borderBottomWidth: "0.08em",
        // borderBottomStyle: "solid",
    },
        cardPanelHeaderColorToStyle(this.themeProperties.COLOR_PLAIN)
    ];

    @styleRule
    body = {
    };

    @styleRule
    panel = [{
        borderWidth: this.themeProperties.BASE_BORDER_WIDTH,
        borderRadius: this.themeProperties.BASE_BORDER_RADIUS,
        boxShadow: this.themeProperties.BASE_BOX_SHADOW,
        borderStyle: this.themeProperties.BASE_BORDER_STYLE,
        backgroundColor: this.themeProperties.COLOR_PLAIN,
    },
        cardPanelColorToStyle(this.themeProperties.COLOR_PLAIN)
    ];

    @styleRule
    bodyCentered = {
        textAlign: "center",
    };
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

    getLevel() {
        return super.getLevel() || Level.PRIMARY;
    }

    getTitle() {
        return this.options.title;
    }

    getHeaderStyleSheet() {
        return CardPanelHeaderStyle.getInstance();
    }

    render() {
        let headingLevel = this.getHeaderStyleSheet().Level(this.getLevel());

        const {bodyCentered} = this.options;
        let bodyClassName = this.styleSheet.body;
        if (bodyCentered) {
            bodyClassName = bodyClassName + this.styleSheet.bodyCentered;
        }

        return [
            <div className={`${this.styleSheet.heading} ${headingLevel}`}>{this.getTitle()}</div>,
            <div className={bodyClassName} style={this.options.bodyStyle}>{this.getGivenChildren()}</div>,
        ];
    }
}

// TODO: delete references to these
GlobalStyle.CardPanel = CardPanelStyle.getInstance();
GlobalStyle.CardPanelHeader = CardPanelHeaderStyle.getInstance();

export {CardPanel};
