import {BaseUIElement, UI, UIElement, type NodeAttributes} from "../UIBase";
import {FAIcon} from "../FontAwesome";
import {registerStyle} from "../style/Theme";
import {HorizontalOverflowStyle} from "./Style";



interface HorizontalOverflowOptions {
    // How much of the visible width one arrow click scrolls
    swipePercent?: number;
}

@registerStyle(HorizontalOverflowStyle)
export class HorizontalOverflow extends UI.Element<HorizontalOverflowOptions> {
    declare leftArrow?: FAIcon;
    declare rightArrow?: FAIcon;
    declare childrenContainer?: UIElement;
    declare swipeHelperChild?: UIElement;
    declare pusherContainer?: UIElement;

    getDefaultOptions() {
        return {
            swipePercent: .5,
        }
    }

    extraNodeAttributes(attr: NodeAttributes) {
        super.extraNodeAttributes(attr);
        attr.addClass(this.styleSheet.horizontalOverflow);
    }

    getChildrenToRender() {
        return [
            <FAIcon ref="leftArrow" icon="chevron-left" className={`${this.styleSheet.leftArrow} ${this.styleSheet.hiddenArrow}`}/>,
            <div ref="childrenContainer" className={this.styleSheet.childrenContainer}>
                <div ref="swipeHelperChild"/>
                <div ref="pusherContainer" className={this.styleSheet.pusherContainer}>
                    {this.render()}
                </div>
            </div>,
            <FAIcon ref="rightArrow" icon="chevron-right" className={`${this.styleSheet.rightArrow} ${this.styleSheet.hiddenArrow}`}/>
        ];
    }

    // Our own children, not the scroller's: getChildrenToRender rebuilds the scroller from them
    appendChild(child: BaseUIElement, doMount: boolean = true): BaseUIElement {
        this.options.children = this.options.children || [];
        this.options.children.push(child);
        if (doMount) {
            child.mount(this.pusherContainer, null);
        }
        this.redraw();
        return child;
    }

    eraseChild(child: BaseUIElement, destroy: boolean = true): BaseUIElement | null {
        const index = (this.options.children || []).indexOf(child);
        if (index < 0) {
            return null;
        }
        this.options.children.splice(index, 1);
        if (destroy) {
            child.destroyNode();
        }
        this.redraw();
        return child;
    }

    getChildOffset(child: UIElement): number {
        return child.node.offsetLeft - this.pusherContainer.node.offsetLeft;
    }

    scrollToChild(child: UIElement): void {
        this.scrollToOffset(this.getChildOffset(child));
    }

    // Whichever child the scroller is currently closest to
    getActiveChild(): UIElement | undefined {
        const children = this.options.children || [];
        const scrollLeft = this.pusherContainer.node.scrollLeft;
        let closest;
        let closestDistance = Infinity;
        for (const child of children) {
            const distance = Math.abs(this.getChildOffset(child as UIElement) - scrollLeft);
            if (distance < closestDistance) {
                closestDistance = distance;
                closest = child;
            }
        }
        return closest;
    }

    checkForOverflow() {
        const children = this.pusherContainer.children as UIElement[];

        if (!children.length) {
            return;
        }

        let shouldOverflowRight = false;
        let shouldOverflowLeft = false;

        const elementRect = this.node.getBoundingClientRect();

        for (let child of children) {
            const childRect = child.node.getBoundingClientRect();
            shouldOverflowRight ||= elementRect.left + elementRect.width < childRect.left + childRect.width - 1;
            shouldOverflowLeft ||= elementRect.left > childRect.left;
        }

        const leftArrowHidden = !this.leftArrow.getWidth();
        if (shouldOverflowLeft && leftArrowHidden) {
            this.leftArrow.removeClass(this.styleSheet.hiddenArrow);
        } else if (!shouldOverflowLeft && !leftArrowHidden) {
            this.leftArrow.addClass(this.styleSheet.hiddenArrow);
        }

        const rightArrowHidden = !this.rightArrow.getWidth();
        if (shouldOverflowRight && rightArrowHidden) {
            this.rightArrow.removeClass(this.styleSheet.hiddenArrow);
        } else if (!shouldOverflowRight && !rightArrowHidden) {
            this.rightArrow.addClass(this.styleSheet.hiddenArrow);
        }
    }

    scrollContent(amount) {
        const containerNode = this.pusherContainer.node;
        const target = containerNode.scrollLeft + amount * this.getWidth();
        this.scrollToOffset(amount < 0 ?
            Math.max(0, target) :
            Math.min(containerNode.scrollWidth - this.getWidth(), target));
    }

    scrollToOffset(scrollLeft: number) {
        const containerNode = this.pusherContainer.node;
        const amount = scrollLeft - containerNode.scrollLeft;
        if (amount < 0) {
            this.swipeHelperChild.setStyle("marginLeft", scrollLeft - containerNode.scrollLeft);
            containerNode.scrollLeft = scrollLeft;
        }

        this.pusherContainer.setWidth("fit-content");
        this.swipeHelperChild.addClass(this.styleSheet.swipeAnimation);

        if (amount < 0) {
            this.swipeHelperChild.setStyle("marginLeft", 0);
        } else {
            this.swipeHelperChild.setStyle("marginLeft", containerNode.scrollLeft - scrollLeft);
        }

        setTimeout(() => {
            this.pusherContainer.setWidth("100%");
            this.swipeHelperChild.removeClass(this.styleSheet.swipeAnimation);
            containerNode.scrollLeft = scrollLeft;
            this.swipeHelperChild.setStyle("marginLeft", 0);
            this.checkForOverflow();
        }, this.styleSheet.transitionTime * 1000);
    }

    scrollContentLeft() {
        this.scrollContent(-this.options.swipePercent);
    }

    scrollContentRight() {
        this.scrollContent(this.options.swipePercent);
    }

    // This method should be overwritten, and it is called whenever the position of the elements is changed.
    handleEventAndHandlePositionChange(callback: () => void) {
        callback();
    }

    onMount() {
        this.pusherContainer.addNodeListener("scroll", () => this.handleEventAndHandlePositionChange(() => this.checkForOverflow()));

        this.addListener("resize", () => this.handleEventAndHandlePositionChange(() => this.checkForOverflow()));

        this.rightArrow.addClickListener(() => this.handleEventAndHandlePositionChange(() => this.scrollContentRight()));
        this.leftArrow.addClickListener(() => this.handleEventAndHandlePositionChange(() => this.scrollContentLeft()));

        // TODO: Create a resizeable-aware UI Element to be extended by this class and manage these listeners.
        this.attachEventListener(window, "resize", () => this.handleEventAndHandlePositionChange(() => this.checkForOverflow()));

        setTimeout(() => this.checkForOverflow());
    }
}