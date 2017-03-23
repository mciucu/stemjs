import {UI} from "./UIBase";
import {StyleSet} from "./Style";
import {styleRule} from "../decorators/Style";
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
};


class SimpleStyledElement extends UI.Element {
    getLevel() {
        return this.options.level || (this.parent && this.parent.getLevel && this.parent.getLevel());
    }

    setLevel(level) {
        this.updateOptions({level});
    }

    getSize() {
        return this.options.size || (this.parent && this.parent.getSize && this.parent.getSize());
    }

    setSize(size) {
        this.updateOptions({size});
    }
}


class IconableInterface extends SimpleStyledElement {
    render() {
        return [this.beforeChildren(), this.getLabel(), super.render()];
    };

    getLabel() {
        return (this.options.label != null) ? this.options.label : "";
    }

    setLabel(label) {
        this.updateOptions({label: label});
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

    beforeChildren() {
        if (!this.getFaIcon()) {
            return null;
        }
        let iconOptions = {
            className: "fa fa-" + this.getFaIcon(),
        };
        if (this.getLabel()) {
            iconOptions.style = {
                marginRight: "5px",
            }
        }

        return <span {...iconOptions} />;
    }
}


class Label extends UI.Primitive(IconableInterface, "span") {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.Label.DEFAULT);

        if (this.getSize()) {
            attr.addClass(GlobalStyle.Label.Size(this.getSize()));
        }

        if (this.getLevel()) {
            attr.addClass(GlobalStyle.Label.Level(this.getLevel()));
        }
    }
}


class Badge extends UI.Primitive(IconableInterface, "span") {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.Badge.DEFAULT);

        if (this.getSize()) {
            attr.addClass(GlobalStyle.Badge.Size(this.getSize()));
        }

        if (this.getLevel()) {
            attr.addClass(GlobalStyle.Badge.Level(this.getLevel()));
        }
    }
}


class CardPanelStyle extends StyleSet {
    @styleRule
    heading = {
        color: "#333",
        backgroundColor: "#f5f5f5",
        padding: "10px 15px",
        borderBottom: "1px solid #ddd",
    };

    @styleRule
    body = {
        padding: "5px",
    };

    @styleRule
    panel = {
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "4px",
    };
}


class CardPanel extends SimpleStyledElement {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.CardPanel.DEFAULT.panel);
        if (this.getLevel()) {
            attr.addClass(GlobalStyle.CardPanel.Level(this.getLevel()).panel);
        }
        if (this.getSize()) {
            attr.addClass(GlobalStyle.CardPanel.Size(this.getSize()).panel);
        }
    }

    getTitle() {
        return this.options.title;
    }

    render() {
        let headingLevel = (this.getLevel() ? GlobalStyle.CardPanel.Level(this.getLevel()).heading : "");

        return [
            <div className={`${GlobalStyle.CardPanel.DEFAULT.heading} ${headingLevel}`}>{this.getTitle()}</div>,
            <div className={GlobalStyle.CardPanel.DEFAULT.body} style={this.options.bodyStyle}>{this.getGivenChildren()}</div>,
        ];
    }
}

class CollapsibleStyle extends StyleSet {
    constructor() {
        super();
        this.transitionDuration = 0.4;
    }

    @styleRule
    collapsing = {
        marginTop: "0",
        transitionTimingFunction: "ease",
        transitionDuration: `${this.transitionDuration}s`,
        transitionProperty: "margin-top",
        transitionDelay: "-0.15s",
    };

    @styleRule
    collapsed = {
        marginTop: "-100% !important",
        transitionDelay: "0s !important",
    };
}


class CollapsiblePanelStyle extends StyleSet {
    @styleRule
    heading = {
        padding: "10px 15px",
        borderBottom: "1px solid transparent",
        borderTopLeftRadius: "3px",
        borderTopRightRadius: "3px",
        backgroundColor: "#f5f5f5",
    };

    @styleRule
    button = {
        marginTop: "0",
        marginBottom: "0",
        fontSize: "16px",
        color: "inherit",
        cursor: "pointer",
        ":hover": {
            color: "inherit",
        },
        ":before": {
            fontFamily: "'Glyphicons Halflings'",
            content: "\"\\e114\"",
            color: "grey",
            float: "left",
        }
    };

    @styleRule
    collapsedButton = {
        ":before": {
            content: "\"\\e080\" !important",
        },
    };
}

