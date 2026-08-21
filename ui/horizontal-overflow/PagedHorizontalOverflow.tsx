import {UIElement} from "../UIBase";
import {FAIcon} from "../FontAwesome";
import {registerStyle} from "../style/Theme";
import {HorizontalOverflow} from "./HorizontalOverflow";
import {PagedHorizontalOverflowStyle} from "./Style";


// Steps a whole page at a time, and pages from a bar of its own rather than the edge arrows
@registerStyle(PagedHorizontalOverflowStyle)
export class PagedHorizontalOverflow extends HorizontalOverflow {
    getDefaultOptions() {
        return {
            swipePercent: 1,
        };
    }

    getChildrenToRender() {
        return [this.getNavigator(), ...super.getChildrenToRender()];
    }

    getNavigator() {
        const pageCount = (this.options.children || []).length;
        const className = this.styleSheet.navigator + (pageCount > 1 ? "" : " hidden");
        return <div className={className}>
            <FAIcon icon="angle-left" className={this.styleSheet.navigatorIcon}
                    onClick={() => this.handleEventAndHandlePositionChange(() => this.scrollContentLeft())}/>
            <FAIcon icon="angle-right" className={this.styleSheet.navigatorIcon}
                    onClick={() => this.handleEventAndHandlePositionChange(() => this.scrollContentRight())}/>
        </div>;
    }

    setActive(page: UIElement): void {
        this.scrollToChild(page);
    }

    getActive(): UIElement | undefined {
        return this.getActiveChild();
    }
}
