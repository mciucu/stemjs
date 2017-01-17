import {UI} from "./UIBase";
import {hover, StyleSet} from "Style";
import {Panel} from "./UIPrimitives";
import {GlobalStyle} from "./GlobalStyle";
import {Ajax} from "../base/Ajax";


function BootstrapMixin(BaseClass, bootstrapClassName) {
    class BootstrapClass extends BaseClass {
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
            this.applyNodeAttributes();
        }


        static bootstrapClass() {
            return bootstrapClassName;
        }
    }


    return BootstrapClass;
}


class SimpleStyledElement extends UI.Element {
    getLevel() {
        return this.options.level || (this.parent && this.parent.options && this.parent.options.level);
    }


    setLevel(level) {
        this.updateOptions({level});
    }


    getSize() {
        return this.options.size || (this.parent && this.parent.options && this.parent.options.size);
    }


    setSize(size) {
        this.updateOptions({size});
    }
}


class Label extends UI.Primitive(SimpleStyledElement, "a") {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.Label.DEFAULT);


        if (this.getSize()) {
            attr.addClass(GlobalStyle.Label.Size(this.getSize()));
        }


        if (this.getLevel()) {
            attr.addClass(GlobalStyle.Label.Level(this.getLevel()));
        }
    }


    setLabel(label) {
        this.options.label = label;
        this.redraw();
    }


    render() {
        return [this.options.label];
    }
}


class Button extends UI.Primitive(SimpleStyledElement, "button") {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.Button.DEFAULT);


        if (this.getSize()) {
            attr.addClass(GlobalStyle.Button.Size(this.getSize()));
        }


        if (this.getLevel()) {
            attr.addClass(GlobalStyle.Button.Level(this.getLevel()));
        }
    }


    defaultOptions() {
        return {
            label: ""
        };
    }


    render() {
        return [this.beforeChildren(), this.getLabel(), super.render()];
    };


    getLabel() {
        return this.options.label;
    }


    setLabel(label) {
        this.updateOptions({label: label});
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
        if (!this.getFaIcon()) {
            return null;
        }
        let iconOptions = {
            className: "fa fa-" + this.getFaIcon(),
        };
        if (this.getLabel()) {
            iconOptions.style = {
                paddingRight: "5px",
            }
        }


        return <span {...iconOptions} />;
    }
}


class StateButton extends Button {
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
}


class AjaxButton extends StateButton {
    ajaxCall(data) {
        this.setState(UI.ActionStatus.RUNNING);
        Ajax.request({
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
}


class ButtonGroup extends SimpleStyledElement {
    getDefaultOptions() {
        return {
            orientation: UI.Orientation.HORIZONTAL,
        };
    }


    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.ButtonGroup.Orientation(this.options.orientation));
    }
}


class RadioButtonGroup extends SimpleStyledElement {
    setOptions(options) {
        super.setOptions(options);
        this.index = this.options.index || 0;
    }


    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.RadioButtonGroup.DEFAULT);
    }


    render() {
        this.buttons = [];
        for (let i = 0; i < this.options.givenOptions.length; i += 1) {
            this.buttons.push(
                <UI.Button key={i} onClick={() => {this.setIndex(i);}} size={this.getSize()}
                  label={this.options.givenOptions[i].toString()} level={this.getLevel()}
                  className={this.index === i ? "active" : ""}/>);
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
        this.dispatch("setIndex", {
            index: index,
            oldIndex: this.index,
            value: this.options.givenOptions[index],
            oldValue: this.options.givenOptions[this.index]
        });
        this.buttons[this.index].removeClass("active");
        this.index = index;
        this.buttons[this.index].addClass("active");
    }
}


class BootstrapLabel extends BootstrapMixin(UI.Element, "label") {
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
}


class CardPanel extends BootstrapMixin(Panel, "panel") {
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
}


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
        });
    }
}


