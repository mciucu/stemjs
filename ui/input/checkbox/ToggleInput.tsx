import {UI} from "../../UIBase.js";
import {styleRule, StyleSheet} from "../../Style.js";
import {registerStyle} from "../../style/Theme.js";
import {BaseInputElement} from "../BaseInputElement.js";


export class ToggleInputStyle extends StyleSheet {
    @styleRule
    container = {
        cursor: "pointer",
        display: "flex", // TODO @Andrei shouldn't this be inline-flex?
        alignItems: "center",
        position: "relative",
        borderRadius: 20,
        width: 35,
        height: 15,
        background: this.themeProps.TOGGLE_BACKGROUND,
    };

    @styleRule
    pill = {
        position: "absolute",
        left: "0%",
        transitionProperty: "background, left",
        transition: this.themeProps.DEFAULT_TRANSITION,
        borderRadius: "100%",
        width: this.themeProps.TOGGLE_PILL_SIZE,
        height: this.themeProps.TOGGLE_PILL_SIZE,
        background: this.themeProps.TOGGLE_DISABLED_BACKGROUND,
        boxShadow: this.themeProps.TOGGLE_SHADOW,
    }

    @styleRule
    toggleOn = {
        left: "calc(100% - " + this.themeProps.TOGGLE_PILL_SIZE + "px)",
        background: this.themeProps.TOGGLE_COLOR,
    };
}


@registerStyle(ToggleInputStyle)
export class ToggleInput extends BaseInputElement {
    render() {
        const {styleSheet} = this;
        return <div className={styleSheet.pill + (this.getValue() && styleSheet.toggleOn)} />;
    }

    onMount() {
        super.onMount();

        this.addClickListener(() => {
            const newValue = !this.getValue();
            this.setValue(newValue);
        });
    }
}
