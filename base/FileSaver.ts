// The FileSaver class is mean to be able to create a Save as... file dialog from text/bytes
// TODO: this file is work in progress
import {Dispatchable} from "./Dispatcher";
import {isSafari, UNICODE_BOM_CHARACTER} from "./Utils";

interface FileSaverOptions {
    autoBom?: boolean;
}

interface BlobOptions {
    type?: string;
}

function AddAutoBom(blob: Blob): Blob {
    // Add the unicode boom if not present
    if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
        return new Blob([String.fromCharCode(UNICODE_BOM_CHARACTER), blob], {type: blob.type});
    }
    return blob;
}

export class FileSaver extends Dispatchable {
    blob: Blob;
    fileName: string;
    options: FileSaverOptions;
    saveLink: HTMLAnchorElement;
    readyState: number;

    static readonly INIT = 0;
    static readonly WRITING = 1;
    static readonly DONE = 2;

    constructor(blob: Blob, fileName: string, options: FileSaverOptions = {}) {
        super();
        this.blob = blob;
        this.fileName = fileName;
        this.options = options;

        if (this.options.autoBom) {
            this.blob = AddAutoBom(this.blob);
        }

        // TODO: these should be static
        this.saveLink = document.createElement("a");
        const canUseSaveLink = "download" in this.saveLink;
		const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);

        const force = blob.type === "application/octet-stream";
        let objectUrl: string | undefined;

        this.readyState = FileSaver.INIT;
        if (canUseSaveLink) {
            objectUrl = window.URL.createObjectURL(blob);
            setTimeout(() => {
                this.saveLink.href = objectUrl!;
                this.saveLink.download = this.fileName;
                this.click();
                this.revoke(objectUrl!);
                this.readyState = FileSaver.DONE;
            }, 0);
            return;
        }

        if ((isChromeIOS || (force && isSafari())) && window.FileReader) {
            // Safari doesn't allow downloading of blob urls
            let reader = new FileReader();
            reader.onloadend = () => {
                let url = isChromeIOS ? reader.result as string : (reader.result as string).replace(/^data:[^;]*;/, 'data:attachment/file;');
                let popup = window.open(url, '_blank');
                if (!popup) {
                    window.location.href = url;
                }
                url = undefined as any; // release reference before dispatching
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

    static saveAs(blob: Blob | string | any[], fileName: string, blobOptions: BlobOptions = {type: "text/plain;charset=utf-8"}): FileSaver {
        if (!(blob instanceof Blob)) {
            let value = blob;
            if (!Array.isArray(value)) {
                value = [value];
            }
            blob = new Blob(value, blobOptions);
        }
        return new FileSaver(blob, fileName);
    }

    click(): void {
        let clickEvent = new MouseEvent("click");
        this.saveLink.dispatchEvent(clickEvent);
    }

    revoke(file: string | File): void {
        setTimeout(() => {
            if (typeof file === "string") {
                window.URL.revokeObjectURL(file);
            } else {
                (file as any).remove();
            }
        }, 1000 * 40);
    }
}
