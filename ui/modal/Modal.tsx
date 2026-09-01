import {ButtonGroup} from "../button/ButtonGroup";
import {Button, type ButtonOptions} from "../button/Button";
import {FloatingWindow} from "./FloatingWindow";
import {ModalStyle} from "./Style";
import {UI, UIElement, type StyleObject, type UIChild, type UIElementOptions, type BaseUIElement} from "../UIBase";
import {Dispatcher, type RemoveHandle} from "../../base/Dispatcher";
import {registerStyle} from "../style/Theme";
import {Level, type LevelType, Size} from "../Constants";
import {TemporaryMessageArea} from "../misc/TemporaryMessageArea";
import {NodeAttributes} from "../NodeAttributes";
import {isString} from "../../base/Utils";


export interface ModalOptions extends UIElementOptions {
    closeButton?: boolean;
    destroyOnHide?: boolean;
    visible?: boolean;
    fillScreen?: boolean;
    display?: string;
    maxHeight?: string;
    width?: string;
    height?: string;
    overflow?: string;
}

@registerStyle(ModalStyle)
export class Modal<ExtraOptions extends ModalOptions = ModalOptions> extends UI.Element<ExtraOptions> {
    declare behindPanel?: UIElement;
    declare modalWindow?: FloatingWindow;
    declare closeListenerHandler?: RemoveHandle;

    getDefaultOptions(): Partial<ModalOptions> {
        return {
            closeButton: true,
            destroyOnHide: true,
            visible: false,
        };
    }

    extraNodeAttributes(attr: NodeAttributes) {
        if (!this.options.visible) {
            attr.addClass("hidden");
        }
    }

    getChildrenToRender() {
        return [
            <UIElement
                ref="behindPanel"
                className={this.styleSheet.hiddenAnimated + this.styleSheet.background}
                onClick={() => this.hide()}
            />,
            this.getModalWindow(),
        ];
    }

    getModalWindow() {
        let closeButton = null;
        if (this.options.closeButton) {
            // TODO: this should be in a method
            closeButton = <div style={{right: "10px", zIndex: "10", position: "absolute"}}>
                <Button className="close" size={Size.EXTRA_LARGE} style={{border: "none"}} label="&times;" onClick={() => this.hide()}/>
            </div>;
        }

        return <FloatingWindow ref="modalWindow" style={this.getModalWindowStyle()}>
            {closeButton}
            {this.render()}
        </FloatingWindow>;
    }

    getModalWindowStyle(): StyleObject {
        if (this.options.fillScreen) {
            this.options.width = "85%";
        }
        // TODO(@Rocky): I don't like this very much, honestly...
        return {
            position: "relative",
            padding: "1%",
            boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
            borderRadius: "10px",
            margin: "60px auto",
            display: this.options.display || "block",
            maxHeight: this.options.maxHeight || "85%",
            left: "0",
            right: "0",
            width: this.options.width || "50%",
            height: this.options.height || "auto",
            background: "white",
            overflow: this.options.overflow || "auto",
        };
    }

    isVisible() {
        return this.options.visible;
    }

    hide() {
        if (!this.isVisible()) {
            return;
        }

        this.options.visible = false;
        this.modalWindow.fadeOut();

        setTimeout(() => {
            this.behindPanel.removeClass(this.styleSheet.visibleAnimated);
            this.behindPanel.addClass(this.styleSheet.hiddenAnimated);

            setTimeout(() => {
                this.addClass("hidden");
                if (this.options.destroyOnHide) {
                    this.destroyNode();
                }
            }, this.modalWindow.options.transitionTime || 0);

            this.detachListener(this.closeListenerHandler);
        }, this.modalWindow.options.transitionTime || 0);
        document.body.classList.remove("unscrollable");
    }

    show() {
        this.options.visible = true;
        if (!this.node) {
            this.mount(document.body);
        }
        this.removeClass("hidden");
        setTimeout(() => {
            this.behindPanel.addClass(this.styleSheet.visibleAnimated);
            this.behindPanel.removeClass(this.styleSheet.hiddenAnimated);

            setTimeout(() => {
                this.modalWindow.fadeIn();
            }, this.modalWindow.options.transitionTime);
        }, 0);
        this.closeListenerHandler = this.attachListener(Dispatcher.Global, "closeAllModals", () => {
            this.hide();
        }) as RemoveHandle;
        document.body.classList.add("unscrollable");
    }

    static show(options={}) {
        let modal = new this(options);
        modal.show();
        return modal;
    }
}


