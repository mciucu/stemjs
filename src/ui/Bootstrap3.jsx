import {UI} from "./UIBase";
import "./UIPrimitives";

function BootstrapMixin(BaseClass, bootstrapClassName) {
    class BootstrapClass extends BaseClass {
        setOptions(options) {
            super.setOptions(options);
            this.options.level = this.options.level || UI.Level.DEFAULT;
        }

        getDOMAttributes() {
            let attr = super.getDOMAttributes();

            attr.addClass(this.constructor.bootstrapClass());
            if (this.getLevel()) {
                attr.addClass(this.constructor.bootstrapClass() + "-" + this.getLevel());
            }
            return attr;
        }

        getLevel() {
            return this.options.level || "";
        }

        setLevel(level) {
            this.options.level = level;
            this.applyDOMAttributes();
        }

        static bootstrapClass() {
            return bootstrapClassName;
        }
    }

    return BootstrapClass;
}

UI.Button = class Button extends BootstrapMixin(UI.Element, "btn") {
    getDOMAttributes() {
        let attr = super.getDOMAttributes();

        if (this.getSize()) {
            attr.addClass(this.constructor.bootstrapClass() + "-" + this.getSize());
        }

        return attr;
    }

    setOptions(options) {
        super.setOptions(options);
        this.options.label = options.label || "";
    }

    getPrimitiveTag() {
        return "button";
    }

    renderHTML() {
        // TODO: Label was converted to string. Fix it.
        return [this.beforeChildren(), this.options.label, this.options.children];
    };

    getLabel() {
        return this.options.label;
    }

    setLabel(label) {
        this.options.label = label;
        this.redraw();
    }

    getSize() {
        return this.options.size || "";
    }

    setSize(size) {
        this.options.size = size;
        this.redraw();
    }

    //TODO: this should live in a base iconable class, of which you'd only use this.beforeChildren
    getFaIcon() {
        return this.options.faIcon;
    }
    setFaIcon(value) {
        this.options.faIcon = value;
        this.redraw();
    }

    disable() {
        this.node.disabled = true;
    }

    enable() {
        this.node.disabled = false;
    }

    setEnabled(enabled) {
        this.node.disabled = !enabled;
    };

    beforeChildren() {
        if (!this.options.faIcon) {
            return null;
        }
        let iconOptions = {
            className: "fa fa-" + this.options.faIcon,
        };
        if (this.options.label) {
            iconOptions.style = {
                paddingRight: "5px",
            }
        }

        return <span {...iconOptions} />;
    }
};

UI.StateButton = class StateButton extends UI.Button {
    setOptions(options) {
        options.state = (this.options && this.options.state) || options.state || UI.ActionStatus.DEFAULT;

        super.setOptions(options);

        this.options.statusOptions = this.options.statusOptions || [];
        for (let i = 0; i < 4; i += 1) {
            if (typeof this.options.statusOptions[i] === "string") {
                let statusLabel = this.options.statusOptions[i];
                this.options.statusOptions[i] = {
                    label: statusLabel,
                    faIcon: ""
                }
            }
        }
    }

    setState(status) {
        this.options.state = status;
        if (status === UI.ActionStatus.DEFAULT) {
            this.enable();
        } else if (status === UI.ActionStatus.RUNNING) {
            this.disable();
        } else if (status === UI.ActionStatus.SUCCESS) {
        } else if (status === UI.ActionStatus.FAILED) {
        }

        this.redraw();
    }

    renderHTML() {
        let stateOptions = this.options.statusOptions[this.options.state - 1];

        this.options.label = stateOptions.label;
        this.options.faIcon = stateOptions.faIcon;

        return super.renderHTML();
    }
};

UI.AjaxButton = class AjaxButton extends UI.StateButton {
    ajaxCall(data) {
        this.setState(UI.ActionStatus.RUNNING);
        $.ajax({
            url: data.url,
            type: data.type,
            dataType: data.dataType,
            data: data.data,
            success: (successData) => {
                data.success(successData);
                if (successData.error) {
                    this.setState(UI.ActionStatus.FAILED);
                } else {
                    this.setState(UI.ActionStatus.SUCCESS);
                }
            },
            error: (xhr, errmsg, err) => {
                data.error(xhr, errmsg, err);
                this.setState(UI.ActionStatus.FAILED);
            },
            complete: () => {
                setTimeout(() => {
                    this.setState(UI.ActionStatus.DEFAULT);
                }, this.options.onCompete || 1000);
            }
        });
    }
};

