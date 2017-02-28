// TODO: need to redo with a StyleSheet
import {StyleSet} from "./Style";
import {styleRule} from "../decorators/Style";
import {UI} from "./UIBase";
import {Panel, TemporaryMessageArea} from "./UIPrimitives";
import {Button} from "./Bootstrap3";

class FloatingWindowStyle extends StyleSet {
    @styleRule
    hiddenAnimated = {
        visibility: "hidden",
        opacity: "0",
        transition: "opacity 0.1s linear",
    };

    @styleRule
    visibleAnimated = {
        visibility: "visible",
        opacity: "1",
        transition: "opacity 0.1s linear",
    };
}

class FloatingWindow extends UI.Element {
    static styleSet = FloatingWindowStyle.getInstance();

    getDefaultOptions() {
        return {
            transitionTime: 0
        };
    }

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle("z-index", "2016");
    }

    fadeOut() {
        this.removeClass(this.getStyleSet().visibleAnimated);
        this.addClass(this.getStyleSet().hiddenAnimated);
    }

    fadeIn() {
        this.removeClass(this.getStyleSet().hiddenAnimated);
        this.addClass(this.getStyleSet().visibleAnimated);
    }

    show() {
        // TODO: refactor this to use this.parent and UI.Element appendChild
        if (!this.isInDocument()) {
            this.parentNode.appendChild(this.node);
            this.redraw();
            setTimeout(() => {
                this.fadeIn();
            }, 0);
        }
    }

    setParentNode(parentNode) {
        this.options.parentNode = parentNode;
    }

    get parentNode() {
        if (!this.options.parentNode) {
            if (this.parent) {
                if (this.parent instanceof HTMLElement) {
                    this.options.parentNode = this.parent;
                } else {
                    this.options.parentNode = this.parent.node;
                }
            } else {
                this.options.parentNode = document.body;
            }
        }
        return this.options.parentNode;
    }

    hide() {
        // TODO: refactor this to use this.parent and UI.Element removeChild
        if (this.isInDocument()) {
            this.fadeOut();
            setTimeout(() => {
                if (this.isInDocument()) {
                    this.parentNode.removeChild(this.node);
                }
            }, this.options.transitionTime);
        }
    }
}

class VolatileFloatingWindow extends FloatingWindow {
    bindWindowListeners() {
        this.hideListener = this.hideListener || (() => {this.hide();});
        window.addEventListener("click", this.hideListener);
    }

    unbindWindowListeners() {
        window.removeEventListener("click", this.hideListener);
    }

    toggle() {
        if (!this.isInDocument()) {
            this.show();
        } else {
            this.hide();
        }
    }

    show() {
        if (!this.isInDocument()) {
            this.bindWindowListeners();
            super.show();
        }
    }

    hide() {
        if (this.isInDocument()) {
            this.unbindWindowListeners();
            super.hide();
        }
    }

    onMount() {
        if (!this.options.notVisible) {
            this.bindWindowListeners();
        } else {
            setTimeout(() => {
                this.hide();
            });
        }

        this.addClickListener((event) => {
            event.stopPropagation();
        });
    }
}

class ModalStyle extends FloatingWindowStyle {
    @styleRule
    container = {
        position: "fixed",
        top: "0px",
        left: "0px",
        right: "0px",
        bottom: "0px",
        width: "100%",
        height: "100%",
        zIndex: "9999",
    };

    @styleRule
    background = {
        position: "fixed",
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.5)",
    };

    @styleRule
    header = {
        padding: "15px",
        borderBottom: "1px solid #e5e5e5",
    };

    @styleRule
    body = {
        position: "relative",
        padding: "15px",
    };

    @styleRule
    footer = {
        padding: "15px",
        textAlign: "right",
        borderTop: "1px solid #e5e5e5",
    };
}

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
            <UI.ButtonGroup>
                <Button label={this.getCloseName()} onClick={() => this.hide()}/>
                  {this.getActionButton()}
            </UI.ButtonGroup>
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

export {FloatingWindowStyle, FloatingWindow, VolatileFloatingWindow, ModalStyle, Modal, ErrorModal, ActionModal, ActionModalButton};
