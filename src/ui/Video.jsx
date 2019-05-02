import {UI} from "UIBase";
import {CreateNodeAttributesMap} from "NodeAttributes";


class Video extends UI.Primitive( "video") {
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
