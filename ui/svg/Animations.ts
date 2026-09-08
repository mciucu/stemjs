import {Transition, type TransitionLike} from "../Transition";
import {Color} from "../Color";
import {SVGUIElement} from "./SVGBase";
import {SVGText} from "./SVGText";
import {type Point} from "../../numerics/StemMath";
import {isFunction} from "../../base/Utils";


// Each helper asks for the capability it animates, since only some SVG elements implement these
interface ColorAnimatable extends SVGUIElement {
    getColor(): string | undefined;
}

// Either the element moves itself through setPosition, or it hands back the transition that does
interface MoveAnimatable extends SVGUIElement {
    setPosition?(point: Point): void;
    moveTransition?: (coords: Point, duration: number, dependsOn: TransitionLike[], startTime: number) => Transition;
}

// What each helper's func reads off its own context, which is what Transition infers its parameter from
interface BlinkContext {
    firstColor: string;
    secondColor: string;
    interval: number;
    executeLastStep: boolean;
}

interface BlinkTransitionOptions {
    duration?: number;
    times?: number;
    firstColor?: string;
    secondColor?: string;
    executeLastStep?: boolean;
    startTime?: number;
    dependsOn?: TransitionLike[];
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
        func: (t: number, context: BlinkContext) => {
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

export function makeOpacityTransition(svgElement: SVGUIElement, opacity: number, duration: number, dependsOn: TransitionLike[] = [], startTime: number = 0): Transition {
    if (!svgElement.options.hasOwnProperty("opacity")) {
        svgElement.options.opacity = 1;
    }
    return new Transition({
        // Left open: the base SVG options declare opacity as `number | string`, and this multiplies it
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

export function makeColorTransition(svgElement: ColorAnimatable, color: string, duration: number, dependsOn: TransitionLike[] = [], startTime: number = 0): Transition {
    return new Transition({
        func: (t: number, context: {color: string}) => {
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

export function makeMoveTransition(svgElement: MoveAnimatable, coords: Point, duration: number, dependsOn: TransitionLike[] = [], startTime: number = 0): Transition {
    if (isFunction(svgElement.moveTransition)) {
        return svgElement.moveTransition(coords, duration, dependsOn, startTime) as Transition;
    }

    return new Transition({
        // Left open: the base SVG options declare x and y as `number | string`, and this multiplies them
        func: (t: number, context: any) => {
            const x = (1 - t) * context.x + t * coords.x;
            const y = (1 - t) * context.y + t * coords.y;

            svgElement.setPosition({x, y});
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

export function makeTextFillColorTransition(svgTextElement: SVGText, color: string, duration: number, dependsOn: TransitionLike[] = [], startTime: number = 0): Transition {
    return new Transition({
        func: (t: number, context: {color: string}) => {
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