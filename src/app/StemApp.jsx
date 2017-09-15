import {UI, Link, Router, GlobalContainer} from "../ui/UI";
import {isLocalUrl, trimLocalUrl} from "../base/Utils";
import {Dispatcher} from "../base/Dispatcher";


export function singlePageLinkOnMount() {
    this.addClickListener((event) => {
        if (event.shiftKey || event.ctrlKey || event.metaKey || !this.options.href || !isLocalUrl(this.options.href)
            || this.options.newTab || (this.options.target && this.options.target !== "_self")) {
            // Leave it to the browser
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        Router.changeURL(trimLocalUrl(this.options.href));
    });
}

export class StemApp extends UI.Element {
    static init() {
        Link.prototype.onMount = singlePageLinkOnMount;
        return self.appInstance = this.create(document.body);
    }

    getRoutes() {
        return this.options.routes;
    }

    getBeforeContainer() {
        return null;
    }

    getRouterOptions() {
        return {
            style: {
                height: "100%",
            }
        }
    }

    getRouter() {
        return <Router routes={this.getRoutes()} ref="router" {...this.getRouterOptions()}/>;
    }

    getContainer() {
        return <GlobalContainer>
            {this.getRouter()}
            </GlobalContainer>;
    }

    getAfterContainer() {
        return null;
    }

    render() {
        return [
            this.getBeforeContainer(),
            this.getContainer(),
            this.getAfterContainer(),
        ]
    }

    onMount() {
        this.router && this.router.addListener("change", () => {
            document.body.click();
            Dispatcher.Global.dispatch("closeAllModals");
        });
    }
}
