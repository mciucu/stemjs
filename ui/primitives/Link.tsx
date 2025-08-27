import {UI} from "../UIBase";
import {styleRule, StyleSheet} from "../Style";
import {registerStyle} from "../style/Theme";
import {isLocalUrl, isString, trimLocalUrl} from "../../base/Utils";
import {Router} from "../Router";

interface LinkOptions {
    // Custom properties not on HTMLAnchorElement
    newTab?: boolean;  // Custom property to automatically set target="_blank"
    value?: string;    // Custom property for link text content
    label?: string;    // Custom property for link text content
    // Note: href, target, etc. are inherited from Partial<HTMLAnchorElement>
}

export function sanitizeUrlFromOptions<T extends LinkOptions>(options: T, key: string): T {
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
export class Link extends UI.Primitive<LinkOptions, "a">("a") {
    getDefaultOptions(options?: any): Partial<any> {
        return {
            newTab: false,
        }
    }

    setOptions(options: any): any {
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

    changeRouteInternal(): void {
        // TODO Only if Router.Global exists?
        Router.changeURL(trimLocalUrl(this.options.href));
    }

    onMount(): void {
        this.addClickListener((event: MouseEvent) => {
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