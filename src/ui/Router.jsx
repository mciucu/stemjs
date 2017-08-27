import {UI} from "./UIBase";
import {Switcher} from "./Switcher";
import {Dispatcher} from "../base/Dispatcher";
import {PageTitleManager} from "../base/PageTitleManager";
import {unwrapArray} from "../base/Utils";

export class Router extends Switcher {
    static parseURL(path=location.pathname) {
        if (!Array.isArray(path)) {
            path = path.split("/");
        }
        return path.filter(str => str != "");
    }

    static joinURLParts(urlParts) {
        if (urlParts.length) {
            return "/" + urlParts.join("/") + "/";
        } else {
            return "/";
        }
    }

    static changeURL(url, replaceHistory=false) {
        if (Array.isArray(url)) {
            url = this.joinURLParts(url);
        }

        if (url === window.location.pathname) {
            return;
        }
        const historyArgs = [{}, PageTitleManager.getTitle(), url];
        if (replaceHistory) {
            window.history.replaceState(...historyArgs);
        } else {
            window.history.pushState(...historyArgs);
        }

        this.updateURL();
    }

    static updateURL() {
        this.Global.setURL(this.parseURL());
    }

    static setGlobalRouter(router) {
        this.Global = router;
        window.onpopstate = () => {
            this.updateURL();
            Dispatcher.Global.dispatch("externalURLChange");
        };

        this.updateURL();
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

    setURL(urlParts) {
        urlParts = unwrapArray(urlParts);

        const page = this.getRoutes().getPage(urlParts) || this.getPageNotFound();

        const activePage = this.getActive();

        if (activePage !== page) {
            activePage && activePage.dispatch("urlExit");
            this.setActive(page);
            page.dispatch("urlEnter");
        }

        if (this === this.constructor.Global) {
            PageTitleManager.setTitle(page.pageTitle);
        }

        this.dispatch("change", urlParts, page, activePage);
    }

    addChangeListener(callback) {
        return this.addListener("change", callback);
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

    constructor(expr, pageGenerator, subroutes=[], options={}) {
        this.expr = (expr instanceof Array) ? expr : [expr];
        this.pageGenerator = pageGenerator;
        this.subroutes = unwrapArray(subroutes);
        if (typeof options === "string") {
            options = {title: options}
        }
        this.options = options;
        this.cachedPages = new Map();
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

    generatePage(...argsArray) {
        if (!this.pageGenerator) {
            return null;
        }

        const serializedArgs = argsArray.toString();
        if (!this.cachedPages.has(serializedArgs)) {
            const pageGenerator = this.pageGenerator;
            const args = unwrapArray(argsArray);
            const generatorArgs = {args, argsArray};
            const page = (pageGenerator.prototype instanceof UI.Element) ? new pageGenerator(generatorArgs) : pageGenerator(generatorArgs);
            if (!page.pageTitle) {
                const myPageTitle = this.getPageTitle();
                if (myPageTitle) {
                    page.pageTitle = this.getPageTitle();
                }
            }
            this.cachedPages.set(serializedArgs, page);
        }
        return this.cachedPages.get(serializedArgs);
    }

    matchesOwnNode(urlParts) {
        return urlParts.length === 0;
    }

    getPage(urlParts, router, ...argsArray) {
        if (this.matchesOwnNode(urlParts)) {
            return this.generatePage(...argsArray);
        }
        for (const subroute of this.subroutes) {
            const match = subroute.matches(urlParts);
            if (match) {
                if (match.args.length) {
                    argsArray.push(match.args);
                }
                let page = subroute.getPage(match.urlParts, router, ...argsArray);
                if (page && !page.pageTitle) {
                    page.pageTitle = this.getPageTitle();
                }
                return page;
            }
        }
    }
}

export class TerminalRoute extends Route {
    constructor(expr, pageGenerator, options={}) {
        super(expr, pageGenerator, [], options);
    }

    matchesOwnNode(urlParts) {
        return true;
    }

    getPage(urlParts, router) {
        const page = super.getPage(...arguments);
        setTimeout(() => {
            page.setURL(urlParts);
        });
        return page;
    }
}