class CollapsiblePanelStyle extends StyleSet {
    constructor() {
        super();


        this.heading = this.css({
            "padding": "10px 15px",
            "border-bottom": "1px solid transparent",
            "border-top-left-radius": "3px",
            "border-top-right-radius": "3px",
            "background-color": "#f5f5f5",
        });


        this.button = this.css({
            "margin-top": "0",
            "margin-bottom": "0",
            "font-size": "16px",
            "color": "inherit",
            "cursor": "pointer",
            ":hover": {
                "color": "inherit",
            },
            ":before": {
                "font-family": "'Glyphicons Halflings'",
                "content": "\"\\e114\"",
                "color": "grey",
                "float": "left",
            }
        });


        this.collapsedButton = this.css({
            ":before": {
                "content": "\"\\e080\"",
            },
        });


        this.content = this.css({
            "padding": "5px",
        });
    }
}


let collapsibleStyle = new CollapsibleStyle();
let collapsiblePanelStyle = new CollapsiblePanelStyle();


class CollapsiblePanel extends CardPanel {
    constructor(options) {
        super(options);
        // If options.collapsed is set, use that value. otherwise it is collapsed
        options.collapsed = options.collapsed || true;
    }


    onMount() {
        this.expandLink.addClickListener(() => {
            this.togglePanel();
        });
    }


    togglePanel() {
        if (!this.collapsing) {
            if (this.options.collapsed) {
                this.expand();
            } else {
                this.collapse();
            }
        }
    }


    expand() {
        this.options.collapsed = false;
        this.expandLink.removeClass(collapsiblePanelStyle.collapsedButton);
        this.contentArea.removeClass(collapsibleStyle.collapsed);
        let contentStyleHeight = this.contentArea.node.style.height;
        let contentHeight = this.contentArea.getHeight();
        this.contentArea.addClass(collapsibleStyle.collapsing);
        setTimeout(() => {
            this.contentArea.removeClass(collapsibleStyle.noPadding);
            this.contentArea.setHeight(contentHeight);
            let transitionEndFunction = () => {
                this.contentArea.setHeight(contentStyleHeight);
                this.contentArea.removeClass(collapsibleStyle.collapsing);
                this.contentArea.removeNodeListener("transitionend", transitionEndFunction);
                this.collapsing = false;
            };
            this.contentArea.addNodeListener("transitionend", transitionEndFunction);
            this.collapsing = true;
        });
    }


    collapse() {
        this.options.collapsed = true;
        let contentStyleHeight = this.contentArea.node.style.height;
        this.contentArea.setHeight(this.contentArea.getHeight());
        this.contentArea.addClass(collapsibleStyle.collapsing);
        setTimeout(() => {
            this.contentArea.addClass(collapsibleStyle.noPadding);
            this.contentArea.setHeight(0);
            let transitionEndFunction = () => {
                this.expandLink.addClass(collapsiblePanelStyle.collapsedButton);
                this.contentArea.addClass(collapsibleStyle.collapsed);
                this.contentArea.removeClass(collapsibleStyle.collapsing);
                this.contentArea.setHeight(contentStyleHeight);
                this.contentArea.removeNodeListener("transitionend", transitionEndFunction);
                this.collapsing = false;
            };
            this.contentArea.addNodeListener("transitionend", transitionEndFunction);
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
        if (this.options.collapsed) {
            collapsedHeadingClass = collapsiblePanelStyle.collapsedButton;
            collapsedPanelClass = collapsibleStyle.collapsed;
        }


        return [<div className={collapsiblePanelStyle.heading}>
                    <a ref="expandLink"  className={`${collapsiblePanelStyle.button} ${collapsedHeadingClass}`}>
                        {this.getTitle()}
                    </a>
                </div>,
                <div ref="contentArea" className={`${collapsiblePanelStyle.content} ${autoHeightClass} ${collapsedPanelClass}`}>
                    {this.getGivenChildren()}
                </div>
        ];
    }
}


class DelayedCollapsiblePanel extends CollapsiblePanel {
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
}


class ProgressBar extends BootstrapMixin(UI.Element, "progress") {
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
}

export {BootstrapMixin, SimpleStyledElement, Label, Button, StateButton, AjaxButton, ButtonGroup, RadioButtonGroup, BootstrapLabel,
        CardPanel, CollapsiblePanelStyle, CollapsiblePanel, DelayedCollapsiblePanel, ProgressBar};
