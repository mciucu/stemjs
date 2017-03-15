// The FileSaver class is mean to be able to create a Save as... file dialog from text/bytes
// TODO: this file is work in progress
import {Dispatchable} from "Dispatcher";

let autoBom = function (blob) {
    // Add the unicode boom if not present
    if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
        return new Blob([String.fromCharCode(0xFEFF), blob], {type: blob.type});
    }
    return blob;
};

class FileSaver extends Dispatchable {
    constructor(blob, fileName, options={}) {
        super();
        this.blob = blob;
        this.fileName = fileName;
        this.options = options;

        if (this.options.autoBom) {
            this.blob = autoBom(this.blob);
        }

        // TODO: these should be static
        this.saveLink = document.createElement("a");
        let canUseSaveLink = "download" in this.saveLink;
        let is_safari = /constructor/i.test(window.HTMLElement) || window.safari;
		let is_chrome_ios =/CriOS\/[\d]+/.test(navigator.userAgent);

        let force = blob.type === "application/octet-stream";
        let objectUrl;

        this.readyState = FileSaver.INIT;
        if (canUseSaveLink) {
            objectUrl = window.URL.createObjectURL(blob);
            setTimeout(() => {
                this.saveLink.href = objectUrl;
                this.saveLink.download = this.fileName;
                this.click();
                this.revoke(objectUrl);
                this.readyState = FileSaver.DONE;
            }, 0);
            return;
        }

        if ((is_chrome_ios || (force && is_safari)) && window.FileReader) {
            // Safari doesn't allow downloading of blob urls
            let reader = new FileReader();
            reader.onloadend = () => {
                let url = is_chrome_ios ? reader.result : reader.result.replace(/^data:[^;]*;/, 'data:attachment/file;');
                let popup = window.open(url, '_blank');
                if (!popup) {
                    window.location.href = url;
                }
                url = void 0; // release reference before dispatching
                this.readyState = FileSaver.DONE;
            };
            reader.readAsDataURL(blob);
            this.readyState = FileSaver.INIT;
            return;
        }

        if (!objectUrl) {
            objectUrl = window.URL.createObjectURL(blob);
        }
        if (force) {
            window.location.href = objectUrl;
        } else {
            let opened = window.open(objectUrl, "_blank");
            if (!opened) {
                // Apple does not allow window.open, see https://developer.apple.com/library/safari/documentation/Tools/Conceptual/SafariExtensionGuide/WorkingwithWindowsandTabs/WorkingwithWindowsandTabs.html
                window.location.href = objectUrl;
            }
        }
        this.readyState = FileSaver.DONE;
        this.revoke(objectUrl);
    }

    static saveAs(blob, fileName, blobOptions={type:"text/plain;charset=utf-8"}) {
        if (!(blob instanceof Blob)) {
            let value = blob;
            if (!Array.isArray(value)) {
                value = [value];
            }
            blob = new Blob(value, blobOptions);
        }
        let fileSaver = new FileSaver(blob, fileName);

        return fileSaver;
    }

    click() {
        let clickEvent = new MouseEvent("click");
        this.saveLink.dispatchEvent(clickEvent);
    }

    revoke(file) {
        setTimeout(() => {
            if (typeof file === "string") {
                window.URL.revokeObjectURL(file);
            } else {
                file.remove();
            }
        }, 1000 * 40);
    }
}
FileSaver.readyState = FileSaver.INIT = 0;
FileSaver.WRITING = 1;
FileSaver.DONE = 2;

if (typeof navigator !== "undefined" && navigator.msSaveOrOpenBlob) {
    FileSaver.saveAs = function(blob, name, no_auto_bom) {
        name = name || blob.name || "download";

        if (!no_auto_bom) {
            blob = autoBom(blob);
        }
        return navigator.msSaveOrOpenBlob(blob, name);
    };
}

export {FileSaver};
