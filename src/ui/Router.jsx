import {UI, Switcher} from "./UI";
import {Dispatcher, Dispatchable} from "../base/Dispatcher";
import {unwrapArray} from "../base/Utils";

function attachSubrouterEvents(subrouter) {
    let handleChangeUrl = () => {
        let currentUrl = Router.parseURL();
        if (currentUrl.length >= subrouter.getPrefix().length) {
            let currentPrefix = currentUrl.slice(0, subrouter.getPrefix().length);
            if (currentPrefix.join("/") === subrouter.getPrefix().join("/")) {
                subrouter.getParentRouter().setActiveSubrouter(subrouter);
                subrouter.setState(currentUrl.slice(currentPrefix.length), true);
            } else if (subrouter.getParentRouter().getActiveSubrouter() === subrouter) {
                subrouter.getParentRouter().resetActiveSubrouter();
            }
        }
    };

    Dispatcher.Global.addListener("changeURL", handleChangeUrl);
    Router.Global.addListener("change", handleChangeUrl);
}

class Router extends Switcher {
    static parseURL() {
        let path = location.pathname;
        let urlParts = path.split("/");
        while (urlParts.length && urlParts[urlParts.length - 1] === "") {
            urlParts.pop();
        }
        while (urlParts.length && urlParts[0] === "") {
            urlParts.splice(0, 1);
        }
        if (!urlParts.length) {
            urlParts = [""];
        }
        return urlParts;
    }

    static changeURL(urlParts, replaceHistory=false) {
        urlParts = unwrapArray(urlParts).filter(urlPart => !!urlPart);
        let url;
        if (urlParts.length) {
            url = "/" + urlParts.join("/") + "/";
        } else {
            url = "/";
        }

        if (url === location.pathname) {
            return;
        }
        if (replaceHistory) {
            history.replaceState({}, this.pageTitle, url);
        } else {
            history.pushState({}, this.pageTitle, url);
        }
    }

    getDefaultOptions() {
        return {
            global: true,
        }
    }

    getPrefix() {
        return [];
    }

    getRoutes() {
        return this.options.routes;
    }

    setRoute(route, urlParts, subArgs) {
        if (this._activeRoute === route && urlParts.join(" ") === this._activeUrlParts.join(" ")) {
            return;
        }
        this.dispatch("change");
        this._activeRoute = route;
        this._activeUrlParts = urlParts;
        this.setActive(route.getElement(urlParts, this, subArgs));
    }

    updateURL() {
        const urlParts = this.constructor.parseURL();
        for (const route of this.getRoutes()) {
            let match = route.matches(urlParts);
            if (match) {
                this.setRoute(route, match, urlParts.slice(match.length));
                break;
            }
        }
    }

    getParentRouter() {
        return null;
    }

    registerSubrouter(subrouter, autoActive=true) {
        if (!this.subrouters) {
            this.subrouters = [];
        }
        this.subrouters.push(subrouter);
        if (autoActive) {
            this.setActiveSubrouter(subrouter);
        }

        attachSubrouterEvents(subrouter);
    }

    getActiveSubrouter() {
        return this.activeSubrouter || null;
    }

    getCurrentRouter() {
        let currentRouter = this;
        while (currentRouter.getActiveSubrouter()) {
            currentRouter = currentRouter.getActiveSubrouter();
        }
        return currentRouter;
    }

    setActiveSubrouter(subrouter) {
        if (this.getActiveSubrouter() === subrouter) {
            return;
        }
        if (this.subrouters.indexOf(subrouter) === -1) {
            throw Error("Invalid subrouter (you need to register it first)");
        }
        this.activeSubrouter = subrouter;
        this.constructor.changeURL([...this.getState(), ...this.getActiveSubrouter().getFullState()], true);
    }

    resetActiveSubrouter() {
        this.activeSubrouter = null;
    }

    getState() {
        return this._activeUrlParts;
    }

    isGlobal() {
        return this.options.global;
    }

    onMount() {
        if (this.isGlobal()) {
            Router.Global = this;
        }
        this.updateURL();
        Dispatcher.Global.addListener("changeURL", (href, event) => {
            history.pushState({}, Router.pageTitle, href);
            if (event) {
                event.preventDefault();
            }
            this.updateURL();
        });
        Dispatcher.Global.addListener("externalURLChange", () => {
            this.updateURL();
        });
    }
}
Router.pageTitle = "Example";

