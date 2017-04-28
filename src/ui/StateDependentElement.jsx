import {UI} from "UI";
import {DelayedElement} from "DelayedElement";
import {Ajax} from "Ajax";
import {GlobalState} from "State";
import {StemDate} from "Time";

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
            let startTime = StemDate.now();
            Ajax.getJSON(this.getAjaxUrl(), {}).then(
                (data) => {
                    this.importState(data);
                    let durationLeft = 500 - (StemDate.now() - startTime);
                    if (durationLeft > 0) {
                        setTimeout(() => {this.setLoaded();}, durationLeft);
                    } else {
                        this.setLoaded();
                    }
                },
                (error) => {
                    console.error(error);
                }
            );
        }
    }
}

export {StateDependentElement};