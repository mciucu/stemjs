import {UI, type StyleObject, type UIChild} from "./UIBase";
import {buildColors} from "./Color";
import {BasicLevelStyleSheet, type CSSStyleObject} from "./GlobalStyle";
import {styleRule} from "../decorators/Style";
import {registerStyle} from "./Style";
import {Orientation, type OrientationType} from "./Constants";
import {SimpleStyledElement, type SimpleStyledElementOptions} from "./SimpleElements";
import {BaseUIElement} from "./UIBase";

export interface ProgressBarOptions extends SimpleStyledElementOptions {
    value?: number;
    orientation?: OrientationType;
    height?: number;
    disableTransition?: boolean;
    striped?: boolean;
    active?: boolean;
    color?: string;
    label?: UIChild;
}

const progressBarColorToStyle = (color: string): CSSStyleObject => {
    const colors = buildColors(color);
    return {
        backgroundColor: colors[1],
    };
};

export class ProgressBarStyle extends BasicLevelStyleSheet(progressBarColorToStyle) {
    @styleRule
    container = {
        position: "relative",
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
        backgroundColor: "#337ab7",
        boxShadow: "inset 0 -1px 0 rgba(0, 0, 0, .15)",
        transition: "width .25s ease",
        ...this.colorStyleRule(this.themeProps.COLOR_PRIMARY),
    };

    // Over the whole bar, so it stays whole at any fill, with text painted by a gradient that turns at the fill's edge
    @styleRule
    label = {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        lineHeight: "20px",
        fontSize: 12,
        textAlign: "center",
        whiteSpace: "nowrap",
        color: "transparent",
        "-webkit-background-clip": "text",
        backgroundClip: "text",
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
    xs = {
        fontSize: "8px",
    };

    @styleRule
    sm = {
        fontSize: "10px",
    };

    @styleRule
    md = {};

    @styleRule
    lg = {
        fontSize: "14px",
    };

    @styleRule
    xl = {
        fontSize: "17px",
        padding: "0.1em 0.2em",
    };
}

@registerStyle(ProgressBarStyle)
export class ProgressBar extends SimpleStyledElement<ProgressBarOptions> {
    render(): UIChild {
        const valueInPercent = Math.min(Math.max(this.options.value || 0, 0), 1) * 100;
        let orientation: OrientationType = Orientation.HORIZONTAL;
        if (this.options.hasOwnProperty("orientation")) {
            orientation = this.options.orientation!;
        }
        
        let barStyle: StyleObject;
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

        const {label} = this.options;
        // The label's colours turn at once, so a fill still moving would leave its text on the wrong background
        if (this.options.disableTransition || label != null) {
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

        const labelStyle = {backgroundImage: `linear-gradient(to right, #fff ${valueInPercent}%, #333 ${valueInPercent}%)`};

        return [
            <div {...barOptions} />,
            label != null && <span className={this.styleSheet.label} style={labelStyle}>{label}</span>,
        ];
    }

    set(value: number): void {
        this.options.value = value;
        this.redraw();
    }
}
