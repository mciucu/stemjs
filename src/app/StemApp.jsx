import {UI, Link, Router} from "../ui/UI";
import {isLocalUrl, trimLocalUrl} from "../base/Utils";
import {Dispatcher} from "../base/Dispatcher";


export function singlePageLinkOnMount() {
    this.addClickListener((event) => {
        if (event.shiftKey || event.ctrlKey || event.metaKey || !isLocalUrl(this.options.href)) {
            // Leave it to the browser
            return;
        }
        event.preventDefault();
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

    getContainer() {
        return <GlobalContainer>
                <Router routes={this.getRoutes()} ref="router" style={{height: "100%"}}/>
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
