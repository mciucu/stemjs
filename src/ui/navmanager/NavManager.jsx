import {UI, changeParent} from "UI";
import {SessionStorageMap} from "StorageMap";
import {FAIcon, FACollapseIcon} from "ui/FontAwesome";
import {NavbarStyle, NavEffectsStyle} from "NavStyle";

let navStyle = NavbarStyle.getInstance();
let navEffects = NavEffectsStyle.getInstance();
let navSessionManager = new SessionStorageMap("navManager");
let NavbarArea = {
    LEFT_FIXED: "LEFT_FIXED",
    RIGHT_FIXED: "RIGHT_FIXED",
    LEFT_CONDITIONED: "LEFT_CONDITIONED",
    RIGHT_CONDITIONED: "RIGHT_CONDITIONED",
};

class BasicOrientedElement extends UI.Element {
    getOrientation() {
        if (this.options.orientation) {
            return this.options.orientation;
        }
        if (this.parent && typeof this.parent.getOrientation === "function") {
            return this.parent.getOrientation();
        }
        return UI.Orientation.HORIZONTAL;
    }
}

// NavElements should know if they are in vertical or horizontal mode, so they can behave differently
class NavElement extends UI.Primitive(BasicOrientedElement, "li") {
    constructor() {
        super(...arguments);
        this.isToggled = this.getToggledState();
    }

    extraNodeAttributes(attr) {
        if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
            // it is in the navbar
            attr.addClass(navStyle.navElementHorizontal);

            if (this.parent instanceof NavElementSection) {
                attr.setStyle("float", "left");
            } else if (this instanceof NavElement) {
                // navbar element collapse
                attr.addClass(navStyle.navCollapseElement);
            }
        } else {
            // it is in the sidebar
            attr.addClass(navStyle.navElementVertical);
        }
    }

    getSelf() {
        const style = (this.getOrientation() === UI.Orientation.HORIZONTAL ?
              navStyle.navElementValueHorizontal : navStyle.navElementValueVertical);

        return <BasicOrientedElement className={style}>
            {this.getValue()}
        </BasicOrientedElement>;
   }

    getSubElements() {
        let childrenToRender = this.getGivenChildren();
        if (childrenToRender.length) {
            let subElementsStyle = navStyle.navElementSubElementsVertical;
            if (this.getOrientation() == UI.Orientation.HORIZONTAL) {
                subElementsStyle = navStyle.navElementSubElementsHorizontal;
            }
            if (this.isToggled) {
                Object.assign(subElementsStyle, navStyle.showNavElement);
            }

            let subElementsClass = "";
            if (!this.isToggled) {
                subElementsClass = "hidden";
            }
            return <BasicOrientedElement ref="contentArea" style={subElementsStyle} className={subElementsClass}>
                {childrenToRender}
            </BasicOrientedElement>;
        }
    }

    getValue() {
        let result;
        if (this.options.children.length) {
            if (this.getOrientation() === UI.Orientation.VERTICAL) {
                // is in the sidebar
                result = [
                    <BasicOrientedElement style={{marginLeft: "-15px",}} className={navStyle.navElementVerticalHover}>
                        <FACollapseIcon ref="collapseIcon" collapsed={!this.isToggled} className={navStyle.navElementVerticalArrow} />
                        {this.options.value}
                    </BasicOrientedElement>
                ];
            } else if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
                // is in the navbar
                result = [
                    this.options.value,
                    <FAIcon icon="angle-down" className={navStyle.navElementHorizontalArrow} />,
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

        this.collapseIcon.setCollapsed(this.isToggled);
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
        this.addNodeListener("mouseenter", () => {
            if (this.getOrientation() === UI.Orientation.HORIZONTAL && this.getGivenChildren().length) {
                this.showChildren();
            }
        });
        this.addNodeListener("mouseleave", () => {
            if (this.getOrientation() === UI.Orientation.HORIZONTAL && this.getGivenChildren().length) {
                this.hideChildren();
            }
        });
        this.addClickListener((event) => {
            if (this.getOrientation() === UI.Orientation.VERTICAL) {
                event.stopPropagation();
                this.toggleChildren();
            }
        });
    }
}


class NavLinkElement extends UI.Primitive(NavElement, "a") {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.addClass(navStyle.navLinkElement);
    }

    getValue() {
        return this.options.value;
    }
}


