import {Draggable} from "../Draggable";
import {type ElementOptions, UI, UIElement, type NodeAttributes} from "../UIBase";
import {ProgressBar} from "../ProgressBar";
import {Orientation} from "../Constants";
import {Device} from "../../base/Device";
import {getOffset} from "../Utils";

// TODO This should extend an input
interface SlideBarOptions {
    value?: number;
    // What the subclasses normalize height/width into
    size?: number;
    barSize?: number;
}

export class SlideBar<ExtraOptions = {}> extends Draggable(UIElement) {
    declare options: ElementOptions<SlideBarOptions & ExtraOptions>;

    getDefaultOptions(): Partial<ElementOptions<SlideBarOptions>> {
        return {
            value: 0,
        };
    }

    extraNodeAttributes(attr: NodeAttributes) {
        attr.setStyle("display", "inline-block");
        attr.setStyle("position", "relative");
        attr.setStyle("cursor", "pointer");
    }

    getSliderValue() {
        return this.options.value * this.options.size - (this.options.barSize / 2);
    }

    render() {
        return [
            <ProgressBar ref="progressBar" active={true} value={this.options.value} disableTransition={true}
                         orientation={this.getOrientation()}
                         style={Object.assign({
                             position: "relative",
                         }, this.getProgressBarStyle())}
            />,
            <div ref="slider" style={Object.assign({
                backgroundColor: "black",
                position: "absolute",
            }, this.getSliderStyle())}>
            </div>
        ];
    }

    setValue(value: number) {
        value = Math.max(value, 0);
        value = Math.min(value, 1);

        this.options.value = value;
        this.progressBar.set(this.options.value);
        this.slider.setStyle(this.getOrientationAttribute(), this.getSliderValue() + "px");

        this.dispatch("change", this.options.value);
    }

    getValue() {
        return this.options.value;
    }

    onMount() {
        this.addDragListener(this.getDragConfig());
    }
}

// The aliases a caller may write instead, which setOptions normalizes into size and barSize
interface HorizontalSlideBarOptions {
    width?: number;
    barWidth?: number;
}

export class HorizontalSlideBar extends SlideBar<HorizontalSlideBarOptions> {
    setOptions(options: typeof this.options) {
        options.size = options.size || options.width || 100;
        options.barSize = options.barSize || options.barWidth || 5;
        super.setOptions(options);
    }

    getProgressBarStyle() {
        return {
            height: "5px",
            width: this.options.size + "px",
            top: "15px",
        };
    }

    getSliderStyle() {
        return {
            width: this.options.barSize + "px",
            height: "20px",
            left: this.getSliderValue() + "px",
            top: "7.5px"
        };
    }

    getOrientationAttribute(): "left" {
        return "left";
    }

    getOrientation() {
        return Orientation.HORIZONTAL;
    }

    getDragConfig() {
        return {
            onStart: (event: MouseEvent | TouchEvent) => {
                this.setValue((Device.getEventX(event) - getOffset(this.progressBar)[this.getOrientationAttribute()]) / this.options.size);
            },
            onDrag: (deltaX: number, deltaY: number) => {
                this.setValue(this.options.value + deltaX / this.options.size);
            },
        };
    }
}

// Same for the vertical one
interface VerticalSlideBarOptions {
    height?: number;
    barHeight?: number;
}

export class VerticalSlideBar extends SlideBar<VerticalSlideBarOptions> {
    setOptions(options: typeof this.options) {
        options.size = options.size || options.height || 100;
        options.barSize = options.barSize || options.barHeight || 5;
        super.setOptions(options);
    }

    getProgressBarStyle() {
        return {
            height: this.options.size + "px",
            width: "5px",
            left: "15px",
        };
    }

    getSliderStyle() {
        return {
            height: this.options.barSize + "px",
            width: "20px",
            top: this.getSliderValue() + "px",
            left: "7.5px"
        };
    }

    getOrientationAttribute(): "top" {
        return "top";
    }

    getOrientation() {
        return Orientation.VERTICAL;
    }

    getDragConfig() {
        return {
            onStart: (event: MouseEvent | TouchEvent) => {
                this.setValue((Device.getEventY(event) - getOffset(this.progressBar)[this.getOrientationAttribute()]) / this.options.size);
            },
            onDrag: (deltaX: number, deltaY: number) => {
                this.setValue(this.options.value + deltaY / this.options.size);
            },
        };
    }
}
