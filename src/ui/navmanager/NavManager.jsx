import {UI, changeParent, registerStyle} from "../UI";
import {NavStyle} from "NavStyle";
import {Carousel, CarouselStyle} from "../Carousel";
import {LeftSideNavIcon, RightSideNavIcon, WrappedNavIcon} from "./NavIcon";
import {BasicOrientedElement, NavSection} from "./NavElement";
import {initializeSwipeEvents} from "./NavSwipeDetection";
import {SessionStorageMap} from "../../base/StorageMap";
import {Orientation, Direction} from "../Constants";


class SidePanelGroup extends UI.Element {
    get styleSheet() {
        return this.options.styleSheet || this.parent.styleSheet;
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.styleSheet.sidePanelGroup);
        if (this.options.anchor === Direction.RIGHT) {
            attr.setStyle("right", 0);
        } else {
            attr.setStyle("width", "250px");
        }
    }

    getOrientation() {
        return Orientation.VERTICAL;
    }

}


@registerStyle(NavStyle)
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
        if (this.options.anchor === Direction.RIGHT) {
            attr.addClass(this.styleSheet.rightSidePanel);
            attr.setStyle("right", "0");
        } else {
            attr.addClass(this.styleSheet.leftSidePanel);
        }
    }

    setVisible(value) {
        this.visible = value;
        if (this.storageSerializer) {
            this.storageSerializer.set("visible", value);
        }
    }

    show() {
        if (this.options.anchor === Direction.RIGHT) {
            this.removeClass(this.styleSheet.navVerticalRightHide);
        } else {
            this.removeClass(this.styleSheet.navVerticalLeftHide);
        }

        this.setVisible(true);
    }

    hide() {
        if (this.options.anchor === Direction.RIGHT) {
            this.addClass(this.styleSheet.navVerticalRightHide);
        } else {
            this.addClass(this.styleSheet.navVerticalLeftHide);
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

    getChildrenToRender() {
        return <SidePanelGroup ref="this.wrappedPanel" anchor={this.options.anchor}>
            {this.render()}
        </SidePanelGroup>;
    }

    onMount() {
        this.addClickListener((event) => {
            event.stopPropagation();
        });
    }
}


class NavCarouselStyle extends CarouselStyle {
    hoverColor = () => NavStyle.getInstance().getColors().sidepanelHover;
    textColor = () => NavStyle.getInstance().getColors().text;
    navigatorTransitionTime = () => NavStyle.getInstance().dimensions.backgroundTransitionDuration;
}


@registerStyle(NavStyle)
class NavManager extends UI.Primitive("nav") {
    getCarouselStyleSheet() {
        return this.options.carouselStyleSheet || NavCarouselStyle.getInstance();
    }

    getDefaultOptions() {
        return {
            persistentLeftSidePanel: true,
            persistentRightSidePanel: true,
        };
    }

    constructor(options) {
        super(options);

        this.leftSidePanel = <SidePanel anchor={Direction.LEFT} name="left" persistent={this.options.persistentLeftSidePanel}>
            <Carousel ref={this.refLink("carousel")} styleSheet={this.getCarouselStyleSheet()}>
                <BasicOrientedElement orientation={Orientation.VERTICAL} ref={this.refLink("navigationPanel")}
                                      styleSheet={this.styleSheet}>
                    {this.getLeftSidePanelChildren()}
                </BasicOrientedElement>
            </Carousel>
        </SidePanel>;

        this.rightSidePanel = <SidePanel anchor={Direction.RIGHT} name="right" persistent={this.options.persistentRightSidePanel}>
            {this.getRightSidePanelChildren()}
        </SidePanel>;
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
        attr.addClass(this.styleSheet.navManager);
    }

    getOrientation() {
        return Orientation.HORIZONTAL;
    }

    leftSideIconAction() {
        if (this.wrapped) {
            if (this.carousel.getActive() === this.navigationPanel) {
                this.toggleLeftSidePanel();
            } else {
                this.carousel.setActive(this.navigationPanel);
                if (!this.leftSidePanel.visible) {
                    this.toggleLeftSidePanel();
                }
            }
        } else {
            this.toggleLeftSidePanel();
        }
    }

    // TODO: lots of duplicate code here, with left/right stuff
    getLeftSideIcon() {
        if (!this.leftSidePanel) {
            return null;
        }

        if (!this.leftPanelToggler) {
            this.leftPanelToggler = <LeftSideNavIcon onClick={() => this.leftSideIconAction()} />;
        }
        return this.leftPanelToggler;
    }

    rightSideIconAction() {
        this.toggleRightSidePanel();
    }

    getRightSideIcon() {
        if (!this.rightSidePanel) {
            return null;
        }
        if (!this.rightPanelToggler) {
            this.rightPanelToggler = <RightSideNavIcon onClick={() => this.rightSideIconAction()} />;
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

    wrappedIconAction() {
        if (this.wrapped) {
            if (this.carousel.getActive() === this.wrappedPanel) {
                this.toggleLeftSidePanel();
            } else {
                this.carousel.setActive(this.wrappedPanel);
                if (!this.leftSidePanel.visible) {
                    this.toggleLeftSidePanel();
                }
            }
        } else {
            this.toggleLeftSidePanel();
        }
    }

    getWrappedIcon() {
        if (!this.wrappedToggler) {
            this.wrappedToggler = <WrappedNavIcon onClick={() => this.wrappedIconAction()}
                                               className={this.wrapped ? "" : "hidden"} />;
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
            this.leftConditionedWrapper = <NavSection anchor={Direction.LEFT}>
                {this.getLeftConditioned()}
            </NavSection>;
        }
        return this.leftConditionedWrapper;
    }

    getRightConditionedWrapper() {
        if (!this.rightConditionedWrapper) {
            this.rightConditionedWrapper = <NavSection anchor={Direction.RIGHT}>
                {this.getRightConditioned()}
            </NavSection>;
        }
        return this.rightConditionedWrapper;
    }

    getLeftConditioned() {
        if (!this.leftConditioned) {
            this.leftConditioned = <NavSection>{this.getLeftConditionedChildren()}</NavSection>;
        }
        return this.leftConditioned;
    }

    getRightConditioned() {
        if (!this.rightConditioned) {
            this.rightConditioned =  <NavSection>{this.getRightConditionedChildren()}</NavSection>;
        }
        return this.rightConditioned;
    }

    toggleSidePanel(mainPanel, toggleEvent) {
        let secondaryPanel = (mainPanel == this.leftSidePanel ? this.rightSidePanel : this.leftSidePanel);
        mainPanel.toggle();
        this.dispatch(toggleEvent, mainPanel.visible);
        if (secondaryPanel && mainPanel.visible && secondaryPanel.visible) {
            mainPanel.setStyle("z-index", 3001);
            secondaryPanel.setStyle("z-index", 3000);
        }
    }

    toggleLeftSidePanel() {
        this.toggleSidePanel(this.leftSidePanel, "toggledLeftSide");
    }

    toggleRightSidePanel() {
        this.toggleSidePanel(this.rightSidePanel, "toggledRightSide");
    }

    render() {
        return [
            this.getLeftSideIcon(),
            this.getLeftFixed(),
            this.getLeftConditionedWrapper(),
            this.getWrappedIcon(),
            <NavSection style={{marginLeft: "auto"}}>
              {this.getRightConditionedWrapper()}
            </NavSection>,
            this.getRightFixed(),
            this.getRightSideIcon(),
        ];
    }

    bindToNode() {
        super.bindToNode(...arguments);
        this.onMount();
    }

    // This method enforces the wrapping to be skipped. It is useful when navbar elements change.
    skipWrap() {
        this.wrapSkip = true;
        this.wrapScheduled = false;
    }

    unskipWrap() {
        this.wrapSkip = false;
        if (this.wrapScheduled) {
            this.checkForWrap();
        }
    }

    checkForWrap() {
        if (this.wrapSkip) {
            this.wrapScheduled = true;
            return;
        }
        const wrapNavElements = () => {
            this.wrapped = true;
            this.wrappedPanel = <BasicOrientedElement orientation={Orientation.VERTICAL} styleSheet={this.styleSheet}/>;
            this.carousel.appendChild(this.wrappedPanel);

            changeParent(this.getRightConditioned(), this.wrappedPanel);
            changeParent(this.getLeftConditioned(), this.wrappedPanel);
            this.getRightConditioned().redraw();
            this.getLeftConditioned().redraw();
            this.getWrappedIcon().removeClass("hidden");
        };

        const unwrapNavElements = () => {
            this.wrapped = false;
            this.getWrappedIcon().addClass("hidden");
            changeParent(this.getLeftConditioned(), this.getLeftConditionedWrapper());
            changeParent(this.getRightConditioned(), this.getRightConditionedWrapper());
            this.carousel.eraseChild(this.wrappedPanel);
            this.getLeftConditioned().redraw();
            this.getRightConditioned().redraw();
        };

        if (this.getLeftConditioned().children.length || this.getRightConditioned().children.length) {
            if (!this.wrapped) {
                this.unwrappedTotalWidth = 10;
                for (let child of this.children) {
                    this.unwrappedTotalWidth += child.getWidth();
                }
            }
            if (window.innerWidth < this.unwrappedTotalWidth && !this.wrapped) {
                wrapNavElements();
                this.dispatch("wrapped", true);
            } else if (window.innerWidth >= this.unwrappedTotalWidth && this.wrapped) {
                unwrapNavElements();
                this.dispatch("wrapped", false);
            }
        } else if (this.wrapped) {
            unwrapNavElements();
        }
    }

    onMount() {
        NavManager.Global = this;
        initializeSwipeEvents(this);
        setTimeout(() => this.checkForWrap());
        window.addEventListener("resize", () => this.checkForWrap());
        this.addListener("maybeWrap", () => this.checkForWrap());
        this.addClickListener((event) => {
            event.stopPropagation();
        });
    }
}


let initializeNavbar = () => {
    NavManager.Global = NavManager.Global || new NavManager();
    return NavManager.Global;
};


export {NavManager, initializeNavbar, NavCarouselStyle}
