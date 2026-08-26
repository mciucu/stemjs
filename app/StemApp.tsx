import {UI, type UIChild} from "../ui/UIBase";
import {Route, Router} from "../ui/Router";
import {GlobalContainer} from "../ui/global-container/GlobalContainer";
import {Dispatcher} from "../base/Dispatcher";
import {GlobalState} from "../state/State";

interface StemAppOptions {
    routes: Route;
    [key: string]: any;
}

interface RouterOptions {
    style: {
        height: string;
    };
    [key: string]: any;
}

declare global {
    interface Window {
        GlobalState: typeof GlobalState;
        appInstance: StemApp;
    }
}

export class StemApp extends UI.Element<StemAppOptions> {
    declare options: StemAppOptions;

    static init(): StemApp {
        self.GlobalState = GlobalState; // Expose it for debugging
        self.appInstance = this.create(document.body);
        return self.appInstance;
    }

    getRoutes(): Route {
        return this.options.routes;
    }

    getBeforeContainer(): UIChild {
        return null;
    }

    getRouterOptions(): RouterOptions {
        return {
            style: {
                height: "100%",
            }
        };
    }

    handleRouteChange(...args: any[]): void {
        document.body.click(); // TODO Really bro?
        Dispatcher.Global.dispatch("closeAllModals");
    }

    getRouter(): UIChild {
        return <Router
            ref="router"
            routes={this.getRoutes()}
            onChange={(...args: any[]) => this.handleRouteChange(...args)}
            {...this.getRouterOptions()}
        />;
    }

    getContainer(): UIChild {
        return <GlobalContainer>
            {this.getRouter()}
        </GlobalContainer>;
    }

    getAfterContainer(): UIChild {
        return null;
    }

    render(): UIChild {
        return [
            this.getBeforeContainer(),
            this.getContainer(),
            this.getAfterContainer(),
        ];
    }
}