class NavElementSection extends UI.Primitive("ul") {
    extraNodeAttributes(attr) {
        if (this.getOrientation() === UI.Orientation.HORIZONTAL) {
            // it is in the navbar
            attr.addClass(navStyle.navElementSectionHorizontal);
            // this is functionality, I really want this to be isolated from the actual design
            // TODO: anchor might not be defined
            attr.setStyle("float", this.options.anchor);
        } else {
            // it is in the sidebar
            attr.addClass(navStyle.navElementSectionVertical);
        }
    }

    getAnchor() {
        return this.options.anchor || UI.Direction.LEFT;
    }

    getOrientation() {
        return this.parent.getOrientation();
    }

    // appendChild(child) {
    //     this.options.children.push(child);
    //     this.redraw();
    //     return child;
    // }
}


class SidePanelGroup extends UI.Element {
    extraNodeAttributes(attr) {
        attr.addClass(navStyle.sidePanelGroup);
        if (this.options.anchor === UI.Direction.RIGHT) {
            attr.setStyle("right", 0);
        } else {
            attr.setStyle("width", "250px");
        }
    }

    getOrientation() {
        return UI.Orientation.VERTICAL;
    }
}


class SidePanel extends UI.Element {
    constructor() {
        super(...arguments);

        if (!this.node) {
            this.mount(document.body);
        }

        if (this.options.name) {
            this.storageSerializer = new SessionStorageMap("sidePanel" + this.options.name);
            this.visible = this.storageSerializer.get("visible");
        }

        if (this.visible) {
            this.show();
        } else {
            this.hide();
        }
    }

    extraNodeAttributes(attr) {
        if (this.options.anchor === UI.Direction.RIGHT) {
            attr.addClass(navStyle.rightSidePanel);
            attr.setStyle("right", "0");
        } else {
            attr.addClass(navStyle.leftSidePanel);
        }
    }

    setVisible(value) {
        this.visible = value;
        if (this.storageSerializer) {
            this.storageSerializer.set("visible", value);
        }
    }

    show() {
        if (this.options.anchor === UI.Direction.RIGHT) {
            this.removeClass(navEffects.navVerticalRightHide);
            this.addClass(navEffects.navVerticalRightShow);
        } else {
            this.removeClass(navEffects.navVerticalLeftHide);
            this.addClass(navEffects.navVerticalLeftShow);
        }

        this.setVisible(true);
    }

    hide() {
        if (this.options.anchor === UI.Direction.RIGHT) {
            this.removeClass(navEffects.navVerticalRightShow);
            this.addClass(navEffects.navVerticalRightHide);
        } else {
            this.removeClass(navEffects.navVerticalLeftShow);
            this.addClass(navEffects.navVerticalLeftHide);
        }

        this.setVisible(false);
    }

    toggle() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    getOrientation() {
        return UI.Orientation.VERTICAL;
    }

    render() {
        return <SidePanelGroup ref="this.wrappedPanel" anchor={this.options.anchor}>
            {this.getGivenChildren()}
        </SidePanelGroup>;
    }
}


class SocialNavbarItems extends NavElementSection {
    extraNodeAttributes(attr) {
        super.extraNodeAttributes(attr);
        attr.setStyle({
            position: "relative",
        });
    }

