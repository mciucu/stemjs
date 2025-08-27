import {UI, UIElement} from "./UIBase";
import {ConcentricCirclesLoadingScreen} from "./ConcentricCirclesLoadingScreen";
import {DelayedElement} from "./DelayedElement";
import {Ajax} from "../base/Ajax";
import {GlobalState} from "../state/State";
import {CardPanel} from "./CardPanel";
import {Level} from "./Constants";

// Type definitions
export interface StateDependentElementOptions {
    error?: any;
    [key: string]: any;
}

// You can configure the loading/error states by defining the "renderLoading" and "renderError" attributes of the
// function somewhere globally in your app.
// Example:
// StateDependentElement.renderLoading = "Loading...";
// or
// StateDependentElement.renderLoading = () => <MyCustomLoadingAnimation />
// StateDependentElement.renderError = (error) => <MyCustomErrorMessageClass error={error} />

export const StateDependentElement = <T extends typeof UIElement>(BaseClass: T) => {
    return class StateDependentElementClass extends DelayedElement(BaseClass) {
        declare options: StateDependentElementOptions;
        
        importState(data: any): void {
            GlobalState.load(data);
            for (let key of Object.keys(data)) {
                if (key !== "state") {
                    (this.options as any)[key] = data[key];
                }
            }
        }

        getAjaxUrl(): string {
            let url = location.pathname;
            if (!url.endsWith("/")) {
                url += "/";
            }
            return url;
        }

        getAjaxRequest(): any {
            return {};
        }

        renderNotLoaded(): any {
            let renderLoading = (StateDependentElement as any).renderLoading;
            if (typeof renderLoading === "function") {
                renderLoading = renderLoading();
            }
            return renderLoading;
        }

        setError(error: any): void {
            this.options.error = error;
        }

        renderError(): any {
            let renderError = (StateDependentElement as any).renderError;
            if (typeof renderError === "function") {
                renderError = renderError(this.options.error);
            }
            return renderError;
        }

        renderLoaded(): any {
            if (this.options.error) {
                return this.renderError();
            }
            return super.renderLoaded();
        }

        onDelayedMount(): void {
            if (!this.options.error) {
                super.onDelayedMount();
            }
        }

        beforeRedrawNotLoaded(): void {
            Ajax.getJSON(this.getAjaxUrl(), this.getAjaxRequest()).then(
                (data: any) => {
                    this.importState(data);
                    (this as any).setLoaded();
                },
                (error: any) => {
                    console.error("Request error", error);
                    this.setError(error);
                    (this as any).setLoaded();
                }
            );
        }
    };
};

(StateDependentElement as any).renderLoading = (): any => <ConcentricCirclesLoadingScreen />;

(StateDependentElement as any).renderError = (error: any, message?: string): any => {
    return <div style={{maxWidth: "300px", margin: "0 auto", marginTop: "30px"}}>
            <CardPanel title={UI.T("Error in opening the URL")} level={Level.ERROR}>
                <h3>{message || error.message}</h3>
            </CardPanel>
        </div>;
};