class Subrouter extends Dispatchable {
    constructor(parentRouter, prefix, initialState=[]) {
        super();
        this.parentRouter = parentRouter;
        this.prefix = prefix;
        this.setState(initialState, true);
        Dispatcher.Global.addListener("externalURLChange", () => {
            let router = Router.Global;
            while (router && router !== this) {
                router = router.getActiveSubrouter();
            }
            if (router === this) {
                this.dispatch("externalChange", Router.parseURL().slice(this.getPrefix().length));
            }
        });
    }

    getPrefix() {
        return this.prefix;
    }

    getParentRouter() {
        return this.parentRouter;
    }

    registerSubrouter(subrouter, autoActive=true) {
        if (!this.subrouters) {
            this.subrouters = [];
        }
        this.subrouters.push(subrouter);
        if (autoActive) {
            this.setActiveSubrouter(subrouter);
        }

        attachSubrouterEvents(subrouter);
    }

    getActiveSubrouter() {
        return this.activeSubrouter || null;
    }

    setActiveSubrouter(subrouter) {
        if (this.getActiveSubrouter() === subrouter) {
            return;
        }
        if (this.subrouters.indexOf(subrouter) === -1) {
            throw Error("Invalid subrouter option");
        }
        this.activeSubrouter = subrouter;
        subrouter.setState(subrouter.getState());
    }

    resetActiveSubrouter() {
        this.activeSubrouter = null;
    }

    getState() {
        return this.state;
    }

    getFullState() {
        if (this.getActiveSubrouter()) {
            return [...this.state, ...this.getActiveSubrouter().getFullState()];
        }
        return this.state;
    }

    setState(state, replaceHistory=false) {
        if (!(state instanceof Array)) {
            state = [state];
        }
        let realState = [];
        for (let urlPart of state) {
            if (urlPart !== "") {
                realState.push(urlPart);
            }
        }
        state = realState;

        this.state = state;
        let fullUrlState = [...this.getPrefix(), ...this.getFullState()];
        Router.changeURL(fullUrlState, replaceHistory);
        this.dispatch("change", state);
    }

    openInNewTab(state) {
        if (!(state instanceof Array)) {
            state = [state];
        }
        let urlParts = [...this.getPrefix(), ...state];
        if (this.getActiveSubrouter()) {
            urlParts = [...urlParts, this.getActiveSubrouter().getFullState()];
        }
        let url;
        if (urlParts.length) {
            url = "/" + urlParts.join("/") + "/";
        } else {
            url = "/";
        }
        window.open(url, "_blank");
    }

    addChangeListener(callback) {
        this.addListener("change", callback);
    }

    addExternalChangeListener(callback) {
        this.addListener("externalChange", callback);
    }
}

class Route {
    constructor(expr, gen) {
        this.expr = expr;
        if (!(this.expr instanceof Array)) {
            this.expr = [this.expr];
        }
        this.gen = gen;
    }

    matchURLComponent(pattern, string) {
        return pattern === "%s" || pattern === string;
    }

    matches(urlParts) {
        if (urlParts.length < this.expr.length && !(urlParts.length === this.expr.length - 1 && this.expr[this.expr.length - 1] === "*")) {
            return null;
        }
        let prefix = [];
        for (let i = 0; i < urlParts.length; ++ i) {
            if (i >= this.expr.length) {
                return null;
            }
            if (this.expr[i] === "*") {
                return prefix;
            }
            if (!this.matchURLComponent(this.expr[i], urlParts[i])) {
                return null;
            }
            prefix.push(urlParts[i]);
        }
        return prefix;
    }

    getElement(urlParts, router, subArgs=[]) {
        let args = this.matches(urlParts);
        if (!this._cachedChildren) {
            this._cachedChildren = new Map();
        }
        let key = args.join(" ");
        if (!this._cachedChildren.has(key)) {
            this._cachedChildren.set(key, <this.gen args={args} router={router} subArgs={subArgs} />);
        }
        return this._cachedChildren.get(key);
    }
}

export {Route, Router, Subrouter};