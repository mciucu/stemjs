import {unwrapArray} from "./Utils";

export class PageTitleManager {
    static title: string | null = null;
    static defaultTitle: string = "Website";
    static prefix: string | null = null;

    static getPrefix(): string | null {
        return this.prefix;
    }

    static setPrefix(prefix: string | null): void {
        this.prefix = prefix;
        this.updatePageTitle();
    }

    static setDefaultTitle(defaultTitle: string): void {
        this.defaultTitle = defaultTitle;
    }

    static getTitle(): string {
        return this.title || this.defaultTitle;
    }

    static setTitle(title: string | null): void {
        this.title = title;
        this.updatePageTitle();
    }

    static getFullPageTitle(): string {
        return unwrapArray([this.getPrefix(), this.getTitle()]).join(" - ");
    }

    static updatePageTitle(): void {
        document.title = this.getFullPageTitle();
    }

    static setIcon(): void {
        throw new Error("Not implemented yet!");
    }
}
