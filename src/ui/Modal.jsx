// TODO: need to redo with a StyleSheet
import {UI} from "./UIBase";
import {Panel, TemporaryMessageArea} from "./UIPrimitives";

class FloatingWindow extends UI.Element {
    getDefaultOptions() {
        return {
            transitionTime: 0
        };
    }

    setOptions(options) {
        options = Object.assign(this.getDefaultOptions(), options);
        super.setOptions(options);
    }

    render() {
        return [this.options.children, this.getStyleElement()];
    }

    getStyleElement() {
        let hiddenStyleAttributes = {
            "visibility": "hidden",
            "opacity": "0",
            "transition": (
                "visibility 0s " +
                this.options.transitionTime / 1000 + "s,opacity " +
                this.options.transitionTime / 1000 + "s linear"
            ),
        };

        let visibleStyleAttributes = {
            "visibility": "visible",
            "opacity": "1",
            "transition": (
                "opacity " +
                this.options.transitionTime / 1000  + "s linear"
            ),
        };

        return <UI.StyleElement>
            <UI.StyleInstance selector=".hidden-animated" attributes={hiddenStyleAttributes} />
            <UI.StyleInstance selector=".visible-animated" attributes={visibleStyleAttributes} />
        </UI.StyleElement>;
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        attr.setStyle("z-index", "2016");
        return attr;
    }

    fadeOut() {
        this.removeClass("visible-animated");
        this.addClass("hidden-animated");
    }

    fadeIn() {
        this.removeClass("hidden-animated");
        this.addClass("visible-animated");
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
        if (!this.notVisible) {
            this.bindWindowListeners();
        }
        this.addClickListener((event) => {
            event.stopPropagation();
        });
    }
}

class Modal extends UI.Element {
    getDefaultOptions() {
        return {
            closeButton: true
        };
    }

    render() {
        return [
            <Panel ref="modalContainer" className="hidden" style={this.getContainerStyle()}>
                {this.getBehindPanel()}
                {this.getModalWindow()}
            </Panel>
        ];
    }

    getContainerStyle() {
        return {
            position: "fixed",
            top: "0px",
            left: "0px",
            right: "0px",
            bottom: "0px",
            width: "100%",
            height: "100%",
            zIndex: "9999",
        };
    }

    getBehindPanel() {
        return <Panel ref="behindPanel" className="hidden-animated" style={this.getBehindPanelStyle()}/>;
    }

    getBehindPanelStyle() {
        return {
            position: "fixed",
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
        };
    }

    getModalWindow() {
        let closeButton = null;
        if (this.options.closeButton) {
            // TODO: this should be in a method
            closeButton = <div style={{position: "absolute", right: "10px", zIndex: "10"}}>
                <UI.Button className="close" size={UI.Size.EXTRA_LARGE}
                           label="&times;" onClick={() => this.hide()}/>
            </div>;
        }

        return <FloatingWindow ref="modalWindow" style={this.getModalWindowStyle()}>
            {closeButton}
            <div className="modal-dialog" style={{margin: "0px", height: "100%", width: "100%"}}>
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
        }
    }

    hide() {
        this.modalWindow.fadeOut();

        setTimeout(() => {
            this.behindPanel.removeClass("visible-animated");
            this.behindPanel.addClass("hidden-animated");

            setTimeout(() => {
                this.modalContainer.addClass("hidden");
            }, this.modalWindow.options.transitionTime);
        }, this.modalWindow.options.transitionTime);
    }

    show() {
        if (!this.node) {
            this.mount(document.body);
        }
        this.modalContainer.removeClass("hidden");
        setTimeout(() => {
            this.behindPanel.addClass("visible-animated");
            this.behindPanel.removeClass("hidden-animated");

            setTimeout(() => {
                this.modalWindow.fadeIn();
            }, this.modalWindow.options.transitionTime);
        }, 0);
    }

    onMount() {
        super.onMount();
        this.behindPanel.addClickListener(() => {
            this.hide();
        })
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
            <div className="modal-header">
                <h4 className="modal-title">An Error occurred</h4>
            </div>
        ];
    }

    getBody() {
        return <div className="modal-body">{this.options.error.message || this.options.error}</div>;
    }

    getFooter() {
        return <div className="modal-footer">
            <UI.Button level={UI.Level.DANGER} label="Dismiss" onClick={() => this.hide()}/>
        </div>;
    }
}

class ActionModal extends Modal {
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
            <div className="modal-header">
                <h4 className="modal-title">{this.getTitle()}</h4>
            </div>
        ];
    }

    getTitle() {
        return this.options.title || this.getActionName();
    }

    getBody() {
        let content = this.getBodyContent();
        return content ? <div className="modal-body">{content}</div> : null;
    }

    getBodyContent() {}

    getFooter() {
        let content = this.getFooterContent();
        return content ? <div className="modal-footer">{content}</div> : null;
    }

    getActionButton() {
        return <UI.Button level={this.getActionLevel()} label={this.getActionName()} onClick={() => this.action()}/>;
    }

    getFooterContent() {
        return [
            <TemporaryMessageArea ref="messageArea"/>,
            <UI.Button label={this.getCloseName()} onClick={() => this.hide()}/>,
            this.getActionButton(),
        ];
    }

    action() {}
}

function ActionModalButton(ActionModal) {
    return class ActionModalButton extends UI.Button {
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

export {FloatingWindow, VolatileFloatingWindow, Modal, ErrorModal, ActionModal, ActionModalButton};
