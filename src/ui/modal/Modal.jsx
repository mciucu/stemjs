import {ButtonGroup} from "../button/ButtonGroup";
import {Button} from "../button/Button";
import {FloatingWindow} from "./FloatingWindow";
import {ModalStyle} from "./Style";
import {Panel, TemporaryMessageArea} from "../UIPrimitives";
import {UI} from "../UIBase";

class Modal extends UI.Element {
    static styleSet = new ModalStyle();

    getDefaultOptions() {
        return {
            closeButton: true
        };
    }

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    render() {
        return [
            <Panel ref="modalContainer" className={`hidden ${this.getStyleSet().container}`}>
                <Panel ref="behindPanel" className={`${this.getStyleSet().hiddenAnimated} ${this.getStyleSet().background}`} onClick={() => this.hide()}/>
                {this.getModalWindow()}
            </Panel>
        ];
    }

    getModalWindow() {
        let closeButton = null;
        if (this.options.closeButton) {
            // TODO: this should be in a method
            closeButton = <div style={{right: "10px", zIndex: "10", position: "absolute"}}>
                <Button className="close" size={UI.Size.EXTRA_LARGE} style={{border: "none"}} label="&times;" onClick={() => this.hide()}/>
            </div>;
        }

        return <FloatingWindow ref="modalWindow" style={this.getModalWindowStyle()}>
            {closeButton}
            <div style={{margin: "0px", height: "100%", width: "100%"}}>
                {this.getGivenChildren()}
            </div>
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

    hide() {
        this.modalWindow.fadeOut();

        setTimeout(() => {
            this.behindPanel.removeClass(this.getStyleSet().visibleAnimated);
            this.behindPanel.addClass(this.getStyleSet().hiddenAnimated);

            setTimeout(() => {
                this.modalContainer.addClass("hidden");
            }, this.modalWindow.options.transitionTime);
        }, this.modalWindow.options.transitionTime);
        document.body.classList.remove("unscrollable");
    }

    show() {
        if (!this.node) {
            this.mount(document.body);
        }
        this.modalContainer.removeClass("hidden");
        setTimeout(() => {
            this.behindPanel.addClass(this.getStyleSet().visibleAnimated);
            this.behindPanel.removeClass(this.getStyleSet().hiddenAnimated);

            setTimeout(() => {
                this.modalWindow.fadeIn();
            }, this.modalWindow.options.transitionTime);
        }, 0);
        document.body.classList.add("unscrollable");
    }
}


class ErrorModal extends Modal {
    getGivenChildren() {
        return [
            this.getHeader(),
            this.getBody(),
            this.getFooter()
        ];
    }

    getHeader() {
        return [
            <div className={ModalStyle.header}>
                <h4>An Error occurred</h4>
            </div>
        ];
    }

    getBody() {
        return <div className={ModalStyle.body}>{this.options.error.message || this.options.error}</div>;
    }

    getFooter() {
        return <div className={ModalStyle.footer}>
            <Button level={UI.Level.DANGER} label="Dismiss" onClick={() => this.hide()}/>
        </div>;
    }
}


class ActionModal extends Modal {
    getDefaultOptions() {
        return {
            closeButton: false
        };
    }

    getActionName() {
        return this.options.actionName;
    }

    getActionLevel() {
        return this.options.level || UI.Level.DEFAULT;
    }

    getCloseName() {
        return "Close";
    }

    getGivenChildren() {
        return [
            this.getHeader(),
            this.getBody(),
            this.getFooter()
        ];
    }

    getHeader() {
        return [
            <div className={this.getStyleSet().header}>
                <h4 >{this.getTitle()}</h4>
            </div>
        ];
    }

    getTitle() {
        return this.options.title || this.getActionName();
    }

    getBody() {
        let content = this.getBodyContent();
        return content ? <div className={this.getStyleSet().body}>{content}</div> : null;
    }

    getBodyContent() {}

    getFooter() {
        let content = this.getFooterContent();
        return content ? <div className={this.getStyleSet().footer}>{content}</div> : null;
    }

    getActionButton() {
        return <Button level={this.getActionLevel()} label={this.getActionName()} onClick={() => this.action()}/>;
    }

    getFooterContent() {
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


function ActionModalButton(ActionModal) {
    return class ActionModalButton extends Button {
        getModalOptions() {
            let modalOptions = {
                actionName: this.options.label,
                level: this.options.level
            };

            Object.assign(modalOptions, this.options.modalOptions);
            return modalOptions;
        }

        onMount() {
            this.modal = <ActionModal {...this.getModalOptions()}/>;
            this.addClickListener(() => this.modal.show());
        }
    };
}

export {Modal, ErrorModal, ActionModal, ActionModalButton};
