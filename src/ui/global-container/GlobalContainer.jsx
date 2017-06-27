import {UI} from "../UI";
import {GlobalContainerStyle} from "./Style";
import {Device} from "../../base/Device";

class GlobalContainer extends UI.Element {
    static styleSet = GlobalContainerStyle.getInstance();
    scrollPositionsMap = new Map();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().default);
    }

    onMount() {
        if (!Device.isTouchDevice()) {
            Object.assign(document.body.style, {
                overflow: "hidden",
            });
        }
        GlobalContainer.Global = GlobalContainer.Global || this;
    }

    getScrollContainerNode() {
        if (Device.isTouchDevice()) {
            return document.body;
        } else {
            return this.fullContainer.node;
        }
    }

    saveScrollPosition(page) {
        this.scrollPositionsMap.set(page, this.getScrollContainerNode().scrollTop);
    }

    applyScrollPosition(page) {
        this.getScrollContainerNode().scrollTop = this.scrollPositionsMap.get(page) || 0;
    }

    render() {
        return [
            <div ref="fullContainer" className={this.getStyleSet().fullContainer}>
                {this.getGivenChildren()}
            </div>
        ]
    }
}

export {GlobalContainer};