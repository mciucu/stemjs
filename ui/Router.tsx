import {UI} from "./UIBase";
import {Switcher} from "./Switcher";
import {Dispatcher} from "../base/Dispatcher";
import {PageTitleManager} from "../base/PageTitleManager";
import {unwrapArray, isString} from "../base/Utils";

export class Router extends Switcher {
    // TODO: This works bad with query params. Fix it!
    static localHistory = []; // If we want the router to not alter the window history, use this instead.
    static useLocalHistory = false;

    // Return a historic page, depth = 0 current, depth = 1 previous, etc
    static getHistoricPath(depth) {
        depth = Math.abs(depth); // So negatives also work
        const index = this.localHistory.length - 1 - depth;
        if (index < 0) {
            return null;
        }
        const url = this.localHistory[index];

        // TODO @cleanup this should use new URL(url), only keeping Denis's shit code to not break anything
        return url.split("?")[0].split("#")[0];
    }

    static getCurrentPath() {
        let path = "";
        if (this.useLocalHistory && this.localHistory.length) {
            // We do this to get rid of query params or hash params
            path = this.getHistoricPath(0);
        } else {
            path = location.pathname;
        }
        return path;
    }

    static parseURL(path=location.pathname) {
        if (!Array.isArray(path)) {
            path = path.split("/");
        }
        return path.filter(str => str != "");
    }

    static joinQueryParams(queryParams = {}) {
        return Object.keys(queryParams)
            .map((param) => `${encodeURIComponent(param)}=${encodeURIComponent(queryParams[param])}`).join("&");
    }

    static formatURL(url) {
        if (Array.isArray(url)) {
            url = url.length ? ("/" + url.join("/")) : "/";
        }

        if (isString(url) && url[0] !== "/") {
            url = "/" + url;
        }

        return url;
    }

    static changeURL(url, options = {
        queryParams: {},
        state: {},
        replaceHistory: false,
        forceElementUpdate: false,
        keepSearchParams: false,
    }) {
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

    static onPopState() {
        this.changeURL(this.parseURL(this.getCurrentPath()), {replaceHistory: true, forceElementUpdate: true,
            keepSearchParams: true});
        Dispatcher.Global.dispatch("externalURLChange");
    }

    static back() {
        if (this.useLocalHistory) {
            this.localHistory.pop();
            this.onPopState();
        } else {
            window.history.back();
        }
    }

    static updateURL() {
        this.Global.setURL(this.parseURL(this.getCurrentPath()));
    }

    static setGlobalRouter(router) {
        this.Global = router;
        window.onpopstate = () => {
            this.onPopState();
        };

        if (this.globalSetURL) {
            this.Global.setURL = this.globalSetURL;
        }

        this.updateURL();
    }

    clearCache() {
        this.getRoutes().clearCache();
    }

    // TODO: should be named getRootRoute() :)
    getRoutes() {
        return this.options.routes;
    }

    getPageNotFound() {
        const element = UI.createElement("h1", {children: ["Can't find url, make sure you typed it correctly"]});
        element.pageTitle = "Page not found";
        return element;
    }

    getPageToRender(urlParts) {
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

    deactivateChild(child) {
        super.deactivateChild(child);
        if (child.options.doNotCache) {
            child.destroyNode();
        }
    }

    setURL(urlParts) {
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

    onMount() {
        if (!Router.Global) {
            this.constructor.setGlobalRouter(this);
        }
    }
}

export class Route {
    static ARG_KEY = "%s";
    cachedPages = new Map();

    getDefaultOptions() {
        return {
            beforeEnter: null,
            cachePage: true,
        };
    }

    constructor(expr, pageGenerator, subroutes = [], options = {}) {
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

    clearCache() {
        this.cachedPages.clear();
        for (const subroute of this.subroutes) {
            if (subroute.clearCache) {
                subroute.clearCache();
            }
        }
    }

    matches(urlParts) {
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

    getPageTitle() {
        return this.options.title;
    }

    getPageGuard() {
        return this.options.beforeEnter;
    }

    generatePage(pageGenerator, ...argsArray) {
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

    matchesOwnNode(urlParts) {
        return urlParts.length === 0;
    }

    executeGuard() {
        const pageGuard = this.getPageGuard();
        if (!pageGuard) {
            return null;
        }

        return pageGuard(this.getSnapshot());
    }

    getPage(urlParts, router, ...argsArray) {
        let match;
        let matchingRoute = this.matchesOwnNode(urlParts) ? this : null;

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

    getSnapshot() {
        return {
            expr: this.expr,
            url: window.location.href,
            path: `${window.location.pathname}${window.location.search}`,
            params: new URLSearchParams(window.location.search)
        }
    }
}

export class TerminalRoute extends Route {
    timeout = null;

    constructor(expr, pageGenerator, options = {}) {
        super(expr, pageGenerator, [], options);
    }

    matchesOwnNode(urlParts) {
        return true;
    }

    getPage(urlParts, router) {
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
