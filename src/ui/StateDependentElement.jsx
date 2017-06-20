import {UI} from "./UI";
import {DelayedElement} from "./DelayedElement";
import {Ajax} from "base/Ajax";
import {GlobalState} from "state/State";

function StateDependentElement(BaseClass) {
    class StateDependentElementClass extends DelayedElement(BaseClass) {
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

        renderNotLoaded() {
            if (typeof window.loadingAnimation === "function") {
                return window.loadingAnimation();
            }
            return "Loading...";
        }

        beforeRedrawNotLoaded() {
            Ajax.getJSON(this.getAjaxUrl(), {}).then(
                (data) => {
                    this.importState(data);
                    this.setLoaded();
                },
                (error) => {
                    console.error(error);
                }
            );
        }
    }
    return StateDependentElementClass;
}

export {StateDependentElement};