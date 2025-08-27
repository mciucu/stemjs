import {ensure} from "../base/Require";
import {UIElement} from "./UIBase";

export const DelayedElement = <T extends new (...args: any[]) => UIElement>(BaseClass: T) => class DelayedElement extends BaseClass {
    private _loaded: boolean = false;
    private _executedMount: boolean = false;
    applyNodeAttributesNotLoaded(): void {
        super.applyNodeAttributes();
    }

    applyNodeAttributesLoaded(): void {
        super.applyNodeAttributes();
    }

    applyNodeAttributes(): void {
        if (!this._loaded) {
            return this.applyNodeAttributesNotLoaded();
        } else {
            return this.applyNodeAttributesLoaded();
        }
    }

    renderNotLoaded(): string {
        return "Loading component...";
    }

    renderLoaded(): any {
        return super.render();
    }

    render(): any {
        if (!this._loaded) {
            return this.renderNotLoaded();
        } else {
            return this.renderLoaded();
        }
    }

    setLoaded(): void {
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

    beforeRedrawNotLoaded(): void {
        // Implement here anything you might need
    }

    redrawNotLoaded(): boolean {
        this.beforeRedrawNotLoaded();
        // The previous code might have triggered a redraw, skip if that was the case
        if (!this._loaded) {
            return super.redraw();
        }
        return false;
    }

    redrawLoaded(): boolean {
        return super.redraw();
    }

    redraw(): boolean {
        if (!this._loaded) {
            return this.redrawNotLoaded();
        }
        return this.redrawLoaded();
    }

    onMount(): void {
        // Nothing to be done here
    }

    onDelayedMount(): void {
        super.onMount();
    }
};

export const ScriptDelayedElement = <T extends new (...args: any[]) => UIElement>(BaseClass: T, scripts: string | string[]) => class ScriptDelayedElement extends DelayedElement(BaseClass) {
    beforeRedrawNotLoaded(): void {
        ensure(scripts, () => {
            this.setLoaded();
        });
    }
};