function CollapsibleMixin(BaseClass, CollapsibleClass = CollapsibleStyle) {
    class CollapsibleElement extends BaseClass {
        getDefaultOptions() {
            return {
                collapsed: true,
            };
        }

        static collapsibleStyleSet = new CollapsibleStyle();

        getCollapsibleStyleSet() {
            return this.options.collapsibleStyleSet || this.constructor.collapsibleStyleSet;
        }

        expand(panel) {
            this.options.collapsed = false;
            let collapsibleStyle = this.getCollapsibleStyleSet();
            panel.addClass(collapsibleStyle.collapsing);
            panel.removeClass("hidden");
            setTimeout(() => {
                panel.removeClass(collapsibleStyle.collapsed);
            });
        }

        collapse(panel) {
            this.options.collapsed = true;
            let collapsibleStyle = this.getCollapsibleStyleSet();
            panel.addClass(collapsibleStyle.collapsing);
            panel.addClass(collapsibleStyle.collapsed);
            let transitionEndFunction = () => {
                if (this.options.collapsed) {
                    panel.addClass("hidden");
                }
            };
            panel.addNodeListener("transitionend", transitionEndFunction);
        }
    }

    return CollapsibleElement;
}

class CollapsiblePanel extends CollapsibleMixin(CardPanel) {
    static styleSet = new CollapsiblePanelStyle();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    toggle() {
        if (this.options.collapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    expand() {
        super.expand(this.contentArea);
        this.toggleButton.removeClass(this.getStyleSet().collapsedButton);
    }

    collapse() {
        super.collapse(this.contentArea);
        setTimeout(() => {
            this.toggleButton.addClass(this.getStyleSet().collapsedButton);
        }, this.getCollapsibleStyleSet().transitionDuration * 700);
    }

    render() {
        let autoHeightClass = "";
        let collapsedPanelClass = "";
        let collapsedHeadingClass = "";
        let hiddenClass = "";
        let contentStyle = {};

        if (this.options.autoHeight) {
            autoHeightClass = "auto-height ";
        }
        if (this.options.collapsed) {
            collapsedHeadingClass = this.getStyleSet().collapsedButton;
            collapsedPanelClass = this.getCollapsibleStyleSet().collapsed;
            hiddenClass = "hidden";
        }
        if (!this.options.noPadding) {
            contentStyle = {
                padding: "8px 8px",
            };
        }

        return [<div className={this.getStyleSet().heading}>
                    <a ref="toggleButton"  className={`${this.getStyleSet().button} ${collapsedHeadingClass}`}
                        onClick={() => this.toggle()}>
                        {this.getTitle()}
                    </a>
                </div>,
                <div style={{overflow: "hidden"}}>
                  <div ref="contentArea" className={`${autoHeightClass} ${collapsedPanelClass} ${hiddenClass}`}
                       style={contentStyle}>
                        {this.getGivenChildren()}
                    </div>
                </div>
        ];
    }
}


class DelayedCollapsiblePanel extends CollapsiblePanel {
    toggle() {
        if (!this._haveExpanded) {
            this._haveExpanded = true;
            UI.renderingStack.push(this);
            this.contentArea.options.children = this.getGivenChildren();
            UI.renderingStack.pop();
            this.contentArea.redraw();
            this.delayedMount();
        }
        super.toggle();
    }

    getGivenChildren() {
        if (!this._haveExpanded) {
            return [];
        }
        return this.getDelayedChildren();
    }
}


class ProgressBar extends SimpleStyledElement {
    extraNodeAttributes(attr) {
        attr.addClass(GlobalStyle.ProgressBar.CONTAINER);
    }

    render() {
        let valueInPercent = (this.options.value || 0) * 100;
        let orientation = UI.Orientation.HORIZONTAL;
        if (this.options.hasOwnProperty("orientation")) {
            orientation = this.options.orientation;
        }
        let barStyle;
        if (orientation === UI.Orientation.HORIZONTAL) {
            barStyle = {
                width: valueInPercent + "%",
                height: this.options.height + "px",
            };
        } else {
            barStyle = {
                height: valueInPercent + "%",
                width: "5px",
            }
        }
        let barOptions = {
            className: GlobalStyle.ProgressBar.DEFAULT,
            style: barStyle,
        };

        if (this.options.disableTransition) {
            Object.assign(barOptions.style, {
                transition: "none",
            });
        }

        if (this.options.level) {
            barOptions.className += " " + GlobalStyle.ProgressBar.Level(this.getLevel());
        }
        if (this.options.striped) {
            barOptions.className += " " + GlobalStyle.ProgressBar.STRIPED;
        }
        if (this.options.active) {
            barOptions.className += " " + GlobalStyle.ProgressBar.ACTIVE;
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


export {BootstrapMixin, SimpleStyledElement, IconableInterface, Label, Badge,  CardPanel, CollapsiblePanelStyle, CollapsiblePanel, CollapsibleMixin,  DelayedCollapsiblePanel, ProgressBar};
