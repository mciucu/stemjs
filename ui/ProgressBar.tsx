import {UI, UIElementChild} from "./UIBase";
import {buildColors} from "./Color";
import {BasicLevelStyleSheet} from "./GlobalStyle";
import {styleRule} from "../decorators/Style";
import {registerStyle} from "./style/Theme";
import {Orientation, OrientationType} from "./Constants";
import {SimpleStyledElement, SimpleStyledElementOptions} from "./SimpleElements";
import {BaseUIElement} from "./UIBase";

export interface ProgressBarOptions extends SimpleStyledElementOptions {
    value?: number;
    orientation?: OrientationType;
    height?: number;
    disableTransition?: boolean;
    striped?: boolean;
    active?: boolean;
    color?: string;
    label?: string | BaseUIElement;
}

const progressBarColorToStyle = (color: string): any => {
    const colors = buildColors(color);
    return {
        backgroundColor: colors[1],
    };
};

export class ProgressBarStyle extends BasicLevelStyleSheet(progressBarColorToStyle) {
    @styleRule
    container = {
        height: 20,
        marginBottom: 20,
        overflow: "hidden",
        backgroundColor: "#f5f5f5",
        borderRadius: 4,
        boxShadow: "inset 0 1px 2px rgba(0, 0, 0, .1)",
    };

    @styleRule
    bar = {
        float: "left",
        width: "0",
        height: "100%",
        lineHeight: "20px",
        color: "#fff",
        textAlign: "center",
        backgroundColor: "#337ab7",
        boxShadow: "inset 0 -1px 0 rgba(0, 0, 0, .15)",
        transition: "width .25s ease",
        fontColor: "#ffffff",
        fontSize: 12,
        ...this.colorStyleRule(this.themeProps.COLOR_PRIMARY),
    };

    @styleRule
    striped = {
        backgroundImage: "linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent)",
        backgroundSize: "40px 40px",
    };

    @styleRule
    active = {
        animation: "progress-bar-stripes 2s linear infinite",
    };

    @styleRule
    EXTRA_SMALL = {
        fontSize: "8px",
    };

    @styleRule
    SMALL = {
        fontSize: "10px",
    };

    @styleRule
    MEDIUM = {};

    @styleRule
    LARGE = {
        fontSize: "14px",
    };

    @styleRule
    EXTRA_LARGE = {
        fontSize: "17px",
        padding: "0.1em 0.2em",
    };
}

// Interface declaration for proper typing
export interface ProgressBar {
    // @ts-ignore
    styleSheet: ProgressBarStyle;
}

@registerStyle(ProgressBarStyle)
export class ProgressBar extends SimpleStyledElement<ProgressBarOptions> {
    render(): UIElementChild {
        const valueInPercent = (this.options.value || 0) * 100;
        let orientation: OrientationType = Orientation.HORIZONTAL;
        if (this.options.hasOwnProperty("orientation")) {
            orientation = this.options.orientation!;
        }
        
        let barStyle: any;
        if (orientation === Orientation.HORIZONTAL) {
            barStyle = {
                width: valueInPercent + "%",
                height: this.options.height,
            };
        } else {
            barStyle = {
                height: valueInPercent + "%",
                width: "5px",
            };
        }
        
        const barOptions = {
            className: String(this.styleSheet.bar),
            style: barStyle,
        };

        if (this.options.disableTransition) {
            Object.assign(barOptions.style, {
                transition: "none",
            });
        }

        if (this.options.level) {
            barOptions.className += " " + this.styleSheet.Level(this.getLevel());
        }
        if (this.options.striped) {
            barOptions.className += " " + this.styleSheet.striped;
        }
        if (this.options.active) {
            barOptions.className += " " + this.styleSheet.active;
        }
        if (this.options.color) {
            barOptions.style.backgroundColor = this.options.color;
        }

        return <div {...barOptions}>
            <span>{this.options.label}</span>
        </div>;
    }

    set(value: number): void {
        // TODO @cleanup clamp
        if (value < 0) {
            value = 0;
        } else if (value > 1) {
            value = 1;
        }
        this.options.value = value;
        this.redraw();
    }
}