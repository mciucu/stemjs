import {UI} from "./UIBase";
import {StyleSet} from "./Style";
import {styleRule} from "../decorators/Style";
import {GlobalStyle} from "./GlobalStyle";
import {Ajax} from "../base/Ajax";
import {Orientation} from "./Constants";

class SimpleStyledElement extends UI.Element {
    getLevel() {
        return this.options.level || (this.parent && this.parent.getLevel && this.parent.getLevel());
    }

    setLevel(level) {
        this.updateOptions({level});
    }

    getSize() {
        return this.options.size || (this.parent && this.parent.getSize && this.parent.getSize());
    }

    setSize(size) {
        this.updateOptions({size});
    }
}


class IconableInterface extends SimpleStyledElement {
    render() {
        return [this.beforeChildren(), this.getLabel(), super.render()];
    };

    getLabel() {
        return (this.options.label != null) ? this.options.label : "";
    }

    setLabel(label) {
        this.updateOptions({label: label});
    }

    //TODO: this should live in a base iconable class, of which you'd only use this.beforeChildren
    getFaIcon() {
        return this.options.faIcon;
    }

    setFaIcon(value) {
        this.options.faIcon = value;
        this.redraw();
    }

    beforeChildren() {
        if (!this.getFaIcon()) {
            return null;
        }
        let iconOptions = {
            className: "fa fa-" + this.getFaIcon(),
        };
        if (this.getLabel()) {
            iconOptions.style = {
                marginRight: "5px",
            }
        }

        return <span {...iconOptions} />;
    }
}


class Label extends UI.Primitive(IconableInterface, "span") {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.Label.DEFAULT);

        if (this.getSize()) {
            attr.addClass(GlobalStyle.Label.Size(this.getSize()));
        }

        if (this.getLevel()) {
            attr.addClass(GlobalStyle.Label.Level(this.getLevel()));
        }
    }
}


class Badge extends UI.Primitive(IconableInterface, "span") {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.Badge.DEFAULT);

        if (this.getSize()) {
            attr.addClass(GlobalStyle.Badge.Size(this.getSize()));
        }

        if (this.getLevel()) {
            attr.addClass(GlobalStyle.Badge.Level(this.getLevel()));
        }
    }
}

class ProgressBar extends SimpleStyledElement {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.ProgressBar.CONTAINER);
    }

    render() {
        let valueInPercent = (this.options.value || 0) * 100;
        let orientation = Orientation.HORIZONTAL;
        if (this.options.hasOwnProperty("orientation")) {
            orientation = this.options.orientation;
        }
        let barStyle;
        if (orientation === Orientation.HORIZONTAL) {
            barStyle = {
                width: valueInPercent + "%",
                height: this.options.height + "px",
            };
        } else {
            barStyle = {
                height: valueInPercent + "%",
                width: "5px",
            }
        }
        let barOptions = {
            className: GlobalStyle.ProgressBar.DEFAULT,
            style: barStyle,
        };

        if (this.options.disableTransition) {
            Object.assign(barOptions.style, {
                transition: "none",
            });
        }

        if (this.options.level) {
            barOptions.className += " " + GlobalStyle.ProgressBar.Level(this.getLevel());
        }
        if (this.options.striped) {
            barOptions.className += " " + GlobalStyle.ProgressBar.STRIPED;
        }
        if (this.options.active) {
            barOptions.className += " " + GlobalStyle.ProgressBar.ACTIVE;
        }
        if (this.options.color) {
            barOptions.style.backgroundColor = this.options.color;
        }

        return <div {...barOptions}>
            <span>{this.options.label}</span>
        </div>;
    }

    set(value) {
        if (value < 0)
            value = 0;
        else if (value > 1)
            value = 1;
        this.options.value = value;
        this.redraw();
    }
}


export {SimpleStyledElement, IconableInterface, Label, Badge, ProgressBar};
