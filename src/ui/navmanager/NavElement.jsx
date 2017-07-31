import {UI, Link} from "../UI";
import {FACollapseIcon} from "../FontAwesome"; //TODO: more flexibility, do not require FAIcons in NavElements
import {SessionStorageMap} from "../../base/StorageMap";
import {Orientation, Direction} from "../Constants";

let navSessionManager = new SessionStorageMap("navManager");

const BasicOrientedElementInterface = (BaseClass) => class BasicOrientedElement extends BaseClass {
    getStyleSet() {
        return this.options.styleSet || this.parent.getStyleSet();
    }

    getOrientation() {
        if (this.options.orientation) {
            return this.options.orientation;
        }
        if (this.parent && typeof this.parent.getOrientation === "function") {
            return this.parent.getOrientation();
        }
        return Orientation.HORIZONTAL;
    }
};

const BasicOrientedElement = BasicOrientedElementInterface(UI.Element);
const BasicOrientedLinkElement = BasicOrientedElementInterface(Link);


// NavElements should know if they are in vertical or horizontal mode, so they can behave differently
const NavElementInterface = (BaseClass) => class NavElement extends BaseClass {
    constructor() {
        super(...arguments);
        this.isToggled = this.getToggledState();
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        if (this.getOrientation() === Orientation.HORIZONTAL) {
            // it is in the navbar
            attr.addClass(this.getStyleSet().navElementHorizontal);

            if (this.parent instanceof NavSection) {
                attr.setStyle("float", "left");
            } else {
                // it is an element in a dropdown
                attr.addClass(this.getStyleSet().navCollapseElement);
            }
        } else {
            // it is in the sidebar
            attr.addClass(this.getStyleSet().navElementVertical);
        }
    }

    getSelf() {
        const style = (this.getOrientation() === Orientation.HORIZONTAL ?
                        this.getStyleSet().navElementValueHorizontal : this.getStyleSet().navElementValueVertical);
        const marginLeft = this.getOrientation() === Orientation.VERTICAL && this.getGivenChildren().length ? "-20px" : "0";

        return <BasicOrientedElement className={style} style={{marginLeft: marginLeft}}>
            {this.getValue()}
        </BasicOrientedElement>;
    }

    getSubElements() {
        let childrenToRender = this.getGivenChildren();
        if (childrenToRender.length) {
            let subElementsClass;
            if (!this.isToggled) {
                subElementsClass = "hidden";
            }
            return <BasicOrientedElement ref="contentArea" className={subElementsClass}>
                {childrenToRender}
            </BasicOrientedElement>;
        }
        return null;
    }

    getValue() {
        let result;
        if (this.getGivenChildren().length) {
            if (this.getOrientation() === Orientation.VERTICAL) {
                // is in the sidebar
                result = [
                    <FACollapseIcon ref="collapseIcon" collapsed={!this.isToggled} className={this.getStyleSet().navElementVerticalArrow} />,
                    this.options.value
                ];
            } else if (this.getOrientation() === Orientation.HORIZONTAL) {
                // is in the navbar
                result = [
                    this.options.value,
                    <FACollapseIcon collapsed={false} className={this.getStyleSet().navElementHorizontalArrow} />,
                ];
            }
        } else {
            result = this.options.value;
        }
        return result;
    }

    render() {
        return [
            this.getSelf(),
            this.getSubElements(),
        ];
    }

    showChildren() {
        this.contentArea.removeClass("hidden");
    }

    hideChildren() {
        this.contentArea.addClass("hidden");
    }

    toggleChildren() {
        if (!this.getGivenChildren().length) {
            return;
        }

        if (!this.isToggled) {
            this.showChildren();
        } else {
            this.hideChildren();
        }

        if (this.collapseIcon) {
            this.collapseIcon.setCollapsed(this.isToggled);
        }
        this.isToggled = !this.isToggled;

        this.saveToggledState();
    }

    getSessionKeyName() {
        let sessionKeyName = this.options.sessionKey || this.options.href;
        if (!sessionKeyName) {
            throw Error("Persistent nav element needs a unique session key!");
        }
        return sessionKeyName;
    }

    getLocalToggledState() {
        if (this.hasOwnProperty("isToggled")) {
            return !!this.isToggled;
        }
        return !!this.options.defaultToggled;
    }

    getToggledState() {
        if (!this.options.persistent) {
            return this.getLocalToggledState();
        }
        let sessionKeyName = this.getSessionKeyName();
        return navSessionManager.get(sessionKeyName, this.getLocalToggledState());
    }

    saveToggledState() {
        if (!this.options.persistent) {
            return;
        }
        let sessionKeyName = this.getSessionKeyName();
        navSessionManager.set(sessionKeyName, this.getLocalToggledState());
    }

    onMount() {
        super.onMount();
        this.addNodeListener("mouseenter", () => {
            if (this.getOrientation() === Orientation.HORIZONTAL && this.getGivenChildren().length) {
                this.showChildren();
            }
        });
        this.addNodeListener("mouseleave", () => {
            if (this.getOrientation() === Orientation.HORIZONTAL && this.getGivenChildren().length) {
                this.hideChildren();
            }
        });
        this.addClickListener((event) => {
            if (this.getOrientation() === Orientation.VERTICAL) {
                event.stopPropagation();
                this.toggleChildren();
            }
        });
    }
};

const NavElement = NavElementInterface(UI.Primitive(BasicOrientedElement, "li"));
class NavLinkElement extends NavElementInterface(BasicOrientedLinkElement) {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.getStyleSet().navLinkElement);
    }
}


class NavSection extends UI.Primitive("ul") {
    getStyleSet() {
        return this.options.styleSet || this.parent.getStyleSet();
    }

    extraNodeAttributes(attr) {
        if (this.getOrientation() === Orientation.HORIZONTAL) {
            // it is in the navbar
            attr.addClass(this.getStyleSet().navSectionHorizontal);
            // this is functionality, I really want this to be isolated from the actual design
            // TODO: anchor might not be defined
            attr.setStyle("float", this.options.anchor);
        } else {
            // it is in the sidebar
            attr.addClass(this.getStyleSet().navSectionVertical);
        }
    }

    getAnchor() {
        return this.options.anchor || Direction.LEFT;
    }

    getOrientation() {
        return this.parent.getOrientation();
    }
}


class NavAnchoredNotifications extends NavSection {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle({
            position: "relative",
        });
    }

    getSwitcherStyle() {
        return {
            position: "absolute",
            maxWidth: "calc(100vw - 76px)",
            top: "50px",
            right: "0",
            height: "300px",
            width: "400px",
            boxShadow: "0px 0px 10px #666",
            zIndex: "-1",
        };
    }

    render() {
        return [
            this.options.children,
            <UI.Switcher ref="switcher" style={this.getSwitcherStyle()} className="hidden">
            </UI.Switcher>
        ];
    }

    show(content, child) {
        this.activeChild = child;
        this.switcher.removeClass("hidden");
        this.switcher.setActive(content, child);
        this.bodyListener = document.body.addEventListener("click", () => this.hide());
    }

    hide() {
        this.switcher.addClass("hidden");
        this.activeChild = null;
        document.body.removeEventListener("click", this.bodyListener);
    }

    onMount() {
        this.addListener("changeSwitcher", (content, child) => {
            if (this.activeChild == child) {
                this.hide();
            } else {
                this.show(content, child);
            }
        });

        this.switcher.addClickListener((event) => {
            event.stopPropagation();
        });
    }
}


export {BasicOrientedElement, NavElement, NavLinkElement, NavSection, NavAnchoredNotifications, navSessionManager};
