import {UI} from "UIBase";
import {CreateNodeAttributesMap} from "NodeAttributes";


class Video extends UI.Primitive( "video") {
    play() {
        return this.node.play();
    }

    render() {
        if (this.options.source) {
            return <source src={this.options.source} type="video/mp4" />
        }
    }
}

Video.domAttributesMap = CreateNodeAttributesMap(UI.Element.domAttributesMap, [
    ["autoplay", {noValue: true}],
    ["buffered"],
    ["controls"],
    ["crossorigin"],
    ["intrinsicsize"],
    ["loop"],
    ["muted", {noValue: true}],
    ["playsinline"],
    ["poster"],
]);

export {Video};
