import {UI} from "./UIBase";
import {SimpleStyledElement} from "./Bootstrap3";
import {BasicLevelStyleSheet, GlobalStyle} from "./GlobalStyle";
import {registerStyle} from "./style/Theme";
import {buildColors} from "./Color";
import {styleRule} from "../decorators/Style";
import {Level, Size} from "ui/Constants";

export function cardPanelColorToStyle(color) {
    let colors = buildColors(color);
    return {
        borderColor: colors[4],
    };
}

export class CardPanelStyle extends BasicLevelStyleSheet(cardPanelColorToStyle) {
    @styleRule
    DEFAULT = [{
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: this.themeProperties.CARD_PANEL_HEADER_HEIGHT,
        textTransform: this.themeProperties.CARD_PANEL_TEXT_TRANSFORM,
        paddingLeft: this.themeProperties.CARD_PANEL_HEADING_PADDING,
        paddingRight: this.themeProperties.CARD_PANEL_HEADING_PADDING,
    },
        cardPanelHeaderColorToStyle(this.themeProperties.COLOR_PLAIN)
    ];

    @styleRule
    LARGE = {
        height: this.themeProperties.CARD_PANEL_HEADER_HEIGHT_LARGE,
        paddingLeft: this.themeProperties.CARD_PANEL_HEADING_PADDING_LARGE,
        paddingRight: this.themeProperties.CARD_PANEL_HEADING_PADDING_LARGE,
    };

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
    centered = {
        display: "flex",
        justifyContent: "center",
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

    getDefaultOptions() {
        return {
            headingCentered: true,
            bodyCentered: false,
        };
    }

    getHeadingClasses() {
        let headingClasses = "";
        const headingLevel = this.getHeaderStyleSheet().Level(this.getLevel()),
            {headingCentered} = this.options;

        if (headingLevel) {
            headingClasses = headingClasses + headingLevel;
        }

        headingClasses = headingClasses + this.styleSheet.DEFAULT;
        if (this.getSize()) {
            headingClasses = headingClasses + this.styleSheet.Size(this.getSize());
        }

        if (headingCentered) {
            headingClasses = headingClasses + this.styleSheet.centered;
        }

        return headingClasses;
    }

    getBodyClasses() {
        const {bodyCentered} = this.options;

        let bodyClasses = this.styleSheet.body;
        if (bodyCentered) {
            bodyClasses = bodyClasses + this.styleSheet.centered;
        }

        return bodyClasses;
    }

    render() {
        const bodyClasses = this.getBodyClasses(),
              headingClasses = this.getHeadingClasses();

        return [
            <div ref="panelTitle" className={headingClasses}>
                {this.getTitle()}
            </div>,
            <div ref="panelBody" className={bodyClasses} style={this.options.bodyStyle}>
                {this.getGivenChildren()}
            </div>,
        ];
    }
}

// TODO: delete references to these
GlobalStyle.CardPanel = CardPanelStyle.getInstance();
GlobalStyle.CardPanelHeader = CardPanelHeaderStyle.getInstance();

export {CardPanel};
