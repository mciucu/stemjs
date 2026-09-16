import {type ElementOptions, type ExtendedOptions, UI, type UIChild, UIElement} from "./UIBase";
import {ConcentricCirclesLoadingScreen} from "./ConcentricCirclesLoadingScreen";
import {DelayedElement} from "./DelayedElement";
import {Ajax} from "../base/Ajax";
import {GlobalState} from "../state/State";
import {CardPanel} from "./CardPanel";
import {Level} from "./Constants";

// importState writes the response's own keys onto the options, and only the page knows what they are
export interface StateDependentElementOptions {
    // A rejection is whatever the endpoint threw, and an app hands its own error objects here
    error?: unknown;
    [key: string]: unknown;
}

// What a delayed page's options are: the wrapped element's, the loading and error ones above, and
// whatever that page's own endpoint sends beside the state
export type PageOptions<Wrapped extends {options?: any}, ExtraOptions = {}> =
    ExtendedOptions<Wrapped, StateDependentElementOptions & ExtraOptions>;

// You can configure the loading/error states by defining the "renderLoading" and "renderError" attributes of the
// function somewhere globally in your app.
// Example:
// StateDependentElement.renderLoading = "Loading...";
// or
// StateDependentElement.renderLoading = () => <MyCustomLoadingAnimation />
// StateDependentElement.renderError = (error) => <MyCustomErrorMessageClass error={error} />

// What a page's state endpoint answers with: the store state under `state`, and the element's own
// options beside it, both of which the page defines
export type PageState = Record<string, unknown>;

// A function declaration, not a const: only that form takes the hooks assigned below as its own properties
export function StateDependentElement<T extends new (...args: any[]) => UIElement<any, any, any, any>>(BaseClass: T) {
    return class StateDependentElementClass extends DelayedElement(BaseClass) {
        declare options: ElementOptions<StateDependentElementOptions>;
        
        importState(data: PageState): void {
            GlobalState.load(data);
            for (let key of Object.keys(data)) {
                if (key !== "state") {
                    this.options[key] = data[key];
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

        getAjaxRequest(): Record<string, unknown> {
            return {};
        }

        renderNotLoaded(): UIChild {
            let renderLoading: UIChild | (() => UIChild) = StateDependentElement.renderLoading;
            if (typeof renderLoading === "function") {
                renderLoading = renderLoading();
            }
            return renderLoading;
        }

        setError(error: unknown): void {
            this.options.error = error;
        }

        renderError(): UIChild {
            let renderError: UIChild | ((error?: {message?: string}) => UIChild) = StateDependentElement.renderError;
            if (typeof renderError === "function") {
                renderError = renderError(this.options.error);
            }
            return renderError;
        }

        renderLoaded(): UIChild {
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
                (data: PageState) => {
                    this.importState(data);
                    this.setLoaded();
                },
                (error: unknown) => {
                    console.error("Request error", error);
                    this.setError(error);
                    this.setLoaded();
                }
            );
        }
    };
}

StateDependentElement.renderLoading = (): UIChild => <ConcentricCirclesLoadingScreen />;

StateDependentElement.renderError = (error: {message?: string}): UIChild => {
    return <div style={{maxWidth: "300px", margin: "0 auto", marginTop: "30px"}}>
            <CardPanel title={UI.T("Error in opening the URL")} level={Level.ERROR}>
                <h3>{error.message}</h3>
            </CardPanel>
        </div>;
};
