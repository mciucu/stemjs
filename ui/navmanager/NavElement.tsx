import {ElementOptions, UI, UIElement, type UICleanChild} from "../UIBase";
import {StyleRules} from "../Style";
import {NavStyle} from "./NavStyle";
import {Switcher} from "../Switcher";
import {Link} from "../primitives/Link";
import {FACollapseIcon} from "../FontAwesome"; //TODO: more flexibility, do not require FAIcons in NavElements
import {SessionStorageMap} from "../../base/StorageMap";
import {Constructor, unwrapArray} from "../../base/Utils";
import {DirectionType, Orientation, OrientationType, Direction} from "../Constants";

let navSessionManager = new SessionStorageMap("navManager");

interface BasicOrientedElementOptions {
    orientation?: OrientationType;
}

interface OrientedElement extends UIElement<any, any, any> {
    getOrientation(): OrientationType;
    get styleSheet(): StyleRules<NavStyle>;
}

const BasicOrientedElementInterface = <TBase extends Constructor<UIElement<any, any, any>>>(BaseClass: TBase) =>
    class BasicOrientedElement extends BaseClass {
    declare options: ElementOptions<BasicOrientedElementOptions>;

    get styleSheet(): StyleRules<NavStyle> {
        return (this.options.styleSheet || (this.parent as OrientedElement).styleSheet) as StyleRules<NavStyle>;
    }

    getOrientation(): OrientationType {
        if (this.options.orientation) {
            return this.options.orientation;
        }
        if (this.parent && typeof (this.parent as OrientedElement).getOrientation === "function") {
            return (this.parent as OrientedElement).getOrientation();
        }
        return Orientation.HORIZONTAL;
    }
};

const BasicOrientedElement = BasicOrientedElementInterface(UI.Element);
type BasicOrientedElementType = InstanceType<typeof BasicOrientedElement>;
const BasicOrientedLinkElement = BasicOrientedElementInterface(Link);


interface NavElementOptions extends BasicOrientedElementOptions {
    value?: any;
    href?: string;
    sessionKey?: string;
    persistent?: boolean;
    defaultToggled?: boolean;
}

// NavElements should know if they are in vertical or horizontal mode, so they can behave differently
const NavElementInterface = <TBase extends Constructor<OrientedElement>>(BaseClass: TBase) =>
    class NavElement extends BaseClass {
    declare options: ElementOptions<NavElementOptions>;
    declare isToggled?: boolean;
    declare contentArea?: UIElement;
    declare collapseIcon?: any;

    constructor(...args) {
        super(...args);
        this.isToggled = this.getToggledState();
    }

    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        if (this.getOrientation() === Orientation.HORIZONTAL) {
            // it is in the navbar
            attr.addClass(this.styleSheet.navElementHorizontal);

            if (this.parent instanceof NavSection) {
                attr.setStyle("float", "left");
            } else {
                // it is an element in a dropdown
                attr.addClass(this.styleSheet.navCollapseElement);
            }
        } else {
            // it is in the sidebar
            attr.addClass(this.styleSheet.navElementVertical);
        }
    }

    getSelf() {
        const style = (this.getOrientation() === Orientation.HORIZONTAL ?
                        this.styleSheet.navElementValueHorizontal : this.styleSheet.navElementValueVertical);
        const marginLeft = this.getOrientation() === Orientation.VERTICAL && unwrapArray(this.render()).length ? "-20px" : "0";

        return <BasicOrientedElement className={style} style={{marginLeft: marginLeft}}>
            {this.getValue()}
        </BasicOrientedElement>;
    }

    getSubElements() {
        let childrenToRender = unwrapArray<UICleanChild>(this.render());
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
        if (unwrapArray(this.render()).length) {
            if (this.getOrientation() === Orientation.VERTICAL) {
                // is in the sidebar
                result = [
                    <FACollapseIcon ref="collapseIcon" collapsed={!this.isToggled} className={this.styleSheet.navElementVerticalArrow} />,
                    this.options.value
                ];
            } else if (this.getOrientation() === Orientation.HORIZONTAL) {
                // is in the navbar
                result = [
                    this.options.value,
                    <FACollapseIcon collapsed={false} className={this.styleSheet.navElementHorizontalArrow} />,
                ];
            }
        } else {
            result = this.options.value;
        }
        return result;
    }

    getChildrenToRender() {
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
        if (!unwrapArray(this.render()).length) {
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
            if (this.getOrientation() === Orientation.HORIZONTAL && unwrapArray(this.render()).length) {
                this.showChildren();
            }
        });
        this.addNodeListener("mouseleave", () => {
            if (this.getOrientation() === Orientation.HORIZONTAL && unwrapArray(this.render()).length) {
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

const NavElement = NavElementInterface(UI.Primitive("li", BasicOrientedElement));
class NavLinkElement extends NavElementInterface(BasicOrientedLinkElement) {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.navLinkElement);
    }

    render() {
        return this.options.children;
    }
}


interface NavSectionOptions {
    anchor?: DirectionType;
}

class NavSection extends UI.Primitive("ul")<NavSectionOptions> {
    get styleSheet(): StyleRules<NavStyle> {
        return (this.options.styleSheet || (this.parent as OrientedElement).styleSheet) as StyleRules<NavStyle>;
    }

    extraNodeAttributes(attr) {
        if (this.getOrientation() === Orientation.HORIZONTAL) {
            // it is in the navbar
            attr.addClass(this.styleSheet.navSectionHorizontal);
            // this is functionality, should be isolated from the actual design
            attr.setStyle("float", this.getAnchor());
        } else {
            // it is in the sidebar
            attr.addClass(this.styleSheet.navSectionVertical);
        }
    }

    getAnchor() {
        return this.options.anchor || Direction.LEFT;
    }

    getOrientation(): OrientationType {
        return (this.parent as OrientedElement).getOrientation();
    }
}


class NavAnchoredNotifications extends NavSection {
    declare switcher?: Switcher;
    declare activeChild?: any;
    declare bodyListener?: any;

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
            <Switcher ref="switcher" style={this.getSwitcherStyle()} className="hidden" />
        ];
    }

    show(content?: UIElement, child?: UIElement) {
        this.activeChild = child;
        this.switcher.removeClass("hidden");
        (this.switcher.setActive as any)(content, child);
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
export type {BasicOrientedElementType};
