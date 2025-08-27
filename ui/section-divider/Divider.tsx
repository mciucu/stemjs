import {UI} from "../UIBase";

class Divider extends UI.Element {
    dragMousedown(event) {};

    dragMousemove(event) {};

    dragMouseup(event) {};

    dividerMousedownFunction(event) {
        this.dragMousedown(event);
        this.parent.dispatch("dividerMousedown", {divider: this, domEvent: event});

        let dragMousemoveFunction = (event) => {
            this.dragMousemove(event);
            event.preventDefault(); // for touch devices
            this.parent.dispatch("dividerMousemove", event);
        };

        this.parent.addNodeListener("touchmove", dragMousemoveFunction);
        this.parent.addNodeListener("mousemove", dragMousemoveFunction);

        let dragMouseupFunction = (event) => {
            this.dragMouseup(event);
            this.parent.dispatch("dividerMouseup", event);
            this.parent.removeNodeListener("touchmove", dragMousemoveFunction);
            window.removeEventListener("touchend", dragMouseupFunction);
            this.parent.removeNodeListener("mousemove", dragMousemoveFunction);
            window.removeEventListener("mouseup", dragMouseupFunction);
        };

        window.addEventListener("touchend", dragMouseupFunction);
        window.addEventListener("mouseup", dragMouseupFunction);
    }

    onMount() {
        // TODO: fix this hack when Device.isTouchDevice works
        this.addNodeListener("touchstart", (event) => {this.touchDeviceTriggered = true; this.dividerMousedownFunction(event);});
        this.addNodeListener("mousedown", (event) => {if (!this.touchDeviceTriggered) {this.dividerMousedownFunction(event);}});
    }
}

export {Divider};
