import {UI} from "./UIBase";
import {ConcentricCirclesLoadingScreen} from "./ConcentricCirclesLoadingScreen";
import {DelayedElement} from "./DelayedElement";
import {Ajax} from "base/Ajax";
import {GlobalState} from "state/State";
import {CardPanel} from "./CardPanel";
import {Level} from "./Constants";

// You can configure the loading/error states by defining the "renderLoading" and "renderError" attributes of the
// function somewhere globally in your app.
// Example:
// StateDependentElement.renderLoading = "Loading...";
// or
// StateDependentElement.renderLoading = () => <MyCustomLoadingAnimation />
// StateDependentElement.renderError = (error) => <MyCustomErrorMessageClass error={error} />

export let StateDependentElement = (BaseClass) => class StateDependentElementClass extends DelayedElement(BaseClass) {
    importState(data) {
        GlobalState.importState(data.state || {});
        for (let key of Object.keys(data)) {
            if (key !== "state") {
                this.options[key] = data[key];
            }
        }
    }

    getAjaxUrl() {
        let url = location.pathname;
        if (!url.endsWith("/")) {
            url += "/";
        }
        return url;
    }

    getAjaxRequest() {
        return {};
    }

    renderNotLoaded() {
        let renderLoading = StateDependentElement.renderLoading;
        if (typeof renderLoading === "function") {
            renderLoading = renderLoading();
        }
        return renderLoading;
    }

    setError(error) {
        this.options.error = error;
    }

    renderError() {
        let renderError = StateDependentElement.renderError;
        if (typeof renderError === "function") {
            renderError = renderError(this.options.error);
        }
        return renderError;
    }

    renderLoaded() {
        if (this.options.error) {
            return this.renderError();
        }
        return super.renderLoaded();
    }

    onDelayedMount() {
        if (!this.options.error) {
            super.onDelayedMount();
        }
    }

    beforeRedrawNotLoaded() {
        Ajax.getJSON(this.getAjaxUrl(), this.getAjaxRequest()).then(
            (data) => {
                this.importState(data);
                this.setLoaded();
            },
            (error) => {
                this.setError(error);
                this.setLoaded();
            }
        );
    }
};

StateDependentElement.renderLoading = () => <ConcentricCirclesLoadingScreen/>;

StateDependentElement.renderError = (error, message) => {
    return <div style={{maxWidth: "300px", margin: "0 auto", marginTop: "30px"}}>
            <CardPanel title={UI.T("Error in opening the URL")} level={Level.ERROR}>
                <h3>{message || error.message}</h3>
            </CardPanel>
        </div>;
};
