import {UI} from "../UIBase.js";

export class TemporaryMessageArea extends UI.Primitive("span") {
    getDefaultOptions() {
        return {
            margin: 10
        };
    }

    render() {
        return [<UI.TextElement ref="textElement" value={this.options.value || ""}/>];
    }

    extraNodeAttributes(attr) {
        attr.setStyle({
            marginLeft: this.options.margin,
            marginRight: this.options.margin,
        });
    }

    setValue(value) {
        this.options.value = value;
        this.textElement.setValue(value);
    }

    setColor(color) {
        this.setStyle("color", color);
    }

    showMessage(message, color = "black", displayDuration = 2000) {
        this.setColor(color);
        this.clear();
        this.setValue(message);
        if (displayDuration) {
            this.clearValueTimeout = this.attachTimeout(() => this.clear(), displayDuration);
        }
    }

    clear() {
        this.setValue("");
        if (this.clearValueTimeout) {
            clearTimeout(this.clearValueTimeout);
            this.clearValueTimeout = null;
        }
    }
}
