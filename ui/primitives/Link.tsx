import {UI} from "../UIBase.js";
import {styleRule, StyleSheet} from "../Style.js";
import {registerStyle} from "../style/Theme.js";
import {isLocalUrl, trimLocalUrl} from "../../base/Utils.js";
import {Router} from "../Router.jsx";

export function sanitizeUrlFromOptions(options, key) {
    const rawURL = options[key];

    if (!rawURL || !rawURL.includes(":")) {
        return options;
    }

    const invalidateUrl = () => {
        console.error("Invalid URL", rawURL);
        options[key] = "";
        options.value = options.label = options.alt = "[Invalid URL]";
    };

    try {
        const url = new URL(rawURL);
        if (["http:", "https:", "mailto:", "tel:"].indexOf(url.protocol) === -1) {
            invalidateUrl();
        }
    } catch (e) {
        invalidateUrl();
    }

    return options;
}


export class LinkStyle extends StyleSheet {
    @styleRule
    container = {
        cursor: "pointer",
    }
}

@registerStyle(LinkStyle)
export class Link extends UI.Primitive("a") {
    getDefaultOptions() {
        return {
            newTab: false,
        }
    }

    setOptions(options) {
        options = sanitizeUrlFromOptions(options, "href");

        super.setOptions(options);

        if (this.options.newTab) {
            this.options.target = "_blank";
        }

        return options;
    }

    render() {
        const {value, label} = this.options;

        return value || label || super.render();
    }

    changeRouteInternal() {
        // TODO Only if Router.Global exists?
        Router.changeURL(trimLocalUrl(this.options.href));
    }

    onMount() {
        this.addClickListener((event) => {
            const {href, newTab, target} = this.options;

            const specialKeyPressed = event.shiftKey || event.ctrlKey || event.metaKey;
            const unroutable = !href || !isLocalUrl(href);

            if (specialKeyPressed || unroutable || newTab || (target && target !== "_self")) {
                // Leave it to the browser
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            this.changeRouteInternal();
        });
    }
}
