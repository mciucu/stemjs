import {SVG} from "./SVGBase";
import {Transition} from "../Transition";
import {Color} from "../Color";

SVG.AnimatedSVG = class AnimatedSVG extends SVG.SVGRoot {
    onMount() {
        if (this.options.transition) {
            this.options.transition.setStartTime(Date.now());
            let animationWrapper = () => {
                if (this.options.transition.isStopped()) {
                    if (this.options.repeat) {
                        this.options.transition.setStartTime(Date.now());
                        this.options.transition.restart();
                        requestAnimationFrame(animationWrapper);
                    }
                    return;
                }
                if (!this.options.transition.pauseTime) {
                    this.options.transition.nextStep();
                }
                requestAnimationFrame(animationWrapper);
            };
            requestAnimationFrame(animationWrapper);
        }
    }
};

SVG.Element.prototype.blinkTransition = function (options) {
    let config = {
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
        func: (t, context) => {
            if (t > 1 - context.interval && !context.executeLastStep) {
                this.setColor(context.firstColor);
            } else {
                this.setColor(Math.floor((1 - t) / context.interval) % 2 === 1 ? context.firstColor : context.secondColor);
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
};
SVG.Element.prototype.changeOpacityTransition = function(opacity, duration, dependsOn=[], startTime=0) {
    if (!this.options.hasOwnProperty("opacity")) {
        this.options.opacity = 1;
    }
    return new Transition({
        func: (t, context) => {
            this.setOpacity((1 - t) * context.opacity + t * opacity);
        },
        context: {
            opacity: this.options.opacity
        },
        duration: duration,
        startTime: startTime,
        dependsOn: dependsOn
    });
};
SVG.Element.prototype.changeColorTransition = function(color, duration, dependsOn=[], startTime=0) {
        return new Transition({
            func: (t, context) => {
                this.setColor(Color.interpolate(context.color, color, t));
            },
            context: {
                color: this.getColor()
            },
            duration: duration,
            startTime: startTime,
            dependsOn: dependsOn
        });
    };

SVG.Text.prototype.moveTransition = function(coords, duration, dependsOn=[], startTime=0) {
        return new Transition({
            func: (t, context) => {
                this.setPosition(
                    (1 - t) * context.x + t * coords.x,
                    (1 - t) * context.y + t * coords.y
                );
            },
            context: {
                x: this.options.x,
                y: this.options.y
            },
            duration: duration,
            startTime: startTime,
            dependsOn: dependsOn
        });
    };
SVG.Text.prototype.changeFillTransition = function(color, duration, dependsOn=[], startTime=0) {
    return new Transition({
        func: (t, context) => {
            this.setColor(Color.interpolate(context.color, color, t), true);
        },
        context: {
            color: this.getColor()
        },
        duration: duration,
        startTime: startTime,
        dependsOn: dependsOn
    });
};