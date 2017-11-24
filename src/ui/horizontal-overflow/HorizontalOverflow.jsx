import {UI} from "../UIBase";
import {FAIcon} from "../FontAwesome";
import {registerStyle} from "../style/Theme";
import {HorizontalOverflowStyle} from "./Style";



@registerStyle(HorizontalOverflowStyle)
export class HorizontalOverflow extends UI.Element {
    getDefaultOptions() {
        return {
            swipePercent: .5,
        }
    }

    extraNodeAttributes(attr) {
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

    appendChild(...args) {
        this.pusherContainer.appendChild(...args);
    }

    eraseChild(...args) {
        this.pusherContainer.eraseChild(...args);
    }

    checkForOverflow() {
        const children = this.pusherContainer.children;

        if (!children.length) {
            return;
        }

        let shouldOverflowRight = false;
        let shouldOverflowLeft = false;

        const elementRect = this.node.getBoundingClientRect();

        for (let child of children) {
            const childRect = child.node.getBoundingClientRect();
            shouldOverflowRight |= elementRect.left + elementRect.width < childRect.left + childRect.width - 1;
            shouldOverflowLeft |= elementRect.left > childRect.left;
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
        let scrollLeft;
        const containerNode = this.pusherContainer.node;
        if (amount < 0) {
            scrollLeft = Math.max(0, containerNode.scrollLeft + amount * this.getWidth());
        } else {
            scrollLeft = Math.min(containerNode.scrollWidth - this.getWidth(), containerNode.scrollLeft + amount * this.getWidth());
        }

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
    handleEventAndHandlePositionChange(callback) {
        callback();
    }

    onMount() {
        this.pusherContainer.addNodeListener("scroll", () => this.handleEventAndHandlePositionChange(() => this.checkForOverflow()));

        this.addListener("resize", () => this.handleEventAndHandlePositionChange(() => this.checkForOverflow()));

        this.rightArrow.addClickListener(() => this.handleEventAndHandlePositionChange(() => this.scrollContentRight()));
        this.leftArrow.addClickListener(() => this.handleEventAndHandlePositionChange(() => this.scrollContentLeft()));

        // TODO: Create a resizeable-aware UI Element to be extended by this class and manage these listeners.
        window.addEventListener("resize", () => this.handleEventAndHandlePositionChange(() => this.checkForOverflow()));

        setTimeout(() => this.checkForOverflow());
    }
}