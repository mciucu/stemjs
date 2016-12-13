import {UI} from "./UIBase";
import {StyleSet} from "Style";
import "./UIPrimitives";

function BootstrapMixin(BaseClass, bootstrapClassName) {
    class BootstrapClass extends BaseClass {
        setOptions(options) {
            super.setOptions(options);
            this.options.level = this.options.level || UI.Level.DEFAULT;
        }

        getNodeAttributes() {
            let attr = super.getNodeAttributes();

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
    getNodeAttributes() {
        let attr = super.getNodeAttributes();

        if (this.getSize()) {
            attr.addClass(this.constructor.bootstrapClass() + "-" + this.getSize());
        }

        return attr;
    }

    setOptions(options) {
        super.setOptions(options);
        this.options.label = options.label || "";
    }

    getNodeType() {
        return "button";
    }

    render() {
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

    render() {
        let stateOptions = this.options.statusOptions[this.options.state - 1];

        this.options.label = stateOptions.label;
        this.options.faIcon = stateOptions.faIcon;

        return super.render();
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
    render() {
        this.buttons = [];
        for (let i = 0; i < this.options.givenOptions.length; i += 1) {
            let handler = () => {
                this.setIndex(i);
            };
            this.buttons.push(<UI.Button key={i} onClick={handler} label={this.options.givenOptions[i].toString()} level={this.options.buttonsLevel}/>);
        }
        return this.buttons;
    }

    onMount() {
        super.onMount();
        if (this.index == null) {
            this.index = 0;
            this.buttons[this.index].addClass("active");
        }
    }

    getIndex() {
        return this.index;
    }

    getValue() {
        return this.options.givenOptions[this.index];
    }

    setIndex(index) {
        this.buttons[this.index].removeClass("active");
        this.index = index;
        this.buttons[this.index].addClass("active");
        this.dispatch("setIndex", {value: this.options.givenOptions[index]});
    }
};

UI.BootstrapLabel = class BootstrapLabel extends BootstrapMixin(UI.Element, "label") {
    getNodeType() {
        return "span";
    }

    getNodeAttributes() {
        let attr = super.getNodeAttributes();
        if (this.options.faIcon) {
            attr.addClass("fa fa-" + this.options.faIcon);
        }
        return attr;
    }

    setLabel(label) {
        this.options.label = label;
        this.redraw();
    }

    render() {
        return [this.options.label];
    }
};

UI.CardPanel = class CardPanel extends BootstrapMixin(UI.Panel, "panel") {
    setOptions(options) {
        super.setOptions(options);
        this.options.level = this.options.level || UI.Level.DEFAULT;
    }

    render() {
        return [
            <div className="panel-heading">{this.getTitle()}</div>,
            <div className="panel-body" style={this.options.bodyStyle}>{this.getGivenChildren()}</div>,
        ];
    }
};

class CollapsibleStyle extends StyleSet {
    constructor() {
        super();

        this.collapsed = this.css({
            "display": "none",
        });

        this.collapsing = this.css({
            "height": "0",
            "transition-timing-function": "ease",
            "transition-duration": ".3s",
            "transition-property": "height, padding-top, padding-bottom",
            "position": "relative",
            "overflow": "hidden",
            "display": "block",
        });

        this.noPadding = this.css({
            "padding-top": "0 !important",
            "padding-bottom": "0 !important",
        })
    }
}

let collapsibleStyle = new CollapsibleStyle();

//TODO: remove all bootstrap logic
UI.CollapsiblePanel = class CollapsiblePanel extends UI.CardPanel {
    constructor(options) {
        super(options);
        // If options.collapsed is set, use that value. otherwise it is collapsed
        this.collapsed = (options.collapsed != null) ? options.collapsed : true;
    }

    onMount() {
        this.expandLink.addClickListener(() => {
            this.togglePanel();
        });
    }

    togglePanel() {
        if (!this.collapsing) {
            if (this.collapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    }

    expand() {
        // TODO: use this.options.collapsed instead
        this.collapsed = false;
        this.expandLink.removeClass("collapsed");
        this.contentArea.removeClass(collapsibleStyle.collapsed);
        let contentStyleHeight = this.contentArea.node.style.height;
        let contentHeight = this.contentArea.getHeight();
        this.contentArea.addClass(collapsibleStyle.collapsing);
        setTimeout(() => {
            this.contentArea.removeClass(collapsibleStyle.noPadding);
            this.contentArea.setHeight(contentHeight);
            let transitionEndFunction = () => {
                /* TODO: test height change with classes */
                this.contentArea.setHeight(contentStyleHeight);
                this.contentArea.removeClass(collapsibleStyle.collapsing);
                this.contentArea.removeDOMListener("webkitTransitionEnd", transitionEndFunction);
                this.collapsing = false;
            };
            this.contentArea.addNodeListener("webkitTransitionEnd", transitionEndFunction);
            this.collapsing = true;
        });
    }

    collapse() {
        this.collapsed = true;
        let contentStyleHeight = this.contentArea.node.style.height;
        this.contentArea.setHeight(this.contentArea.getHeight());
        this.contentArea.addClass(collapsibleStyle.collapsing);
        setTimeout(() => {
            this.contentArea.addClass(collapsibleStyle.noPadding);
            this.contentArea.setHeight(0);
            let transitionEndFunction = () => {
                this.expandLink.addClass("collapsed");
                this.contentArea.addClass(collapsibleStyle.collapsed);
                this.contentArea.removeClass(collapsibleStyle.collapsing);
                this.contentArea.setHeight(contentStyleHeight);
                this.contentArea.removeDOMListener("webkitTransitionEnd", transitionEndFunction);
                this.collapsing = false;
            };
            this.contentArea.addNodeListener("webkitTransitionEnd", transitionEndFunction);
            this.collapsing = true;
        });
    }

    render() {
        let autoHeightClass = "";
        let collapsedPanelClass = "";
        let collapsedHeadingClass = "";
        let expandLinkClass = "";

        if (this.options.autoHeight) {
            autoHeightClass = "auto-height ";
        }
        if (this.collapsed) {
            collapsedHeadingClass = "collapsed";
            collapsedPanelClass = collapsibleStyle.collapsed;
        }
        //TODO: remove panel-heading and panel-title (bootstrap stuff)
        return [
            <div className="panel-heading">
                <h4 className="panel-title">
                    <a ref="expandLink"  className={`panelCollapseButton ${collapsedHeadingClass}`}>
                        {this.getTitle()}
                    </a>
                </h4>
            </div>,
            <div ref="contentArea" className={`panel-content ${autoHeightClass} ${collapsedPanelClass}`}>
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
            this.togglePanel();
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
    render() {
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
