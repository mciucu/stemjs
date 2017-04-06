/*
* Implements a Class Factory, to be able to create element that can be easily set to full screen
*/

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
let FullScreenable = function (BaseClass) {
    return class FullScreenable extends BaseClass {
        extraNodeAttributes(attr) {
            super.extraNodeAttributes(attr);
            attr.setStyle({
                backgroundColor: "#FFFFFF",
                width: "100%",
                padding: "10px",
                height: "100%",
            });
        }

        enterFullScreen() {
            this.attachEnterFullscreenHandler();
            if (!callFirstMethodAvailable(this.node, ENTER_FULL_SCREEN_METHODS)) {
                console.error("No valid full screen function available");
                return ;
            }
            this._expectingFullScreen = true;
        };

        isFullScreen() {
            return this._isFullScreen;
        }

        exitFullScreen() {
            if (!callFirstMethodAvailable(document, EXIT_FULL_SCREEN_METHODS)) {
                console.error("No valid available function to exit fullscreen");
                return ;
            }
        };

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
                } else {
                    if (this._isFullScreen) {
                        this._isFullScreen = false;
                        this.dispatch("exitFullScreen");
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

export {FullScreenable};
