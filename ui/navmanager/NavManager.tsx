import {type ElementOptions, type PartialOptions, UI, type UIChild, UIElement, type NodeAttributes} from "../UIBase";
import {changeParent} from "../Utils";
import {registerStyle} from "../style/Theme";
import {NavStyle} from "./NavStyle";
import {type StyleRules} from "../Style";
import {PagedHorizontalOverflow} from "../horizontal-overflow/PagedHorizontalOverflow";
import {PagedHorizontalOverflowStyle} from "../horizontal-overflow/Style";
import {LeftSideNavIcon, RightSideNavIcon, WrappedNavIcon} from "./NavIcon";
import {BasicOrientedElement, type BasicOrientedElementType, NavSection} from "./NavElement";
import {initializeSwipeEvents} from "./NavSwipeDetection";
import {SessionStorageMap} from "../../base/StorageMap";
import {type DirectionType, Orientation, Direction} from "../Constants";


interface SidePanelGroupOptions {
    anchor?: DirectionType;
}

class SidePanelGroup extends UI.Element<SidePanelGroupOptions> {
    get styleSheet(): StyleRules<NavStyle> {
        return this.options.styleSheet || (this.parent as any)?.styleSheet;
    }

    extraNodeAttributes(attr: NodeAttributes) {
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


interface SidePanelOptions {
    anchor?: DirectionType;
    name?: string;
    persistent?: boolean;
}

@registerStyle(NavStyle)
class SidePanel extends UI.Element<SidePanelOptions> {
    declare storageSerializer?: SessionStorageMap;
    declare visible?: boolean;

    constructor(options: PartialOptions<SidePanel>) {
        super(options);
        this.initNode();
        this.applyVisibility();
    }

    initNode() {
        if (!this.node) {
            this.mount(document.body);
        }
    }

    applyVisibility() {
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

    extraNodeAttributes(attr: NodeAttributes) {
        if (this.options.anchor === Direction.RIGHT) {
            attr.addClass(this.styleSheet.rightSidePanel);
            attr.setStyle("right", "0");
        } else {
            attr.addClass(this.styleSheet.leftSidePanel);
        }
    }

    setVisible(value: boolean) {
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


class NavPagerStyle extends PagedHorizontalOverflowStyle {
    navigatorColor = () => NavStyle.getInstance().getColors().text;
    navigatorHoverBackground = () => NavStyle.getInstance().getColors().sidepanelHover;
    navigatorTransition = () => NavStyle.getInstance().getDimensions().backgroundTransitionDuration;
}


interface NavManagerOptions {
    pagerStyleSheet?: PagedHorizontalOverflowStyle;
    persistentLeftSidePanel?: boolean;
    persistentRightSidePanel?: boolean;
}

@registerStyle(NavStyle)
class NavManager extends UI.Primitive("nav")<NavManagerOptions> {
    declare static Global?: NavManager;

    declare leftSidePanel?: SidePanel;
    declare rightSidePanel?: SidePanel;
    declare leftPanelToggler?: LeftSideNavIcon;
    declare rightPanelToggler?: RightSideNavIcon;
    declare wrappedToggler?: WrappedNavIcon;
    declare leftConditioned?: NavSection;
    declare rightConditioned?: NavSection;
    declare leftConditionedWrapper?: NavSection;
    declare rightConditionedWrapper?: NavSection;
    declare pager?: PagedHorizontalOverflow;
    declare navigationPanel?: BasicOrientedElementType;
    declare wrappedPanel?: BasicOrientedElementType;
    declare wrapped?: boolean;
    declare wrapSkip?: boolean;
    declare wrapScheduled?: boolean;
    declare unwrappedTotalWidth?: number;

    getPagerStyleSheet() {
        return this.options.pagerStyleSheet || NavPagerStyle.getInstance();
    }

    getDefaultOptions(options?: ElementOptions<NavManagerOptions>): Partial<ElementOptions<NavManagerOptions>> {
        return {
            persistentLeftSidePanel: true,
            persistentRightSidePanel: true,
        };
    }

    // JSX always yields BaseUIElement, never the tag's own class, so each cached element is cast back
    // to what it is - the fields below are read for members only the concrete class has.
    initLeftSidePanel() {
        this.leftSidePanel = <SidePanel anchor={Direction.LEFT} name="left" persistent={this.options.persistentLeftSidePanel}>
            <PagedHorizontalOverflow ref={this.refLink("pager")} styleSheet={this.getPagerStyleSheet()}>
                <BasicOrientedElement orientation={Orientation.VERTICAL} ref={this.refLink("navigationPanel")}
                                      styleSheet={this.styleSheet}>
                    {this.getLeftSidePanelChildren()}
                </BasicOrientedElement>
            </PagedHorizontalOverflow>
        </SidePanel>;
    }

    initRightSidePanel() {
        this.rightSidePanel = <SidePanel
            className="no-print"
            anchor={Direction.RIGHT}
            name="right"
            persistent={this.options.persistentRightSidePanel}
        >
            {this.getRightSidePanelChildren()}
        </SidePanel>;
    }

    constructor(options = {}) {
        super(options);

        this.initLeftSidePanel();
        this.initRightSidePanel();
    }

    getLeftSidePanelChildren(): UIChild[] {
        return [];
    }

    getRightSidePanelChildren(): UIChild[] {
        return [];
    }

    getLeftConditionedChildren(): UIChild[] {
        return [];
    }

    getRightConditionedChildren(): UIChild[] {
        return [];
    }

    extraNodeAttributes(attr: NodeAttributes) {
        attr.addClass(this.styleSheet.navManager);
    }

    getOrientation() {
        return Orientation.HORIZONTAL;
    }

    leftSideIconAction() {
        if (this.wrapped) {
            if (this.pager.getActive() === this.navigationPanel) {
                this.toggleLeftSidePanel();
            } else {
                this.pager.setActive(this.navigationPanel);
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
        for (let child of this.children as UIElement[]) {
            width += child.getWidth();
        }
        width -= this.getLeftConditioned().getWidth();
        width -= this.getRightConditioned().getWidth();
        return width;
    }

    wrappedIconAction() {
        if (this.wrapped) {
            if (this.pager.getActive() === this.wrappedPanel) {
                this.toggleLeftSidePanel();
            } else {
                this.pager.setActive(this.wrappedPanel);
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

    getLeftFixed(): UIChild[] {
        return [];
    }

    getRightFixed(): UIChild[] {
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

    toggleSidePanel(mainPanel: SidePanel, toggleEvent: string) {
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

    bindToNode(node: HTMLElement, doRedraw?: boolean): this {
        super.bindToNode(node, doRedraw);
        this.onMount();
        return this;
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
            this.pager.appendChild(this.wrappedPanel);

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
            this.pager.eraseChild(this.wrappedPanel);
            this.getLeftConditioned().redraw();
            this.getRightConditioned().redraw();
        };

        if (this.getLeftConditioned().children.length || this.getRightConditioned().children.length) {
            if (!this.wrapped) {
                this.unwrappedTotalWidth = 10;
                for (let child of this.children as UIElement[]) {
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


export {NavManager, initializeNavbar, NavPagerStyle, SidePanel}
