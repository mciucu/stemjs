import {UI} from "./UI";
import {DelayedElement} from "./DelayedElement";
import {Ajax} from "base/Ajax";
import {GlobalState} from "state/State";

function StateDependentElement(BaseClass) {
    return class StateDependentElementClass extends DelayedElement(BaseClass) {
        importState(data) {
            GlobalState.importState(data.state || {});
        }

        getAjaxUrl() {}

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
}

export {StateDependentElement};