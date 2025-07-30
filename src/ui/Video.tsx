import {UI, UIElementChild} from "./UIBase";
import {DOMAttributesMap} from "./NodeAttributes";

export interface VideoOptions {
    source?: string;
}

export class Video extends UI.Primitive<VideoOptions, "video">("video") {
    play() {
        return this.node.play();
    }

    render(): UIElementChild {
        if (this.options.source) {
            return <source src={this.options.source} type="video/mp4" />
        }
        return undefined;
    }
}

Video.domAttributesMap = new DOMAttributesMap(UI.Element.domAttributesMap, [
    ["autoplay", {noValue: true}],
    ["buffered"],
    ["controls"],
    ["crossorigin"],
    ["intrinsicsize"],
    ["loop"],
    ["muted", {noValue: true}],
    ["playsinline"],
    ["poster"],
    ["preload"],
    ["srcObject"],
]);
