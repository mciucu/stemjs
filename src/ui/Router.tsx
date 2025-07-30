import {UI, UIElement} from "./UIBase";
import {Switcher} from "./Switcher";
import {Dispatcher} from "../base/Dispatcher";
import {PageTitleManager} from "../base/PageTitleManager";
import {unwrapArray, isString} from "../base/Utils";

interface RouterOptions {
    routes: Route;
}

interface ChangeURLOptions {
    queryParams?: Record<string, string>;
    state?: Record<string, any>;
    replaceHistory?: boolean;
    forceElementUpdate?: boolean;
    keepSearchParams?: boolean;
}

export interface RouteMatch {
    args: string[];
    urlParts: string[];
}

interface RouteOptions {
    title?: string;
    beforeEnter?: (snapshot: RouteSnapshot) => UIElement | string[] | null;
    cachePage?: boolean;
    doNotCache?: boolean;
}

interface RouteSnapshot {
    expr: string[];
    url: string;
    path: string;
    params: URLSearchParams;
}

interface GeneratorArgs {
    args: any[];
    argsArray: any[];
    doNotCache?: boolean;
}

type PageGenerator = new (args: GeneratorArgs) => UIElement | ((args: GeneratorArgs) => UIElement);

export class Router extends Switcher {
    static Global: Router;
    static globalSetURL: (urlParts: string[]) => void;
    
    // TODO: This works bad with query params. Fix it!
    static localHistory: string[] = []; // If we want the router to not alter the window history, use this instead.
    static useLocalHistory = false;

    // Return a historic page, depth = 0 current, depth = 1 previous, etc
    static getHistoricPath(depth: number): string | null {
        depth = Math.abs(depth); // So negatives also work
        const index = this.localHistory.length - 1 - depth;
        if (index < 0) {
            return null;
        }
        const url = this.localHistory[index];

        // TODO @cleanup this should use new URL(url), only keeping Denis's shit code to not break anything
        return url.split("?")[0].split("#")[0];
    }

    static getCurrentPath(): string {
        let path = "";
        if (this.useLocalHistory && this.localHistory.length) {
            // We do this to get rid of query params or hash params
            path = this.getHistoricPath(0);
        } else {
            path = location.pathname;
        }
        return path;
    }

    static parseURL(path: string | string[] = location.pathname): string[] {
        if (!Array.isArray(path)) {
            path = path.split("/");
        }
        return path.filter(str => str != "");
    }

    static joinQueryParams(queryParams: Record<string, string> = {}): string {
        return Object.keys(queryParams)
            .map((param) => `${encodeURIComponent(param)}=${encodeURIComponent(queryParams[param])}`).join("&");
    }

    static formatURL(url: string | string[]): string {
        if (Array.isArray(url)) {
            url = url.length ? ("/" + url.join("/")) : "/";
        }

        if (isString(url) && url[0] !== "/") {
            url = "/" + url;
        }

        return url;
    }

    static changeURL(url: string | string[], options: ChangeURLOptions = {
        queryParams: {},
        state: {},
        replaceHistory: false,
        forceElementUpdate: false,
        keepSearchParams: false,
    }): void {
        url = this.formatURL(url);

        if (options.queryParams && Object.keys(options.queryParams).length > 0) {
            const queryString = this.joinQueryParams(options.queryParams);
            url = `${url}?${queryString}`;
        } else if (options.keepSearchParams) {
            url += location.search;
        }

        if (url === window.location.pathname && !options.forceElementUpdate) {
            // We're already here
            return;
        }

        options.state = options.state || {};
        const historyArgs = [options.state, PageTitleManager.getTitle(), url];
        if (this.useLocalHistory) {
            if (options.replaceHistory) {
                this.localHistory.pop();
            }
            if (this.localHistory.length === 0 || this.localHistory[this.localHistory.length - 1] != url) {
                this.localHistory.push(url);
            }
        } else {
            if (options.replaceHistory) {
                window.history.replaceState(...historyArgs);
            } else {
                window.history.pushState(...historyArgs);
            }
        }

        this.updateURL();
    }

    static onPopState(): void {
        this.changeURL(this.parseURL(this.getCurrentPath()), {replaceHistory: true, forceElementUpdate: true,
            keepSearchParams: true});
        Dispatcher.Global.dispatch("externalURLChange");
    }

    static back(): void {
        if (this.useLocalHistory) {
            this.localHistory.pop();
            this.onPopState();
        } else {
            window.history.back();
        }
    }

    static updateURL(): void {
        this.Global.setURL(this.parseURL(this.getCurrentPath()));
    }

    static setGlobalRouter(router: Router): void {
        this.Global = router;
        window.onpopstate = () => {
            this.onPopState();
        };

        if (this.globalSetURL) {
            this.Global.setURL = this.globalSetURL;
        }

        this.updateURL();
    }

    clearCache(): void {
        this.getRoutes().clearCache();
    }

    // TODO: should be named getRootRoute() :)
    getRoutes(): Route {
        return this.options.routes;
    }

    getPageNotFound(): UIElement {
        const element = UI.createElement("h1", {children: ["Can't find url, make sure you typed it correctly"]});
        element.pageTitle = "Page not found";
        return element;
    }

    getPageToRender(urlParts: string[]): UIElement | null {
        const result = this.getRoutes().getPage(urlParts);
        if (result === false) {
            return this.getPageNotFound();
        }

        if (Array.isArray(result)) {
            this.constructor.changeURL(...result);
            return null;
        }

        return result;
    }

