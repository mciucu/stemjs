import {ButtonGroup} from "../button/ButtonGroup";
import {Button} from "../button/Button";
import {FloatingWindow} from "./FloatingWindow";
import {ModalStyle} from "./Style";
import {Panel, TemporaryMessageArea} from "../UIPrimitives";
import {UI} from "../UIBase";
import {Dispatcher} from "../../base/Dispatcher";
import {registerStyle} from "../style/Theme";
import {Level, Size} from "../Constants";

@registerStyle(ModalStyle)
class Modal extends UI.Element {
    getDefaultOptions() {
        return {
            closeButton: true,
            destroyOnHide: true,
            visible: false,
        };
    }

    getChildrenToRender() {
        return [
            <Panel ref="modalContainer" className={(this.options.visible ? "" : "hidden") + this.styleSheet.container}>
                <Panel ref="behindPanel" className={this.styleSheet.hiddenAnimated + this.styleSheet.background} onClick={() => this.hide()}/>
                {this.getModalWindow()}
            </Panel>
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

    getModalWindowStyle() {
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
                this.modalContainer.addClass("hidden");
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
        this.modalContainer.removeClass("hidden");
        setTimeout(() => {
            this.behindPanel.addClass(this.styleSheet.visibleAnimated);
            this.behindPanel.removeClass(this.styleSheet.hiddenAnimated);

            setTimeout(() => {
                this.modalWindow.fadeIn();
            }, this.modalWindow.options.transitionTime);
        }, 0);
        this.closeListenerHandler = this.attachListener(Dispatcher.Global, "closeAllModals", () => {
            this.hide();
        });
        document.body.classList.add("unscrollable");
    }

    static show(options={}) {
        let modal = new this(options);
        modal.show();
        return modal;
    }
}


class ActionModal extends Modal {
    getDefaultOptions() {
        return Object.assign(super.getDefaultOptions(), {
            closeButton: false
        });
    }

    getActionName() {
        return this.options.actionName;
    }

    getActionLevel() {
        return this.options.level || Level.DEFAULT;
    }

    getCloseName() {
        return this.options.closeName || "Close";
    }

    render() {
        return [
            <div className={this.styleSheet.header}>{this.getHeader()}</div>,
            (this.getBody() ? <div className={this.styleSheet.body}>{this.getBody()}</div> : null),
            (this.getFooter() ? <div className={this.styleSheet.footer}>{this.getFooter()}</div> : null)
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

    getActionButton() {
        return <Button level={this.getActionLevel()} label={this.getActionName()} onClick={() => this.action()}/>;
    }

    getFooter() {
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


const ActionModalButton = (ActionModal) => class ActionModalButton extends Button {
    getModalOptions() {
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


class ErrorModal extends ActionModal {
    getTitle() {
        return "An Error occurred";
    }

    getBody() {
        return this.options.error.message || this.options.error;
    }

    getFooter() {
        return <Button level={Level.DANGER} label="Dismiss" onClick={() => this.hide()}/>;
    }
}

export {Modal, ErrorModal, ActionModal, ActionModalButton};