export interface ActionModalOptions extends ModalOptions {
    closeName?: UIChild;
    actionName?: UIChild;
    level?: LevelType;
    title?: UIChild;
}

export class ActionModal<ExtraOptions extends ActionModalOptions = ActionModalOptions> extends Modal<ExtraOptions> {
    declare actionButton?: Button;
    declare messageArea?: TemporaryMessageArea;

    getDefaultOptions(): Partial<ActionModalOptions> {
        return {
            ...super.getDefaultOptions(),
            closeButton: false,
            closeName: "Cancel",
            actionName: "Default Action"
        };
    }

    getActionName() {
        return this.options.actionName;
    }

    getActionLevel() {
        return this.options.level;
    }

    getCloseName() {
        return this.options.closeName;
    }

    render() {
        const {styleSheet} = this;
        const headerContent = this.getHeader(); // TODO need a rewrite/rename
        const bodyContent = this.getBody();
        const footerContent = this.getFooter();

        return [
            <div className={styleSheet.header}>
                {headerContent}
            </div>,
            bodyContent && <div className={styleSheet.body}>
                {bodyContent}
            </div>,
            footerContent && <div className={styleSheet.footer}>
                {footerContent}
            </div>,
        ];
    }

    getHeader() {
        return <h4>{this.getTitle()}</h4>;
    }

    getTitle() {
        return this.options.title || this.getActionName();
    }

    getBody() {
        return null;
    }

    // If the main action is allowed
    isValid() {
        return true;
    }

    updateActionButtonEnabled() {
        this.actionButton.updateOptions({
            disabled: this.isValid(),
        });
    }

    getActionButton() {
        return <Button
            ref="actionButton"
            level={this.getActionLevel()}
            label={this.getActionName()}
            disabled={!this.isValid()}
            onClick={() => this.action()}
        />;
    }

    getFooter(): UIChild {
        return [
            <TemporaryMessageArea ref="messageArea"/>,
            <ButtonGroup>
                <Button label={this.getCloseName()} onClick={() => this.hide()}/>
                {this.getActionButton()}
            </ButtonGroup>
        ];
    }

    action() {}
}


// modalOptions is whatever the modal being wrapped accepts, not merely what every ActionModal accepts
type ActionModalClass = (new (...args: any[]) => UIElement<any, any, any, any>) & {show(options?: any): any};

export const ActionModalButton = <T extends ActionModalClass>(ActionModal: T) =>
    class ActionModalButton extends Button<ButtonOptions & {modalOptions?: NonNullable<InstanceType<T>["options"]>}> {
    // The options the modal is shown with: what the button carries, plus whatever an override adds
    getModalOptions(): Record<string, any> {
        let modalOptions = {
            actionName: this.options.label,
            level: this.options.level
        };

        Object.assign(modalOptions, this.options.modalOptions);
        return modalOptions;
    }

    onMount() {
        this.addClickListener(() => {
            ActionModal.show(this.getModalOptions());
        });
    }
};


interface ConfirmModalOptions extends ActionModalOptions {
    // Narrower than the base, since it also stands in for the action name
    title?: string;
    message?: UIChild;
    confirmText?: string;
    cancelText?: string;
}

export class ConfirmModal extends ActionModal<ConfirmModalOptions> {
    declare resolvePromise: (value: boolean) => void;
    declare resolved?: boolean;

    getTitle() {
        return this.options.title || "Confirm";
    }

    getBody() {
        return this.options.message || "Are you sure?";
    }

    getActionName() {
        return this.options.confirmText || this.options.title || "Confirm";
    }

    getCloseName() {
        return this.options.cancelText || "Cancel";
    }

    getActionLevel() {
        return this.options.level || Level.PRIMARY;
    }

    action() {
        this.resolvePromise(true);
        this.hide();
    }

    hide() {
        if (!this.resolved) {
            this.resolvePromise(false);
        }
        super.hide();
    }

    static async prompt<T = any>(options): Promise<T> {
        return new Promise<T>((resolve) => {
            const modal = new this({...options, destroyOnHide: true});
            modal.resolvePromise = (value) => {
                modal.resolved = true;
                resolve(value as any);
            };
            modal.show();
        });
    }
}


interface ErrorModalOptions extends ActionModalOptions {
    error?: {message?: string} | string;
}

export class ErrorModal extends ActionModal<ErrorModalOptions> {
    getTitle() {
        return "An Error occurred";
    }

    getBody() {
        const {error} = this.options;
        return (isString(error) ? error : error?.message) || error;
    }

    getFooter() {
        return <Button level={Level.DANGER} label="Dismiss" onClick={() => this.hide()}/>;
    }
}