UI.RadioButtonGroup = class RadioButtonGroup extends BootstrapMixin(UI.Element, "btn-group") {
    renderHTML() {
        this.buttons = [];
        for (let i = 0; i < this.options.givenOptions.length; i += 1) {
            let handler = () => {
                this.setIndex(i);
            };
            this.buttons.push(<UI.Button key={i} onClick={handler} label={this.options.givenOptions[i].toString()} level={this.options.buttonsLevel}/>);
        }
        return this.buttons;
    }

    getIndex() {
        return this.index;
    }

    getValue() {
        return this.options.givenOptions[this.index];
    }

    setIndex(index) {
        this.index = index;
        this.dispatch("setIndex", {value: this.options.givenOptions[index]});
    }
};

UI.BootstrapLabel = class BootstrapLabel extends BootstrapMixin(UI.Element, "label") {
    getPrimitiveTag() {
        return "span";
    }

    getDOMAttributes() {
        let attr = super.getDOMAttributes();
        if (this.options.faIcon) {
            attr.addClass("fa fa-" + this.options.faIcon);
        }
        return attr;
    }

    setLabel(label) {
        this.options.label = label;
        this.redraw();
    }

    renderHTML() {
        return [this.options.label];
    }
};

UI.CardPanel = class CardPanel extends BootstrapMixin(UI.Element, "panel") {
    setOptions(options) {
        super.setOptions(options);
        this.options.level = this.options.level || UI.Level.DEFAULT;
    }

    renderHTML() {
        return [
            <div className="panel-heading">{this.getTitle()}</div>,
            <div className="panel-body" style={this.options.bodyStyle}>{this.getGivenChildren()}</div>,
        ];
    }
};

//TODO: remove all bootstrap logic
UI.CollapsiblePanel = class CollapsiblePanel extends UI.CardPanel {
    constructor(options) {
        super(options);

        // If options.collapsed is set, use that value. otherwise it is collapsed
        this.collapsed = (options.collapsed != null) ? options.collapsed : true;
    }

    onMount() {
        this.expandLink.addClickListener(() => {
            if (this.collapsed) {
                this.collapsed = false;
            } else {
                this.collapsed = true;
            }
        });
    }

    renderHTML() {
        let bodyId = "body" + this.uniqueId();
        let collapsedHeaderClass = "";
        let collapsedBodyClass = " in";
        let autoHeightClass = "";
        if (this.options.autoHeight) {
            autoHeightClass = "auto-height ";
        }
        if (this.collapsed) {
            collapsedHeaderClass = " collapsed";
            collapsedBodyClass = "";
        }

        return [
            <div className="panel-heading" role="tab">
                <h4 className="panel-title">
                    <a ref="expandLink" data-toggle="collapse" href={"#" + bodyId}  className={"panelCollapseButton" + collapsedHeaderClass}
                        aria-expanded="true" aria-controls={bodyId} >
                        {this.getTitle()}
                    </a>
                </h4>
            </div>,
            <div ref="contentArea" id={bodyId} className={autoHeightClass + "panel-collapse collapse" + collapsedBodyClass}
                 role="tabpanel" aria-expanded="false">
                {this.getGivenChildren()}
            </div>
        ];
    }
};

UI.DelayedCollapsiblePanel = class DelayedCollapsiblePanel extends UI.CollapsiblePanel {
    onMount() {
        this.expandLink.addClickListener(() => {
            if (!this._haveExpanded) {
                this._haveExpanded = true;
                UI.renderingStack.push(this);
                this.contentArea.options.children = this.getGivenChildren();
                UI.renderingStack.pop();
                this.contentArea.redraw();
                this.delayedMount();
            }
        });
    }

    getGivenChildren() {
        if (!this._haveExpanded) {
            return [];
        }
        return this.getDelayedChildren();
    }
};

UI.ProgressBar = class ProgressBar extends BootstrapMixin(UI.Element, "progress") {
    renderHTML() {
        let valueInPercent = (this.options.value || 0) * 100;

        let barOptions = {
            className: "progress-bar",
            role: "progressbar",
            "aria-valuenow": valueInPercent,
            "aria-valuemin": 0,
            "aria-valuemax": 100,
            style: {
                addingBottom: 5,
                width: valueInPercent + "%",
                height: this.options.height + "px",
            },
        };

        if (this.options.disableTransition) {
            Object.assign(barOptions.style, {
                transition: "none",
                "-webkit-transition": "none"
            });
        }

        if (this.options.level) {
            barOptions.className += " progress-bar-" + this.options.level;
        }
        if (this.options.striped) {
            barOptions.className += " progress-bar-striped";
        }
        if (this.options.active) {
            barOptions.className += " active";
        }
        if (this.options.color) {
            barOptions.style.backgroundColor = this.options.color;
        }

        return <div {...barOptions}>
            <span className="progress-span">{this.options.label}</span>
        </div>;
    }

    set(value) {
        if (value < 0)
            value = 0;
        else if (value > 1)
            value = 1;
        this.options.value = value;
        this.redraw();
    }
};

UI.BootstrapMixin = BootstrapMixin;

export {BootstrapMixin};