    deactivateChild(child: UIElement): void {
        super.deactivateChild(child);
        if (child.options.doNotCache) {
            child.destroyNode();
        }
    }

    setURL(urlParts: string[] | string): void {
        urlParts = unwrapArray(urlParts);
        const page = this.getPageToRender(urlParts);

        if (!page) return;

        const activePage = this.getActive();

        if (activePage !== page) {
            activePage?.dispatch("urlExit");
            this.setActive(page);
            page.dispatch("urlEnter");
        } else {
            page.dispatch("urlReload");
        }

        if (page.pageTitle) {
            PageTitleManager.setTitle(page.pageTitle);
        }

        this.dispatchChange(urlParts, page, activePage);
    }

    onMount(): void {
        if (!Router.Global) {
            this.constructor.setGlobalRouter(this);
        }
    }
}

export class Route {
    static ARG_KEY = "%s";
    expr: string[];
    pageGenerator: PageGenerator;
    subroutes: Route[];
    options: RouteOptions;
    cachedPages = new Map<string, UIElement>();

    getDefaultOptions(): RouteOptions {
        return {
            beforeEnter: null,
            cachePage: true,
        };
    }

    constructor(expr: string | string[], pageGenerator: PageGenerator, subroutes: Route[] = [], options: RouteOptions | string = {}) {
        this.expr = (expr instanceof Array) ? expr : [expr];
        this.pageGenerator = pageGenerator;
        this.subroutes = unwrapArray(subroutes);
        if (typeof options === "string") {
            options = {title: options}
        }
        this.options = {
            ...this.getDefaultOptions(),
            ...options
        };
        this.cachedPages = new Map();
    }

    clearCache(): void {
        this.cachedPages.clear();
        for (const subroute of this.subroutes) {
            if (subroute.clearCache) {
                subroute.clearCache();
            }
        }
    }

    matches(urlParts: string[]): RouteMatch | null {
        if (urlParts.length < this.expr.length) {
            return null;
        }
        let args = [];
        for (let i = 0; i < this.expr.length; i += 1) {
            const isArg = this.expr[i] === this.constructor.ARG_KEY;
            if (urlParts[i] != this.expr[i] && !isArg) {
                return null;
            }
            if (isArg) {
                args.push(urlParts[i]);
            }
        }
        return {
            args: args,
            urlParts: urlParts.slice(this.expr.length)
        }
    }

    getPageTitle(): string | undefined {
        return this.options.title;
    }

    getPageGuard(): ((snapshot: RouteSnapshot) => UIElement | string[] | null) | undefined {
        return this.options.beforeEnter;
    }

    generatePage(pageGenerator: PageGenerator, ...argsArray: any[]): UIElement | null {
        if (!pageGenerator) {
            return null;
        }

        const serializedArgs = argsArray.toString();
        if (!this.cachedPages.has(serializedArgs)) {
            const args = unwrapArray(argsArray);
            const generatorArgs = {
                args,
                argsArray,
                doNotCache: this.options.doNotCache,
            };
            const page = (pageGenerator.prototype instanceof UI.Element) ? new pageGenerator(generatorArgs) : pageGenerator(generatorArgs);
            if (page && !page.pageTitle) {
                const myPageTitle = this.getPageTitle();
                if (myPageTitle) {
                    page.pageTitle = this.getPageTitle();
                }
            }
            if (this.options.doNotCache) {
                return page;
            }
            this.cachedPages.set(serializedArgs, page);
        }
        return this.cachedPages.get(serializedArgs);
    }

    matchesOwnNode(urlParts: string[]): boolean {
        return urlParts.length === 0;
    }

    executeGuard(): UIElement | string[] | null {
        const pageGuard = this.getPageGuard();
        if (!pageGuard) {
            return null;
        }

        return pageGuard(this.getSnapshot());
    }

    getPage(urlParts: string[], router?: Router, ...argsArray: any[]): UIElement | string[] | false {
        let match;
        let matchingRoute: Route | null = this.matchesOwnNode(urlParts) ? this : null;

        if (!matchingRoute) {
            for (const subroute of this.subroutes) {
                match = subroute.matches(urlParts);
                if (!match) {
                    continue;
                }
                if (match.args.length) {
                    argsArray.push(match.args);
                }
                matchingRoute = subroute;
                break;
            }
        }

        if (!matchingRoute) {
            return false;
        }

        const guardResult = this.executeGuard();
        if (!guardResult) {
            return matchingRoute === this ?
                this.generatePage(this.pageGenerator, ...argsArray) :
                matchingRoute.getPage(match.urlParts, router, ...argsArray);
        }

        if (Array.isArray(guardResult)) {
            return guardResult;
        }

        return this.generatePage(guardResult, ...argsArray);
    }

    getSnapshot(): RouteSnapshot {
        return {
            expr: this.expr,
            url: window.location.href,
            path: `${window.location.pathname}${window.location.search}`,
            params: new URLSearchParams(window.location.search)
        }
    }
}

export class TerminalRoute extends Route {
    timeout: number | null = null;

    constructor(expr: string | string[], pageGenerator: PageGenerator, options: RouteOptions | string = {}) {
        super(expr, pageGenerator, [], options);
    }

    matchesOwnNode(urlParts: string[]): boolean {
        return true;
    }

    getPage(urlParts: string[], router?: Router): UIElement | string[] | false {
        const page = super.getPage(...arguments);
        // TODO: why is this in a setTimeout?
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            if (page?.setURL) {
                page.setURL(urlParts);
            }
        });
        return page;
    }
}
