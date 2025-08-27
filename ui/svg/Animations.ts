import {Transition} from "../Transition";
import {Color} from "../Color";
import {SVGUIElement} from "./SVGBase";
import {SVGText} from "./SVGText";
import {Point} from "../../numerics/math";


interface BlinkTransitionOptions {
    duration?: number;
    times?: number;
    firstColor?: string;
    secondColor?: string;
    executeLastStep?: boolean;
    startTime?: number;
    dependsOn?: Transition[];
}

export function makeBlinkTransition(svgElement: SVGUIElement, options?: BlinkTransitionOptions): Transition {
    let config: Required<BlinkTransitionOptions> = {
        duration: 2000,
        times: 2,
        firstColor: "grey",
        secondColor: "black",
        executeLastStep: true,
        startTime: 0,
        dependsOn: []
    };
    Object.assign(config, options);
    return new Transition({
        func: (t: number, context: any) => {
            if (t > 1 - context.interval && !context.executeLastStep) {
                svgElement.setColor(context.firstColor);
            } else {
                svgElement.setColor(Math.floor((1 - t) / context.interval) % 2 === 1 ? context.firstColor : context.secondColor);
            }
        },
        context: {
            firstColor: config.firstColor,
            secondColor: config.secondColor,
            interval: 1 / (2 * config.times),
            executeLastStep: config.executeLastStep
        },
        duration: config.duration,
        startTime: config.startTime,
        dependsOn: config.dependsOn
    });
}

export function makeOpacityTransition(svgElement: SVGUIElement, opacity: number, duration: number, dependsOn: Transition[] = [], startTime: number = 0): Transition {
    if (!svgElement.options.hasOwnProperty("opacity")) {
        svgElement.options.opacity = 1;
    }
    return new Transition({
        func: (t: number, context: any) => {
            svgElement.setOpacity((1 - t) * context.opacity + t * opacity);
        },
        context: {
            opacity: svgElement.options.opacity
        },
        duration,
        startTime,
        dependsOn
    });
}

export function makeColorTransition(svgElement: SVGUIElement, color: string, duration: number, dependsOn: Transition[] = [], startTime: number = 0): Transition {
    return new Transition({
        func: (t: number, context: any) => {
            svgElement.setColor(Color.interpolate(context.color, color, t));
        },
        context: {
            color: svgElement.getColor()
        },
        duration,
        startTime,
        dependsOn
    });
}

export function makeMoveTransition(svgElement: SVGUIElement, coords: Point, duration: number, dependsOn: Transition[] = [], startTime: number = 0): Transition {
    return new Transition({
        func: (t: number, context: any) => {
            svgElement.setPosition(
                (1 - t) * context.x + t * coords.x,
                (1 - t) * context.y + t * coords.y
            );
        },
        context: {
            x: svgElement.options.x,
            y: svgElement.options.y
        },
        duration,
        startTime,
        dependsOn
    });
}

export function makeTextFillColorTransition(svgTextElement: SVGText, color: string, duration: number, dependsOn: Transition[] = [], startTime: number = 0): Transition {
    return new Transition({
        func: (t: number, context: any) => {
            svgTextElement.setColor(Color.interpolate(context.color, color, t), true);
        },
        context: {
            color: svgTextElement.getColor()
        },
        duration,
        startTime,
        dependsOn
    });
}