import {UI} from "../../UIBase.js";
import {StyleSheet} from "../../Style.js";
import {styleRule} from "../../../decorators/Style.js";
import {registerStyle} from "../../style/Theme.js";
import {Device} from "../../../base/Device.js";
import {BaseInputElement} from "../BaseInputElement.js";
import {MakeIcon, MakeText} from "../../SimpleElements.jsx";


export class CheckboxInputStyle extends StyleSheet {
    @styleRule
    container = {
        display: "flex",
        cursor: "pointer",
        userSelect: "none",
        alignItems: "flex-start",
        lineHeight: this.themeProps.GENERAL_LINE_HEIGHT, // This is needed because this component is used in dashboard.
    };

    @styleRule
    checkbox = {
        position: "relative",
        flexShrink: 0,
        marginTop: ((parseFloat(this.themeProps.GENERAL_LINE_HEIGHT) || 1.5) - 1) / 2 + "em", // Align the checkbox top margin with the text top margin.
        marginRight: 12,
        border: "1px solid " + this.themeProps.CHECKBOX_BORDER_COLOR,
        borderRadius: this.themeProps.CHECKBOX_BORDER_RADIUS,
        width: this.themeProps.CHECKBOX_SIZE,
        height: this.themeProps.CHECKBOX_SIZE,
        pointerEvents: "none",
        ":hover": {
            cursor: "pointer",
        },
    };

    // Checked or indeterminate
    @styleRule
    selected = {
        backgroundColor: this.themeProps.CHECKBOX_ENABLED_BACKGROUND_COLOR
    };

    @styleRule
    label = {
        userSelect: "none",
        "-webkit-user-select": "none",
    };

    @styleRule
    disabled = {
        opacity: this.themeProps.BASE_DISABLED_OPACITY,
        pointerEvents: Device.isMobileDevice() ? "none" : "initial",
        cursor: "not-allowed",
    };
}

@registerStyle(CheckboxInputStyle)
export class CheckboxInput extends BaseInputElement {
    getDefaultOptions(options) {
        return {
            ...super.getDefaultOptions(options),
            initialValue: false,
            label: "Label"
        };
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        if (this.options.disabled) {
            // TODO actually implement disabled
            attr.addClass(this.styleSheet.disabled);
        }
    }

    getIcon() {
        const iconOptions = {
            color: this.themeProps.CHECKBOX_CHECKMARK_COLOR,
            size: "100%",
            style: {display: "block"},
        };

        const value = this.getValue();
        if (value == null) {
            return MakeIcon("minus", iconOptions);
        }
        if (value) {
            return MakeIcon("checkmark", iconOptions);
        }
        return null;
    }

    render() {
        const {styleSheet} = this;
        const checkboxClass = styleSheet.checkbox + (this.getValue() !== false ? styleSheet.selected : "");
        return [
            <div className={checkboxClass}>
                {this.getIcon()}
            </div>,
            <div className={styleSheet.label}>
                {MakeText(this.options.label)}
            </div>,
        ];
    }

    onMount() {
        super.onMount();

        this.addClickListener((event) => {
            event.stopPropagation();

            // Unchecked -> checked
            // Checked or indeterminate -> unchecked
            const newValue = (this.getValue() === false);

            this.setValue(newValue);
        });

        // TODO @input also handle Enter or Space
        // this.addNodeListener("keyup", event => {
        //     if (this.options.disabled) {
        //         return;
        //     }
        //     const key = new KeyEvent(event);
        //     if (key.isEnter() || key.isSpace()) {
        //         this.setAndDispatchValue(!this.value);
        //     }
        // });
    }
}
