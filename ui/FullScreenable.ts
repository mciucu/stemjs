// Implements a Class Factory, to be able to create element that can be easily set to full screen
import {FullScreenStyle} from "./FullScreenStyle";
import {GlobalStyle} from "./GlobalStyle";
import {UIElement, UIElementOptions} from "./UIBase";
import {NodeAttributes} from "./NodeAttributes";

export interface FullScreenableOptions extends UIElementOptions {
    fullContainer?: boolean;
}

export const FullScreenable = function <T extends new (...args: any[]) => UIElement>(BaseClass: T) {
    return class FullScreenable extends BaseClass {
        _expectingFullScreen?: boolean;
        _isFullScreen?: boolean;
        _attachedFullscreenHandler?: boolean;

        getDefaultOptions(): any {
            return Object.assign({}, super.getDefaultOptions(), {
                fullContainer: true,
            });
        }

        getStyleSheet(): FullScreenStyle {
            return FullScreenStyle.getInstance();
        }

        extraNodeAttributes(attr: NodeAttributes): void {
            super.extraNodeAttributes(attr);
            if (this.options.fullContainer) {
                attr.addClass(GlobalStyle.Utils.fullContainer);
            } else {
                attr.setStyle("height", "100%");
            }
        }

        enterFullScreen(): void {
            this.attachEnterFullscreenHandler();
            this.node!.requestFullscreen().then();
            this._expectingFullScreen = true;
        }

        setFullScreenStyle(): void {
            this.addClass(this.getStyleSheet().fullScreen);
            if (this.options.fullContainer) {
                this.removeClass(GlobalStyle.Utils.fullContainer);
                this.setStyle("height", "100%");
            }
        }

        isFullScreen(): boolean {
            return !!this._isFullScreen;
        }

        exitFullScreen(): void {
            document.exitFullscreen().then();
        }

        unsetFullScreenStyle(): void {
            this.removeClass(this.getStyleSheet().fullScreen);
            if (this.options.fullContainer) {
                this.addClass(GlobalStyle.Utils.fullContainer);
                this.setStyle("height", null);
            }
        }

        toggleFullScreen(): void {
            if (this.isFullScreen()) {
                this.exitFullScreen();
            } else {
                this.enterFullScreen();
            }
        }

        attachEnterFullscreenHandler(): void {
            if (this._attachedFullscreenHandler) {
                return;
            }
            this._attachedFullscreenHandler = true;
            const fullScreenFunction = (): void => {
                if (this._expectingFullScreen) {
                    this._expectingFullScreen = false;
                    this._isFullScreen = true;
                    this.dispatch("enterFullScreen");
                    this.setFullScreenStyle();
                } else {
                    if (this._isFullScreen) {
                        this._isFullScreen = false;
                        this.dispatch("exitFullScreen");
                        this.unsetFullScreenStyle();
                    }
                }
                this.dispatch("resize");
            };
            document.addEventListener("fullscreenchange", fullScreenFunction);
        }
    };
};