    render() {
        return [
            this.options.children,
            <UI.Switcher ref="switcher" style={{
                position: "absolute",
                maxWidth: "calc(100vw - 76px)",
                top: "50px",
                right: "0",
                height: "300px",
                width: "400px",
                boxShadow: "0px 0px 10px #666",
            }} className="hidden">
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


class NavManager extends UI.Primitive("nav") {
    constructor(persistentLeftSidePanel=true, persistentRightSidePanel=true) {
        super();

        let icon = [<UI.SVG.CSAIconSVG size={25} style={{
        }}/>, "Home"];

        this.leftSidePanel = <SidePanel anchor={UI.Direction.LEFT} name="left" persistent={persistentLeftSidePanel}>
            <BasicOrientedElement orientation={UI.Orientation.VERTICAL} ref={this.refLink("navigationPanel")}>
                    {this.getLeftSidePanelFixedChildren()}
            </BasicOrientedElement>
            <UI.Carousel ref={this.refLink("carousel")}>
                <BasicOrientedElement orientation={UI.Orientation.VERTICAL} ref={this.refLink("navigationPanel")}>
                    {this.getLeftSidePanelChildren()}
                </BasicOrientedElement>
            </UI.Carousel>
        </SidePanel>;

        this.rightSidePanel = <SidePanel anchor={UI.Direction.RIGHT} name="right" persistent={persistentRightSidePanel}>
            {this.getRightSidePanelChildren()}
        </SidePanel>;

        this.leftConditionedChildren = this.getLeftConditionedChildren();
        this.rightConditionedChildren = this.getRightConditionedChildren();
    }

    getLeftSidePanelFixedChildren() {
        return [];
    }

    getLeftSidePanelChildren() {
        return [];
    }

    getRightSidePanelChildren() {
        return [];
    }

    getLeftConditionedChildren() {
        return [];
    }

    getRightConditionedChildren() {
        return [];
    }

    extraNodeAttributes(attr) {
        attr.addClass(navStyle.navManager);
    }

    getOrientation() {
        return UI.Orientation.HORIZONTAL;
    }

    // TODO: lots of duplicate code here, with left/right stuff
    getLeftSideIcon() {
        if (!this.hasLeftSidePanel()) {
            return null;
        }
        if (!this.leftPanelToggler) {
            this.leftPanelToggler = <FAIcon icon="bars" onClick={() => {
                if (this.wrapped) {
                    if (this.carousel.getActive() === this.navigationPanel) {
                        this.toggleLeftSidePanel();
                    } else {
                        this.carousel.setActive(this.navigationPanel);
                        if (!this.getLeftSidePanel().visible) {
                            this.toggleLeftSidePanel();
                        }
                    }
                } else {
                    this.toggleLeftSidePanel();
                }}} style={navStyle.leftSideIcon} />;
        }
        return this.leftPanelToggler;
    }

    getRightSideIcon() {
        if (!this.hasRightSidePanel()) {
            return null;
        }
        if (!this.rightPanelToggler) {
            this.rightPanelToggler = <FAIcon icon="ellipsis-v" onClick={() => this.toggleRightSidePanel()} style={navStyle.rightSideIcon} />;
        }
        return this.rightPanelToggler;
    }

    getFixedWidth() {
        let width = 10;
        for (let child of this.children) {
            width += child.getWidth();
        }
        width -= this.getLeftConditioned().getWidth();
        width -= this.getRightConditioned().getWidth();
        return width;
    }

    getWrappedIcon() {
        if (!this.wrappedToggler) {
            this.wrappedToggler = <FAIcon icon="ellipsis-h" onClick={() => {
                if (this.wrapped) {
                    if (this.carousel.getActive() === this.wrappedPanel) {
                        this.toggleLeftSidePanel();
                    } else {
                        this.carousel.setActive(this.wrappedPanel);
                        if (!this.getLeftSidePanel().visible) {
                            this.toggleLeftSidePanel();
                        }
                    }
                } else {
                    this.toggleLeftSidePanel();
                }}} style={{lineHeight: "50px"}}
              className={navStyle.wrappedIcon.toString() + " " + (this.wrapped ? "" : "hidden")}/>;
        }
        return this.wrappedToggler;
    }

    getLeftFixed() {
        return [];
    }

    getRightFixed() {
        return [];
    }

    getLeftConditionedWrapper() {
        if (!this.leftConditionedWrapper) {
            this.leftConditionedWrapper = <NavElementSection anchor={UI.Direction.LEFT}>
                {this.getLeftConditioned()}
            </NavElementSection>;
        }
        return this.leftConditionedWrapper;
    }

    getRightConditionedWrapper() {
        if (!this.rightConditionedWrapper) {
            this.rightConditionedWrapper = <NavElementSection anchor={UI.Direction.RIGHT}>
                {this.getRightConditioned()}
            </NavElementSection>;
        }
        return this.rightConditionedWrapper;
    }

    getLeftConditioned() {
        if (!this.leftConditioned) {
            this.leftConditioned = <NavElementSection>{this.getLeftConditionedChildren()}</NavElementSection>;
        }
        return this.leftConditioned;
    }

    getRightConditioned() {
        if (!this.rightConditioned) {
            this.rightConditioned =  <NavElementSection>{this.getRightConditionedChildren()}</NavElementSection>;
        }
        return this.rightConditioned;
    }

    addLeftConditioned(element) {
        this.getLeftConditioned().appendChild(element);
    }

    addRightConditioned(element) {
        this.rightConditioned().appendChild(element);
    }

    hasLeftSidePanel() {
        return this.getLeftSidePanel() != null;
    }

    hasRightSidePanel() {
        return this.getRightSidePanel() != null;
    }

    getLeftSidePanel() {
        return this.leftSidePanel;
    }

    getRightSidePanel() {
        return this.rightSidePanel;
    }

    toggleLeftSidePanel() {
        this.getLeftSidePanel().toggle();
        this.dispatch("toggledLeftSide", this.getLeftSidePanel().visible);
        if (this.hasRightSidePanel() && this.getLeftSidePanel().visible && this.getRightSidePanel().visible) {
            this.getLeftSidePanel().setStyle("z-index", 3001);
            this.getRightSidePanel().setStyle("z-index", 3000);
        }
    }

    toggleRightSidePanel() {
        this.getRightSidePanel().toggle();
        this.dispatch("toggledRightSide", this.getRightSidePanel().visible);
        if (this.hasLeftSidePanel() && this.getLeftSidePanel().visible && this.getRightSidePanel().visible) {
            this.getRightSidePanel().setStyle("z-index", 3001);
            this.getLeftSidePanel().setStyle("z-index", 3000);
        }
    }

    render() {
        return [
            this.getLeftSideIcon(),
            this.getLeftFixed(),
            this.getLeftConditionedWrapper(),
            this.getWrappedIcon(),
            this.getRightSideIcon(),
            this.getRightFixed(),
            this.getRightConditionedWrapper(),
        ];
    }

    bindToNode() {
        // TODO: Don't forget to add href to this
        // this.addLeftConditioned(<NavLinkElement value={UI.T("Dynamic left")} href="/link3"/>);

        // TODO: add listener on window resize
        /*
        this.addRightConditioned(<NavElement value={UI.T("Dynamic right")}>
            <NavElement value="hello"/>
            <NavElement value="world"/>
        </NavElement>);
        */

        super.bindToNode(...arguments);
        this.onMount();
    }

    checkForWrap() {
        if (this.getLeftConditioned().children.length || this.getRightConditioned().children.length) {
            if (!this.wrapped) {
                this.unwrappedTotalWidth = 10;
                for (let child of this.children) {
                    this.unwrappedTotalWidth += child.getWidth();
                }
            }
            if (window.innerWidth < this.unwrappedTotalWidth && !this.wrapped) {
                this.wrapped = true;
                this.wrappedPanel = <BasicOrientedElement orientation={UI.Orientation.VERTICAL} />;
                this.carousel.appendChild(this.wrappedPanel);

                this.getWrappedIcon().setStyle("width", "calc(100% - " + this.getFixedWidth() + "px)");
                changeParent(this.getRightConditioned(), this.wrappedPanel);
                changeParent(this.getLeftConditioned(), this.wrappedPanel);
                this.getRightConditioned().redraw();
                this.getLeftConditioned().redraw();
                this.getWrappedIcon().removeClass("hidden");
                this.dispatch("wrapped", true);
            } else if (window.innerWidth >= this.unwrappedTotalWidth && this.wrapped) {
                this.wrapped = false;
                this.getWrappedIcon().addClass("hidden");
                changeParent(this.getLeftConditioned(), this.getLeftConditionedWrapper());
                changeParent(this.getRightConditioned(), this.getRightConditionedWrapper());
                this.carousel.eraseChild(this.wrappedPanel);
                this.getLeftConditioned().redraw();
                this.getRightConditioned().redraw();
                this.dispatch("wrapped", false);
            }
        }
    }

    onMount() {
        setTimeout(() => this.checkForWrap());
        window.addEventListener("resize", () => this.checkForWrap());
        this.addListener("maybeWrap", () => this.checkForWrap());
    }
}


let initializeNavbar = () => {
    NavManager.Global = NavManager.Global || new NavManager();
    return NavManager.Global;
};


export {NavManager, initializeNavbar, NavElement, NavElementSection, NavLinkElement, SocialNavbarItems, navSessionManager}
