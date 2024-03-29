import {unwrapArray} from "./Utils.js";

export class PageTitleManager {
    static title = null;
    static defaultTitle = "Website";
    static prefix = null;

    static getPrefix() {
        return this.prefix;
    }

    static setPrefix(prefix) {
        this.prefix = prefix;
        this.updatePageTitle();
    }

    static setDefaultTitle(defaultTitle) {
        this.defaultTitle = defaultTitle;
    }

    static getTitle() {
        return this.title || this.defaultTitle;
    }

    static setTitle(title) {
        this.title = title;
        this.updatePageTitle();
    }

    static getFullPageTitle() {
        return unwrapArray([this.getPrefix(), this.getTitle()]).join(" - ");
    }

    static updatePageTitle() {
        document.title = this.getFullPageTitle();
    }

    static setIcon() {
        throw Error("Not implemented yet!");
    }
}
