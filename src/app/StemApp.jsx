import {UI} from "../ui/UI";
import {Router} from "../ui/Router";
import {GlobalContainer} from "../ui/global-container/GlobalContainer";
import {isLocalUrl, trimLocalUrl} from "../base/Utils";
import {Dispatcher} from "../base/Dispatcher";
import {GlobalState} from "../state/State.js";

export class StemApp extends UI.Element {
    static init() {
        self.GlobalState = GlobalState; // Expose it for debugging
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
