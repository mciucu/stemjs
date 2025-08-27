import {UI} from "../UIBase.js";
import {DOMAttributesMap} from "../NodeAttributes.js";

export class IFrame extends UI.Primitive("iframe") {
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
