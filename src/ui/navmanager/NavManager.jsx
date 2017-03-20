import {UI, changeParent} from "../UI";
import {NavStyle} from "NavStyle";
import {Carousel, CarouselStyle} from "../Carousel";
import {LeftSideIcon, RightSideIcon, WrappedIcon} from "NavIcon";
import {BasicOrientedElement, NavElement, NavSection} from "NavElement";
import {SessionStorageMap} from "../../base/StorageMap";


class SidePanelGroup extends UI.Element {
    getStyleSet() {
        return this.options.styleSet || this.parent.getStyleSet();
    }

    extraNodeAttributes(attr) {
        attr.addClass(this.getStyleSet().sidePanelGroup);
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
    static styleSet = NavStyle.getInstance();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

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
            attr.addClass(this.getStyleSet().rightSidePanel);
            attr.setStyle("right", "0");
        } else {
            attr.addClass(this.getStyleSet().leftSidePanel);
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
            this.removeClass(this.getStyleSet().navVerticalRightHide);
        } else {
            this.removeClass(this.getStyleSet().navVerticalLeftHide);
        }

        this.setVisible(true);
    }

    hide() {
        if (this.options.anchor === UI.Direction.RIGHT) {
            this.addClass(this.getStyleSet().navVerticalRightHide);
        } else {
            this.addClass(this.getStyleSet().navVerticalLeftHide);
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

    render() {
        return <SidePanelGroup ref="this.wrappedPanel" anchor={this.options.anchor}>
            {this.getGivenChildren()}
        </SidePanelGroup>;
    }

    onMount() {
        this.addClickListener((event) => {
            event.stopPropagation();
        });
    }
}


class NavCarouselStyle extends CarouselStyle {
    hoverColor = NavStyle.getInstance().colors.sidepanelHover;
    textColor = NavStyle.getInstance().colors.text;
    navigatorTransitionTime = NavStyle.getInstance().dimensions.backgroundTransitionDuration;
}


class NavManager extends UI.Primitive("nav") {
    static styleSet = NavStyle.getInstance();

    static carouselStyleSet = NavCarouselStyle.getInstance();

    getStyleSet() {
        return this.options.styleSet || this.constructor.styleSet;
    }

    getCarouselStyleSet() {
        return this.options.carouselStyleSet || this.constructor.carouselStyleSet;
    }

    getDefaultOptions() {
        return {
            persistentLeftSidePanel: true,
            persistentRightSidePanel: true,
        };
    }

    constructor(options) {
        super(options);

        this.leftSidePanel = <SidePanel anchor={UI.Direction.LEFT} name="left" persistent={this.options.persistentLeftSidePanel}
                                        styleSet={this.getStyleSet()}>
            <BasicOrientedElement orientation={UI.Orientation.VERTICAL} ref={this.refLink("navigationPanel")}>
                {this.getLeftSidePanelFixedChildren()}
            </BasicOrientedElement>
            <Carousel ref={this.refLink("carousel")} styleSet={this.getCarouselStyleSet()}>
                <BasicOrientedElement orientation={UI.Orientation.VERTICAL} ref={this.refLink("navigationPanel")}
                                      styleSet={this.getStyleSet()}>
                    {this.getLeftSidePanelChildren()}
                </BasicOrientedElement>
            </Carousel>
        </SidePanel>;

        this.rightSidePanel = <SidePanel anchor={UI.Direction.RIGHT} name="right" persistent={this.options.persistentRightSidePanel}
                                         styleSet={this.getStyleSet()}>
            {this.getRightSidePanelChildren()}
        </SidePanel>;
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
        attr.addClass(this.getStyleSet().navManager);
    }

    getOrientation() {
        return UI.Orientation.HORIZONTAL;
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
            this.leftPanelToggler = <LeftSideIcon onClick={() => this.leftSideIconAction()} />;
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
            this.rightPanelToggler = <RightSideIcon onClick={() => this.rightSideIconAction()} />;
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
            this.wrappedToggler = <WrappedIcon onClick={() => this.wrappedIconAction()}
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
            this.leftConditionedWrapper = <NavSection anchor={UI.Direction.LEFT}>
                {this.getLeftConditioned()}
            </NavSection>;
        }
        return this.leftConditionedWrapper;
    }

    getRightConditionedWrapper() {
        if (!this.rightConditionedWrapper) {
            this.rightConditionedWrapper = <NavSection anchor={UI.Direction.RIGHT}>
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
        this.toggleSidePanel(this.rightSidePanel, "toggleRightSide");
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
                this.wrappedPanel = <BasicOrientedElement orientation={UI.Orientation.VERTICAL} styleSet={this.getStyleSet()}/>;
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
