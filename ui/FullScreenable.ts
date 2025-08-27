/*
* Implements a Class Factory, to be able to create element that can be easily set to full screen
*/

import {FullScreenStyle} from "./FullScreenStyle";
import {GlobalStyle} from "./GlobalStyle";

// TODO: is this a good pattern, and should this method live somewhere else?
function callFirstMethodAvailable(obj, methodNames) {
    for (let methodName of methodNames) {
        if (typeof obj[methodName] === "function") {
            obj[methodName]();
            return methodName;
        }
    }
    return null;
}

// TODO: might need a clean-up
// Don't automate this, these names differ slightly (eg. moz has uppercase Screen)
const ENTER_FULL_SCREEN_METHODS = [
    "requestFullscreen",
    "webkitRequestFullscreen",
    "msRequestFullscreen",
    "mozRequestFullScreen",
];

const EXIT_FULL_SCREEN_METHODS = [
    "exitFullscreen",
    "webkitExitFullscreen",
    "msExitFullscreen",
    "mozCancelFullScreen",
];

const FULL_SCREEN_CHANGE_EVENTS = [
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "fullscreenchange",
    "MSFullscreenChange"
];


// TODO: lowercase the s in screen?
// TODO: this should not be directly in UI namespace
export const FullScreenable = function (BaseClass) {
    return class FullScreenable extends BaseClass {
        static fullScreenStyleSheet = FullScreenStyle.getInstance();

        getDefaultOptions() {
            return Object.assign({}, super.getDefaultOptions(), {
                fullContainer: true,
            })
        }

        extraNodeAttributes(attr) {
            super.extraNodeAttributes(attr);
            if (this.options.fullContainer) {
                attr.addClass(GlobalStyle.Utils.fullContainer);
            } else {
                attr.setStyle("height", "100%");
            }
        }

        enterFullScreen() {
            this.attachEnterFullscreenHandler();
            if (!callFirstMethodAvailable(this.node, ENTER_FULL_SCREEN_METHODS)) {
                console.error("No valid full screen function available");
                return ;
            }
            this._expectingFullScreen = true;
        };

        setFullScreenStyle() {
            this.addClass(this.constructor.fullScreenStyleSheet.fullScreen);
            if (this.options.fullContainer) {
                this.removeClass(GlobalStyle.Utils.fullContainer);
                this.setStyle("height", "100%");
            }
        }

        isFullScreen() {
            return this._isFullScreen;
        }

        exitFullScreen() {
            if (!callFirstMethodAvailable(document, EXIT_FULL_SCREEN_METHODS)) {
                console.error("No valid available function to exit fullscreen");
                return ;
            }
        };

        unsetFullScreenStyle() {
            this.removeClass(this.constructor.fullScreenStyleSheet.fullScreen);
            if (this.options.fullContainer) {
                this.addClass(GlobalStyle.Utils.fullContainer);
                this.setStyle("height", null);
            }
        }

        toggleFullScreen() {
            if (this.isFullScreen()) {
                this.exitFullScreen();
            } else {
                this.enterFullScreen();
            }
        };

        attachEnterFullscreenHandler() {
            if (this._attachedFullscreenHandler) {
                return;
            }
            this._attachedFullscreenHandler = true;
            let fullScreenFunction = () => {
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
            for (let eventName of FULL_SCREEN_CHANGE_EVENTS) {
                document.addEventListener(eventName, fullScreenFunction);
            }
        }
    };
};