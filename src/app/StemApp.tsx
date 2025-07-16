import {UI, UIElementChild} from "../ui/UIBase";
import {Router} from "../ui/Router";
import {GlobalContainer} from "../ui/global-container/GlobalContainer";
import {Dispatcher} from "../base/Dispatcher";
import {GlobalState} from "../state/State";

interface StemAppOptions {
    routes: any[];
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

export class StemApp extends UI.Element {
    declare options: StemAppOptions;

    static init(): StemApp {
        self.GlobalState = GlobalState; // Expose it for debugging
        self.appInstance = this.create(document.body);
        return self.appInstance;
    }

    getRoutes(): any[] {
        return this.options.routes;
    }

    getBeforeContainer(): UIElementChild {
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

    getRouter(): UIElementChild {
        return <Router
            ref="router"
            routes={this.getRoutes()}
            onChange={(...args: any[]) => this.handleRouteChange(...args)}
            {...this.getRouterOptions()}
        />;
    }

    getContainer(): UIElementChild {
        return <GlobalContainer>
            {this.getRouter()}
        </GlobalContainer>;
    }

    getAfterContainer(): UIElementChild {
        return null;
    }

    render(): UIElementChild {
        return [
            this.getBeforeContainer(),
            this.getContainer(),
            this.getAfterContainer(),
        ];
    }
}
