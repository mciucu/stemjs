import {UI} from "../UIBase";
import {DOMAttributesMap} from "../NodeAttributes";

export class IFrame extends UI.Primitive<void, "iframe">("iframe") {
    static domAttributesMap = new DOMAttributesMap(UI.Element.domAttributesMap, [
        ["allow"],
        ["allowfullscreen", {noValue: true}],
        ["allowpaymentrequest", {noValue: true}],
        ["csp"],
        ["loading"],
        ["name"],
        ["referrerpolicy"],
        ["sandbox"],
        ["src"],
        ["srcdoc"],
        ["align"],
        ["frameborder"],
        ["longdesc"],
        ["marginheight"],
        ["marginwidth"],
        ["scrolling"],
        ["mozbrowser"],
    ]);
}