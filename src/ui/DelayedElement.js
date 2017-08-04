import {ensure} from "../base/Require";

let DelayedElement = (BaseClass) => class DelayedElement extends BaseClass {
    applyNodeAttributesNotLoaded() {
        super.applyNodeAttributes();
    }

    applyNodeAttributesLoaded() {
        super.applyNodeAttributes();
    }

    applyNodeAttributes() {
        if (!this._loaded) {
            return this.applyNodeAttributesNotLoaded();
        } else {
            return this.applyNodeAttributesLoaded();
        }
    }

    renderNotLoaded() {
        return "Loading component...";
    }

    renderLoaded() {
        return super.render();
    }

    render() {
        if (!this._loaded) {
            return this.renderNotLoaded();
        } else {
            return this.renderLoaded();
        }
    }

    setLoaded() {
        if (this._loaded) {
            return;
        }
        this._loaded = true;
        if (!this.node) {
            return;
        }
        super.redraw();
        if (!this._executedMount) {
            this._executedMount = true;
            this.onDelayedMount();
        }
    }

    beforeRedrawNotLoaded() {
        // Implement here anything you might need
    }

    redrawNotLoaded() {
        this.beforeRedrawNotLoaded();
        // The previous code might have triggered a redraw, skip if that was the case
        if (!this._loaded) {
            super.redraw();
        }
    }

    redrawLoaded() {
        super.redraw();
    }

    redraw() {
        if (!this._loaded) {
            return this.redrawNotLoaded();
        }
        return this.redrawLoaded();
    }

    onMount() {
        // Nothing to be done here
    }

    onDelayedMount() {
        super.onMount();
    }
};

let ScriptDelayedElement = (BaseClass, scripts) => class ScriptDelayedElement extends DelayedElement(BaseClass) {
    beforeRedrawNotLoaded() {
        // TODO: what happens if this gets destroyed before the load finishes? Should cancel this
        ensure(scripts, () => {
            this.setLoaded();
        });
    }
};

export {DelayedElement, ScriptDelayedElement}
