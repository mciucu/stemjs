import {UI} from "../ui/UIBase.js";
import {Router} from "../ui/Router.jsx";
import {GlobalContainer} from "../ui/global-container/GlobalContainer.jsx";
import {Dispatcher} from "../base/Dispatcher.js";
import {GlobalState} from "../state/State.js";

export class StemApp extends UI.Element {
    static init() {
        self.GlobalState = GlobalState; // Expose it for debugging
        self.appInstance = this.create(document.body);
        return self.appInstance;
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

    handleRouteChange() {
        document.body.click(); // TODO Really bro?
        Dispatcher.Global.dispatch("closeAllModals");
    }

    getRouter() {
        return <Router
            ref="router"
            routes={this.getRoutes()}
            onChange={(...args) => this.handleRouteChange(...args)}
            {...this.getRouterOptions()}
        />;
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
}
