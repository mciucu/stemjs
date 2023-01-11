import {Draggable} from "../Draggable.js";
import {UI} from "../UIBase.js";
import {ProgressBar} from "../ProgressBar.jsx";
import {Orientation} from "../Constants.js";
import {Device} from "../../base/Device.js";
import {getOffset} from "../Utils.js";

// TODO This should extend an input
export class SlideBar extends Draggable(UI.Element) {
    getDefaultOptions() {
        return {
            value: 0,
        };
    }

    extraNodeAttributes(attr) {
        attr.setStyle("display", "inline-block");
        attr.setStyle("position", "relative");
        attr.setStyle("cursor", "pointer");
    }

    getSliderValue() {
        return this.options.value * this.options.size - (this.options.barSize / 2);
    }

    render() {
        return [
            <ProgressBar ref="progressBar" active="true" value={this.options.value} disableTransition={true}
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

    setValue(value) {
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

export class HorizontalSlideBar extends SlideBar {
    setOptions(options) {
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

    getOrientationAttribute() {
        return "left";
    }

    getOrientation() {
        return Orientation.HORIZONTAL;
    }

    getDragConfig() {
        return {
            onStart: (event) => {
                this.setValue((Device.getEventX(event) - getOffset(this.progressBar)[this.getOrientationAttribute()]) / this.options.size);
            },
            onDrag: (deltaX, deltaY) => {
                this.setValue(this.options.value + deltaX / this.options.size);
            },
        };
    }
}

export class VerticalSlideBar extends SlideBar {
    setOptions(options) {
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

    getOrientationAttribute() {
        return "top";
    }

    getOrientation() {
        return Orientation.VERTICAL;
    }

    getDragConfig() {
        return {
            onStart: (event) => {
                this.setValue((Device.getEventY(event) - getOffset(this.progressBar)[this.getOrientationAttribute()]) / this.options.size);
            },
            onDrag: (deltaX, deltaY) => {
                this.setValue(this.options.value + deltaY / this.options.size);
            },
        };
    }
}
